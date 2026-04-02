// /src/pages/NarratorsCollection.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Sparkles, BookOpen, Lock, Unlock, Star, Filter, Search, Sun, Moon } from "lucide-react";
import { NARRATORS_MOCK } from "@/data/narrators_mock";

const rarityConfig = {
  common:    { label: "Commun",    gradient: "from-emerald-500 to-teal-600",      glowColor: "rgba(16,185,129,.2)",  borderColor: "#10b981" },
  rare:      { label: "Rare",      gradient: "from-indigo-500 to-purple-600",     glowColor: "rgba(124,58,237,.2)",  borderColor: "#6366f1" },
  legendary: { label: "Légendaire",gradient: "from-amber-500 to-rose-600",       glowColor: "rgba(251,146,60,.2)",  borderColor: "#f59e0b" },
  epic:      { label: "Épique",    gradient: "from-fuchsia-500 to-violet-600",   glowColor: "rgba(217,70,239,.22)", borderColor: "#d946ef" },
};

/* ── NarratorCard ── */
function NarratorCard({ narrator, index, isUnlocked: forcedUnlocked, onOpen, isDark }) {
  const [isHovered, setIsHovered] = useState(false);
  const isUnlocked = typeof forcedUnlocked === "boolean" ? forcedUnlocked : narrator.isUnlocked;
  const rarity = rarityConfig[narrator?.rarity] ?? rarityConfig.common;

  const initials = useMemo(() => {
    const parts = (narrator?.name_fr || "").split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "??";
  }, [narrator?.name_fr]);

  return (
    <div
      className={`nc-narrator-card ${isUnlocked ? "nc-narrator-card--unlocked" : "nc-narrator-card--locked"}`}
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
        "--glow": rarity.glowColor,
        "--border-accent": rarity.borderColor,
      }}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(narrator, isUnlocked)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen?.(narrator, isUnlocked); } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow overlay */}
      {isUnlocked && isHovered && (
        <div className="nc-card-shimmer" style={{ background: `linear-gradient(135deg, transparent 40%, ${rarity.glowColor} 50%, transparent 60%)` }} />
      )}

      {/* Card header */}
      <div className="nc-card-header">
        <div className="nc-card-header-inner">
          {/* Avatar */}
          <div className="nc-avatar-wrap">
            <div className={`nc-avatar bg-gradient-to-br ${rarity.gradient}`}>
              {isUnlocked ? initials : "?"}
            </div>
          </div>

          <div className="nc-card-meta">
            <div className="nc-card-name-row">
              <span className="nc-card-name">{isUnlocked ? narrator.name_fr : "Narrateur à débloquer"}</span>
              {isUnlocked ? <Unlock size={14} className="nc-unlock-icon" /> : <Lock size={14} className="nc-lock-icon" />}
            </div>
            <span className="nc-card-name-ar">{isUnlocked ? narrator.name_ar : "Continue ta mémorisation"}</span>
            {isUnlocked && narrator.hadith_count && (
              <span className="nc-hadith-count"><BookOpen size={11} /> {narrator.hadith_count} hadiths rapportés</span>
            )}
          </div>
        </div>

        <span className={`nc-rarity-badge bg-gradient-to-r ${rarity.gradient}`}>
          <Star size={11} /> {rarity.label}
        </span>
      </div>

      {/* Badges */}
      <div className="nc-card-badges">
        {narrator.generation && <span className="nc-badge">{narrator.generation}</span>}
        {narrator.region && <span className="nc-badge">📍 {narrator.region}</span>}
        {narrator.death_year_h && <span className="nc-badge">† {narrator.death_year_h} H</span>}
      </div>

      {/* Bio / locked */}
      <div className="nc-card-bio">
        {isUnlocked ? (
          <>
            <p className="nc-bio-text">{narrator.short_bio}</p>
            {narrator.key_anecdote && (
              <div className="nc-anecdote">
                <p className="nc-anecdote-text">💡 {narrator.key_anecdote}</p>
              </div>
            )}
          </>
        ) : (
          <div className="nc-locked-box">
            <p className="nc-locked-text">🔒 {narrator.unlock_by || "Maîtrise (4/5) un hadith rapporté par ce narrateur pour le débloquer."}</p>
            {narrator.unlock_hint && (
              <span className="nc-hint-pill">💡 Indice : <strong>{narrator.unlock_hint}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      {isUnlocked && (
        <div className="nc-card-cta">
          <Link
            to={`/narrators/${narrator.slug}`}
            className="nc-cta-link"
            onClick={e => e.stopPropagation()}
          >
            En savoir plus (page dédiée)
          </Link>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════ */
export function NarratorsCollection() {
  const [filterRarity, setFilterRarity] = useState("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const [unlockedIds, setUnlockedIds]   = useState([]);
  const [openSheet, setOpenSheet]       = useState(false);
  const [selectedNarrator, setSelectedNarrator] = useState(null);
  const [selectedUnlocked, setSelectedUnlocked] = useState(false);
  const [isDark, setIsDark]             = useState(true);

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

  /* load unlocked */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("unlocked_narrators");
    try { const p = raw ? JSON.parse(raw) : []; setUnlockedIds(Array.isArray(p) ? p : []); }
    catch { setUnlockedIds([]); }
  }, []);

  const filteredNarrators = useMemo(() => NARRATORS_MOCK.filter(n => {
    const matchRarity  = filterRarity === "all" || n.rarity === filterRarity;
    const matchSearch  = !searchQuery || (n.name_fr || "").toLowerCase().includes(searchQuery.toLowerCase()) || (n.name_ar || "").includes(searchQuery);
    return matchRarity && matchSearch;
  }), [filterRarity, searchQuery]);

  const total    = NARRATORS_MOCK.length;
  const unlocked = NARRATORS_MOCK.filter(n => unlockedIds.includes(n.id) || n.isUnlocked).length;
  const progress = total ? Math.round((unlocked / total) * 100) : 0;

  const openNarrator = (narrator, isUnlocked) => {
    setSelectedNarrator(narrator);
    setSelectedUnlocked(!!isUnlocked);
    setOpenSheet(true);
  };

  const rarity = selectedNarrator?.rarity && rarityConfig[selectedNarrator.rarity]
    ? rarityConfig[selectedNarrator.rarity]
    : rarityConfig.common;

  const themeClass = isDark ? "nc-dark" : "nc-light";

  return (
    <>
      <NarratorsStyles isDark={isDark} />
      <div className={`nc-root ${themeClass}`}>

        {/* ── Topbar ── */}
        <div className="nc-topbar">
          <button className="nc-theme-toggle" onClick={toggleTheme} aria-label="Changer de thème">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </div>

        {/* ── Header ── */}
        <header className="nc-header">
          <div className="nc-header-left">
            <div className="nc-icon-wrap"><BookOpen size={22} /></div>
            <div>
              <h1 className="nc-title">Collection des Narrateurs</h1>
              <p className="nc-subtitle">Débloque les grands transmetteurs de la Sunna 📚</p>
            </div>
          </div>

          {/* Progress card */}
          <div className="nc-progress-card">
            <div className="nc-progress-header">
              <div className="nc-progress-label-wrap">
                <Sparkles size={16} className="nc-progress-sparkle" />
                <span className="nc-progress-label">Collection</span>
              </div>
              <span className="nc-progress-pct">{progress}%</span>
            </div>
            <div className="nc-progress-track">
              <div className="nc-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="nc-progress-sub">{unlocked} sur {total} narrateurs débloqués</p>
          </div>
        </header>

        {/* ── Search + filters ── */}
        <div className="nc-toolbar">
          <div className="nc-search-wrap">
            <Search size={14} className="nc-search-icon" />
            <input
              type="text"
              placeholder="Rechercher un narrateur..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="nc-search-input"
            />
          </div>

          <div className="nc-filter-row">
            <Filter size={13} className="nc-filter-icon" />
            <div className="nc-filters">
              <button
                onClick={() => setFilterRarity("all")}
                className={`nc-filter-btn ${filterRarity === "all" ? "nc-filter-btn--active-neutral" : ""}`}
              >
                Tous
              </button>
              {Object.entries(rarityConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setFilterRarity(key)}
                  className={`nc-filter-btn ${filterRarity === key ? `bg-gradient-to-r ${config.gradient} nc-filter-btn--active-colored` : ""}`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        {filteredNarrators.length > 0 ? (
          <div className="nc-grid">
            {filteredNarrators.map((narrator, index) => {
              const isUnlockedComputed = unlockedIds.includes(narrator.id) || narrator.isUnlocked;
              return (
                <NarratorCard
                  key={narrator.id} narrator={narrator} index={index}
                  isUnlocked={isUnlockedComputed} onOpen={openNarrator} isDark={isDark}
                />
              );
            })}
          </div>
        ) : (
          <div className="nc-empty">
            <div className="nc-empty-icon-wrap"><Search size={28} /></div>
            <p>Aucun narrateur trouvé avec ces critères</p>
          </div>
        )}

      </div>

      {/* ── Sheet ── */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          {selectedNarrator && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span>{selectedUnlocked ? selectedNarrator.name_fr : "Narrateur à débloquer"}</span>
                  <span className={`ml-auto text-xs font-semibold text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${rarity.gradient}`}>
                    {rarity.label}
                  </span>
                </SheetTitle>
                <SheetDescription>
                  {selectedUnlocked ? selectedNarrator.name_ar : (selectedNarrator.unlock_by || "Maîtrise (4/5) un hadith rapporté par lui pour le débloquer.")}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedNarrator.generation && <span className="nc-badge">{selectedNarrator.generation}</span>}
                  {selectedNarrator.region && <span className="nc-badge">📍 {selectedNarrator.region}</span>}
                  {selectedNarrator.death_year_h && <span className="nc-badge">† {selectedNarrator.death_year_h} H</span>}
                  {selectedNarrator.hadith_count && <span className="nc-badge">📚 {selectedNarrator.hadith_count} hadiths</span>}
                </div>

                {selectedUnlocked ? (
                  <>
                    {selectedNarrator.short_bio && <p style={{ fontSize: ".85rem", lineHeight: 1.7 }}>{selectedNarrator.short_bio}</p>}
                    {selectedNarrator.bio?.conversion_story && (
                      <div>
                        <p style={{ fontWeight: 700, fontSize: ".85rem", marginBottom: ".35rem" }}>Parcours / entrée dans l'islam</p>
                        <p style={{ fontSize: ".82rem", lineHeight: 1.65 }}>{selectedNarrator.bio.conversion_story}</p>
                      </div>
                    )}
                    {selectedNarrator.bio?.anecdotes?.length > 0 && (
                      <div>
                        <p style={{ fontWeight: 700, fontSize: ".85rem", marginBottom: ".35rem" }}>Anecdotes marquantes</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
                          {selectedNarrator.bio.anecdotes.slice(0, 4).map((a, i) => (
                            <div key={i} style={{ display: "flex", gap: ".4rem", fontSize: ".8rem" }}><span>•</span><span>{a}</span></div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedNarrator.bio?.sources?.length > 0 && (
                      <div>
                        <p style={{ fontWeight: 700, fontSize: ".82rem", marginBottom: ".3rem" }}>Sources</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: ".2rem", fontSize: ".75rem" }}>
                          {selectedNarrator.bio.sources.map((s, i) => <div key={i}>- {s}</div>)}
                        </div>
                      </div>
                    )}
                    <Link
                      to={`/narrators/${selectedNarrator.slug}`}
                      className={`nc-cta-link`}
                      style={{ display: "block", textAlign: "center", marginTop: ".5rem" }}
                    >
                      Ouvrir la page complète
                    </Link>
                  </>
                ) : (
                  <div className="nc-locked-box">
                    <p className="nc-locked-text">🔒 {selectedNarrator.unlock_by || "Maîtrise (4/5) un hadith lié à ce narrateur."}</p>
                    {selectedNarrator.unlock_hint && (
                      <p style={{ fontSize: ".78rem" }}>💡 <strong>Indice :</strong> {selectedNarrator.unlock_hint}</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function NarratorsStyles({ isDark }) {
  const dark = `
    .nc-dark {
      --bg:      #0d1117;
      --surface: #161c24;
      --surface2:#1e2630;
      --border:  rgba(255,255,255,.08);
      --border2: rgba(255,255,255,.14);
      --fg:      #e8e0d0;
      --muted:   #7a8694;
      --gold:    #c9a84c;
    }
    .nc-dark .nc-theme-toggle { background: rgba(255,255,255,.07); color: #c9a84c; border-color: rgba(201,168,76,.2); }
    .nc-dark .nc-theme-toggle:hover { background: rgba(201,168,76,.12); }
    .nc-dark .nc-icon-wrap { background: linear-gradient(135deg, #4a9f82, #2d7a62); }
    .nc-dark .nc-title    { color: #e8e0d0; }
    .nc-dark .nc-subtitle { color: #7a8694; }
    .nc-dark .nc-progress-card { background: #161c24; border-color: rgba(255,255,255,.08); }
    .nc-dark .nc-progress-label { color: #e8e0d0; }
    .nc-dark .nc-progress-sub   { color: #7a8694; }
    .nc-dark .nc-progress-track { background: #1e2630; }
    .nc-dark .nc-toolbar { background: #161c24; border-color: rgba(255,255,255,.07); }
    .nc-dark .nc-search-wrap { background: #1e2630; border-color: rgba(255,255,255,.13); }
    .nc-dark .nc-search-input { color: #e8e0d0; }
    .nc-dark .nc-search-icon  { color: #7a8694; }
    .nc-dark .nc-filter-icon  { color: #7a8694; }
    .nc-dark .nc-filter-btn { background: #161c24; border-color: rgba(255,255,255,.07); color: #7a8694; }
    .nc-dark .nc-filter-btn:hover { background: rgba(255,255,255,.06); color: #e8e0d0; }
    .nc-dark .nc-filter-btn--active-neutral { background: #e8e0d0; color: #0d1117; }
    .nc-dark .nc-narrator-card--unlocked { background: #161c24; border-color: rgba(255,255,255,.1); }
    .nc-dark .nc-narrator-card--unlocked:hover { box-shadow: 0 12px 32px rgba(0,0,0,.4), 0 0 0 1px var(--border-accent); }
    .nc-dark .nc-narrator-card--locked { background: rgba(22,28,36,.7); border-color: rgba(255,255,255,.06); }
    .nc-dark .nc-card-name { color: #e8e0d0; }
    .nc-dark .nc-card-name-ar { color: #7a8694; }
    .nc-dark .nc-unlock-icon { color: #4a9f82; }
    .nc-dark .nc-lock-icon   { color: #7a8694; }
    .nc-dark .nc-hadith-count { background: rgba(30,38,48,.9); color: #e8e0d0; }
    .nc-dark .nc-badge { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.1); color: #7a8694; }
    .nc-dark .nc-bio-text { color: #c8c0b0; }
    .nc-dark .nc-anecdote { background: rgba(201,168,76,.08); border-left-color: rgba(201,168,76,.5); }
    .nc-dark .nc-anecdote-text { color: #c9a84c; }
    .nc-dark .nc-locked-box { background: rgba(22,28,36,.9); border-color: rgba(255,255,255,.08); }
    .nc-dark .nc-locked-text { color: #7a8694; }
    .nc-dark .nc-hint-pill { background: rgba(22,28,36,.9); border-color: rgba(255,255,255,.08); color: #c8c0b0; }
    .nc-dark .nc-cta-link { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.12); color: #c8c0b0; }
    .nc-dark .nc-cta-link:hover { border-color: #c9a84c; color: #c9a84c; }
    .nc-dark .nc-empty { background: rgba(22,28,36,.7); }
    .nc-dark .nc-empty-icon-wrap { background: #1e2630; }
  `;

  const light = `
    .nc-light {
      --bg:      #f5f8f3;
      --surface: #ffffff;
      --surface2:#f0f5ee;
      --border:  rgba(45,140,106,.14);
      --border2: rgba(45,140,106,.25);
      --fg:      #1a2e24;
      --muted:   #6b8070;
      --gold:    #a07d28;
    }
    .nc-light .nc-theme-toggle { background: rgba(45,140,106,.08); color: #7c56c8; border-color: rgba(124,86,200,.2); }
    .nc-light .nc-theme-toggle:hover { background: rgba(124,86,200,.1); }
    .nc-light .nc-icon-wrap { background: linear-gradient(135deg, #2d8c6a, #1e6a50); }
    .nc-light .nc-title    { color: #0f2018; }
    .nc-light .nc-subtitle { color: #6b8070; }
    .nc-light .nc-progress-card { background: #ffffff; border-color: rgba(45,140,106,.18); box-shadow: 0 2px 12px rgba(45,140,106,.08); }
    .nc-light .nc-progress-label { color: #1a2e24; }
    .nc-light .nc-progress-sub   { color: #6b8070; }
    .nc-light .nc-progress-track { background: #e8f0eb; }
    .nc-light .nc-toolbar { background: #ffffff; border-color: rgba(45,140,106,.13); box-shadow: 0 1px 6px rgba(45,140,106,.06); }
    .nc-light .nc-search-wrap { background: #f0f5ee; border-color: rgba(45,140,106,.2); }
    .nc-light .nc-search-input { color: #1a2e24; }
    .nc-light .nc-search-icon  { color: #6b8070; }
    .nc-light .nc-filter-icon  { color: #6b8070; }
    .nc-light .nc-filter-btn { background: #ffffff; border-color: rgba(45,140,106,.15); color: #6b8070; }
    .nc-light .nc-filter-btn:hover { background: rgba(45,140,106,.06); color: #1a2e24; }
    .nc-light .nc-filter-btn--active-neutral { background: #1a2e24; color: #f5f8f3; }
    .nc-light .nc-narrator-card--unlocked { background: #ffffff; border-color: rgba(16,185,129,.25); }
    .nc-light .nc-narrator-card--unlocked:hover { box-shadow: 0 12px 32px rgba(45,140,106,.15), 0 0 0 1px var(--border-accent); }
    .nc-light .nc-narrator-card--locked { background: rgba(240,245,238,.8); border-color: rgba(45,140,106,.12); }
    .nc-light .nc-card-name { color: #0f2018; }
    .nc-light .nc-card-name-ar { color: #6b8070; }
    .nc-light .nc-unlock-icon { color: #2d8c6a; }
    .nc-light .nc-lock-icon   { color: #6b8070; }
    .nc-light .nc-hadith-count { background: rgba(26,46,36,.85); color: #e8f0eb; }
    .nc-light .nc-badge { background: rgba(45,140,106,.08); border-color: rgba(45,140,106,.18); color: #4a7a62; }
    .nc-light .nc-bio-text { color: #2e4838; }
    .nc-light .nc-anecdote { background: rgba(201,168,76,.08); border-left-color: rgba(160,125,40,.5); }
    .nc-light .nc-anecdote-text { color: #a07d28; }
    .nc-light .nc-locked-box { background: rgba(240,245,238,.9); border-color: rgba(45,140,106,.15); }
    .nc-light .nc-locked-text { color: #6b8070; }
    .nc-light .nc-hint-pill { background: #ffffff; border-color: rgba(45,140,106,.15); color: #2e4838; }
    .nc-light .nc-cta-link { background: rgba(45,140,106,.08); border-color: rgba(45,140,106,.2); color: #2e4838; }
    .nc-light .nc-cta-link:hover { border-color: #2d8c6a; color: #2d8c6a; }
    .nc-light .nc-empty { background: rgba(240,245,238,.8); }
    .nc-light .nc-empty-icon-wrap { background: #e8f0eb; }
  `;

  return (
    <style>{`
      @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

      .nc-root {
        --serif: Georgia, 'Times New Roman', serif;
        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        padding: 1.2rem 1rem 5rem;
        max-width: 1200px;
        margin: 0 auto;
        display: flex; flex-direction: column; gap: 1.25rem;
        transition: background .3s ease, color .3s ease;
      }

      /* ── topbar ── */
      .nc-topbar { display: flex; justify-content: flex-end; }
      .nc-theme-toggle {
        display: flex; align-items: center; gap: .45rem;
        border: 1px solid transparent; border-radius: 20px;
        padding: .38rem .85rem; font-size: .78rem;
        font-family: var(--serif); font-weight: 600; cursor: pointer;
        transition: background .2s, color .2s, transform .15s;
      }
      .nc-theme-toggle:hover { transform: translateY(-1px); }

      /* ── header ── */
      .nc-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 1.25rem; flex-wrap: wrap;
        animation: fadeDown .4s ease both;
      }
      .nc-header-left { display: flex; align-items: center; gap: .85rem; }
      .nc-icon-wrap { width: 48px; height: 48px; flex-shrink: 0; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; transition: background .3s; }
      .nc-title    { font-size: 1.7rem; font-weight: 700; margin: 0 0 .2rem; transition: color .3s; }
      .nc-subtitle { font-size: .82rem; margin: 0; transition: color .3s; }

      /* progress card */
      .nc-progress-card { border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.2rem; min-width: 220px; display: flex; flex-direction: column; gap: .6rem; transition: background .3s, border-color .3s; }
      .nc-progress-header { display: flex; align-items: center; justify-content: space-between; }
      .nc-progress-label-wrap { display: flex; align-items: center; gap: .4rem; }
      .nc-progress-sparkle { color: #f59e0b; }
      .nc-progress-label { font-size: .88rem; font-weight: 600; transition: color .3s; }
      .nc-progress-pct { font-size: 1.5rem; font-weight: 700; color: #2d8c6a; }
      .nc-progress-track { height: 10px; border-radius: 99px; overflow: hidden; transition: background .3s; }
      .nc-progress-fill  { height: 100%; background: linear-gradient(90deg, #2d8c6a, #4a9f82); border-radius: 99px; transition: width .5s ease; }
      .nc-progress-sub { font-size: .72rem; transition: color .3s; }

      /* ── toolbar ── */
      .nc-toolbar { border: 1px solid var(--border); border-radius: 14px; padding: .9rem 1.1rem; display: flex; flex-direction: column; gap: .75rem; transition: background .3s, border-color .3s; }
      .nc-search-wrap { display: flex; align-items: center; gap: .5rem; border: 1px solid transparent; border-radius: 10px; padding: 0 .75rem; height: 40px; transition: border-color .15s, background .3s; }
      .nc-search-wrap:focus-within { border-color: #2d8c6a; }
      .nc-search-icon { flex-shrink: 0; transition: color .3s; }
      .nc-search-input { flex: 1; background: transparent; border: none; outline: none; font-size: .85rem; font-family: var(--serif); transition: color .3s; }
      .nc-search-input::placeholder { color: var(--muted); }
      .nc-filter-row { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
      .nc-filter-icon { flex-shrink: 0; transition: color .3s; }
      .nc-filters { display: flex; gap: .4rem; flex-wrap: wrap; }
      .nc-filter-btn { border: 1px solid transparent; border-radius: 8px; padding: .3rem .7rem; font-size: .75rem; font-family: var(--serif); cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
      .nc-filter-btn--active-colored { color: #fff !important; }

      /* ── grid ── */
      .nc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.1rem; }

      /* ── narrator card ── */
      .nc-narrator-card {
        border: 2px solid var(--border); border-radius: 14px; padding: 1.1rem;
        display: flex; flex-direction: column; gap: .75rem;
        cursor: pointer; position: relative; overflow: hidden;
        transition: border-color .2s, transform .2s, box-shadow .2s, background .3s;
      }
      .nc-narrator-card:hover { transform: translateY(-4px); }
      .nc-card-shimmer { position: absolute; inset: 0; opacity: .3; pointer-events: none; animation: shimmer 2s infinite; }
      .nc-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; }
      .nc-card-header-inner { display: flex; align-items: center; gap: .75rem; flex: 1; min-width: 0; }
      .nc-avatar-wrap { flex-shrink: 0; }
      .nc-avatar { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: #fff; transition: transform .2s; }
      .nc-narrator-card:hover .nc-avatar { transform: scale(1.06) rotate(2deg); }
      .nc-card-meta { flex: 1; min-width: 0; }
      .nc-card-name-row { display: flex; align-items: center; gap: .4rem; margin-bottom: .15rem; }
      .nc-card-name { font-size: .9rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .3s; }
      .nc-card-name-ar { display: block; font-size: .78rem; transition: color .3s; }
      .nc-unlock-icon { flex-shrink: 0; transition: color .3s; }
      .nc-lock-icon   { flex-shrink: 0; transition: color .3s; }
      .nc-hadith-count { display: inline-flex; align-items: center; gap: .3rem; font-size: .65rem; border-radius: 20px; padding: 2px 8px; margin-top: .25rem; transition: background .3s, color .3s; }
      .nc-rarity-badge { display: inline-flex; align-items: center; gap: .3rem; color: #fff; border-radius: 20px; padding: 2px 8px; font-size: .65rem; font-weight: 700; flex-shrink: 0; }
      .nc-card-badges { display: flex; flex-wrap: wrap; gap: .35rem; }
      .nc-badge { border: 1px solid transparent; border-radius: 20px; padding: 2px 8px; font-size: .7rem; transition: background .3s, border-color .3s, color .3s; }
      .nc-card-bio { font-size: .8rem; }
      .nc-bio-text { line-height: 1.6; margin: 0; transition: color .3s; }
      .nc-anecdote { border-left: 2px solid transparent; border-radius: 0 6px 6px 0; padding: .5rem .75rem; margin-top: .4rem; transition: background .3s, border-color .3s; }
      .nc-anecdote-text { font-size: .75rem; font-style: italic; margin: 0; transition: color .3s; }
      .nc-locked-box { border: 1px dashed transparent; border-radius: 8px; padding: .75rem; display: flex; flex-direction: column; gap: .5rem; align-items: center; text-align: center; transition: background .3s, border-color .3s; }
      .nc-locked-text { font-size: .75rem; line-height: 1.5; margin: 0; transition: color .3s; }
      .nc-hint-pill { display: inline-block; border: 1px solid transparent; border-radius: 20px; padding: 3px 10px; font-size: .68rem; transition: background .3s, border-color .3s, color .3s; }
      .nc-card-cta { padding-top: .25rem; }
      .nc-cta-link { display: block; text-align: center; border: 1px solid transparent; border-radius: 8px; padding: .4rem .75rem; font-size: .75rem; font-family: var(--serif); text-decoration: none; transition: border-color .15s, color .15s, background .3s; }

      /* ── empty ── */
      .nc-empty { border: 2px dashed var(--border2); border-radius: 14px; padding: 3rem; text-align: center; transition: background .3s; }
      .nc-empty-icon-wrap { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; margin-bottom: .75rem; color: var(--muted); transition: background .3s; }

      ${dark}
      ${light}
    `}</style>
  );
}

export default NarratorsCollection;