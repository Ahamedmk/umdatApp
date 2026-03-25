// /src/pages/ChapterLearn.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUserHadithProgress,
  mergeHadithsWithSupabaseProgress,
} from "../lib/hadithProgress";
import { ArrowLeft, Search } from "lucide-react";

import { CHAPTERS } from "../data/chapters";
import { ALL_HADITHS } from "../data/allHadiths";



const FILTERS = [
  { key: "all",      label: "Tous",      accent: null },
  { key: "new",      label: "Nouveaux",  accent: "#7a8694" },
  { key: "learning", label: "En cours",  accent: "#4a9fc8" },
  { key: "review",   label: "À revoir",  accent: "#e08a3c" },
  { key: "mastered", label: "Maîtrisés", accent: "#c9a84c" },
];

function statusMeta(status) {
  switch (status) {
    case "mastered":
      return { label: "Maîtrisé", color: "#c9a84c" };
    case "review":
      return { label: "À revoir", color: "#e08a3c" };
    case "learning":
      return { label: "En cours", color: "#4a9fc8" };
    case "scheduled":
      return { label: "En cours", color: "#4a9fc8" };
    default:
      return { label: "Nouveau", color: "#7a8694" };
  }
}

export default function ChapterLearn() {
  const navigate = useNavigate();
  const { chapterSlug } = useParams();
  const { user } = useAuth();

  const [search, setSearch]           = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [progressRows, setProgressRows] = useState([]);

  const chapter = useMemo(() => CHAPTERS.find(c => c.slug === chapterSlug), [chapterSlug]);
   useEffect(() => {
  let mounted = true;

  async function loadProgress() {
    if (!user?.id) {
      if (mounted) setProgressRows([]);
      return;
    }

    try {
      const rows = await getUserHadithProgress(user.id);
      if (mounted) setProgressRows(rows);
    } catch (error) {
      console.error("Erreur chargement progression chapitre:", error);
      if (mounted) setProgressRows([]);
    }
  }

  loadProgress();

  return () => {
    mounted = false;
  };
}, [user?.id]);

  const hadiths = useMemo(() => {
  const chapterHadiths = ALL_HADITHS
    .filter(h => h.chapterSlug === chapterSlug)
    .sort((a, b) => (a.hadithOrder || a.number || a.id) - (b.hadithOrder || b.number || b.id));

  return mergeHadithsWithSupabaseProgress(chapterHadiths, progressRows);
}, [chapterSlug, progressRows]);

  const filteredHadiths = useMemo(() => hadiths.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || (h.title || "").toLowerCase().includes(q)
      || String(h.number).includes(q)
      || String(h.id).includes(q)
      || String(h.hadithOrder || "").includes(q);
    const matchFilter =
  activeFilter === "all" ||
  (activeFilter === "learning" &&
    (h.progressStatus === "learning" || h.progressStatus === "scheduled")) ||
  h.progressStatus === activeFilter;
    return matchSearch && matchFilter;
  }), [hadiths, search, activeFilter]);

  const stats = useMemo(() => {
    const total    = hadiths.length;
    const mastered = hadiths.filter(h => h.progressStatus === "mastered").length;
    const review   = hadiths.filter(h => h.progressStatus === "review").length;
    const learning = hadiths.filter(
  h => h.progressStatus === "learning" || h.progressStatus === "scheduled"
).length;
    const fresh    = hadiths.filter(h => h.progressStatus === "new").length;
    const percent  = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, review, learning, fresh, percent };
  }, [hadiths]);

  /* ── not found ── */
  if (!chapter) return (
    <>
      <ChapterStyles />
      <div className="cl-root">
        <div className="cl-notfound">
          <p className="cl-notfound-title">Chapitre introuvable</p>
          <button className="cl-btn-primary" onClick={() => navigate("/learn")}>
            Retour à l'apprentissage
          </button>
        </div>
      </div>
    </>
  );

  /* ── ring svg ── */
  const ringR = 22, ringSize = 52, ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc - (stats.percent / 100) * ringCirc;

  return (
    <>
      <ChapterStyles />
      <div className="cl-root">

        {/* ── Back ── */}
        <button className="cl-back-btn" onClick={() => navigate("/learn")}>
          <ArrowLeft size={14} /> Retour à l'apprentissage
        </button>

        {/* ── Chapter hero ── */}
        <header className="cl-hero">
          <div className="cl-hero-text">
            <h1 className="cl-hero-title">{chapter.titleFr}</h1>
            <p className="cl-hero-ar">{chapter.titleAr}</p>
            {chapter.description && (
              <p className="cl-hero-desc">{chapter.description}</p>
            )}
          </div>

          {/* Ring + stats */}
          <div className="cl-hero-right">
            <svg width={ringSize} height={ringSize} className="cl-ring">
              <circle cx={ringSize/2} cy={ringSize/2} r={ringR} className="cl-ring-bg" />
              <circle
                cx={ringSize/2} cy={ringSize/2} r={ringR}
                className="cl-ring-fg"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOffset}
                transform={`rotate(-90 ${ringSize/2} ${ringSize/2})`}
              />
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="cl-ring-text">
                {stats.percent}%
              </text>
            </svg>
          </div>
        </header>

        {/* ── Stats strip ── */}
        <div className="cl-stats">
          {[
            { label: "Total",     value: stats.total,    accent: "#7a8694" },
            { label: "Maîtrisés", value: stats.mastered, accent: "#c9a84c" },
            { label: "En cours",  value: stats.learning, accent: "#4a9fc8" },
            { label: "À revoir",  value: stats.review,   accent: "#e08a3c" },
            { label: "Nouveaux",  value: stats.fresh,    accent: "#7a8694" },
          ].map(s => (
            <div key={s.label} className="cl-stat" style={{ "--accent": s.accent }}>
              <span className="cl-stat-value">{s.value}</span>
              <span className="cl-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Search + filters ── */}
        <div className="cl-toolbar">
          <div className="cl-search-wrap">
            <Search size={13} className="cl-search-icon" />
            <input
              className="cl-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un hadith…"
            />
            {search && (
              <button className="cl-search-clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="cl-filters">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`cl-filter-btn ${activeFilter === f.key ? "cl-filter-btn--active" : ""}`}
                style={{ "--accent": f.accent || "var(--gold)" }}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.accent && (
                  <span className="cl-filter-dot" style={{ background: f.accent }} />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Hadith list ── */}
        {filteredHadiths.length === 0 ? (
          <div className="cl-empty">
            <p>Aucun hadith ne correspond à ta recherche ou à ce filtre.</p>
          </div>
        ) : (
          <div className="cl-list">
            {filteredHadiths.map((hadith, i) => {
              const { label, color } = statusMeta(hadith.progressStatus);
              return (
                <div
                  key={hadith.id}
                  className="cl-hadith-row"
                  style={{ "--delay": `${i * 40}ms`, "--status-clr": color }}
                >
                  <div className="cl-hadith-status-bar" />

                  <div className="cl-hadith-body">
                    <div className="cl-hadith-top">
                      <span className="cl-hadith-num">
                        Hadith {hadith.hadithOrder || hadith.number || hadith.id}
                      </span>
                      <span className="cl-status-pill" style={{ "--clr": color }}>
                        <span className="cl-status-dot" />
                        {label}
                      </span>
                    </div>

                    <h3 className="cl-hadith-title">
                      {hadith.title || `Hadith ${hadith.hadithOrder || hadith.number || hadith.id}`}
                    </h3>

                    <p className="cl-hadith-chapter">{chapter.shortFr || chapter.titleFr}</p>
                  </div>

                  <button
                    className="cl-open-btn"
                    onClick={() => navigate(`/hadith/${hadith.id}`)}
                  >
                    Ouvrir →
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}

function ChapterStyles() {
  return (
    <style>{`
      .cl-root {
        --bg:       #0d1117;
        --surface:  #161c24;
        --surface2: #1e2630;
        --border:   rgba(255,255,255,.07);
        --border2:  rgba(255,255,255,.13);
        --fg:       #e8e0d0;
        --muted:    #7a8694;
        --gold:     #c9a84c;
        --gold-dim: rgba(201,168,76,.13);
        --serif:    Georgia, 'Times New Roman', serif;

        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 820px;
        margin: 0 auto;
        padding: 1.5rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
      }

      /* ── back ── */
      .cl-back-btn {
        display: inline-flex; align-items: center; gap: .45rem;
        background: transparent; border: 1px solid var(--border2);
        border-radius: 9px; padding: .42rem .9rem;
        font-size: .78rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s;
        align-self: flex-start;
      }
      .cl-back-btn:hover { border-color: var(--gold); color: var(--gold); }

      /* ── hero ── */
      .cl-hero {
        display: flex; align-items: flex-start;
        justify-content: space-between; gap: 1rem;
        background: var(--surface);
        border: 1px solid var(--border);
        border-top: 2px solid var(--gold);
        border-radius: 16px; padding: 1.4rem 1.5rem;
        animation: fadeDown .4s ease both;
        position: relative; overflow: hidden;
      }
      .cl-hero::after {
        content: '';
        position: absolute; top: 0; right: 0;
        width: 120px; height: 120px;
        background: radial-gradient(circle at top right, rgba(201,168,76,.08), transparent 70%);
        pointer-events: none;
      }
      .cl-hero-text { flex: 1; min-width: 0; }
      .cl-hero-title {
        font-size: 1.35rem; font-weight: 700;
        color: var(--fg); margin: 0 0 .3rem;
        line-height: 1.2;
      }
      .cl-hero-ar {
        font-size: 1rem; color: var(--gold);
        opacity: .7; margin: 0 0 .55rem;
        direction: rtl; font-weight: 400;
      }
      .cl-hero-desc {
        font-size: .8rem; color: var(--muted);
        font-style: italic; margin: 0; line-height: 1.55;
      }
      .cl-hero-right { flex-shrink: 0; padding-top: .2rem; }

      /* ── ring ── */
      .cl-ring { display: block; }
      .cl-ring-bg { fill: none; stroke: var(--surface2); stroke-width: 4; }
      .cl-ring-fg {
        fill: none; stroke: var(--gold); stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset .6s ease;
      }
      .cl-ring-text {
        fill: var(--gold); font-size: 10px;
        font-family: var(--serif); font-weight: 700;
      }

      /* ── stats ── */
      .cl-stats {
        display: grid; grid-template-columns: repeat(5, 1fr); gap: .6rem;
      }
      @media (max-width: 520px) { .cl-stats { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 340px) { .cl-stats { grid-template-columns: repeat(2, 1fr); } }
      .cl-stat {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 11px; padding: .7rem .5rem;
        text-align: center;
        transition: border-color .15s;
      }
      .cl-stat:hover { border-color: var(--accent, var(--border2)); }
      .cl-stat-value {
        display: block; font-size: 1.35rem; font-weight: 700;
        color: var(--accent, var(--fg)); line-height: 1;
      }
      .cl-stat-label {
        display: block; font-size: .62rem; color: var(--muted);
        margin-top: .22rem; letter-spacing: .03em;
      }

      /* ── toolbar ── */
      .cl-toolbar {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 14px; padding: 1rem 1.1rem;
        display: flex; flex-direction: column; gap: .85rem;
      }
      .cl-search-wrap {
        display: flex; align-items: center; gap: .5rem;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 10px; padding: 0 .75rem; height: 38px;
        transition: border-color .15s;
      }
      .cl-search-wrap:focus-within { border-color: var(--gold); }
      .cl-search-icon { color: var(--muted); flex-shrink: 0; }
      .cl-search-input {
        flex: 1; background: transparent; border: none; outline: none;
        font-size: .85rem; font-family: var(--serif); color: var(--fg);
      }
      .cl-search-input::placeholder { color: var(--muted); }
      .cl-search-clear {
        background: transparent; border: none;
        color: var(--muted); font-size: .75rem; cursor: pointer;
        transition: color .15s; flex-shrink: 0;
      }
      .cl-search-clear:hover { color: var(--fg); }

      .cl-filters { display: flex; flex-wrap: wrap; gap: .45rem; }
      .cl-filter-btn {
        display: inline-flex; align-items: center; gap: .35rem;
        background: transparent; border: 1px solid var(--border2);
        border-radius: 99px; padding: .3rem .8rem;
        font-size: .75rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s, background .15s;
      }
      .cl-filter-btn:hover { border-color: var(--accent, var(--gold)); color: var(--fg); }
      .cl-filter-btn--active {
        background: color-mix(in srgb, var(--accent, var(--gold)) 15%, transparent);
        border-color: var(--accent, var(--gold));
        color: var(--fg);
      }
      .cl-filter-dot {
        width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
      }

      /* ── hadith list ── */
      .cl-list { display: flex; flex-direction: column; gap: .55rem; }

      .cl-hadith-row {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 13px;
        display: flex; align-items: stretch; gap: 0;
        overflow: hidden;
        transition: border-color .15s, transform .15s, box-shadow .15s;
        animation: fadeUp .35s ease both;
        animation-delay: var(--delay, 0ms);
      }
      .cl-hadith-row:hover {
        border-color: var(--border2);
        transform: translateX(3px);
        box-shadow: 0 4px 20px rgba(0,0,0,.25);
      }
      .cl-hadith-status-bar {
        width: 3px; flex-shrink: 0;
        background: var(--status-clr, var(--muted));
      }
      .cl-hadith-body {
        flex: 1; min-width: 0;
        padding: .85rem .95rem;
        display: flex; flex-direction: column; gap: .3rem;
      }
      .cl-hadith-top {
        display: flex; align-items: center; gap: .6rem; flex-wrap: wrap;
      }
      .cl-hadith-num {
        font-size: .68rem; color: var(--muted);
        text-transform: uppercase; letter-spacing: .06em;
      }
      .cl-status-pill {
        display: inline-flex; align-items: center; gap: .3rem;
        font-size: .68rem;
        color: var(--clr);
        background: color-mix(in srgb, var(--clr) 12%, transparent);
        border-radius: 20px; padding: 1px 7px;
      }
      .cl-status-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: var(--clr); flex-shrink: 0;
      }
      .cl-hadith-title {
        font-size: .9rem; font-weight: 700;
        color: var(--fg); margin: 0; line-height: 1.3;
      }
      .cl-hadith-chapter {
        font-size: .72rem; color: var(--muted);
        font-style: italic; margin: 0;
      }
      .cl-open-btn {
        align-self: center; flex-shrink: 0;
        margin-right: .85rem;
        background: transparent; border: 1px solid var(--border2);
        border-radius: 8px; padding: .38rem .75rem;
        font-size: .75rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s;
        white-space: nowrap;
      }
      .cl-open-btn:hover { border-color: var(--gold); color: var(--gold); }

      /* ── empty ── */
      .cl-empty {
        background: var(--surface); border: 2px dashed var(--border2);
        border-radius: 14px; padding: 2rem;
        text-align: center; font-size: .85rem;
        color: var(--muted); font-style: italic;
      }

      /* ── not found ── */
      .cl-notfound {
        background: var(--surface); border: 1px solid var(--border2);
        border-radius: 16px; padding: 2rem;
        display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;
      }
      .cl-notfound-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
      .cl-btn-primary {
        display: inline-flex; align-items: center; gap: .4rem;
        background: var(--gold); color: #0d1117;
        border: none; border-radius: 9px;
        padding: .55rem 1.1rem; font-size: .85rem;
        font-weight: 700; font-family: var(--serif); cursor: pointer;
        transition: opacity .15s;
      }
      .cl-btn-primary:hover { opacity: .88; }

      /* ── animations ── */
      @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
  );
}