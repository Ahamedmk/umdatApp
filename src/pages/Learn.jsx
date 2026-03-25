// /src/pages/Learn.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  Flame,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  Star,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { CHAPTERS } from "../data/chapters";
import { ALL_HADITHS } from "../data/allHadiths";
import { useAuth } from "../context/AuthContext";
import {
  getUserHadithProgress,
  mergeHadithsWithSupabaseProgress,
} from "../lib/hadithProgress";

/* ─── helpers ─── */

function statusLabel(status) {
  switch (status) {
    case "mastered":
      return "Maîtrisé";
    case "review":
      return "À revoir";
    case "learning":
      return "En cours";
    case "scheduled":
      return "Planifié";
    default:
      return "Nouveau";
  }
}

function statusColor(status) {
  switch (status) {
    case "mastered": return "var(--clr-gold)";
    case "review":   return "var(--clr-amber)";
    case "learning": return "var(--clr-accent)";
    case "scheduled": return "var(--clr-muted-fg)";
    default:         return "var(--clr-muted-fg)";
  }
}



/* ─── sub-components ─── */

function StatPill({ icon: Icon, label, value, accent }) {
  return (
    <div className="learn-stat-pill" style={{ "--accent": accent }}>
      <span className="learn-stat-icon"><Icon size={16} /></span>
      <span className="learn-stat-value">{value}</span>
      <span className="learn-stat-label">{label}</span>
    </div>
  );
}

function ProgressRing({ percent, size = 52 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="learn-ring">
      <circle cx={size / 2} cy={size / 2} r={r} className="learn-ring-bg" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        className="learn-ring-fg"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="learn-ring-text">
        {percent}%
      </text>
    </svg>
  );
}

/* ─── main component ─── */

export function Learn() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [progressRows, setProgressRows] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProgress() {
      if (!user?.id) {
        if (mounted) { setProgressRows([]); setLoading(false); }
        return;
      }
      try {
        setLoading(true);
        setLoadError("");
        const rows = await getUserHadithProgress(user.id);
        if (!mounted) return;
        setProgressRows(rows);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setLoadError("Impossible de charger la progression.");
        setProgressRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProgress();
    return () => { mounted = false; };
  }, [user?.id]);

  const hadithsWithProgress = useMemo(
    () => mergeHadithsWithSupabaseProgress(ALL_HADITHS, progressRows),
    [progressRows]
  );

  const globalStats = useMemo(() => {
    const total    = hadithsWithProgress.length;
    const mastered = hadithsWithProgress.filter(h => h.progressStatus === "mastered").length;
    const review   = hadithsWithProgress.filter(h => h.progressStatus === "review").length;
    const learning = hadithsWithProgress.filter(
  h => h.progressStatus === "learning" || h.progressStatus === "scheduled"
).length;
    return { total, mastered, review, learning };
  }, [hadithsWithProgress]);

  const chapterCards = useMemo(() => {
    return CHAPTERS.map(chapter => {
      const ch = hadithsWithProgress
        .filter(h => h.chapterSlug === chapter.slug)
        .sort((a, b) => (a.hadithOrder || a.number || a.id) - (b.hadithOrder || b.number || b.id));

      const total    = ch.length;
      const mastered = ch.filter(h => h.progressStatus === "mastered").length;
      const review   = ch.filter(h => h.progressStatus === "review").length;
      const learning = ch.filter(
  h => h.progressStatus === "learning" || h.progressStatus === "scheduled"
).length;
      const percent  = total > 0 ? Math.round((mastered / total) * 100) : 0;

      const nextRecommended =
  ch.find(h => h.progressStatus === "review")   ||
  ch.find(h => h.progressStatus === "learning") ||
  ch.find(h => h.progressStatus === "new")      ||
  ch.find(h => h.progressStatus === "scheduled") ||
  ch[0];

      return { ...chapter, total, mastered, review, learning, percent, nextRecommended };
    }).sort((a, b) => a.order - b.order);
  }, [hadithsWithProgress]);

  const globalNextHadith = useMemo(() => {
  const reviewHadiths = hadithsWithProgress
    .filter((h) => h.progressStatus === "review")
    .sort((a, b) => {
      const aDate = a.next_review_date || "9999-12-31";
      const bDate = b.next_review_date || "9999-12-31";
      return aDate.localeCompare(bDate);
    });

  const learningHadiths = hadithsWithProgress.filter(
    (h) => h.progressStatus === "learning"
  );

  const newHadiths = hadithsWithProgress.filter(
    (h) => h.progressStatus === "new"
  );

  return (
    reviewHadiths[0] ||
    learningHadiths[0] ||
    newHadiths[0] ||
    hadithsWithProgress.find((h) => h.progressStatus === "scheduled") ||
    hadithsWithProgress[0]
  );
}, [hadithsWithProgress]);

  /* ── loading state ── */
  if (loading) {
    return (
      <>
        <LearnStyles />
        <div className="learn-loader">
          <Loader2 className="learn-loader-icon" />
          <span>Chargement de ta progression…</span>
        </div>
      </>
    );
  }

  /* ── main render ── */
  return (
    <>
      <LearnStyles />
      <div className="learn-root">

        {/* ── Header ── */}
        <header className="learn-header">
          <div>
            <h1 className="learn-title">
              <span className="learn-title-ar">تعلّم</span>
              Apprentissage
            </h1>
            <p className="learn-subtitle">Reprends là où tu t'es arrêté · Progresse chaque jour</p>
            {loadError && <p className="learn-error">{loadError}</p>}
          </div>
          <div className="learn-header-ornament" aria-hidden="true">﷽</div>
        </header>

        {/* ── Continue card ── */}
        <section className="learn-continue-card">
          <div className="learn-continue-label">
            <Sparkles size={14} />
            Continuer mon apprentissage
          </div>

          {globalNextHadith ? (
            <div className="learn-continue-body">
              <div className="learn-continue-info">
                <span className="learn-continue-chapter">
                  {globalNextHadith.chapterTitle || globalNextHadith.chapterSlug}
                </span>
                <h2 className="learn-continue-hadith">
                  Hadith {globalNextHadith.hadithOrder || globalNextHadith.number || globalNextHadith.id}
                  {globalNextHadith.title ? ` — ${globalNextHadith.title}` : ""}
                </h2>
                <div className="learn-continue-badges">
                  <span
                    className="learn-status-dot"
                    style={{ "--dot": statusColor(globalNextHadith.progressStatus) }}
                  />
                  <span className="learn-status-text">
                    {statusLabel(globalNextHadith.progressStatus)}
                  </span>
                  {globalNextHadith.score != null && (
                    <span className="learn-score-badge">
                      <Star size={11} /> {globalNextHadith.score}/5
                    </span>
                  )}
                </div>
              </div>

              <div className="learn-continue-actions">
                <button
                  className="learn-btn-primary"
                  onClick={() => navigate(`/hadith/${globalNextHadith.id}`)}
                >
                  Continuer <ArrowRight size={15} />
                </button>
                <button
                  className="learn-btn-ghost"
                  onClick={() => navigate(`/learn/${globalNextHadith.chapterSlug}`)}
                >
                  Voir le chapitre
                </button>
              </div>
            </div>
          ) : (
            <p className="learn-empty">Aucun hadith disponible pour le moment.</p>
          )}
        </section>

        {/* ── Stats strip ── */}
        <div className="learn-stats-strip">
          <StatPill icon={BookOpen}     label="Total"     value={globalStats.total}    accent="var(--clr-muted-fg)" />
          <StatPill icon={CheckCircle2} label="Maîtrisés" value={globalStats.mastered} accent="var(--clr-gold)"     />
          <StatPill icon={RefreshCw}    label="À revoir"  value={globalStats.review}   accent="var(--clr-amber)"    />
          <StatPill icon={Flame}        label="En cours"  value={globalStats.learning} accent="var(--clr-accent)"   />
        </div>

        {/* ── Chapters ── */}
        <section>
          <div className="learn-section-head">
            <h2 className="learn-section-title">Mes chapitres</h2>
            <p className="learn-section-sub">Choisis un chapitre pour voir ses hadiths</p>
          </div>

          <div className="learn-chapters-grid">
            {chapterCards.map((chapter, i) => (
              <article
                key={chapter.id}
                className="learn-chapter-card"
                style={{ "--delay": `${i * 60}ms` }}
              >
                <div className="learn-chapter-top">
                  <div className="learn-chapter-titles">
                    <h3 className="learn-chapter-title-fr">{chapter.titleFr}</h3>
                    <p className="learn-chapter-title-ar">{chapter.titleAr}</p>
                  </div>
                  <ProgressRing percent={chapter.percent} />
                </div>

                {chapter.description && (
                  <p className="learn-chapter-desc">{chapter.description}</p>
                )}

                <div className="learn-chapter-stats">
                  {[
                    { label: "Total",     value: chapter.total },
                    { label: "Maîtrisés", value: chapter.mastered },
                    { label: "En cours",  value: chapter.learning },
                    { label: "À revoir",  value: chapter.review },
                  ].map(s => (
                    <div key={s.label} className="learn-chapter-stat">
                      <span className="learn-chapter-stat-val">{s.value}</span>
                      <span className="learn-chapter-stat-lbl">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="learn-chapter-divider" />

                {chapter.nextRecommended ? (
                  <div className="learn-chapter-next">
                    <span className="learn-chapter-next-label">Prochain recommandé</span>
                    <span className="learn-chapter-next-title">
                      Hadith {chapter.nextRecommended.hadithOrder || chapter.nextRecommended.number || chapter.nextRecommended.id}
                      {chapter.nextRecommended.title ? ` — ${chapter.nextRecommended.title}` : ""}
                    </span>
                  </div>
                ) : (
                  <div className="learn-chapter-next">
                    <span className="learn-chapter-next-label">Aucun hadith pour l'instant.</span>
                  </div>
                )}

                <div className="learn-chapter-actions">
                  <button
                    className="learn-btn-primary learn-btn-sm"
                    onClick={() => navigate(`/learn/${chapter.slug}`)}
                  >
                    Entrer <ChevronRight size={14} />
                  </button>
                  {chapter.nextRecommended && (
                    <button
                      className="learn-btn-ghost learn-btn-sm"
                      onClick={() => navigate(`/hadith/${chapter.nextRecommended.id}`)}
                    >
                      Continuer
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}

/* ─── scoped styles injected as a component ─── */
function LearnStyles() {
  return (
    <style>{`
      /* ── tokens ── */
      .learn-root {
        --clr-bg:        #0d1117;
        --clr-surface:   #161c24;
        --clr-surface2:  #1e2630;
        --clr-border:    rgba(255,255,255,.07);
        --clr-border2:   rgba(255,255,255,.12);
        --clr-fg:        #e8e0d0;
        --clr-muted-fg:  #7a8694;
        --clr-gold:      #c9a84c;
        --clr-gold-dim:  rgba(201,168,76,.15);
        --clr-amber:     #e08a3c;
        --clr-accent:    #4a9f82;
        --clr-accent-dim:rgba(74,159,130,.12);

        font-family: 'Georgia', 'Times New Roman', serif;
        background: var(--clr-bg);
        color: var(--clr-fg);
        min-height: 100vh;
        padding: 1.5rem 1rem 4rem;
        max-width: 900px;
        margin: 0 auto;
      }

      /* ── loader ── */
      .learn-loader {
        display: flex;
        align-items: center;
        gap: .75rem;
        justify-content: center;
        min-height: 50vh;
        color: var(--clr-muted-fg);
        font-family: Georgia, serif;
      }
      .learn-loader-icon { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* ── header ── */
      .learn-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--clr-border2);
      }
      .learn-title {
        font-size: 1.9rem;
        font-weight: 700;
        letter-spacing: -.02em;
        line-height: 1.1;
        display: flex;
        align-items: baseline;
        gap: .55rem;
        margin: 0 0 .35rem;
        color: var(--clr-fg);
      }
      .learn-title-ar {
        font-size: 1.2rem;
        color: var(--clr-gold);
        font-weight: 400;
        opacity: .8;
      }
      .learn-subtitle {
        font-size: .82rem;
        color: var(--clr-muted-fg);
        font-style: italic;
        margin: 0;
      }
      .learn-error {
        font-size: .8rem;
        color: #e05555;
        margin-top: .4rem;
      }
      .learn-header-ornament {
        font-size: 1.6rem;
        color: var(--clr-gold);
        opacity: .25;
        line-height: 1;
        flex-shrink: 0;
        padding-top: .15rem;
      }

      /* ── continue card ── */
      .learn-continue-card {
        background: linear-gradient(135deg, var(--clr-surface) 0%, rgba(201,168,76,.06) 100%);
        border: 1px solid var(--clr-gold-dim);
        border-radius: 16px;
        padding: 1.4rem 1.5rem;
        margin-bottom: 1.5rem;
        position: relative;
        overflow: hidden;
      }
      .learn-continue-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--clr-gold), transparent);
        border-radius: 16px 16px 0 0;
      }
      .learn-continue-label {
        display: flex;
        align-items: center;
        gap: .4rem;
        font-size: .72rem;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: var(--clr-gold);
        margin-bottom: 1rem;
        font-family: 'Georgia', serif;
        font-style: italic;
      }
      .learn-continue-body {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .learn-continue-chapter {
        font-size: .75rem;
        color: var(--clr-muted-fg);
        text-transform: uppercase;
        letter-spacing: .07em;
        display: block;
        margin-bottom: .3rem;
      }
      .learn-continue-hadith {
        font-size: 1.15rem;
        font-weight: 700;
        margin: 0 0 .6rem;
        color: var(--clr-fg);
        line-height: 1.3;
      }
      .learn-continue-badges {
        display: flex;
        align-items: center;
        gap: .55rem;
        flex-wrap: wrap;
      }
      .learn-status-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: var(--dot);
        flex-shrink: 0;
      }
      .learn-status-text {
        font-size: .78rem;
        color: var(--clr-muted-fg);
      }
      .learn-score-badge {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: .73rem;
        color: var(--clr-gold);
        background: var(--clr-gold-dim);
        border-radius: 20px;
        padding: 2px 8px;
      }
      .learn-continue-actions {
        display: flex;
        gap: .65rem;
        flex-wrap: wrap;
        flex-shrink: 0;
      }
      .learn-empty {
        font-size: .85rem;
        color: var(--clr-muted-fg);
        font-style: italic;
      }

      /* ── buttons ── */
      .learn-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        background: var(--clr-gold);
        color: #0d1117;
        border: none;
        border-radius: 9px;
        padding: .55rem 1.1rem;
        font-size: .85rem;
        font-weight: 700;
        font-family: Georgia, serif;
        cursor: pointer;
        transition: opacity .15s, transform .15s;
      }
      .learn-btn-primary:hover { opacity: .88; transform: translateY(-1px); }
      .learn-btn-primary:active { transform: translateY(0); opacity: 1; }

      .learn-btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        background: transparent;
        color: var(--clr-muted-fg);
        border: 1px solid var(--clr-border2);
        border-radius: 9px;
        padding: .55rem 1.1rem;
        font-size: .85rem;
        font-family: Georgia, serif;
        cursor: pointer;
        transition: border-color .15s, color .15s, transform .15s;
      }
      .learn-btn-ghost:hover {
        border-color: var(--clr-gold);
        color: var(--clr-gold);
        transform: translateY(-1px);
      }

      .learn-btn-sm { padding: .42rem .9rem; font-size: .8rem; }

      /* ── stats strip ── */
      .learn-stats-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: .75rem;
        margin-bottom: 2.5rem;
      }
      @media (max-width: 540px) {
        .learn-stats-strip { grid-template-columns: repeat(2, 1fr); }
      }
      .learn-stat-pill {
        background: var(--clr-surface);
        border: 1px solid var(--clr-border);
        border-radius: 12px;
        padding: .85rem .9rem;
        display: flex;
        flex-direction: column;
        gap: .2rem;
        transition: border-color .2s;
      }
      .learn-stat-pill:hover { border-color: var(--clr-border2); }
      .learn-stat-icon {
        color: var(--accent);
        line-height: 1;
        margin-bottom: .1rem;
      }
      .learn-stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        color: var(--clr-fg);
      }
      .learn-stat-label {
        font-size: .72rem;
        color: var(--clr-muted-fg);
        letter-spacing: .03em;
      }

      /* ── section head ── */
      .learn-section-head {
        margin-bottom: 1rem;
      }
      .learn-section-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 .2rem;
        color: var(--clr-fg);
      }
      .learn-section-sub {
        font-size: .8rem;
        color: var(--clr-muted-fg);
        margin: 0;
        font-style: italic;
      }

      /* ── chapters grid ── */
      .learn-chapters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      /* ── chapter card ── */
      .learn-chapter-card {
        background: var(--clr-surface);
        border: 1px solid var(--clr-border);
        border-radius: 16px;
        padding: 1.3rem;
        display: flex;
        flex-direction: column;
        gap: .9rem;
        transition: border-color .2s, transform .2s, box-shadow .2s;
        animation: cardIn .4s ease both;
        animation-delay: var(--delay, 0ms);
      }
      .learn-chapter-card:hover {
        border-color: var(--clr-border2);
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(0,0,0,.35);
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .learn-chapter-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: .75rem;
      }
      .learn-chapter-title-fr {
        font-size: 1rem;
        font-weight: 700;
        color: var(--clr-fg);
        margin: 0 0 .2rem;
        line-height: 1.25;
      }
      .learn-chapter-title-ar {
        font-size: .95rem;
        color: var(--clr-gold);
        opacity: .75;
        margin: 0;
        font-weight: 400;
        direction: rtl;
      }
      .learn-chapter-desc {
        font-size: .8rem;
        color: var(--clr-muted-fg);
        line-height: 1.5;
        margin: 0;
        font-style: italic;
      }

      .learn-chapter-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: .45rem;
      }
      .learn-chapter-stat {
        background: var(--clr-surface2);
        border-radius: 9px;
        padding: .55rem .4rem;
        text-align: center;
      }
      .learn-chapter-stat-val {
        display: block;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--clr-fg);
        line-height: 1;
      }
      .learn-chapter-stat-lbl {
        display: block;
        font-size: .65rem;
        color: var(--clr-muted-fg);
        margin-top: .2rem;
        letter-spacing: .03em;
      }

      .learn-chapter-divider {
        height: 1px;
        background: var(--clr-border);
        margin: 0 -.1rem;
      }

      .learn-chapter-next {
        background: var(--clr-surface2);
        border-radius: 10px;
        padding: .7rem .9rem;
      }
      .learn-chapter-next-label {
        display: block;
        font-size: .7rem;
        color: var(--clr-muted-fg);
        letter-spacing: .05em;
        text-transform: uppercase;
        margin-bottom: .25rem;
      }
      .learn-chapter-next-title {
        display: block;
        font-size: .85rem;
        color: var(--clr-fg);
        font-weight: 600;
        line-height: 1.35;
      }

      .learn-chapter-actions {
        display: flex;
        gap: .6rem;
        flex-wrap: wrap;
      }

      /* ── progress ring ── */
      .learn-ring { flex-shrink: 0; }
      .learn-ring-bg {
        fill: none;
        stroke: var(--clr-surface2);
        stroke-width: 4;
      }
      .learn-ring-fg {
        fill: none;
        stroke: var(--clr-gold);
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset .6s ease;
      }
      .learn-ring-text {
        fill: var(--clr-gold);
        font-size: 11px;
        font-family: Georgia, serif;
        font-weight: 700;
      }
    `}</style>
  );
}

export default Learn;