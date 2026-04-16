// /src/pages/ChapterLearn.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUserHadithProgress,
  mergeHadithsWithSupabaseProgress,
} from "../lib/hadithProgress";
import { ArrowLeft, Search } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

import { CHAPTERS } from "../data/chapters";
import { ALL_HADITHS } from "../data/allHadiths";

const FILTERS = [
  { key: "all",      label: "Tous",      accent: null },
  { key: "new",      label: "Nouveaux",  accentDark: "#7a8694",  accentLight: "#6a7580" },
  { key: "learning", label: "En cours",  accentDark: "#4a9fc8",  accentLight: "#2a7ab0" },
  { key: "review",   label: "À revoir",  accentDark: "#e08a3c",  accentLight: "#bf6a1a" },
  { key: "mastered", label: "Maîtrisés", accentDark: "#c9a84c",  accentLight: "#a07d28" },
];

function statusMeta(status, isDark) {
  switch (status) {
    case "mastered":  return { label: "Maîtrisé", color: isDark ? "#c9a84c" : "#a07d28" };
    case "review":    return { label: "À revoir",  color: isDark ? "#e08a3c" : "#bf6a1a" };
    case "learning":  return { label: "En cours",  color: isDark ? "#4a9fc8" : "#2a7ab0" };
    case "scheduled": return { label: "En cours",  color: isDark ? "#4a9fc8" : "#2a7ab0" };
    default:          return { label: "Nouveau",   color: isDark ? "#7a8694" : "#6a7580" };
  }
}

export default function ChapterLearn() {
  const navigate = useNavigate();
  const { chapterSlug } = useParams();
  const { user } = useAuth();

  const [search, setSearch]             = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [progressRows, setProgressRows] = useState([]);
  const { isDark } = useTheme();

  const chapter = useMemo(() => CHAPTERS.find(c => c.slug === chapterSlug), [chapterSlug]);

  useEffect(() => {
    let mounted = true;
    async function loadProgress() {
      if (!user?.id) { if (mounted) setProgressRows([]); return; }
      try {
        const rows = await getUserHadithProgress(user.id);
        if (mounted) setProgressRows(rows);
      } catch (error) {
        console.error("Erreur chargement progression chapitre:", error);
        if (mounted) setProgressRows([]);
      }
    }
    loadProgress();
    return () => { mounted = false; };
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
      (activeFilter === "learning" && (h.progressStatus === "learning" || h.progressStatus === "scheduled")) ||
      h.progressStatus === activeFilter;
    return matchSearch && matchFilter;
  }), [hadiths, search, activeFilter]);

  const stats = useMemo(() => {
    const total    = hadiths.length;
    const mastered = hadiths.filter(h => h.progressStatus === "mastered").length;
    const review   = hadiths.filter(h => h.progressStatus === "review").length;
    const learning = hadiths.filter(h => h.progressStatus === "learning" || h.progressStatus === "scheduled").length;
    const fresh    = hadiths.filter(h => h.progressStatus === "new").length;
    const percent  = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, review, learning, fresh, percent };
  }, [hadiths]);

  const themeClass = isDark ? "cl-dark" : "cl-light";

  /* ── not found ── */
  if (!chapter) return (
    <>
      <ChapterStyles isDark={isDark} />
      <div className={`cl-root ${themeClass}`}>
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

  const statsRow = [
    { label: "Total",     value: stats.total,    accent: isDark ? "#7a8694" : "#6a7580" },
    { label: "Maîtrisés", value: stats.mastered, accent: isDark ? "#c9a84c" : "#a07d28" },
    { label: "En cours",  value: stats.learning, accent: isDark ? "#4a9fc8" : "#2a7ab0" },
    { label: "À revoir",  value: stats.review,   accent: isDark ? "#e08a3c" : "#bf6a1a" },
    { label: "Nouveaux",  value: stats.fresh,    accent: isDark ? "#7a8694" : "#6a7580" },
  ];

  return (
    <>
      <ChapterStyles isDark={isDark} />
      <div className={`cl-root ${themeClass}`}>

        {/* ── Topbar ── */}
        <div className="cl-topbar">
          <button className="cl-back-btn" onClick={() => navigate("/learn")}>
            <ArrowLeft size={14} /> Retour à l'apprentissage
          </button>
        </div>

        {/* ── Chapter hero ── */}
        <header className="cl-hero">
          <div className="cl-hero-text">
            <h1 className="cl-hero-title">{chapter.titleFr}</h1>
            <p className="cl-hero-ar">{chapter.titleAr}</p>
            {chapter.description && (
              <p className="cl-hero-desc">{chapter.description}</p>
            )}
          </div>
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
          {statsRow.map(s => (
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
            {FILTERS.map(f => {
              const accent = f.accentDark
                ? (isDark ? f.accentDark : f.accentLight)
                : null;
              return (
                <button
                  key={f.key}
                  className={`cl-filter-btn ${activeFilter === f.key ? "cl-filter-btn--active" : ""}`}
                  style={{ "--accent": accent || "var(--gold)" }}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {accent && <span className="cl-filter-dot" style={{ background: accent }} />}
                  {f.label}
                </button>
              );
            })}
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
              const { label, color } = statusMeta(hadith.progressStatus, isDark);
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

function ChapterStyles({ isDark }) {
  const dark = `
    .cl-dark {
      --bg:       #0d1117;
      --surface:  #161c24;
      --surface2: #1e2630;
      --border:   rgba(255,255,255,.07);
      --border2:  rgba(255,255,255,.13);
      --fg:       #e8e0d0;
      --muted:    #7a8694;
      --gold:     #c9a84c;
      --gold-dim: rgba(201,168,76,.13);
    }
    .cl-dark .cl-theme-toggle {
      background: rgba(255,255,255,.07);
      color: #c9a84c;
      border-color: rgba(201,168,76,.2);
    }
    .cl-dark .cl-theme-toggle:hover { background: rgba(201,168,76,.12); }
    .cl-dark .cl-back-btn { border-color: rgba(255,255,255,.13); color: #7a8694; }
    .cl-dark .cl-back-btn:hover { border-color: #c9a84c; color: #c9a84c; }
    .cl-dark .cl-hero {
      background: #161c24;
      border-color: rgba(255,255,255,.07);
      border-top-color: #c9a84c;
    }
    .cl-dark .cl-hero::after {
      background: radial-gradient(circle at top right, rgba(201,168,76,.08), transparent 70%);
    }
    .cl-dark .cl-hero-title { color: #e8e0d0; }
    .cl-dark .cl-hero-ar    { color: #c9a84c; }
    .cl-dark .cl-hero-desc  { color: #7a8694; }
    .cl-dark .cl-ring-bg   { stroke: #1e2630; }
    .cl-dark .cl-ring-fg   { stroke: #c9a84c; }
    .cl-dark .cl-ring-text { fill: #c9a84c; }
    .cl-dark .cl-stat { background: #161c24; border-color: rgba(255,255,255,.07); }
    .cl-dark .cl-stat-label { color: #7a8694; }
    .cl-dark .cl-toolbar { background: #161c24; border-color: rgba(255,255,255,.07); }
    .cl-dark .cl-search-wrap { background: #1e2630; border-color: rgba(255,255,255,.13); }
    .cl-dark .cl-search-wrap:focus-within { border-color: #c9a84c; }
    .cl-dark .cl-search-input { color: #e8e0d0; }
    .cl-dark .cl-search-icon  { color: #7a8694; }
    .cl-dark .cl-search-clear { color: #7a8694; }
    .cl-dark .cl-search-clear:hover { color: #e8e0d0; }
    .cl-dark .cl-filter-btn { border-color: rgba(255,255,255,.13); color: #7a8694; }
    .cl-dark .cl-filter-btn:hover { border-color: var(--accent, #c9a84c); color: #e8e0d0; }
    .cl-dark .cl-filter-btn--active { color: #e8e0d0; }
    .cl-dark .cl-hadith-row { background: #161c24; border-color: rgba(255,255,255,.07); }
    .cl-dark .cl-hadith-row:hover { border-color: rgba(255,255,255,.13); box-shadow: 0 4px 20px rgba(0,0,0,.25); }
    .cl-dark .cl-hadith-num    { color: #7a8694; }
    .cl-dark .cl-hadith-title  { color: #e8e0d0; }
    .cl-dark .cl-hadith-chapter { color: #7a8694; }
    .cl-dark .cl-open-btn { border-color: rgba(255,255,255,.13); color: #7a8694; }
    .cl-dark .cl-open-btn:hover { border-color: #c9a84c; color: #c9a84c; }
    .cl-dark .cl-empty { background: #161c24; border-color: rgba(255,255,255,.13); color: #7a8694; }
    .cl-dark .cl-notfound { background: #161c24; border-color: rgba(255,255,255,.13); }
    .cl-dark .cl-notfound-title { color: #e8e0d0; }
    .cl-dark .cl-btn-primary { background: #c9a84c; color: #0d1117; }
  `;

  const light = `
    .cl-light {
      --bg:       #fdf8f0;
      --surface:  #ffffff;
      --surface2: #fef6e4;
      --border:   rgba(160,125,40,.13);
      --border2:  rgba(160,125,40,.25);
      --fg:       #2c2416;
      --muted:    #7a6d58;
      --gold:     #a07d28;
      --gold-dim: rgba(160,125,40,.1);
    }
    .cl-light .cl-theme-toggle {
      background: rgba(160,125,40,.08);
      color: #7c56c8;
      border-color: rgba(124,86,200,.2);
    }
    .cl-light .cl-theme-toggle:hover { background: rgba(124,86,200,.1); }
    .cl-light .cl-back-btn { border-color: rgba(160,125,40,.25); color: #7a6d58; }
    .cl-light .cl-back-btn:hover { border-color: #a07d28; color: #a07d28; }
    .cl-light .cl-hero {
      background: #ffffff;
      border-color: rgba(160,125,40,.13);
      border-top-color: #a07d28;
      box-shadow: 0 2px 16px rgba(160,125,40,.07);
    }
    .cl-light .cl-hero::after {
      background: radial-gradient(circle at top right, rgba(160,125,40,.06), transparent 70%);
    }
    .cl-light .cl-hero-title { color: #1e1810; }
    .cl-light .cl-hero-ar    { color: #a07d28; }
    .cl-light .cl-hero-desc  { color: #7a6d58; }
    .cl-light .cl-ring-bg   { stroke: #fef6e4; }
    .cl-light .cl-ring-fg   { stroke: #a07d28; }
    .cl-light .cl-ring-text { fill: #a07d28; }
    .cl-light .cl-stat {
      background: #ffffff;
      border-color: rgba(160,125,40,.13);
      box-shadow: 0 1px 4px rgba(160,125,40,.06);
    }
    .cl-light .cl-stat-label { color: #7a6d58; }
    .cl-light .cl-toolbar {
      background: #ffffff;
      border-color: rgba(160,125,40,.13);
      box-shadow: 0 1px 6px rgba(160,125,40,.06);
    }
    .cl-light .cl-search-wrap {
      background: #fef6e4;
      border-color: rgba(160,125,40,.22);
    }
    .cl-light .cl-search-wrap:focus-within { border-color: #a07d28; }
    .cl-light .cl-search-input { color: #2c2416; }
    .cl-light .cl-search-icon  { color: #7a6d58; }
    .cl-light .cl-search-clear { color: #7a6d58; }
    .cl-light .cl-search-clear:hover { color: #2c2416; }
    .cl-light .cl-filter-btn { border-color: rgba(160,125,40,.22); color: #7a6d58; }
    .cl-light .cl-filter-btn:hover { border-color: var(--accent, #a07d28); color: #2c2416; }
    .cl-light .cl-filter-btn--active { color: #2c2416; }
    .cl-light .cl-hadith-row {
      background: #ffffff;
      border-color: rgba(160,125,40,.13);
      box-shadow: 0 1px 4px rgba(160,125,40,.05);
    }
    .cl-light .cl-hadith-row:hover {
      border-color: rgba(160,125,40,.28);
      box-shadow: 0 4px 18px rgba(160,125,40,.12);
    }
    .cl-light .cl-hadith-num    { color: #7a6d58; }
    .cl-light .cl-hadith-title  { color: #1e1810; }
    .cl-light .cl-hadith-chapter { color: #7a6d58; }
    .cl-light .cl-open-btn { border-color: rgba(160,125,40,.22); color: #7a6d58; }
    .cl-light .cl-open-btn:hover { border-color: #a07d28; color: #a07d28; }
    .cl-light .cl-empty {
      background: #ffffff;
      border-color: rgba(160,125,40,.2);
      color: #7a6d58;
    }
    .cl-light .cl-notfound {
      background: #ffffff;
      border-color: rgba(160,125,40,.2);
    }
    .cl-light .cl-notfound-title { color: #1e1810; }
    .cl-light .cl-btn-primary { background: #a07d28; color: #ffffff; }
  `;

  return (
    <style>{`
      .cl-root {
        --serif: Georgia, 'Times New Roman', serif;
        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 820px;
        margin: 0 auto;
        padding: 1.2rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
        transition: background .3s ease, color .3s ease;
      }

      /* ── topbar ── */
      .cl-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .cl-theme-toggle {
        display: flex; align-items: center; gap: .45rem;
        border: 1px solid transparent; border-radius: 20px;
        padding: .38rem .85rem;
        font-size: .78rem; font-family: var(--serif); font-weight: 600;
        cursor: pointer; flex-shrink: 0;
        transition: background .2s, color .2s, transform .15s;
        letter-spacing: .02em;
      }
      .cl-theme-toggle:hover { transform: translateY(-1px); }

      /* ── back ── */
      .cl-back-btn {
        display: inline-flex; align-items: center; gap: .45rem;
        background: transparent; border: 1px solid transparent;
        border-radius: 9px; padding: .42rem .9rem;
        font-size: .78rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s;
      }

      /* ── hero ── */
      .cl-hero {
        display: flex; align-items: flex-start;
        justify-content: space-between; gap: 1rem;
        border: 1px solid transparent;
        border-top-width: 2px;
        border-radius: 16px; padding: 1.4rem 1.5rem;
        animation: fadeDown .4s ease both;
        position: relative; overflow: hidden;
        transition: background .3s, border-color .3s, box-shadow .3s;
      }
      .cl-hero::after {
        content: ''; position: absolute; top: 0; right: 0;
        width: 120px; height: 120px; pointer-events: none;
      }
      .cl-hero-text { flex: 1; min-width: 0; }
      .cl-hero-title { font-size: 1.35rem; font-weight: 700; margin: 0 0 .3rem; line-height: 1.2; transition: color .3s; }
      .cl-hero-ar    { font-size: 1rem; opacity: .7; margin: 0 0 .55rem; direction: rtl; font-weight: 400; transition: color .3s; }
      .cl-hero-desc  { font-size: .8rem; font-style: italic; margin: 0; line-height: 1.55; transition: color .3s; }
      .cl-hero-right { flex-shrink: 0; padding-top: .2rem; }

      /* ── ring ── */
      .cl-ring { display: block; }
      .cl-ring-bg { fill: none; stroke-width: 4; transition: stroke .3s; }
      .cl-ring-fg { fill: none; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset .6s ease, stroke .3s; }
      .cl-ring-text { font-size: 10px; font-family: var(--serif); font-weight: 700; transition: fill .3s; }

      /* ── stats ── */
      .cl-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: .6rem; }
      @media (max-width: 520px) { .cl-stats { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 340px) { .cl-stats { grid-template-columns: repeat(2, 1fr); } }
      .cl-stat {
        border: 1px solid var(--border); border-radius: 11px; padding: .7rem .5rem;
        text-align: center; transition: border-color .15s, background .3s, box-shadow .2s;
      }
      .cl-stat:hover { border-color: var(--accent, var(--border2)); }
      .cl-stat-value { display: block; font-size: 1.35rem; font-weight: 700; color: var(--accent, var(--fg)); line-height: 1; }
      .cl-stat-label { display: block; font-size: .62rem; margin-top: .22rem; letter-spacing: .03em; transition: color .3s; }

      /* ── toolbar ── */
      .cl-toolbar {
        border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.1rem;
        display: flex; flex-direction: column; gap: .85rem;
        transition: background .3s, border-color .3s;
      }
      .cl-search-wrap {
        display: flex; align-items: center; gap: .5rem;
        border: 1px solid transparent; border-radius: 10px;
        padding: 0 .75rem; height: 38px;
        transition: border-color .15s, background .3s;
      }
      .cl-search-icon { flex-shrink: 0; transition: color .3s; }
      .cl-search-input {
        flex: 1; background: transparent; border: none; outline: none;
        font-size: .85rem; font-family: var(--serif);
        transition: color .3s;
      }
      .cl-search-input::placeholder { color: var(--muted); }
      .cl-search-clear {
        background: transparent; border: none;
        font-size: .75rem; cursor: pointer;
        transition: color .15s; flex-shrink: 0;
      }

      .cl-filters { display: flex; flex-wrap: wrap; gap: .45rem; }
      .cl-filter-btn {
        display: inline-flex; align-items: center; gap: .35rem;
        background: transparent; border: 1px solid transparent;
        border-radius: 99px; padding: .3rem .8rem;
        font-size: .75rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s, background .15s;
      }
      .cl-filter-btn--active {
        background: color-mix(in srgb, var(--accent, var(--gold)) 15%, transparent);
        border-color: var(--accent, var(--gold));
      }
      .cl-filter-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

      /* ── hadith list ── */
      .cl-list { display: flex; flex-direction: column; gap: .55rem; }
      .cl-hadith-row {
        border: 1px solid var(--border); border-radius: 13px;
        display: flex; align-items: stretch; gap: 0; overflow: hidden;
        transition: border-color .15s, transform .15s, box-shadow .15s, background .3s;
        animation: fadeUp .35s ease both;
        animation-delay: var(--delay, 0ms);
      }
      .cl-hadith-row:hover { transform: translateX(3px); }
      .cl-hadith-status-bar { width: 3px; flex-shrink: 0; background: var(--status-clr, var(--muted)); }
      .cl-hadith-body {
        flex: 1; min-width: 0; padding: .85rem .95rem;
        display: flex; flex-direction: column; gap: .3rem;
      }
      .cl-hadith-top { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
      .cl-hadith-num { font-size: .68rem; text-transform: uppercase; letter-spacing: .06em; transition: color .3s; }
      .cl-status-pill {
        display: inline-flex; align-items: center; gap: .3rem;
        font-size: .68rem; color: var(--clr);
        background: color-mix(in srgb, var(--clr) 12%, transparent);
        border-radius: 20px; padding: 1px 7px;
      }
      .cl-status-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--clr); flex-shrink: 0; }
      .cl-hadith-title { font-size: .9rem; font-weight: 700; margin: 0; line-height: 1.3; transition: color .3s; }
      .cl-hadith-chapter { font-size: .72rem; font-style: italic; margin: 0; transition: color .3s; }
      .cl-open-btn {
        align-self: center; flex-shrink: 0; margin-right: .85rem;
        background: transparent; border: 1px solid transparent;
        border-radius: 8px; padding: .38rem .75rem;
        font-size: .75rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s;
        white-space: nowrap;
      }

      /* ── empty / notfound ── */
      .cl-empty {
        border: 2px dashed var(--border2); border-radius: 14px; padding: 2rem;
        text-align: center; font-size: .85rem; font-style: italic;
        transition: background .3s, border-color .3s, color .3s;
      }
      .cl-notfound {
        border: 1px solid var(--border2); border-radius: 16px; padding: 2rem;
        display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;
        transition: background .3s, border-color .3s;
      }
      .cl-notfound-title { font-size: 1.1rem; font-weight: 700; margin: 0; transition: color .3s; }
      .cl-btn-primary {
        display: inline-flex; align-items: center; gap: .4rem;
        border: none; border-radius: 9px;
        padding: .55rem 1.1rem; font-size: .85rem;
        font-weight: 700; font-family: var(--serif); cursor: pointer;
        transition: opacity .15s, background .3s, color .3s;
      }
      .cl-btn-primary:hover { opacity: .88; }

      /* ── animations ── */
      @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

      ${dark}
      ${light}
    `}</style>
  );
}
