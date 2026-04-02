// /src/pages/History.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  History, Clock, BookOpenCheck, RotateCcw, Star,
  Sparkles, Flame, CalendarDays, TrendingUp, Sun, Moon,
} from "lucide-react";

/* ── helpers ── */
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function qualityLabel(q) {
  switch (q) {
    case 5: return "Parfait";
    case 4: return "Facile";
    case 3: return "Moyen";
    case 2: return "Difficile";
    case 1: return "Très difficile";
    default: return "Oublié";
  }
}
function qualityAccent(q, isDark) {
  if (q >= 4) return isDark ? "#4a9f82" : "#2d8c6a";
  if (q === 3) return isDark ? "#c9a84c" : "#a07d28";
  if (q <= 2) return isDark ? "#c95a4a" : "#a83030";
  return isDark ? "#7a8694" : "#6a7580";
}
function eventTypeLabel(type) {
  if (type === "review") return "Révision";
  if (type === "learn") return "Nouvel apprentissage";
  return "Événement";
}
function eventTypeIcon(type) {
  if (type === "review") return <RotateCcw size={14} />;
  if (type === "learn") return <BookOpenCheck size={14} />;
  return <Sparkles size={14} />;
}
function computeCurrentStreak(dateKeysDesc) {
  if (!dateKeysDesc.length) return 0;
  const dateSet = new Set(dateKeysDesc);
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (dateSet.has(iso)) { streak += 1; }
    else { if (i === 0) continue; break; }
  }
  return streak;
}

/* ── SummaryCard ── */
function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="hs-summary-card" style={{ "--accent": accent }}>
      <div className="hs-summary-icon"><Icon size={15} /></div>
      <div>
        <p className="hs-summary-label">{label}</p>
        <p className="hs-summary-value" style={{ color: accent }}>{value}</p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark]   = useState(true);

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

  useEffect(() => {
    if (!user?.id) { setEvents([]); setLoading(false); return; }
    async function loadHistory() {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - 13);
      const { data, error } = await supabase
        .from("review_events")
        .select("hadith_number, quality, event_type, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });
      if (error) { console.error("Erreur historique :", error); setEvents([]); }
      else setEvents(data || []);
      setLoading(false);
    }
    loadHistory();
  }, [user?.id]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    for (const ev of events) {
      const key = new Date(ev.created_at).toISOString().slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([dateKey, evts]) => ({ dateKey, events: evts }));
  }, [events]);

  const summary = useMemo(() => {
    if (!events.length) return { total: 0, avg: 0, unique: 0, streak: 0, topDay: null, topDayCount: 0 };
    const total  = events.length;
    const avg    = Number((events.reduce((s, e) => s + (Number(e.quality) || 0), 0) / total).toFixed(1));
    const unique = new Set(events.map(e => e.hadith_number)).size;
    const countsByDay = {};
    for (const ev of events) {
      const key = new Date(ev.created_at).toISOString().slice(0, 10);
      countsByDay[key] = (countsByDay[key] || 0) + 1;
    }
    const sortedDays = Object.keys(countsByDay).sort((a, b) => (a < b ? 1 : -1));
    const streak = computeCurrentStreak(sortedDays);
    let topDay = null, topDayCount = 0;
    for (const [day, count] of Object.entries(countsByDay)) {
      if (count > topDayCount) { topDay = day; topDayCount = count; }
    }
    return { total, avg, unique, streak, topDay, topDayCount };
  }, [events]);

  const themeClass = isDark ? "hs-dark" : "hs-light";

  const avgAccent = summary.avg >= 4
    ? (isDark ? "#4a9f82" : "#2d8c6a")
    : summary.avg >= 3
    ? (isDark ? "#c9a84c" : "#a07d28")
    : (isDark ? "#c95a4a" : "#a83030");

  /* ── not logged in ── */
  if (!user) return (
    <>
      <HistoryStyles isDark={isDark} />
      <div className={`hs-root hs-center ${themeClass}`}>
        <div className="hs-topbar-abs">
          <button className="hs-theme-toggle" onClick={toggleTheme}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </div>
        <div className="hs-login-card">
          <History size={28} className="hs-login-icon" />
          <p className="hs-login-title">Tu dois être connecté pour voir ton historique.</p>
          <p className="hs-login-sub">Connecte-toi pour suivre toutes tes révisions et voir ta progression jour après jour.</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <HistoryStyles isDark={isDark} />
      <div className={`hs-root ${themeClass}`}>

        {/* ── Topbar ── */}
        <div className="hs-topbar">
          <button className="hs-theme-toggle" onClick={toggleTheme} aria-label="Changer de thème">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </div>

        {/* ── Header ── */}
        <header className="hs-header">
          <div className="hs-header-left">
            <div className="hs-icon-wrap"><History size={22} /></div>
            <div>
              <h1 className="hs-title">Historique des révisions</h1>
              <p className="hs-subtitle">Vue des 14 derniers jours pour garder une timeline claire et utile.</p>
            </div>
          </div>
          <span className="hs-count-badge">
            <Star size={12} />
            {events.length} évènement{events.length > 1 ? "s" : ""} sur 14 jours
          </span>
        </header>

        {/* ── Loading ── */}
        {loading && (
          <div className="hs-card hs-skeleton-block">
            <div className="hs-sk-line hs-sk-line--short" />
            <div className="hs-sk-line" />
            <div className="hs-sk-line hs-sk-line--medium" />
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && events.length === 0 && (
          <div className="hs-card hs-empty">
            <RotateCcw size={36} className="hs-empty-icon" />
            <p className="hs-empty-title">Aucune révision enregistrée sur les 14 derniers jours.</p>
            <p className="hs-empty-sub">Dès que tu commenceras à réviser tes hadiths, chaque session apparaîtra ici sous forme de timeline.</p>
          </div>
        )}

        {/* ── Summary cards ── */}
        {!loading && events.length > 0 && (
          <div className="hs-summary-grid">
            <SummaryCard icon={RotateCcw}    label="Révisions"         value={summary.total}     accent={isDark ? "#4a9fc8" : "#2a7ab0"} />
            <SummaryCard icon={TrendingUp}   label="Moyenne"           value={`${summary.avg}/5`} accent={avgAccent} />
            <SummaryCard icon={BookOpenCheck} label="Hadiths travaillés" value={summary.unique}    accent={isDark ? "#9f7ae0" : "#7c56c8"} />
            <SummaryCard icon={Flame}        label="Série active"       value={`${summary.streak} jour${summary.streak > 1 ? "s" : ""}`} accent={isDark ? "#e08a3c" : "#bf6a1a"} />
          </div>
        )}

        {/* ── Top day ── */}
        {!loading && summary.topDay && (
          <div className="hs-card hs-topday-card">
            <div className="hs-topday-left">
              <div className="hs-topday-icon"><CalendarDays size={15} /></div>
              <div>
                <p className="hs-topday-title">Jour le plus actif</p>
                <p className="hs-topday-date">{formatDate(summary.topDay)}</p>
              </div>
            </div>
            <span className="hs-topday-badge">{summary.topDayCount} révision{summary.topDayCount > 1 ? "s" : ""}</span>
          </div>
        )}

        {/* ── Timeline ── */}
        {!loading && events.length > 0 && (
          <div className="hs-timeline">
            <div className="hs-timeline-line" />
            <div className="hs-timeline-content">
              {groupedByDate.map(({ dateKey, events: group }) => (
                <div key={dateKey} className="hs-day-group">
                  <div className="hs-day-header">
                    <div className="hs-day-dot-wrap">
                      <div className="hs-day-dot" />
                    </div>
                    <p className="hs-day-label">{formatDate(dateKey)}</p>
                  </div>

                  <div className="hs-events-list">
                    {group.map((ev, idx) => {
                      const accent = qualityAccent(ev.quality, isDark);
                      return (
                        <div key={`${dateKey}-${idx}`} className="hs-event-card" style={{ "--accent": accent }}>
                          <div className="hs-event-card-top">
                            <div className="hs-event-badges">
                              <span className="hs-badge-hadith">Hadith #{ev.hadith_number}</span>
                              <span className="hs-badge-quality" style={{ "--accent": accent }}>
                                {ev.quality}/5 – {qualityLabel(ev.quality)}
                              </span>
                            </div>
                            <div className="hs-event-time">
                              <Clock size={11} />
                              <span>{formatTime(ev.created_at)}</span>
                            </div>
                          </div>
                          <div className="hs-event-divider" />
                          <div className="hs-event-card-bottom">
                            <div className="hs-event-type" style={{ "--accent": accent }}>
                              {eventTypeIcon(ev.event_type)}
                              <span>{eventTypeLabel(ev.event_type)}</span>
                            </div>
                            <p className="hs-event-note">Session enregistrée automatiquement pour suivre ta progression.</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

function HistoryStyles({ isDark }) {
  const dark = `
    .hs-dark {
      --bg:      #0d1117;
      --surface: #161c24;
      --surface2:#1e2630;
      --border:  rgba(255,255,255,.07);
      --border2: rgba(255,255,255,.13);
      --fg:      #e8e0d0;
      --muted:   #7a8694;
      --gold:    #c9a84c;
      --accent:  #4a9fc8;
    }
    .hs-dark .hs-theme-toggle { background: rgba(255,255,255,.07); color: #c9a84c; border-color: rgba(201,168,76,.2); }
    .hs-dark .hs-theme-toggle:hover { background: rgba(201,168,76,.12); }
    .hs-dark .hs-icon-wrap { background: linear-gradient(135deg, #4a9fc8, #2d6ca8); }
    .hs-dark .hs-title     { color: #e8e0d0; }
    .hs-dark .hs-subtitle  { color: #7a8694; }
    .hs-dark .hs-header    { border-bottom-color: rgba(255,255,255,.13); }
    .hs-dark .hs-count-badge { background: rgba(255,255,255,.07); color: #7a8694; border-color: rgba(255,255,255,.13); }
    .hs-dark .hs-card { background: #161c24; border-color: rgba(255,255,255,.07); }
    .hs-dark .hs-sk-line  { background: #1e2630; }
    .hs-dark .hs-empty-icon  { color: #7a8694; }
    .hs-dark .hs-empty-title { color: #e8e0d0; }
    .hs-dark .hs-empty-sub   { color: #7a8694; }
    .hs-dark .hs-summary-card { background: #161c24; border-color: rgba(255,255,255,.07); }
    .hs-dark .hs-summary-icon { background: rgba(255,255,255,.07); color: #7a8694; }
    .hs-dark .hs-summary-label { color: #7a8694; }
    .hs-dark .hs-topday-icon { background: rgba(74,159,200,.2); color: #4a9fc8; }
    .hs-dark .hs-topday-title { color: #e8e0d0; }
    .hs-dark .hs-topday-date  { color: #7a8694; }
    .hs-dark .hs-topday-badge { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.13); color: #7a8694; }
    .hs-dark .hs-timeline-line { background: linear-gradient(to bottom, rgba(74,159,200,.6), rgba(122,134,148,.3), transparent); }
    .hs-dark .hs-day-dot { background: #4a9fc8; border-color: #0d1117; }
    .hs-dark .hs-day-label { color: #7a8694; }
    .hs-dark .hs-event-card { background: #161c24; border-color: rgba(255,255,255,.07); }
    .hs-dark .hs-event-card:hover { border-color: rgba(255,255,255,.13); box-shadow: 0 4px 18px rgba(0,0,0,.25); }
    .hs-dark .hs-badge-hadith { background: rgba(255,255,255,.07); color: #7a8694; border-color: rgba(255,255,255,.13); }
    .hs-dark .hs-event-time { color: #7a8694; }
    .hs-dark .hs-event-divider { background: rgba(255,255,255,.07); }
    .hs-dark .hs-event-note { color: #7a8694; }
    .hs-dark .hs-login-card { background: #161c24; border-color: rgba(255,255,255,.13); }
    .hs-dark .hs-login-icon  { color: #7a8694; }
    .hs-dark .hs-login-title { color: #e8e0d0; }
    .hs-dark .hs-login-sub   { color: #7a8694; }
  `;

  const light = `
    .hs-light {
      --bg:      #fdf8f0;
      --surface: #ffffff;
      --surface2:#fef6e4;
      --border:  rgba(160,125,40,.13);
      --border2: rgba(160,125,40,.25);
      --fg:      #2c2416;
      --muted:   #7a6d58;
      --gold:    #a07d28;
      --accent:  #2a7ab0;
    }
    .hs-light .hs-theme-toggle { background: rgba(160,125,40,.08); color: #7c56c8; border-color: rgba(124,86,200,.2); }
    .hs-light .hs-theme-toggle:hover { background: rgba(124,86,200,.1); }
    .hs-light .hs-icon-wrap { background: linear-gradient(135deg, #2a7ab0, #1a5a8a); }
    .hs-light .hs-title     { color: #1e1810; }
    .hs-light .hs-subtitle  { color: #7a6d58; }
    .hs-light .hs-header    { border-bottom-color: rgba(160,125,40,.15); }
    .hs-light .hs-count-badge { background: rgba(160,125,40,.08); color: #7a6d58; border-color: rgba(160,125,40,.2); }
    .hs-light .hs-card { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 1px 6px rgba(160,125,40,.06); }
    .hs-light .hs-sk-line  { background: #fef6e4; }
    .hs-light .hs-empty-icon  { color: #7a6d58; }
    .hs-light .hs-empty-title { color: #1e1810; }
    .hs-light .hs-empty-sub   { color: #7a6d58; }
    .hs-light .hs-summary-card { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 1px 4px rgba(160,125,40,.06); }
    .hs-light .hs-summary-icon { background: rgba(160,125,40,.08); color: #7a6d58; }
    .hs-light .hs-summary-label { color: #7a6d58; }
    .hs-light .hs-topday-icon { background: rgba(42,122,176,.12); color: #2a7ab0; }
    .hs-light .hs-topday-title { color: #1e1810; }
    .hs-light .hs-topday-date  { color: #7a6d58; }
    .hs-light .hs-topday-badge { background: rgba(160,125,40,.08); border-color: rgba(160,125,40,.2); color: #7a6d58; }
    .hs-light .hs-timeline-line { background: linear-gradient(to bottom, rgba(42,122,176,.5), rgba(122,109,88,.25), transparent); }
    .hs-light .hs-day-dot { background: #2a7ab0; border-color: #fdf8f0; }
    .hs-light .hs-day-label { color: #7a6d58; }
    .hs-light .hs-event-card { background: #ffffff; border-color: rgba(160,125,40,.13); }
    .hs-light .hs-event-card:hover { border-color: rgba(160,125,40,.28); box-shadow: 0 4px 16px rgba(160,125,40,.1); }
    .hs-light .hs-badge-hadith { background: rgba(160,125,40,.08); color: #7a6d58; border-color: rgba(160,125,40,.18); }
    .hs-light .hs-event-time { color: #7a6d58; }
    .hs-light .hs-event-divider { background: rgba(160,125,40,.1); }
    .hs-light .hs-event-note { color: #7a6d58; }
    .hs-light .hs-login-card { background: #ffffff; border-color: rgba(160,125,40,.2); box-shadow: 0 2px 16px rgba(160,125,40,.07); }
    .hs-light .hs-login-icon  { color: #7a6d58; }
    .hs-light .hs-login-title { color: #1e1810; }
    .hs-light .hs-login-sub   { color: #7a6d58; }
  `;

  return (
    <style>{`
      .hs-root {
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
        position: relative;
      }
      .hs-center { justify-content: center; align-items: center; }
      .hs-topbar-abs { position: absolute; top: 1.2rem; right: 1rem; }

      /* ── topbar ── */
      .hs-topbar { display: flex; justify-content: flex-end; }
      .hs-theme-toggle {
        display: flex; align-items: center; gap: .45rem;
        border: 1px solid transparent; border-radius: 20px;
        padding: .38rem .85rem; font-size: .78rem;
        font-family: var(--serif); font-weight: 600; cursor: pointer;
        transition: background .2s, color .2s, transform .15s;
      }
      .hs-theme-toggle:hover { transform: translateY(-1px); }

      /* ── header ── */
      .hs-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 1rem; flex-wrap: wrap;
        padding-bottom: 1.25rem; border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both; transition: border-color .3s;
      }
      .hs-header-left { display: flex; align-items: flex-start; gap: .85rem; }
      .hs-icon-wrap {
        width: 48px; height: 48px; flex-shrink: 0; border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; margin-top: .1rem; transition: background .3s;
      }
      .hs-title    { font-size: 1.6rem; font-weight: 700; margin: 0 0 .2rem; transition: color .3s; }
      .hs-subtitle { font-size: .8rem; font-style: italic; margin: 0; transition: color .3s; }
      .hs-count-badge {
        display: inline-flex; align-items: center; gap: .35rem;
        border: 1px solid transparent; border-radius: 20px; padding: .28rem .75rem;
        font-size: .72rem; white-space: nowrap; transition: background .3s, color .3s, border-color .3s;
      }

      /* ── card base ── */
      .hs-card {
        border: 1px solid var(--border); border-radius: 14px; padding: 1.2rem;
        animation: fadeUp .4s ease both; transition: background .3s, border-color .3s, box-shadow .3s;
      }

      /* ── skeleton ── */
      .hs-skeleton-block { display: flex; flex-direction: column; gap: .75rem; animation: pulse 1.4s ease infinite; }
      .hs-sk-line { height: 16px; border-radius: 6px; transition: background .3s; }
      .hs-sk-line--short  { width: 35%; }
      .hs-sk-line--medium { width: 60%; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

      /* ── empty ── */
      .hs-empty { text-align: center; display: flex; flex-direction: column; align-items: center; gap: .75rem; border: 2px dashed var(--border2); }
      .hs-empty-icon  { opacity: .45; transition: color .3s; }
      .hs-empty-title { font-size: .95rem; font-weight: 700; margin: 0; transition: color .3s; }
      .hs-empty-sub   { font-size: .82rem; font-style: italic; margin: 0; line-height: 1.6; max-width: 440px; transition: color .3s; }

      /* ── summary grid ── */
      .hs-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .75rem; }
      @media (max-width: 560px) { .hs-summary-grid { grid-template-columns: repeat(2, 1fr); } }
      .hs-summary-card {
        border: 1px solid var(--border); border-radius: 12px; padding: .9rem;
        display: flex; align-items: center; gap: .75rem;
        transition: background .3s, border-color .3s;
      }
      .hs-summary-icon { width: 34px; height: 34px; flex-shrink: 0; border-radius: 9px; display: flex; align-items: center; justify-content: center; transition: background .3s, color .3s; }
      .hs-summary-label { font-size: .68rem; margin: 0 0 .15rem; transition: color .3s; }
      .hs-summary-value { font-size: 1.35rem; font-weight: 700; margin: 0; line-height: 1; }

      /* ── top day ── */
      .hs-topday-card { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem; }
      .hs-topday-left { display: flex; align-items: center; gap: .75rem; }
      .hs-topday-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; transition: background .3s, color .3s; }
      .hs-topday-title { font-size: .85rem; font-weight: 700; margin: 0; transition: color .3s; }
      .hs-topday-date  { font-size: .75rem; margin: 0; transition: color .3s; }
      .hs-topday-badge {
        border: 1px solid transparent; border-radius: 20px; padding: .25rem .75rem;
        font-size: .75rem; transition: background .3s, color .3s, border-color .3s;
      }

      /* ── timeline ── */
      .hs-timeline { position: relative; padding-left: 1.5rem; }
      .hs-timeline-line { position: absolute; left: .35rem; top: 0; bottom: 0; width: 2px; border-radius: 1px; }
      .hs-timeline-content { display: flex; flex-direction: column; gap: 1.5rem; }
      .hs-day-group {}
      .hs-day-header { display: flex; align-items: center; gap: .65rem; margin-bottom: .75rem; }
      .hs-day-dot-wrap { position: relative; }
      .hs-day-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid transparent; flex-shrink: 0; transition: background .3s, border-color .3s; }
      .hs-day-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; transition: color .3s; }
      .hs-events-list { display: flex; flex-direction: column; gap: .6rem; }

      .hs-event-card {
        border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
        transition: border-color .15s, box-shadow .15s, background .3s;
      }
      .hs-event-card-top {
        display: flex; align-items: center; justify-content: space-between;
        gap: .75rem; flex-wrap: wrap; padding: .75rem 1rem;
      }
      .hs-event-badges { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
      .hs-badge-hadith {
        border: 1px solid transparent; border-radius: 20px; padding: 2px 9px;
        font-size: .7rem; transition: background .3s, color .3s, border-color .3s;
      }
      .hs-badge-quality {
        border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        color: var(--accent); border-radius: 20px; padding: 2px 9px;
        font-size: .7rem;
      }
      .hs-event-time { display: flex; align-items: center; gap: .3rem; font-size: .72rem; flex-shrink: 0; transition: color .3s; }
      .hs-event-divider { height: 1px; transition: background .3s; }
      .hs-event-card-bottom { display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; padding: .7rem 1rem; }
      .hs-event-type { display: flex; align-items: center; gap: .5rem; font-size: .82rem; font-weight: 600; color: var(--accent); }
      .hs-event-note { font-size: .7rem; font-style: italic; margin: 0; max-width: 340px; text-align: right; transition: color .3s; }

      /* ── login ── */
      .hs-login-card { border: 1px solid var(--border2); border-radius: 16px; padding: 2.5rem; display: flex; flex-direction: column; align-items: center; gap: .75rem; text-align: center; max-width: 380px; width: 100%; transition: background .3s, border-color .3s; }
      .hs-login-title { font-size: 1rem; font-weight: 700; margin: 0; transition: color .3s; }
      .hs-login-sub   { font-size: .82rem; font-style: italic; margin: 0; line-height: 1.55; transition: color .3s; }

      @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

      ${dark}
      ${light}
    `}</style>
  );
}