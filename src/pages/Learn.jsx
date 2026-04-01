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
  Sun,
  Moon,
} from "lucide-react";

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
    case "mastered":  return "Maîtrisé";
    case "review":    return "À revoir";
    case "learning":  return "En cours";
    case "scheduled": return "Planifié";
    default:          return "Nouveau";
  }
}

function statusColor(status, isDark) {
  switch (status) {
    case "mastered":  return isDark ? "#c9a84c" : "#a07d28";
    case "review":    return isDark ? "#e08a3c" : "#bf6a1a";
    case "learning":  return isDark ? "#4a9f82" : "#2d8c6a";
    case "scheduled": return isDark ? "#7a8694" : "#6a7580";
    default:          return isDark ? "#7a8694" : "#6a7580";
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
  const [isDark, setIsDark]             = useState(true);

  /* theme sync on mount */
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const dark = pref ? pref === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

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
        ch.find(h => h.progressStatus === "review")    ||
        ch.find(h => h.progressStatus === "learning")  ||
        ch.find(h => h.progressStatus === "new")       ||
        ch.find(h => h.progressStatus === "scheduled") ||
        ch[0];

      return { ...chapter, total, mastered, review, learning, percent, nextRecommended };
    }).sort((a, b) => a.order - b.order);
  }, [hadithsWithProgress]);

  const globalNextHadith = useMemo(() => {
    const reviewHadiths = hadithsWithProgress
      .filter(h => h.progressStatus === "review")
      .sort((a, b) => {
        const aDate = a.next_review_date || "9999-12-31";
        const bDate = b.next_review_date || "9999-12-31";
        return aDate.localeCompare(bDate);
      });
    const learningHadiths = hadithsWithProgress.filter(h => h.progressStatus === "learning");
    const newHadiths      = hadithsWithProgress.filter(h => h.progressStatus === "new");
    return (
      reviewHadiths[0]  ||
      learningHadiths[0] ||
      newHadiths[0]     ||
      hadithsWithProgress.find(h => h.progressStatus === "scheduled") ||
      hadithsWithProgress[0]
    );
  }, [hadithsWithProgress]);

  /* ── loading state ── */
  if (loading) {
    return (
      <>
        <LearnStyles isDark={isDark} />
        <div className={`learn-root ${isDark ? "learn-dark" : "learn-light"}`}>
          <div className="learn-loader">
            <Loader2 className="learn-loader-icon" />
            <span>Chargement de ta progression…</span>
          </div>
        </div>
      </>
    );
  }

  /* ── main render ── */
  return (
    <>
      <LearnStyles isDark={isDark} />
      <div className={`learn-root ${isDark ? "learn-dark" : "learn-light"}`}>

        {/* ── Theme toggle ── */}
        <div className="learn-topbar">
          <button className="learn-theme-toggle" onClick={toggleTheme} aria-label="Changer de thème">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </div>

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
                    style={{ "--dot": statusColor(globalNextHadith.progressStatus, isDark) }}
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

/* ─── scoped styles ─── */
function LearnStyles({ isDark }) {
  const dark = `
    .learn-dark {
      --clr-bg:         #0d1117;
      --clr-surface:    #161c24;
      --clr-surface2:   #1e2630;
      --clr-border:     rgba(255,255,255,.07);
      --clr-border2:    rgba(255,255,255,.12);
      --clr-fg:         #e8e0d0;
      --clr-muted-fg:   #7a8694;
      --clr-gold:       #c9a84c;
      --clr-gold-dim:   rgba(201,168,76,.15);
      --clr-amber:      #e08a3c;
      --clr-accent:     #4a9f82;
      --clr-accent-dim: rgba(74,159,130,.12);
    }
    .learn-dark .learn-theme-toggle {
      background: rgba(255,255,255,.07);
      color: #c9a84c;
      border-color: rgba(201,168,76,.2);
    }
    .learn-dark .learn-theme-toggle:hover { background: rgba(201,168,76,.12); }
    .learn-dark .learn-continue-card {
      background: linear-gradient(135deg, #161c24 0%, rgba(201,168,76,.06) 100%);
      border-color: rgba(201,168,76,.15);
    }
    .learn-dark .learn-continue-card::before {
      background: linear-gradient(90deg, #c9a84c, transparent);
    }
    .learn-dark .learn-btn-primary { background: #c9a84c; color: #0d1117; }
    .learn-dark .learn-btn-ghost {
      color: #7a8694;
      border-color: rgba(255,255,255,.12);
    }
    .learn-dark .learn-btn-ghost:hover { border-color: #c9a84c; color: #c9a84c; }
    .learn-dark .learn-score-badge { color: #c9a84c; background: rgba(201,168,76,.15); }
    .learn-dark .learn-chapter-card { background: #161c24; border-color: rgba(255,255,255,.07); }
    .learn-dark .learn-chapter-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.35); }
    .learn-dark .learn-chapter-stat { background: #1e2630; }
    .learn-dark .learn-chapter-next { background: #1e2630; }
    .learn-dark .learn-chapter-divider { background: rgba(255,255,255,.07); }
    .learn-dark .learn-stat-pill { background: #161c24; border-color: rgba(255,255,255,.07); }
    .learn-dark .learn-header { border-color: rgba(255,255,255,.12); }
    .learn-dark .learn-header-ornament { color: #c9a84c; }
    .learn-dark .learn-title-ar { color: #c9a84c; }
    .learn-dark .learn-ring-bg { stroke: #1e2630; }
    .learn-dark .learn-ring-fg { stroke: #c9a84c; }
    .learn-dark .learn-ring-text { fill: #c9a84c; }
    .learn-dark .learn-loader { color: #7a8694; }
  `;

  const light = `
    .learn-light {
      --clr-bg:         #fdf8f0;
      --clr-surface:    #ffffff;
      --clr-surface2:   #fef6e4;
      --clr-border:     rgba(160,125,40,.13);
      --clr-border2:    rgba(160,125,40,.25);
      --clr-fg:         #2c2416;
      --clr-muted-fg:   #7a6d58;
      --clr-gold:       #a07d28;
      --clr-gold-dim:   rgba(160,125,40,.1);
      --clr-amber:      #bf6a1a;
      --clr-accent:     #2d8c6a;
      --clr-accent-dim: rgba(45,140,106,.1);
    }
    .learn-light .learn-theme-toggle {
      background: rgba(160,125,40,.08);
      color: #7c56c8;
      border-color: rgba(124,86,200,.2);
    }
    .learn-light .learn-theme-toggle:hover { background: rgba(124,86,200,.1); }
    .learn-light .learn-continue-card {
      background: linear-gradient(135deg, #ffffff 0%, rgba(160,125,40,.05) 100%);
      border-color: rgba(160,125,40,.18);
      box-shadow: 0 2px 16px rgba(160,125,40,.07);
    }
    .learn-light .learn-continue-card::before {
      background: linear-gradient(90deg, #a07d28, transparent);
    }
    .learn-light .learn-continue-chapter { color: #7a6d58; }
    .learn-light .learn-continue-hadith  { color: #1e1810; }
    .learn-light .learn-btn-primary { background: #a07d28; color: #ffffff; }
    .learn-light .learn-btn-ghost {
      color: #7a6d58;
      border-color: rgba(160,125,40,.22);
    }
    .learn-light .learn-btn-ghost:hover { border-color: #a07d28; color: #a07d28; }
    .learn-light .learn-score-badge { color: #a07d28; background: rgba(160,125,40,.1); }
    .learn-light .learn-chapter-card {
      background: #ffffff;
      border-color: rgba(160,125,40,.13);
      box-shadow: 0 1px 6px rgba(160,125,40,.07);
    }
    .learn-light .learn-chapter-card:hover {
      box-shadow: 0 8px 28px rgba(160,125,40,.13);
      border-color: rgba(160,125,40,.28);
    }
    .learn-light .learn-chapter-title-fr { color: #1e1810; }
    .learn-light .learn-chapter-title-ar { color: #a07d28; }
    .learn-light .learn-chapter-desc     { color: #7a6d58; }
    .learn-light .learn-chapter-stat     { background: #fef6e4; }
    .learn-light .learn-chapter-stat-val { color: #1e1810; }
    .learn-light .learn-chapter-stat-lbl { color: #7a6d58; }
    .learn-light .learn-chapter-next     { background: #fef6e4; }
    .learn-light .learn-chapter-next-label { color: #7a6d58; }
    .learn-light .learn-chapter-next-title { color: #1e1810; }
    .learn-light .learn-chapter-divider  { background: rgba(160,125,40,.1); }
    .learn-light .learn-stat-pill {
      background: #ffffff;
      border-color: rgba(160,125,40,.13);
      box-shadow: 0 1px 4px rgba(160,125,40,.06);
    }
    .learn-light .learn-stat-value  { color: #1e1810; }
    .learn-light .learn-stat-label  { color: #7a6d58; }
    .learn-light .learn-header      { border-color: rgba(160,125,40,.15); }
    .learn-light .learn-header-ornament { color: #a07d28; }
    .learn-light .learn-title       { color: #1e1810; }
    .learn-light .learn-title-ar    { color: #a07d28; }
    .learn-light .learn-subtitle    { color: #7a6d58; }
    .learn-light .learn-section-title { color: #1e1810; }
    .learn-light .learn-section-sub   { color: #7a6d58; }
    .learn-light .learn-continue-label { color: #a07d28; }
    .learn-light .learn-status-text    { color: #7a6d58; }
    .learn-light .learn-ring-bg  { stroke: #fef6e4; }
    .learn-light .learn-ring-fg  { stroke: #a07d28; }
    .learn-light .learn-ring-text { fill: #a07d28; }
    .learn-light .learn-loader   { color: #7a6d58; }
    .learn-light .learn-empty    { color: #7a6d58; }
  `;

  return (
    <style>{`
      /* ── base layout ── */
      .learn-root {
        --serif: Georgia, 'Times New Roman', serif;
        font-family: var(--serif);
        background: var(--clr-bg);
        color: var(--clr-fg);
        min-height: 100vh;
        padding: 1.2rem 1rem 4rem;
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        transition: background .3s ease, color .3s ease;
      }

      /* ── topbar ── */
      .learn-topbar { display: flex; justify-content: flex-end; }
      .learn-theme-toggle {
        display: flex;
        align-items: center;
        gap: .45rem;
        border: 1px solid transparent;
        border-radius: 20px;
        padding: .38rem .85rem;
        font-size: .78rem;
        font-family: var(--serif);
        font-weight: 600;
        cursor: pointer;
        transition: background .2s, color .2s, transform .15s;
        letter-spacing: .02em;
      }
      .learn-theme-toggle:hover { transform: translateY(-1px); }

      /* ── loader ── */
      .learn-loader {
        display: flex;
        align-items: center;
        gap: .75rem;
        justify-content: center;
        min-height: 50vh;
      }
      .learn-loader-icon { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* ── header ── */
      .learn-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--clr-border2);
        transition: border-color .3s;
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
        transition: color .3s;
      }
      .learn-title-ar {
        font-size: 1.2rem;
        font-weight: 400;
        opacity: .8;
        transition: color .3s;
      }
      .learn-subtitle {
        font-size: .82rem;
        font-style: italic;
        margin: 0;
        color: var(--clr-muted-fg);
        transition: color .3s;
      }
      .learn-error { font-size: .8rem; color: #e05555; margin-top: .4rem; }
      .learn-header-ornament {
        font-size: 1.6rem;
        opacity: .25;
        line-height: 1;
        flex-shrink: 0;
        padding-top: .15rem;
        transition: color .3s;
      }

      /* ── continue card ── */
      .learn-continue-card {
        border: 1px solid transparent;
        border-radius: 16px;
        padding: 1.4rem 1.5rem;
        position: relative;
        overflow: hidden;
        transition: background .3s, border-color .3s, box-shadow .3s;
      }
      .learn-continue-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        border-radius: 16px 16px 0 0;
      }
      .learn-continue-label {
        display: flex;
        align-items: center;
        gap: .4rem;
        font-size: .72rem;
        letter-spacing: .1em;
        text-transform: uppercase;
        margin-bottom: 1rem;
        font-style: italic;
        transition: color .3s;
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
        text-transform: uppercase;
        letter-spacing: .07em;
        display: block;
        margin-bottom: .3rem;
        transition: color .3s;
      }
      .learn-continue-hadith {
        font-size: 1.15rem;
        font-weight: 700;
        margin: 0 0 .6rem;
        line-height: 1.3;
        transition: color .3s;
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
        transition: background .3s;
      }
      .learn-status-text {
        font-size: .78rem;
        color: var(--clr-muted-fg);
        transition: color .3s;
      }
      .learn-score-badge {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: .73rem;
        border-radius: 20px;
        padding: 2px 8px;
        transition: color .3s, background .3s;
      }
      .learn-continue-actions {
        display: flex;
        gap: .65rem;
        flex-wrap: wrap;
        flex-shrink: 0;
      }
      .learn-empty { font-size: .85rem; font-style: italic; transition: color .3s; }

      /* ── buttons ── */
      .learn-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        border: none;
        border-radius: 9px;
        padding: .55rem 1.1rem;
        font-size: .85rem;
        font-weight: 700;
        font-family: var(--serif);
        cursor: pointer;
        transition: opacity .15s, transform .15s, background .3s, color .3s;
      }
      .learn-btn-primary:hover { opacity: .88; transform: translateY(-1px); }
      .learn-btn-primary:active { transform: translateY(0); opacity: 1; }

      .learn-btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 9px;
        padding: .55rem 1.1rem;
        font-size: .85rem;
        font-family: var(--serif);
        cursor: pointer;
        transition: border-color .15s, color .15s, transform .15s;
      }
      .learn-btn-ghost:hover { transform: translateY(-1px); }
      .learn-btn-sm { padding: .42rem .9rem; font-size: .8rem; }

      /* ── stats strip ── */
      .learn-stats-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: .75rem;
      }
      @media (max-width: 540px) { .learn-stats-strip { grid-template-columns: repeat(2, 1fr); } }
      .learn-stat-pill {
        border: 1px solid var(--clr-border);
        border-radius: 12px;
        padding: .85rem .9rem;
        display: flex;
        flex-direction: column;
        gap: .2rem;
        transition: border-color .2s, background .3s;
      }
      .learn-stat-pill:hover { border-color: var(--clr-border2); }
      .learn-stat-icon { color: var(--accent); line-height: 1; margin-bottom: .1rem; }
      .learn-stat-value { font-size: 1.5rem; font-weight: 700; line-height: 1; transition: color .3s; }
      .learn-stat-label { font-size: .72rem; letter-spacing: .03em; transition: color .3s; }

      /* ── section head ── */
      .learn-section-head { margin-bottom: .75rem; }
      .learn-section-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 .2rem; transition: color .3s; }
      .learn-section-sub   { font-size: .8rem; margin: 0; font-style: italic; transition: color .3s; }

      /* ── chapters grid ── */
      .learn-chapters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      /* ── chapter card ── */
      .learn-chapter-card {
        border: 1px solid var(--clr-border);
        border-radius: 16px;
        padding: 1.3rem;
        display: flex;
        flex-direction: column;
        gap: .9rem;
        transition: border-color .2s, transform .2s, box-shadow .2s, background .3s;
        animation: cardIn .4s ease both;
        animation-delay: var(--delay, 0ms);
      }
      .learn-chapter-card:hover { border-color: var(--clr-border2); transform: translateY(-2px); }
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
        font-size: 1rem; font-weight: 700;
        margin: 0 0 .2rem; line-height: 1.25;
        transition: color .3s;
      }
      .learn-chapter-title-ar {
        font-size: .95rem; font-weight: 400;
        opacity: .75; margin: 0;
        direction: rtl;
        transition: color .3s;
      }
      .learn-chapter-desc {
        font-size: .8rem; line-height: 1.5; margin: 0;
        font-style: italic; transition: color .3s;
      }

      .learn-chapter-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: .45rem;
      }
      .learn-chapter-stat {
        border-radius: 9px; padding: .55rem .4rem; text-align: center;
        transition: background .3s;
      }
      .learn-chapter-stat-val {
        display: block; font-size: 1.05rem; font-weight: 700; line-height: 1;
        transition: color .3s;
      }
      .learn-chapter-stat-lbl {
        display: block; font-size: .65rem; margin-top: .2rem; letter-spacing: .03em;
        transition: color .3s;
      }

      .learn-chapter-divider { height: 1px; margin: 0 -.1rem; transition: background .3s; }

      .learn-chapter-next { border-radius: 10px; padding: .7rem .9rem; transition: background .3s; }
      .learn-chapter-next-label {
        display: block; font-size: .7rem; letter-spacing: .05em;
        text-transform: uppercase; margin-bottom: .25rem; transition: color .3s;
      }
      .learn-chapter-next-title {
        display: block; font-size: .85rem; font-weight: 600; line-height: 1.35;
        transition: color .3s;
      }

      .learn-chapter-actions { display: flex; gap: .6rem; flex-wrap: wrap; }

      /* ── progress ring ── */
      .learn-ring { flex-shrink: 0; }
      .learn-ring-bg { fill: none; stroke-width: 4; transition: stroke .3s; }
      .learn-ring-fg {
        fill: none; stroke-width: 4; stroke-linecap: round;
        transition: stroke-dashoffset .6s ease, stroke .3s;
      }
      .learn-ring-text {
        font-size: 11px; font-family: Georgia, serif; font-weight: 700;
        transition: fill .3s;
      }

      ${dark}
      ${light}
    `}</style>
  );
}

export default Learn;