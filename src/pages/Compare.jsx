// /src/pages/Compare.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Scale, Search, Filter, BookMarked, ExternalLink, FileText, Sun, Moon,
} from "lucide-react";
import { ALL_HADITHS } from "../data/allHadiths";

/* ─── config ─── */
const SCHOOL_CONFIG = {
  hanafi:  { label: "Hanafite",  colorDark: "#4a9fc8", colorLight: "#2a7ab0", getFr: i => i.opinions?.Hanafi?.fr  || "", getAr: i => i.opinions?.Hanafi?.ar  || "" },
  maliki:  { label: "Malikite",  colorDark: "#4a9f82", colorLight: "#2d8c6a", getFr: i => i.opinions?.Maliki?.fr  || "", getAr: i => i.opinions?.Maliki?.ar  || "" },
  shafi:   { label: "Chafi'ite", colorDark: "#9f7ae0", colorLight: "#7c56c8", getFr: i => i.opinions?.Shafi?.fr   || "", getAr: i => i.opinions?.Shafi?.ar   || "" },
  hanbali: { label: "Hanbalite", colorDark: "#c9a84c", colorLight: "#a07d28", getFr: i => i.opinions?.Hanbali?.fr || "", getAr: i => i.opinions?.Hanbali?.ar || "" },
};

const CONSENSUS_META_DARK = {
  consensus:  { label: "Consensus",          color: "#4a9f82" },
  majority:   { label: "Majorité",           color: "#4a9fc8" },
  divergence: { label: "Divergence",         color: "#e08a3c" },
  partial:    { label: "Données partielles", color: "#7a8694" },
};
const CONSENSUS_META_LIGHT = {
  consensus:  { label: "Consensus",          color: "#2d8c6a" },
  majority:   { label: "Majorité",           color: "#2a7ab0" },
  divergence: { label: "Divergence",         color: "#bf6a1a" },
  partial:    { label: "Données partielles", color: "#6a7580" },
};

const CHAPTER_LABELS = {
  tahara: "Ṭahāra", salat: "Ṣalāh", zakat: "Zakāh",
  siyam: "Ṣiyām", hajj: "Ḥajj", buyu: "Buyūʿ", nikah: "Nikāḥ",
};

/* ─── helpers ─── */
function norm(v) { return String(v || "").toLowerCase(); }
function getVisibleSchools(sel) { return sel === "all" ? Object.keys(SCHOOL_CONFIG) : [sel]; }
function hasOpinion(item) {
  return !!(item?.opinions?.Hanafi?.fr || item?.opinions?.Maliki?.fr ||
            item?.opinions?.Shafi?.fr  || item?.opinions?.Hanbali?.fr);
}
function getOpinionValues(item) {
  return [item.opinions?.Hanafi?.fr, item.opinions?.Maliki?.fr,
          item.opinions?.Shafi?.fr,  item.opinions?.Hanbali?.fr].filter(Boolean);
}
function getConsensus(item, isDark) {
  const CONSENSUS_META = isDark ? CONSENSUS_META_DARK : CONSENSUS_META_LIGHT;
  const ops = getOpinionValues(item);
  if (ops.length < 4) return { level: "partial", ...CONSENSUS_META.partial };
  const counts = {};
  ops.forEach(o => { counts[o] = (counts[o] || 0) + 1; });
  const max = Math.max(...Object.values(counts));
  if (max === 4) return { level: "consensus",  ...CONSENSUS_META.consensus  };
  if (max === 3) return { level: "majority",   ...CONSENSUS_META.majority   };
  return { level: "divergence", ...CONSENSUS_META.divergence };
}
function trunc(text, max = 100) {
  const s = String(text || "").trim();
  return s ? (s.length <= max ? s : `${s.slice(0, max).trim()}…`) : "—";
}
function buildGroups(hadiths) {
  const map = new Map();
  hadiths.forEach(h => {
    const key = h.chapterSlug || h.chapter || "autre";
    if (!map.has(key)) map.set(key, { chapter: key, category: h.chapterTitle || CHAPTER_LABELS[key] || key, chapterOrder: h.chapterOrder ?? 999, items: [] });
    map.get(key).items.push(h);
  });
  return [...map.values()]
    .map(g => ({ ...g, items: g.items.sort((a, b) => (a.number || 0) - (b.number || 0)) }))
    .sort((a, b) => a.chapterOrder - b.chapterOrder);
}

/* ─── sub-components ─── */
function ConsensusPill({ level, label, color }) {
  return (
    <span className="cmp-consensus-pill" style={{ "--clr": color }}>
      <span className="cmp-consensus-dot" />{label}
    </span>
  );
}

function SchoolDetailCard({ schoolKey, item, isDark }) {
  const s  = SCHOOL_CONFIG[schoolKey];
  const color = isDark ? s.colorDark : s.colorLight;
  const fr = s.getFr(item);
  const ar = s.getAr(item);
  return (
    <div className="cmp-school-card" style={{ "--clr": color }}>
      <div className="cmp-school-card-head">
        <span className="cmp-school-dot" />
        <span className="cmp-school-card-label">{s.label}</span>
      </div>
      {fr ? <p className="cmp-school-fr">{fr}</p> : <p className="cmp-school-empty">Aucun avis détaillé disponible.</p>}
      {ar && <div className="cmp-school-ar-wrap"><p className="cmp-school-ar" dir="rtl">{ar}</p></div>}
    </div>
  );
}

function MobileItem({ item, detailKey, isExpanded, toggleDetails, visibleSchools, onOpenHadith, isDark }) {
  const cons = getConsensus(item, isDark);
  return (
    <div className="cmp-mobile-row" style={{ "--status-clr": cons.color }}>
      <div className="cmp-mobile-row-bar" />
      <div className="cmp-mobile-row-body">
        <div className="cmp-mobile-row-top">
          <span className="cmp-mobile-hadith-title">
            Hadith {item.number}{item.title ? ` — ${item.title}` : ""}
          </span>
          <ConsensusPill {...cons} />
        </div>
        <div className="cmp-mobile-opinions">
          {visibleSchools.map(k => {
            const s = SCHOOL_CONFIG[k];
            const color = isDark ? s.colorDark : s.colorLight;
            return (
              <div key={k} className="cmp-mobile-opinion">
                <span className="cmp-opinion-dot" style={{ background: color }} />
                <span><strong style={{ color }}>{s.label} : </strong>{trunc(s.getFr(item))}</span>
              </div>
            );
          })}
        </div>
        <div className="cmp-mobile-row-actions">
          <button className="cmp-btn-ghost-xs" onClick={() => onOpenHadith(item.number)}>
            <ExternalLink size={11} /> Ouvrir
          </button>
          <button className="cmp-btn-ghost-xs" onClick={() => toggleDetails(detailKey)}>
            <FileText size={11} /> {isExpanded ? "Masquer" : "Détails"}
          </button>
        </div>
        {isExpanded && (
          <div className="cmp-mobile-detail">
            {item.french_text && <p className="cmp-detail-fr"><strong>Traduction : </strong>{item.french_text}</p>}
            {item.source && <p className="cmp-detail-source"><strong>Source : </strong>{item.source}</p>}
            <div className="cmp-detail-schools">
              {visibleSchools.map(k => <SchoolDetailCard key={k} schoolKey={k} item={item} isDark={isDark} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════ */
export function Compare() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]         = useState("");
  const [selectedSchool, setSelectedSchool]   = useState("all");
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState(new Set());
  const [isDark, setIsDark]                   = useState(true);

  /* theme sync */
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

  const CONSENSUS_META = isDark ? CONSENSUS_META_DARK : CONSENSUS_META_LIGHT;

  const compareHadiths = useMemo(() => ALL_HADITHS.filter(hasOpinion), []);

  const chapterOptions = useMemo(() => {
    const map = new Map();
    compareHadiths.forEach(h => {
      const key = h.chapterSlug || h.chapter || "autre";
      if (!map.has(key)) map.set(key, { key, order: h.chapterOrder ?? 999, label: h.chapterTitle || CHAPTER_LABELS[key] || key });
    });
    return [{ key: "all", label: "Tous", order: 0 }, ...[...map.values()].sort((a, b) => a.order - b.order)];
  }, [compareHadiths]);

  const groupedData = useMemo(() => {
    const q = norm(searchQuery);
    const filtered = compareHadiths.filter(item => {
      if (selectedChapter !== "all" && (item.chapterSlug || item.chapter || "autre") !== selectedChapter) return false;
      if (!q) return true;
      const cons = getConsensus(item, isDark);
      return [item.title, item.number, item.french_text, item.source, item.chapterTitle, cons.label,
        ...Object.values(SCHOOL_CONFIG).map(s => s.getFr(item))
      ].some(v => norm(v).includes(q));
    });
    return buildGroups(filtered);
  }, [compareHadiths, searchQuery, selectedChapter, isDark]);

  const flatItems = useMemo(() => groupedData.flatMap(g => g.items), [groupedData]);

  const summary = useMemo(() => {
    const acc = { consensus: 0, majority: 0, divergence: 0, partial: 0 };
    flatItems.forEach(item => { acc[getConsensus(item, isDark).level]++; });
    return acc;
  }, [flatItems, isDark]);

  const visibleSchools = useMemo(() => getVisibleSchools(selectedSchool), [selectedSchool]);
  const toggleDetails = key => setExpandedDetails(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const hasFilters = selectedSchool !== "all" || selectedChapter !== "all" || searchQuery;
  const themeClass = isDark ? "cmp-dark" : "cmp-light";

  return (
    <>
      <CompareStyles isDark={isDark} />
      <div className={`cmp-root ${themeClass}`}>

        {/* ── Topbar ── */}
        <div className="cmp-topbar">
          <button className="cmp-theme-toggle" onClick={toggleTheme} aria-label="Changer de thème">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </div>

        {/* ── Header ── */}
        <header className="cmp-header">
          <div className="cmp-header-left">
            <div className="cmp-icon-wrap"><Scale size={17} /></div>
            <div>
              <h1 className="cmp-title">Comparateur des 4 écoles</h1>
              <p className="cmp-subtitle">Vue synthétique + détails par école juridique</p>
            </div>
          </div>
        </header>

        {/* ── Summary stats ── */}
        <div className="cmp-stats">
          <div className="cmp-stat cmp-stat--total">
            <span className="cmp-stat-value">{flatItems.length}</span>
            <span className="cmp-stat-label">Hadiths</span>
          </div>
          {Object.entries(CONSENSUS_META).map(([k, m]) => (
            <div key={k} className="cmp-stat" style={{ "--accent": m.color }}>
              <span className="cmp-stat-value">{summary[k]}</span>
              <span className="cmp-stat-label">{m.label}</span>
            </div>
          ))}
        </div>

        {/* ── School filter cards ── */}
        <div className="cmp-school-filters">
          {Object.entries(SCHOOL_CONFIG).map(([key, s]) => {
            const color = isDark ? s.colorDark : s.colorLight;
            return (
              <button
                key={key}
                className={`cmp-school-filter ${selectedSchool === key ? "cmp-school-filter--active" : ""}`}
                style={{ "--clr": color }}
                onClick={() => setSelectedSchool(selectedSchool === key ? "all" : key)}
              >
                <BookMarked size={14} />
                <span className="cmp-school-filter-label">{s.label}</span>
                {selectedSchool === key && <span className="cmp-school-filter-active-txt">actif</span>}
              </button>
            );
          })}
        </div>

        {/* ── Search + chapter filters ── */}
        <div className="cmp-toolbar">
          <div className="cmp-search-wrap">
            <Search size={13} className="cmp-search-icon" />
            <input
              className="cmp-search-input"
              placeholder="Rechercher un hadith, un avis, un numéro…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && <button className="cmp-search-clear" onClick={() => setSearchQuery("")}>✕</button>}
          </div>
          <div className="cmp-chapter-filters">
            {chapterOptions.map(c => (
              <button
                key={c.key}
                className={`cmp-chapter-btn ${selectedChapter === c.key ? "cmp-chapter-btn--active" : ""}`}
                onClick={() => setSelectedChapter(c.key)}
              >
                {c.label}
              </button>
            ))}
            {hasFilters && (
              <button
                className="cmp-chapter-btn cmp-chapter-btn--reset"
                onClick={() => { setSelectedSchool("all"); setSelectedChapter("all"); setSearchQuery(""); }}
              >
                <Filter size={11} /> Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* ── Groups ── */}
        {groupedData.length === 0 ? (
          <div className="cmp-empty">
            <Search size={32} className="cmp-empty-icon" />
            <p>Aucun résultat trouvé.</p>
          </div>
        ) : (
          <div className="cmp-groups">
            {groupedData.map((group, catIdx) => (
              <div key={group.chapter} className="cmp-group">
                <div className="cmp-group-header">
                  <div className="cmp-group-icon"><BookMarked size={14} /></div>
                  <div>
                    <span className="cmp-group-title">{group.category}</span>
                    <span className="cmp-group-count">{group.items.length} hadith{group.items.length > 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Mobile list */}
                <div className="cmp-mobile-list">
                  {group.items.map((item, idx) => {
                    const detailKey = `${catIdx}-${idx}`;
                    return (
                      <MobileItem
                        key={detailKey} item={item} detailKey={detailKey}
                        isExpanded={expandedDetails.has(detailKey)}
                        toggleDetails={toggleDetails}
                        visibleSchools={visibleSchools}
                        onOpenHadith={n => navigate(`/hadith/${n}`)}
                        isDark={isDark}
                      />
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="cmp-desktop-table">
                  <ScrollArea className="max-h-[620px]">
                    <table className="cmp-table">
                      <thead>
                        <tr className="cmp-table-head-row">
                          <th className="cmp-th cmp-th--hadith">Hadith</th>
                          {visibleSchools.map(k => {
                            const color = isDark ? SCHOOL_CONFIG[k].colorDark : SCHOOL_CONFIG[k].colorLight;
                            return (
                              <th key={k} className="cmp-th" style={{ "--clr": color }}>
                                <span className="cmp-th-dot" />{SCHOOL_CONFIG[k].label}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((item, idx) => {
                          const cons      = getConsensus(item, isDark);
                          const detailKey = `${catIdx}-${idx}`;
                          const expanded  = expandedDetails.has(detailKey);
                          return (
                            <React.Fragment key={detailKey}>
                              <tr className="cmp-table-row">
                                <td className="cmp-td cmp-td--hadith">
                                  <div className="cmp-td-hadith-name">
                                    Hadith {item.number}{item.title ? ` — ${item.title}` : ""}
                                  </div>
                                  <div className="cmp-td-hadith-actions">
                                    <ConsensusPill {...cons} />
                                    <button className="cmp-btn-ghost-xs" onClick={() => navigate(`/hadith/${item.number}`)}>
                                      <ExternalLink size={11} /> Ouvrir
                                    </button>
                                    <button className="cmp-btn-ghost-xs" onClick={() => toggleDetails(detailKey)}>
                                      <FileText size={11} /> {expanded ? "Masquer" : "Détails"}
                                    </button>
                                  </div>
                                </td>
                                {visibleSchools.map(k => {
                                  const s     = SCHOOL_CONFIG[k];
                                  const color = isDark ? s.colorDark : s.colorLight;
                                  const fr    = trunc(s.getFr(item));
                                  return (
                                    <td key={k} className="cmp-td">
                                      <div className="cmp-td-opinion">
                                        <span className="cmp-opinion-dot" style={{ background: color }} />
                                        <span className={fr === "—" ? "cmp-td-empty" : ""}>{fr}</span>
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                              {expanded && (
                                <tr className="cmp-table-row-expanded">
                                  <td colSpan={1 + visibleSchools.length} className="cmp-td-expanded">
                                    {(item.french_text || item.source) && (
                                      <div className="cmp-expanded-meta">
                                        {item.french_text && <p className="cmp-detail-fr"><strong>Traduction : </strong>{item.french_text}</p>}
                                        {item.source && <p className="cmp-detail-source"><strong>Source : </strong>{item.source}</p>}
                                      </div>
                                    )}
                                    <div className="cmp-detail-schools cmp-detail-schools--grid">
                                      {visibleSchools.map(k => <SchoolDetailCard key={k} schoolKey={k} item={item} isDark={isDark} />)}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Legend ── */}
        <div className="cmp-legend">
          <span className="cmp-legend-title">Légende</span>
          {Object.entries(CONSENSUS_META).map(([k, m]) => (
            <div key={k} className="cmp-legend-item">
              <span className="cmp-legend-pill" style={{ "--clr": m.color }}>
                <span className="cmp-consensus-dot" />{m.label}
              </span>
              <span className="cmp-legend-desc">
                {k === "consensus" ? "Les 4 écoles s'accordent"
                  : k === "majority" ? "3 écoles s'accordent"
                  : k === "divergence" ? "Avis variés"
                  : "Avis incomplets"}
              </span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}

function CompareStyles({ isDark }) {
  const dark = `
    .cmp-dark {
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
    .cmp-dark .cmp-theme-toggle { background: rgba(255,255,255,.07); color: #c9a84c; border-color: rgba(201,168,76,.2); }
    .cmp-dark .cmp-theme-toggle:hover { background: rgba(201,168,76,.12); }
    .cmp-dark .cmp-icon-wrap { background: linear-gradient(135deg, #c9a84c, #a07830); box-shadow: 0 2px 10px rgba(201,168,76,.3); }
    .cmp-dark .cmp-title    { color: #e8e0d0; }
    .cmp-dark .cmp-subtitle { color: #7a8694; }
    .cmp-dark .cmp-header   { border-bottom-color: rgba(255,255,255,.13); }
    .cmp-dark .cmp-stat { background: #161c24; border-color: rgba(255,255,255,.07); }
    .cmp-dark .cmp-stat-label { color: #7a8694; }
    .cmp-dark .cmp-school-filter { background: #161c24; border-color: rgba(255,255,255,.07); color: #7a8694; }
    .cmp-dark .cmp-school-filter:hover { color: #e8e0d0; }
    .cmp-dark .cmp-toolbar { background: #161c24; border-color: rgba(255,255,255,.07); }
    .cmp-dark .cmp-search-wrap { background: #1e2630; border-color: rgba(255,255,255,.13); }
    .cmp-dark .cmp-search-wrap:focus-within { border-color: #c9a84c; }
    .cmp-dark .cmp-search-input { color: #e8e0d0; }
    .cmp-dark .cmp-search-clear { color: #7a8694; }
    .cmp-dark .cmp-search-clear:hover { color: #e8e0d0; }
    .cmp-dark .cmp-chapter-btn { border-color: rgba(255,255,255,.13); color: #7a8694; }
    .cmp-dark .cmp-chapter-btn:hover { border-color: #c9a84c; color: #e8e0d0; }
    .cmp-dark .cmp-chapter-btn--active { border-color: #c9a84c; color: #c9a84c; background: rgba(201,168,76,.13); }
    .cmp-dark .cmp-chapter-btn--reset:hover { border-color: #c95a4a; color: #c95a4a; }
    .cmp-dark .cmp-group { background: #161c24; border-color: rgba(255,255,255,.07); }
    .cmp-dark .cmp-group-header { border-bottom-color: rgba(255,255,255,.07); background: linear-gradient(135deg, #161c24 0%, rgba(201,168,76,.04) 100%); }
    .cmp-dark .cmp-group-icon { background: linear-gradient(135deg, #c9a84c, #a07830); }
    .cmp-dark .cmp-group-title { color: #e8e0d0; }
    .cmp-dark .cmp-group-count { color: #7a8694; }
    .cmp-dark .cmp-mobile-row { border-top-color: rgba(255,255,255,.07); }
    .cmp-dark .cmp-mobile-row:hover { background: rgba(255,255,255,.02); }
    .cmp-dark .cmp-mobile-hadith-title { color: #e8e0d0; }
    .cmp-dark .cmp-mobile-opinion { color: #7a8694; }
    .cmp-dark .cmp-mobile-detail { background: #1e2630; }
    .cmp-dark .cmp-detail-fr     { color: #e8e0d0; }
    .cmp-dark .cmp-detail-source { color: #7a8694; }
    .cmp-dark .cmp-table-head-row { background: #1e2630; border-bottom-color: rgba(255,255,255,.13); }
    .cmp-dark .cmp-th { color: #7a8694; }
    .cmp-dark .cmp-table-row { border-bottom-color: rgba(255,255,255,.07); }
    .cmp-dark .cmp-table-row:hover { background: rgba(255,255,255,.025); }
    .cmp-dark .cmp-table-row-expanded { background: #1e2630; }
    .cmp-dark .cmp-td { color: #e8e0d0; }
    .cmp-dark .cmp-td-hadith-name { color: #e8e0d0; }
    .cmp-dark .cmp-td-empty { color: #7a8694; }
    .cmp-dark .cmp-expanded-meta { background: #161c24; border-color: rgba(255,255,255,.13); }
    .cmp-dark .cmp-school-card { border-top-width: 2px; }
    .cmp-dark .cmp-school-fr    { color: #e8e0d0; }
    .cmp-dark .cmp-school-empty { color: #7a8694; }
    .cmp-dark .cmp-school-ar    { color: #e8e0d0; }
    .cmp-dark .cmp-btn-ghost-xs { border-color: rgba(255,255,255,.13); color: #7a8694; }
    .cmp-dark .cmp-btn-ghost-xs:hover { border-color: #c9a84c; color: #c9a84c; }
    .cmp-dark .cmp-empty { background: #161c24; border-color: rgba(255,255,255,.13); color: #7a8694; }
    .cmp-dark .cmp-legend { background: #161c24; border-color: rgba(255,255,255,.07); }
    .cmp-dark .cmp-legend-title { color: #7a8694; }
    .cmp-dark .cmp-legend-desc  { color: #7a8694; }
  `;

  const light = `
    .cmp-light {
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
    .cmp-light .cmp-theme-toggle { background: rgba(160,125,40,.08); color: #7c56c8; border-color: rgba(124,86,200,.2); }
    .cmp-light .cmp-theme-toggle:hover { background: rgba(124,86,200,.1); }
    .cmp-light .cmp-icon-wrap { background: linear-gradient(135deg, #a07d28, #7a5c18); box-shadow: 0 2px 10px rgba(160,125,40,.25); }
    .cmp-light .cmp-title    { color: #1e1810; }
    .cmp-light .cmp-subtitle { color: #7a6d58; }
    .cmp-light .cmp-header   { border-bottom-color: rgba(160,125,40,.15); }
    .cmp-light .cmp-stat { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 1px 4px rgba(160,125,40,.06); }
    .cmp-light .cmp-stat-label { color: #7a6d58; }
    .cmp-light .cmp-school-filter { background: #ffffff; border-color: rgba(160,125,40,.13); color: #7a6d58; box-shadow: 0 1px 4px rgba(160,125,40,.05); }
    .cmp-light .cmp-school-filter:hover { color: #1e1810; }
    .cmp-light .cmp-toolbar { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 1px 6px rgba(160,125,40,.06); }
    .cmp-light .cmp-search-wrap { background: #fef6e4; border-color: rgba(160,125,40,.22); }
    .cmp-light .cmp-search-wrap:focus-within { border-color: #a07d28; }
    .cmp-light .cmp-search-input { color: #2c2416; }
    .cmp-light .cmp-search-clear { color: #7a6d58; }
    .cmp-light .cmp-search-clear:hover { color: #1e1810; }
    .cmp-light .cmp-chapter-btn { border-color: rgba(160,125,40,.22); color: #7a6d58; }
    .cmp-light .cmp-chapter-btn:hover { border-color: #a07d28; color: #1e1810; }
    .cmp-light .cmp-chapter-btn--active { border-color: #a07d28; color: #a07d28; background: rgba(160,125,40,.1); }
    .cmp-light .cmp-chapter-btn--reset:hover { border-color: #a83030; color: #a83030; }
    .cmp-light .cmp-group { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 1px 6px rgba(160,125,40,.06); }
    .cmp-light .cmp-group-header { border-bottom-color: rgba(160,125,40,.1); background: linear-gradient(135deg, #ffffff 0%, rgba(160,125,40,.03) 100%); }
    .cmp-light .cmp-group-icon { background: linear-gradient(135deg, #a07d28, #7a5c18); }
    .cmp-light .cmp-group-title { color: #1e1810; }
    .cmp-light .cmp-group-count { color: #7a6d58; }
    .cmp-light .cmp-mobile-row { border-top-color: rgba(160,125,40,.1); }
    .cmp-light .cmp-mobile-row:hover { background: rgba(160,125,40,.02); }
    .cmp-light .cmp-mobile-hadith-title { color: #1e1810; }
    .cmp-light .cmp-mobile-opinion { color: #7a6d58; }
    .cmp-light .cmp-mobile-detail { background: #fef6e4; }
    .cmp-light .cmp-detail-fr     { color: #1e1810; }
    .cmp-light .cmp-detail-source { color: #7a6d58; }
    .cmp-light .cmp-table-head-row { background: #fef6e4; border-bottom-color: rgba(160,125,40,.15); }
    .cmp-light .cmp-th { color: #7a6d58; }
    .cmp-light .cmp-table-row { border-bottom-color: rgba(160,125,40,.08); }
    .cmp-light .cmp-table-row:hover { background: rgba(160,125,40,.03); }
    .cmp-light .cmp-table-row-expanded { background: #fef6e4; }
    .cmp-light .cmp-td { color: #2c2416; }
    .cmp-light .cmp-td-hadith-name { color: #1e1810; }
    .cmp-light .cmp-td-empty { color: #7a6d58; }
    .cmp-light .cmp-expanded-meta { background: #ffffff; border-color: rgba(160,125,40,.18); }
    .cmp-light .cmp-school-fr    { color: #1e1810; }
    .cmp-light .cmp-school-empty { color: #7a6d58; }
    .cmp-light .cmp-school-ar    { color: #1e1810; }
    .cmp-light .cmp-btn-ghost-xs { border-color: rgba(160,125,40,.22); color: #7a6d58; }
    .cmp-light .cmp-btn-ghost-xs:hover { border-color: #a07d28; color: #a07d28; }
    .cmp-light .cmp-empty { background: #ffffff; border-color: rgba(160,125,40,.2); color: #7a6d58; }
    .cmp-light .cmp-legend { background: #ffffff; border-color: rgba(160,125,40,.13); }
    .cmp-light .cmp-legend-title { color: #7a6d58; }
    .cmp-light .cmp-legend-desc  { color: #7a6d58; }
  `;

  return (
    <style>{`
      .cmp-root {
        --serif: Georgia, 'Times New Roman', serif;
        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 1100px;
        margin: 0 auto;
        padding: 1.2rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
        transition: background .3s ease, color .3s ease;
      }

      /* ── topbar ── */
      .cmp-topbar { display: flex; justify-content: flex-end; }
      .cmp-theme-toggle {
        display: flex; align-items: center; gap: .45rem;
        border: 1px solid transparent; border-radius: 20px;
        padding: .38rem .85rem; font-size: .78rem;
        font-family: var(--serif); font-weight: 600; cursor: pointer;
        transition: background .2s, color .2s, transform .15s; letter-spacing: .02em;
      }
      .cmp-theme-toggle:hover { transform: translateY(-1px); }

      /* ── header ── */
      .cmp-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both; transition: border-color .3s;
      }
      .cmp-header-left { display: flex; align-items: center; gap: .85rem; }
      .cmp-icon-wrap {
        width: 40px; height: 40px; flex-shrink: 0; border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; transition: background .3s, box-shadow .3s;
      }
      .cmp-title    { font-size: 1.5rem; font-weight: 700; margin: 0 0 .15rem; transition: color .3s; }
      .cmp-subtitle { font-size: .78rem; font-style: italic; margin: 0; transition: color .3s; }

      /* ── stats ── */
      .cmp-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: .65rem; }
      @media (max-width: 560px) { .cmp-stats { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 380px) { .cmp-stats { grid-template-columns: repeat(2, 1fr); } }
      .cmp-stat {
        border: 1px solid var(--border); border-top: 2px solid var(--accent, var(--border2));
        border-radius: 12px; padding: .7rem .5rem; text-align: center;
        transition: border-color .15s, background .3s;
        animation: fadeUp .4s ease both;
      }
      .cmp-stat:hover { border-color: var(--accent, var(--gold)); }
      .cmp-stat--total { --accent: var(--gold); }
      .cmp-stat-value { display: block; font-size: 1.45rem; font-weight: 700; color: var(--accent, var(--fg)); line-height: 1; }
      .cmp-stat-label { display: block; font-size: .63rem; margin-top: .25rem; transition: color .3s; }

      /* ── school filters ── */
      .cmp-school-filters { display: grid; grid-template-columns: repeat(4, 1fr); gap: .65rem; }
      @media (max-width: 480px) { .cmp-school-filters { grid-template-columns: repeat(2, 1fr); } }
      .cmp-school-filter {
        border: 1px solid var(--border); border-left: 3px solid var(--clr);
        border-radius: 12px; padding: .75rem .85rem;
        display: flex; align-items: center; gap: .5rem;
        font-family: var(--serif); font-size: .8rem; cursor: pointer;
        transition: background .15s, border-color .15s, color .15s, transform .15s;
      }
      .cmp-school-filter:hover { background: color-mix(in srgb, var(--clr) 8%, transparent); transform: translateY(-1px); }
      .cmp-school-filter--active { background: color-mix(in srgb, var(--clr) 14%, transparent); border-color: var(--clr); }
      .cmp-school-filter-label { flex: 1; font-weight: 600; }
      .cmp-school-filter-active-txt {
        font-size: .62rem; color: var(--clr);
        background: color-mix(in srgb, var(--clr) 15%, transparent);
        border-radius: 20px; padding: 1px 6px;
      }

      /* ── toolbar ── */
      .cmp-toolbar {
        border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.1rem;
        display: flex; flex-direction: column; gap: .8rem;
        transition: background .3s, border-color .3s;
      }
      .cmp-search-wrap {
        display: flex; align-items: center; gap: .5rem;
        border: 1px solid transparent; border-radius: 10px;
        padding: 0 .75rem; height: 38px;
        transition: border-color .15s, background .3s;
      }
      .cmp-search-icon { flex-shrink: 0; color: var(--muted); }
      .cmp-search-input {
        flex: 1; background: transparent; border: none; outline: none;
        font-size: .85rem; font-family: var(--serif); transition: color .3s;
      }
      .cmp-search-input::placeholder { color: var(--muted); }
      .cmp-search-clear { background: transparent; border: none; font-size: .75rem; cursor: pointer; transition: color .15s; }
      .cmp-chapter-filters { display: flex; flex-wrap: wrap; gap: .4rem; }
      .cmp-chapter-btn {
        background: transparent; border: 1px solid transparent; border-radius: 99px;
        padding: .25rem .7rem; font-size: .72rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .13s, color .13s, background .13s;
      }
      .cmp-chapter-btn--reset { display: inline-flex; align-items: center; gap: .3rem; }

      /* ── groups ── */
      .cmp-groups { display: flex; flex-direction: column; gap: 1rem; }
      .cmp-group { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; animation: fadeUp .4s ease both; transition: background .3s, border-color .3s; }
      .cmp-group-header {
        display: flex; align-items: center; gap: .75rem; padding: .95rem 1.2rem;
        border-bottom: 1px solid var(--border); transition: background .3s, border-color .3s;
      }
      .cmp-group-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
      .cmp-group-title { font-size: .95rem; font-weight: 700; display: block; transition: color .3s; }
      .cmp-group-count { font-size: .7rem; font-style: italic; display: block; margin-top: .1rem; transition: color .3s; }

      /* ── consensus pill ── */
      .cmp-consensus-pill {
        display: inline-flex; align-items: center; gap: .3rem; font-size: .67rem; color: var(--clr);
        background: color-mix(in srgb, var(--clr) 12%, transparent); border-radius: 20px; padding: 1px 7px;
      }
      .cmp-consensus-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

      /* ── mobile list ── */
      .cmp-mobile-list { display: flex; flex-direction: column; gap: 0; }
      @media (min-width: 768px) { .cmp-mobile-list { display: none; } }
      .cmp-mobile-row { display: flex; align-items: stretch; border-top: 1px solid var(--border); transition: background .13s; }
      .cmp-mobile-row-bar { width: 3px; flex-shrink: 0; background: var(--status-clr, var(--muted)); }
      .cmp-mobile-row-body { flex: 1; padding: .9rem .95rem; display: flex; flex-direction: column; gap: .6rem; }
      .cmp-mobile-row-top { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; flex-wrap: wrap; }
      .cmp-mobile-hadith-title { font-size: .85rem; font-weight: 700; line-height: 1.35; transition: color .3s; }
      .cmp-mobile-opinions { display: flex; flex-direction: column; gap: .35rem; }
      .cmp-mobile-opinion { display: flex; align-items: flex-start; gap: .5rem; font-size: .78rem; line-height: 1.5; transition: color .3s; }
      .cmp-mobile-row-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
      .cmp-mobile-detail { border-radius: 10px; padding: .85rem; display: flex; flex-direction: column; gap: .75rem; transition: background .3s; }
      .cmp-detail-fr     { font-size: .8rem; line-height: 1.65; margin: 0; font-style: italic; transition: color .3s; }
      .cmp-detail-source { font-size: .75rem; margin: 0; transition: color .3s; }
      .cmp-detail-schools { display: flex; flex-direction: column; gap: .6rem; }
      .cmp-detail-schools--grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .6rem; }
      @media (max-width: 600px) { .cmp-detail-schools--grid { grid-template-columns: 1fr; } }

      /* ── desktop table ── */
      .cmp-desktop-table { display: none; }
      @media (min-width: 768px) { .cmp-desktop-table { display: block; } }
      .cmp-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
      .cmp-table-head-row { border-bottom: 1px solid var(--border2); position: sticky; top: 0; z-index: 5; transition: background .3s, border-color .3s; }
      .cmp-th { text-align: left; padding: .75rem 1rem; font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; white-space: nowrap; transition: color .3s; }
      .cmp-th--hadith { min-width: 280px; }
      .cmp-th:not(.cmp-th--hadith) { color: var(--clr); min-width: 200px; }
      .cmp-th-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--clr); margin-right: .4rem; vertical-align: middle; }
      .cmp-table-row { border-bottom: 1px solid var(--border); transition: background .12s; }
      .cmp-table-row-expanded { }
      .cmp-td { padding: .85rem 1rem; vertical-align: top; transition: color .3s; }
      .cmp-td--hadith { padding: .85rem 1rem; vertical-align: top; }
      .cmp-td-hadith-name { font-size: .85rem; font-weight: 700; margin-bottom: .4rem; line-height: 1.35; transition: color .3s; }
      .cmp-td-hadith-actions { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
      .cmp-td-opinion { display: flex; align-items: flex-start; gap: .45rem; font-size: .8rem; line-height: 1.55; }
      .cmp-td-empty   { font-style: italic; transition: color .3s; }
      .cmp-opinion-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: .45rem; }
      .cmp-td-expanded { padding: 1rem 1.2rem; }
      .cmp-expanded-meta { border: 1px solid var(--border2); border-radius: 10px; padding: .85rem 1rem; margin-bottom: .85rem; display: flex; flex-direction: column; gap: .4rem; transition: background .3s, border-color .3s; }

      /* ── school detail card ── */
      .cmp-school-card {
        background: color-mix(in srgb, var(--clr) 6%, var(--surface));
        border: 1px solid color-mix(in srgb, var(--clr) 22%, transparent);
        border-top: 2px solid var(--clr); border-radius: 10px; padding: .85rem;
        display: flex; flex-direction: column; gap: .5rem; transition: background .3s;
      }
      .cmp-school-card-head { display: flex; align-items: center; gap: .5rem; }
      .cmp-school-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--clr); flex-shrink: 0; }
      .cmp-school-card-label { font-size: .78rem; font-weight: 700; color: var(--clr); }
      .cmp-school-fr    { font-size: .8rem; line-height: 1.65; margin: 0; transition: color .3s; }
      .cmp-school-empty { font-size: .78rem; font-style: italic; margin: 0; transition: color .3s; }
      .cmp-school-ar-wrap { border-top: 1px solid color-mix(in srgb, var(--clr) 18%, transparent); padding-top: .5rem; }
      .cmp-school-ar { font-size: .85rem; line-height: 2; margin: 0; transition: color .3s; }

      /* ── ghost xs button ── */
      .cmp-btn-ghost-xs {
        display: inline-flex; align-items: center; gap: .28rem;
        background: transparent; border: 1px solid transparent;
        border-radius: 6px; padding: .22rem .6rem;
        font-size: .7rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .13s, color .13s;
      }

      /* ── empty ── */
      .cmp-empty {
        border: 2px dashed var(--border2); border-radius: 16px; padding: 3rem 2rem;
        text-align: center; font-size: .9rem; font-style: italic;
        transition: background .3s, border-color .3s, color .3s;
      }
      .cmp-empty-icon { opacity: .3; margin: 0 auto .75rem; display: block; }

      /* ── legend ── */
      .cmp-legend {
        border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.2rem;
        display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap;
        transition: background .3s, border-color .3s;
      }
      .cmp-legend-title { font-size: .7rem; text-transform: uppercase; letter-spacing: .08em; margin-right: .25rem; align-self: center; transition: color .3s; }
      .cmp-legend-item  { display: flex; align-items: center; gap: .5rem; }
      .cmp-legend-pill  { display: inline-flex; align-items: center; gap: .3rem; font-size: .68rem; color: var(--clr); background: color-mix(in srgb, var(--clr) 12%, transparent); border-radius: 20px; padding: 2px 8px; }
      .cmp-legend-desc  { font-size: .72rem; transition: color .3s; }

      @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

      ${dark}
      ${light}
    `}</style>
  );
}

export default Compare;