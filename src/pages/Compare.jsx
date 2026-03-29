// /src/pages/Compare.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Scale, Search, Filter, BookMarked, ExternalLink, FileText,
} from "lucide-react";

import { ALL_HADITHS } from "../data/allHadiths";

/* ─── config ─── */
const SCHOOL_CONFIG = {
  hanafi:  { label: "Hanafite",  color: "#4a9fc8", getFr: i => i.opinions?.Hanafi?.fr  || "", getAr: i => i.opinions?.Hanafi?.ar  || "" },
  maliki:  { label: "Malikite",  color: "#4a9f82", getFr: i => i.opinions?.Maliki?.fr  || "", getAr: i => i.opinions?.Maliki?.ar  || "" },
  shafi:   { label: "Chafi'ite", color: "#9f7ae0", getFr: i => i.opinions?.Shafi?.fr   || "", getAr: i => i.opinions?.Shafi?.ar   || "" },
  hanbali: { label: "Hanbalite", color: "#c9a84c", getFr: i => i.opinions?.Hanbali?.fr || "", getAr: i => i.opinions?.Hanbali?.ar || "" },
};

const CONSENSUS_META = {
  consensus:  { label: "Consensus",         color: "#4a9f82" },
  majority:   { label: "Majorité",          color: "#4a9fc8" },
  divergence: { label: "Divergence",        color: "#e08a3c" },
  partial:    { label: "Données partielles",color: "#7a8694" },
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
  return [
    item.opinions?.Hanafi?.fr, item.opinions?.Maliki?.fr,
    item.opinions?.Shafi?.fr,  item.opinions?.Hanbali?.fr,
  ].filter(Boolean);
}
function getConsensus(item) {
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
    if (!map.has(key)) map.set(key, {
      chapter: key,
      category: h.chapterTitle || CHAPTER_LABELS[key] || key,
      chapterOrder: h.chapterOrder ?? 999,
      items: [],
    });
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
      <span className="cmp-consensus-dot" />
      {label}
    </span>
  );
}

function SchoolDetailCard({ schoolKey, item }) {
  const s  = SCHOOL_CONFIG[schoolKey];
  const fr = s.getFr(item);
  const ar = s.getAr(item);
  return (
    <div className="cmp-school-card" style={{ "--clr": s.color }}>
      <div className="cmp-school-card-head">
        <span className="cmp-school-dot" />
        <span className="cmp-school-card-label">{s.label}</span>
      </div>
      {fr
        ? <p className="cmp-school-fr">{fr}</p>
        : <p className="cmp-school-empty">Aucun avis détaillé disponible.</p>
      }
      {ar && (
        <div className="cmp-school-ar-wrap">
          <p className="cmp-school-ar" dir="rtl">{ar}</p>
        </div>
      )}
    </div>
  );
}

function MobileItem({ item, detailKey, isExpanded, toggleDetails, visibleSchools, onOpenHadith }) {
  const cons = getConsensus(item);
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
            return (
              <div key={k} className="cmp-mobile-opinion">
                <span className="cmp-opinion-dot" style={{ background: s.color }} />
                <span><strong style={{ color: s.color }}>{s.label} : </strong>{trunc(s.getFr(item))}</span>
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
            {item.french_text && (
              <p className="cmp-detail-fr">
                <strong>Traduction : </strong>{item.french_text}
              </p>
            )}
            {item.source && (
              <p className="cmp-detail-source"><strong>Source : </strong>{item.source}</p>
            )}
            <div className="cmp-detail-schools">
              {visibleSchools.map(k => <SchoolDetailCard key={k} schoolKey={k} item={item} />)}
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

  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState(new Set());

  const compareHadiths = useMemo(() => ALL_HADITHS.filter(hasOpinion), []);

  const chapterOptions = useMemo(() => {
    const map = new Map();
    compareHadiths.forEach(h => {
      const key = h.chapterSlug || h.chapter || "autre";
      if (!map.has(key)) map.set(key, {
        key, order: h.chapterOrder ?? 999,
        label: h.chapterTitle || CHAPTER_LABELS[key] || key,
      });
    });
    return [{ key: "all", label: "Tous", order: 0 }, ...[...map.values()].sort((a,b) => a.order - b.order)];
  }, [compareHadiths]);

  const groupedData = useMemo(() => {
    const q = norm(searchQuery);
    const filtered = compareHadiths.filter(item => {
      if (selectedChapter !== "all" && (item.chapterSlug || item.chapter || "autre") !== selectedChapter) return false;
      if (!q) return true;
      const cons = getConsensus(item);
      return [item.title, item.number, item.french_text, item.source, item.chapterTitle, cons.label,
        ...Object.values(SCHOOL_CONFIG).map(s => s.getFr(item))
      ].some(v => norm(v).includes(q));
    });
    return buildGroups(filtered);
  }, [compareHadiths, searchQuery, selectedChapter]);

  const flatItems = useMemo(() => groupedData.flatMap(g => g.items), [groupedData]);

  const summary = useMemo(() => {
    const acc = { consensus: 0, majority: 0, divergence: 0, partial: 0 };
    flatItems.forEach(item => { acc[getConsensus(item).level]++; });
    return acc;
  }, [flatItems]);

  const visibleSchools = useMemo(() => getVisibleSchools(selectedSchool), [selectedSchool]);

  const toggleDetails = key => setExpandedDetails(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const hasFilters = selectedSchool !== "all" || selectedChapter !== "all" || searchQuery;

  return (
    <>
      <CompareStyles />
      <div className="cmp-root">

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
          {Object.entries(SCHOOL_CONFIG).map(([key, s]) => (
            <button
              key={key}
              className={`cmp-school-filter ${selectedSchool === key ? "cmp-school-filter--active" : ""}`}
              style={{ "--clr": s.color }}
              onClick={() => setSelectedSchool(selectedSchool === key ? "all" : key)}
            >
              <BookMarked size={14} />
              <span className="cmp-school-filter-label">{s.label}</span>
              {selectedSchool === key && <span className="cmp-school-filter-active-txt">actif</span>}
            </button>
          ))}
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
            {searchQuery && (
              <button className="cmp-search-clear" onClick={() => setSearchQuery("")}>✕</button>
            )}
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
                {/* Group header */}
                <div className="cmp-group-header">
                  <div className="cmp-group-icon"><BookMarked size={14} /></div>
                  <div>
                    <span className="cmp-group-title">{group.category}</span>
                    <span className="cmp-group-count">
                      {group.items.length} hadith{group.items.length > 1 ? "s" : ""}
                    </span>
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
                          {visibleSchools.map(k => (
                            <th key={k} className="cmp-th" style={{ "--clr": SCHOOL_CONFIG[k].color }}>
                              <span className="cmp-th-dot" />
                              {SCHOOL_CONFIG[k].label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((item, idx) => {
                          const cons     = getConsensus(item);
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
                                  const s  = SCHOOL_CONFIG[k];
                                  const fr = trunc(s.getFr(item));
                                  return (
                                    <td key={k} className="cmp-td">
                                      <div className="cmp-td-opinion">
                                        <span className="cmp-opinion-dot" style={{ background: s.color }} />
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
                                        {item.french_text && (
                                          <p className="cmp-detail-fr">
                                            <strong>Traduction : </strong>{item.french_text}
                                          </p>
                                        )}
                                        {item.source && (
                                          <p className="cmp-detail-source">
                                            <strong>Source : </strong>{item.source}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    <div className="cmp-detail-schools cmp-detail-schools--grid">
                                      {visibleSchools.map(k => <SchoolDetailCard key={k} schoolKey={k} item={item} />)}
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

/* ═══════════════════════════════════ */
function CompareStyles() {
  return (
    <style>{`
      .cmp-root {
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
        max-width: 1100px;
        margin: 0 auto;
        padding: 1.5rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
      }

      /* ── header ── */
      .cmp-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both;
      }
      .cmp-header-left { display: flex; align-items: center; gap: .85rem; }
      .cmp-icon-wrap {
        width: 40px; height: 40px; flex-shrink: 0;
        background: linear-gradient(135deg, #c9a84c, #a07830);
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; box-shadow: 0 2px 10px rgba(201,168,76,.3);
      }
      .cmp-title    { font-size: 1.5rem; font-weight: 700; margin: 0 0 .15rem; color: var(--fg); }
      .cmp-subtitle { font-size: .78rem; color: var(--muted); font-style: italic; margin: 0; }

      /* ── summary stats ── */
      .cmp-stats {
        display: grid; grid-template-columns: repeat(5, 1fr); gap: .65rem;
      }
      @media (max-width: 560px) { .cmp-stats { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 380px) { .cmp-stats { grid-template-columns: repeat(2, 1fr); } }
      .cmp-stat {
        background: var(--surface); border: 1px solid var(--border);
        border-top: 2px solid var(--accent, var(--border2));
        border-radius: 12px; padding: .7rem .5rem;
        text-align: center; transition: border-color .15s;
        animation: fadeUp .4s ease both;
      }
      .cmp-stat:hover { border-color: var(--accent, var(--gold)); }
      .cmp-stat--total { --accent: var(--gold); }
      .cmp-stat-value { display: block; font-size: 1.45rem; font-weight: 700; color: var(--accent, var(--fg)); line-height: 1; }
      .cmp-stat-label { display: block; font-size: .63rem; color: var(--muted); margin-top: .25rem; }

      /* ── school filter cards ── */
      .cmp-school-filters {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: .65rem;
      }
      @media (max-width: 480px) { .cmp-school-filters { grid-template-columns: repeat(2, 1fr); } }
      .cmp-school-filter {
        background: var(--surface); border: 1px solid var(--border);
        border-left: 3px solid var(--clr);
        border-radius: 12px; padding: .75rem .85rem;
        display: flex; align-items: center; gap: .5rem;
        font-family: var(--serif); color: var(--muted);
        font-size: .8rem; cursor: pointer;
        transition: background .15s, border-color .15s, color .15s, transform .15s;
      }
      .cmp-school-filter:hover { background: color-mix(in srgb, var(--clr) 8%, transparent); color: var(--fg); transform: translateY(-1px); }
      .cmp-school-filter--active {
        background: color-mix(in srgb, var(--clr) 14%, transparent);
        border-color: var(--clr); color: var(--fg);
      }
      .cmp-school-filter-label { flex: 1; font-weight: 600; }
      .cmp-school-filter-active-txt {
        font-size: .62rem; color: var(--clr);
        background: color-mix(in srgb, var(--clr) 15%, transparent);
        border-radius: 20px; padding: 1px 6px;
      }

      /* ── toolbar ── */
      .cmp-toolbar {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 14px; padding: 1rem 1.1rem;
        display: flex; flex-direction: column; gap: .8rem;
      }
      .cmp-search-wrap {
        display: flex; align-items: center; gap: .5rem;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 10px; padding: 0 .75rem; height: 38px;
        transition: border-color .15s;
      }
      .cmp-search-wrap:focus-within { border-color: var(--gold); }
      .cmp-search-icon  { color: var(--muted); flex-shrink: 0; }
      .cmp-search-input {
        flex: 1; background: transparent; border: none; outline: none;
        font-size: .85rem; font-family: var(--serif); color: var(--fg);
      }
      .cmp-search-input::placeholder { color: var(--muted); }
      .cmp-search-clear {
        background: transparent; border: none; color: var(--muted);
        font-size: .75rem; cursor: pointer; transition: color .15s;
      }
      .cmp-search-clear:hover { color: var(--fg); }

      .cmp-chapter-filters { display: flex; flex-wrap: wrap; gap: .4rem; }
      .cmp-chapter-btn {
        background: transparent; border: 1px solid var(--border2);
        border-radius: 99px; padding: .25rem .7rem;
        font-size: .72rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .13s, color .13s;
      }
      .cmp-chapter-btn:hover { border-color: var(--gold); color: var(--fg); }
      .cmp-chapter-btn--active { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }
      .cmp-chapter-btn--reset { display: inline-flex; align-items: center; gap: .3rem; color: var(--muted); }
      .cmp-chapter-btn--reset:hover { border-color: #c95a4a; color: #c95a4a; }

      /* ── groups ── */
      .cmp-groups { display: flex; flex-direction: column; gap: 1rem; }
      .cmp-group {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 16px; overflow: hidden;
        animation: fadeUp .4s ease both;
      }
      .cmp-group-header {
        display: flex; align-items: center; gap: .75rem;
        padding: .95rem 1.2rem;
        border-bottom: 1px solid var(--border);
        background: linear-gradient(135deg, var(--surface) 0%, rgba(201,168,76,.04) 100%);
      }
      .cmp-group-icon {
        width: 30px; height: 30px;
        background: linear-gradient(135deg, #c9a84c, #a07830);
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; flex-shrink: 0;
      }
      .cmp-group-title { font-size: .95rem; font-weight: 700; color: var(--fg); display: block; }
      .cmp-group-count { font-size: .7rem; color: var(--muted); font-style: italic; display: block; margin-top: .1rem; }

      /* ── consensus pill ── */
      .cmp-consensus-pill {
        display: inline-flex; align-items: center; gap: .3rem;
        font-size: .67rem; color: var(--clr);
        background: color-mix(in srgb, var(--clr) 12%, transparent);
        border-radius: 20px; padding: 1px 7px;
      }
      .cmp-consensus-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: currentColor; flex-shrink: 0;
      }

      /* ── mobile list ── */
      .cmp-mobile-list { display: flex; flex-direction: column; gap: 0; }
      @media (min-width: 768px) { .cmp-mobile-list { display: none; } }

      .cmp-mobile-row {
        display: flex; align-items: stretch;
        border-top: 1px solid var(--border);
        transition: background .13s;
      }
      .cmp-mobile-row:hover { background: rgba(255,255,255,.02); }
      .cmp-mobile-row-bar { width: 3px; flex-shrink: 0; background: var(--status-clr, var(--muted)); }
      .cmp-mobile-row-body { flex: 1; padding: .9rem .95rem; display: flex; flex-direction: column; gap: .6rem; }
      .cmp-mobile-row-top { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; flex-wrap: wrap; }
      .cmp-mobile-hadith-title { font-size: .85rem; font-weight: 700; color: var(--fg); line-height: 1.35; }
      .cmp-mobile-opinions { display: flex; flex-direction: column; gap: .35rem; }
      .cmp-mobile-opinion { display: flex; align-items: flex-start; gap: .5rem; font-size: .78rem; color: var(--muted); line-height: 1.5; }
      .cmp-mobile-row-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
      .cmp-mobile-detail { background: var(--surface2); border-radius: 10px; padding: .85rem; display: flex; flex-direction: column; gap: .75rem; }
      .cmp-detail-fr     { font-size: .8rem; color: var(--fg); line-height: 1.65; margin: 0; font-style: italic; }
      .cmp-detail-source { font-size: .75rem; color: var(--muted); margin: 0; }
      .cmp-detail-schools { display: flex; flex-direction: column; gap: .6rem; }
      .cmp-detail-schools--grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .6rem; }
      @media (max-width: 600px) { .cmp-detail-schools--grid { grid-template-columns: 1fr; } }

      /* ── desktop table ── */
      .cmp-desktop-table { display: none; }
      @media (min-width: 768px) { .cmp-desktop-table { display: block; } }
      .cmp-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
      .cmp-table-head-row {
        background: var(--surface2);
        border-bottom: 1px solid var(--border2);
        position: sticky; top: 0; z-index: 5;
      }
      .cmp-th {
        text-align: left; padding: .75rem 1rem;
        font-size: .68rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: .07em;
        color: var(--muted);
        white-space: nowrap;
      }
      .cmp-th--hadith { min-width: 280px; }
      .cmp-th { display: table-cell; }
      .cmp-th:not(.cmp-th--hadith) { color: var(--clr); min-width: 200px; }
      .cmp-th-dot {
        display: inline-block; width: 6px; height: 6px;
        border-radius: 50%; background: var(--clr);
        margin-right: .4rem; vertical-align: middle;
      }
      .cmp-table-row { border-bottom: 1px solid var(--border); transition: background .12s; }
      .cmp-table-row:hover { background: rgba(255,255,255,.025); }
      .cmp-table-row-expanded { background: var(--surface2); }
      .cmp-td { padding: .85rem 1rem; vertical-align: top; color: var(--fg); }
      .cmp-td--hadith { padding: .85rem 1rem; vertical-align: top; }
      .cmp-td-hadith-name { font-size: .85rem; font-weight: 700; color: var(--fg); margin-bottom: .4rem; line-height: 1.35; }
      .cmp-td-hadith-actions { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
      .cmp-td-opinion { display: flex; align-items: flex-start; gap: .45rem; font-size: .8rem; color: var(--fg); line-height: 1.55; }
      .cmp-td-empty   { color: var(--muted); font-style: italic; }
      .cmp-opinion-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: .45rem; }
      .cmp-td-expanded { padding: 1rem 1.2rem; }
      .cmp-expanded-meta {
        background: var(--surface); border: 1px solid var(--border2);
        border-radius: 10px; padding: .85rem 1rem;
        margin-bottom: .85rem; display: flex; flex-direction: column; gap: .4rem;
      }

      /* ── school detail card ── */
      .cmp-school-card {
        background: color-mix(in srgb, var(--clr) 6%, var(--surface));
        border: 1px solid color-mix(in srgb, var(--clr) 22%, transparent);
        border-top: 2px solid var(--clr);
        border-radius: 10px; padding: .85rem;
        display: flex; flex-direction: column; gap: .5rem;
      }
      .cmp-school-card-head { display: flex; align-items: center; gap: .5rem; }
      .cmp-school-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: var(--clr); flex-shrink: 0;
      }
      .cmp-school-card-label { font-size: .78rem; font-weight: 700; color: var(--clr); }
      .cmp-school-fr     { font-size: .8rem; color: var(--fg); line-height: 1.65; margin: 0; }
      .cmp-school-empty  { font-size: .78rem; color: var(--muted); font-style: italic; margin: 0; }
      .cmp-school-ar-wrap {
        border-top: 1px solid color-mix(in srgb, var(--clr) 18%, transparent);
        padding-top: .5rem;
      }
      .cmp-school-ar { font-size: .85rem; color: var(--fg); line-height: 2; margin: 0; }

      /* ── ghost xs button ── */
      .cmp-btn-ghost-xs {
        display: inline-flex; align-items: center; gap: .28rem;
        background: transparent; border: 1px solid var(--border2);
        border-radius: 6px; padding: .22rem .6rem;
        font-size: .7rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .13s, color .13s;
      }
      .cmp-btn-ghost-xs:hover { border-color: var(--gold); color: var(--gold); }

      /* ── empty ── */
      .cmp-empty {
        background: var(--surface); border: 2px dashed var(--border2);
        border-radius: 16px; padding: 3rem 2rem;
        text-align: center; font-size: .9rem; color: var(--muted); font-style: italic;
      }
      .cmp-empty-icon { opacity: .3; margin: 0 auto .75rem; display: block; }

      /* ── legend ── */
      .cmp-legend {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 14px; padding: 1rem 1.2rem;
        display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap;
      }
      .cmp-legend-title { font-size: .7rem; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; margin-right: .25rem; align-self: center; }
      .cmp-legend-item  { display: flex; align-items: center; gap: .5rem; }
      .cmp-legend-pill  { display: inline-flex; align-items: center; gap: .3rem; font-size: .68rem; color: var(--clr); background: color-mix(in srgb, var(--clr) 12%, transparent); border-radius: 20px; padding: 2px 8px; }
      .cmp-legend-desc  { font-size: .72rem; color: var(--muted); }

      /* ── animations ── */
      @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
  );
}

export default Compare;