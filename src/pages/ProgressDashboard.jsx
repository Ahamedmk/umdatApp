// /src/pages/ProgressDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  BarChart3, Flame, CheckCircle2, Clock,
  CalendarDays, AlertTriangle, Sparkles, Sun, Moon,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, CartesianGrid, Cell,
} from "recharts";
import { ALL_HADITHS } from "../data/allHadiths";

/* ─── helpers ─── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

function todayStrRef() {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(dates) {
  if (!dates.length) return 0;
  return new Set(dates.map(d => new Date(d).toISOString().slice(0, 10))).size;
}

function normalizeStatus(raw, nextReviewDate, todayStr) {
  if (!raw) return "not_started";
  if (raw === "mastered") return "mastered";
  if (nextReviewDate && nextReviewDate <= todayStr) return "review";
  if (raw === "learned") return "scheduled";
  if (raw === "learning") return "learning";
  return "not_started";
}

/* ─── custom bar tooltip ─── */
function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={`pd-tooltip ${isDark ? "pd-tooltip--dark" : "pd-tooltip--light"}`}>
      <span className="pd-tooltip-date">{formatDate(d.date)}</span>
      <span className="pd-tooltip-val">{d.count} révision{d.count > 1 ? "s" : ""}</span>
    </div>
  );
}

/* ══════════════════════════════════════════ */
export default function ProgressDashboard() {
  const { user } = useAuth();

  const [loading, setLoading]           = useState(true);
  const [progressRows, setProgressRows] = useState([]);
  const [reviewDates, setReviewDates]   = useState([]);
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

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    async function loadData() {
      setLoading(true);
      try {
        const { data: prog, error: pe } = await supabase
          .from("user_hadith_progress")
          .select("hadith_number, status, next_review_date, repetitions, interval_days, last_result, ease_factor")
          .eq("user_id", user.id);
        if (pe) throw pe;
        const { data: events, error: ee } = await supabase
          .from("review_events").select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(365);
        if (ee) throw ee;
        setProgressRows((prog || []).map(r => ({
          ...r,
          status: normalizeStatus(r.status, r.next_review_date, todayStrRef()),
        })));
        setReviewDates((events || []).map(e => e.created_at));
      } catch (err) {
        console.error(err);
        setProgressRows([]); setReviewDates([]);
      } finally { setLoading(false); }
    }
    loadData();
  }, [user?.id]);

  const todayStr      = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const totalHadiths  = ALL_HADITHS.length;

  const progressMap = useMemo(() => {
    const m = {};
    for (const r of progressRows) m[r.hadith_number] = r;
    return m;
  }, [progressRows]);

  const hadithsWithProgress = useMemo(() => ALL_HADITHS.map(h => {
    const p = progressRows.find(x => x.hadith_number === h.number);
    return { ...h, progressStatus: p?.status || "not_started", next_review_date: p?.next_review_date, repetitions: p?.repetitions || 0, last_result: p?.last_result };
  }), [progressRows]);

  const memorizedCount = useMemo(() => hadithsWithProgress.filter(h => h.progressStatus === "mastered").length, [hadithsWithProgress]);
  const learningCount  = useMemo(() => hadithsWithProgress.filter(h => h.progressStatus === "learning" || h.progressStatus === "scheduled").length, [hadithsWithProgress]);
  const newCount       = useMemo(() => hadithsWithProgress.filter(h => !h.progressStatus || h.progressStatus === "not_started").length, [hadithsWithProgress]);
  const dueTodayOrLate = useMemo(() => progressRows.filter(p => p.next_review_date && p.next_review_date <= todayStr).length, [progressRows, todayStr]);
  const streak         = useMemo(() => computeStreak(reviewDates), [reviewDates]);
  const memorizedPct   = totalHadiths ? Math.round((memorizedCount / totalHadiths) * 100) : 0;

  const chartData = useMemo(() => {
    const counts = {};
    reviewDates.forEach(ts => { const k = new Date(ts).toISOString().slice(0, 10); counts[k] = (counts[k] || 0) + 1; });
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, label: d.toLocaleDateString("fr-FR", { day: "2-digit" }), count: counts[key] || 0 });
    }
    return days;
  }, [reviewDates]);

  const upcomingReviews = useMemo(() => (
    [...progressRows].filter(p => p.next_review_date && p.next_review_date >= todayStr)
      .sort((a, b) => a.next_review_date < b.next_review_date ? -1 : 1).slice(0, 5)
  ), [progressRows, todayStr]);

  const STATUS_META = {
    mastered:    { label: "Maîtrisé",      color: isDark ? "#4a9f82" : "#2d8c6a" },
    learning:    { label: "En cours",      color: isDark ? "#4a9fc8" : "#2a7ab0" },
    scheduled:   { label: "En cours",      color: isDark ? "#4a9fc8" : "#2a7ab0" },
    review:      { label: "À réviser",     color: isDark ? "#e08a3c" : "#bf6a1a" },
    not_started: { label: "Non commencé",  color: isDark ? "#7a8694" : "#6a7580" },
  };

  const barColor      = isDark ? "#4a9fc8" : "#2a7ab0";
  const barEmptyColor = isDark ? "rgba(255,255,255,.06)" : "rgba(160,125,40,.1)";
  const gridColor     = isDark ? "rgba(255,255,255,.06)" : "rgba(160,125,40,.08)";
  const axisColor     = isDark ? "#7a8694" : "#7a6d58";
  const cursorColor   = isDark ? "rgba(255,255,255,.04)" : "rgba(160,125,40,.06)";

  const themeClass = isDark ? "pd-dark" : "pd-light";

  /* ── not logged in ── */
  if (!user) return (
    <>
      <PdStyles isDark={isDark} />
      <div className={`pd-root pd-center ${themeClass}`}>
        <div className="pd-topbar" style={{ position: "absolute", top: "1.2rem", right: "1rem" }}>
          <button className="pd-theme-toggle" onClick={toggleTheme}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </div>
        <div className="pd-login-card">
          <BarChart3 size={28} className="pd-login-icon" />
          <p className="pd-login-title">Connecte-toi pour voir ta progression</p>
          <p className="pd-login-sub">Tes statistiques se calculent automatiquement à partir de tes révisions.</p>
        </div>
      </div>
    </>
  );

  const statsRow = [
    { icon: CheckCircle2, label: "Maîtrisés", value: memorizedCount, sub: `${memorizedPct}% des ${totalHadiths}`, accent: isDark ? "#4a9f82" : "#2d8c6a" },
    { icon: Sparkles,     label: "En cours",  value: learningCount,  sub: "Activement révisés",                   accent: isDark ? "#4a9fc8" : "#2a7ab0" },
    { icon: Sparkles,     label: "Nouveaux",  value: newCount,       sub: "Jamais étudiés",                       accent: isDark ? "#7a8694" : "#6a7580" },
    { icon: Clock,        label: "À réviser", value: dueTodayOrLate, sub: "Aujourd'hui ou en retard",             accent: isDark ? "#e08a3c" : "#bf6a1a" },
    { icon: Flame,        label: "Streak",    value: streak,         sub: "Jours de révision",                    accent: isDark ? "#c95a4a" : "#a83030" },
  ];

  return (
    <>
      <PdStyles isDark={isDark} />
      <div className={`pd-root ${themeClass}`}>

        {/* ── Topbar ── */}
        <div className="pd-topbar">
          <button className="pd-theme-toggle" onClick={toggleTheme} aria-label="Changer de thème">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </div>

        {/* ── Header ── */}
        <header className="pd-header">
          <div className="pd-header-left">
            <div className="pd-icon-wrap"><BarChart3 size={17} /></div>
            <div>
              <h1 className="pd-title">Tableau de progression</h1>
              <p className="pd-subtitle">Mémorisation de {totalHadiths} hadiths · SM-2</p>
            </div>
          </div>
          <span className="pd-global-badge">{memorizedCount}/{totalHadiths} maîtrisés</span>
        </header>

        {/* ── Stats ── */}
        <div className="pd-stats">
          {statsRow.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="pd-stat" style={{ "--accent": s.accent }}>
                <div className="pd-stat-icon"><Icon size={15} /></div>
                <span className="pd-stat-value">{s.value}</span>
                <span className="pd-stat-label">{s.label}</span>
                <span className="pd-stat-sub">{s.sub}</span>
              </div>
            );
          })}
        </div>

        {/* ── Chart ── */}
        <section className="pd-card">
          <div className="pd-card-header">
            <span className="pd-card-icon"><BarChart3 size={14} /></span>
            <span>Rythme de révision — 14 derniers jours</span>
          </div>
          <div className="pd-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: axisColor, fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: cursorColor }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.count > 0 ? barColor : barEmptyColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {reviewDates.length === 0 && (
            <p className="pd-chart-empty">Aucune révision enregistrée. Lance ta première session pour alimenter ce graphique.</p>
          )}
        </section>

        {/* ── Upcoming reviews ── */}
        <section className="pd-card">
          <div className="pd-card-header">
            <span className="pd-card-icon"><AlertTriangle size={14} /></span>
            <span>Prochaines révisions</span>
          </div>
          {upcomingReviews.length === 0 ? (
            <p className="pd-empty-txt">Aucune révision planifiée. Continue d'apprendre de nouveaux hadiths.</p>
          ) : (
            <div className="pd-upcoming-list">
              {upcomingReviews.map((p, i) => (
                <div key={p.hadith_number} className="pd-upcoming-row" style={{ "--delay": `${i * 50}ms` }}>
                  <span className="pd-upcoming-num">#{p.hadith_number}</span>
                  <div className="pd-upcoming-info">
                    <span className="pd-upcoming-title">Hadith {p.hadith_number}</span>
                    <span className="pd-upcoming-meta">Intervalle {p.interval_days}j · {p.repetitions} rép.</span>
                  </div>
                  <div className="pd-upcoming-date">
                    <span>{formatDate(p.next_review_date)}</span>
                    <span className="pd-upcoming-date-sub">Prochaine session</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Detail list ── */}
        <section className="pd-card">
          <div className="pd-card-header">
            <span className="pd-card-icon"><CalendarDays size={14} /></span>
            <span>Vue détaillée par hadith</span>
          </div>
          {loading ? (
            <div className="pd-skeleton-list">
              {[...Array(6)].map((_, i) => <div key={i} className="pd-skeleton-row" />)}
            </div>
          ) : (
            <div className="pd-detail-list">
              {ALL_HADITHS.map((h, i) => {
                const prog   = progressMap[h.number];
                const status = prog?.status || "not_started";
                const meta   = STATUS_META[status] || STATUS_META.not_started;
                return (
                  <div key={h.number} className="pd-detail-row" style={{ "--delay": `${i * 25}ms`, "--status-clr": meta.color }}>
                    <div className="pd-detail-bar" />
                    <div className="pd-detail-num">#{h.number}</div>
                    <div className="pd-detail-body">
                      <span className="pd-detail-title">{h.title || `Hadith ${h.number}`}</span>
                      <span className="pd-detail-meta">
                        {prog ? `${prog.repetitions} rép.` : "Non commencé"}
                        {prog?.last_result != null ? ` · Score ${prog.last_result}/5` : ""}
                      </span>
                    </div>
                    <div className="pd-detail-right">
                      <span className="pd-detail-status" style={{ "--clr": meta.color }}>
                        <span className="pd-detail-dot" />{meta.label}
                      </span>
                      <span className="pd-detail-date">
                        <Clock size={10} /> {formatDate(prog?.next_review_date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </>
  );
}

function PdStyles({ isDark }) {
  const dark = `
    .pd-dark {
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
    .pd-dark .pd-theme-toggle { background: rgba(255,255,255,.07); color: #c9a84c; border-color: rgba(201,168,76,.2); }
    .pd-dark .pd-theme-toggle:hover { background: rgba(201,168,76,.12); }
    .pd-dark .pd-login-card { background: #161c24; border-color: rgba(255,255,255,.13); }
    .pd-dark .pd-login-icon { color: #7a8694; }
    .pd-dark .pd-login-title { color: #e8e0d0; }
    .pd-dark .pd-login-sub   { color: #7a8694; }
    .pd-dark .pd-icon-wrap { background: linear-gradient(135deg, #6a5acd, #4a3aad); box-shadow: 0 2px 10px rgba(106,90,205,.3); }
    .pd-dark .pd-title     { color: #e8e0d0; }
    .pd-dark .pd-subtitle  { color: #7a8694; }
    .pd-dark .pd-header    { border-bottom-color: rgba(255,255,255,.13); }
    .pd-dark .pd-global-badge { background: rgba(201,168,76,.13); color: #c9a84c; border-color: rgba(201,168,76,.3); }
    .pd-dark .pd-stat { background: #161c24; border-color: rgba(255,255,255,.07); }
    .pd-dark .pd-stat-label { color: #e8e0d0; }
    .pd-dark .pd-stat-sub   { color: #7a8694; }
    .pd-dark .pd-card { background: #161c24; border-color: rgba(255,255,255,.07); }
    .pd-dark .pd-card-header { color: #c9a84c; border-bottom-color: rgba(255,255,255,.07); }
    .pd-dark .pd-chart-empty { color: #7a8694; }
    .pd-dark .pd-tooltip--dark { background: #1e2630; border: 1px solid rgba(255,255,255,.13); }
    .pd-dark .pd-tooltip--dark .pd-tooltip-date { color: #7a8694; }
    .pd-dark .pd-tooltip--dark .pd-tooltip-val  { color: #e8e0d0; }
    .pd-dark .pd-upcoming-row { background: #1e2630; border-color: rgba(255,255,255,.07); }
    .pd-dark .pd-upcoming-row:hover { border-color: rgba(255,255,255,.13); }
    .pd-dark .pd-upcoming-num   { background: linear-gradient(135deg, #4a9fc8, #2d6ca8); }
    .pd-dark .pd-upcoming-title { color: #e8e0d0; }
    .pd-dark .pd-upcoming-meta  { color: #7a8694; }
    .pd-dark .pd-upcoming-date span:first-child { color: #e8e0d0; }
    .pd-dark .pd-upcoming-date-sub { color: #7a8694; }
    .pd-dark .pd-empty-txt { color: #7a8694; }
    .pd-dark .pd-skeleton-row { background: #1e2630; }
    .pd-dark .pd-detail-row { background: #1e2630; border-color: rgba(255,255,255,.07); }
    .pd-dark .pd-detail-row:hover { border-color: rgba(255,255,255,.13); }
    .pd-dark .pd-detail-num   { color: #7a8694; }
    .pd-dark .pd-detail-title { color: #e8e0d0; }
    .pd-dark .pd-detail-meta  { color: #7a8694; }
    .pd-dark .pd-detail-date  { color: #7a8694; }
  `;

  const light = `
    .pd-light {
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
    .pd-light .pd-theme-toggle { background: rgba(160,125,40,.08); color: #7c56c8; border-color: rgba(124,86,200,.2); }
    .pd-light .pd-theme-toggle:hover { background: rgba(124,86,200,.1); }
    .pd-light .pd-login-card { background: #ffffff; border-color: rgba(160,125,40,.2); box-shadow: 0 2px 16px rgba(160,125,40,.07); }
    .pd-light .pd-login-icon  { color: #7a6d58; }
    .pd-light .pd-login-title { color: #1e1810; }
    .pd-light .pd-login-sub   { color: #7a6d58; }
    .pd-light .pd-icon-wrap { background: linear-gradient(135deg, #7c56c8, #5a3aad); box-shadow: 0 2px 10px rgba(124,86,200,.25); }
    .pd-light .pd-title     { color: #1e1810; }
    .pd-light .pd-subtitle  { color: #7a6d58; }
    .pd-light .pd-header    { border-bottom-color: rgba(160,125,40,.15); }
    .pd-light .pd-global-badge { background: rgba(160,125,40,.1); color: #a07d28; border-color: rgba(160,125,40,.28); }
    .pd-light .pd-stat { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 1px 4px rgba(160,125,40,.06); }
    .pd-light .pd-stat-label { color: #1e1810; }
    .pd-light .pd-stat-sub   { color: #7a6d58; }
    .pd-light .pd-card { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 1px 6px rgba(160,125,40,.06); }
    .pd-light .pd-card-header { color: #a07d28; border-bottom-color: rgba(160,125,40,.12); }
    .pd-light .pd-chart-empty { color: #7a6d58; }
    .pd-light .pd-tooltip--light { background: #ffffff; border: 1px solid rgba(160,125,40,.22); box-shadow: 0 2px 10px rgba(160,125,40,.1); }
    .pd-light .pd-tooltip--light .pd-tooltip-date { color: #7a6d58; }
    .pd-light .pd-tooltip--light .pd-tooltip-val  { color: #1e1810; }
    .pd-light .pd-upcoming-row { background: #fef6e4; border-color: rgba(160,125,40,.13); }
    .pd-light .pd-upcoming-row:hover { border-color: rgba(160,125,40,.25); }
    .pd-light .pd-upcoming-num { background: linear-gradient(135deg, #2a7ab0, #1a5a8a); }
    .pd-light .pd-upcoming-title { color: #1e1810; }
    .pd-light .pd-upcoming-meta  { color: #7a6d58; }
    .pd-light .pd-upcoming-date span:first-child { color: #1e1810; }
    .pd-light .pd-upcoming-date-sub { color: #7a6d58; }
    .pd-light .pd-empty-txt { color: #7a6d58; }
    .pd-light .pd-skeleton-row { background: #fef6e4; }
    .pd-light .pd-detail-row { background: #fef6e4; border-color: rgba(160,125,40,.1); box-shadow: 0 1px 3px rgba(160,125,40,.04); }
    .pd-light .pd-detail-row:hover { border-color: rgba(160,125,40,.25); }
    .pd-light .pd-detail-num   { color: #7a6d58; }
    .pd-light .pd-detail-title { color: #1e1810; }
    .pd-light .pd-detail-meta  { color: #7a6d58; }
    .pd-light .pd-detail-date  { color: #7a6d58; }
  `;

  return (
    <style>{`
      .pd-root {
        --serif: Georgia, 'Times New Roman', serif;
        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 800px;
        margin: 0 auto;
        padding: 1.2rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
        transition: background .3s ease, color .3s ease;
      }
      .pd-center { justify-content: center; align-items: center; position: relative; }

      /* ── topbar ── */
      .pd-topbar { display: flex; justify-content: flex-end; }
      .pd-theme-toggle {
        display: flex; align-items: center; gap: .45rem;
        border: 1px solid transparent; border-radius: 20px;
        padding: .38rem .85rem; font-size: .78rem;
        font-family: var(--serif); font-weight: 600; cursor: pointer;
        transition: background .2s, color .2s, transform .15s; letter-spacing: .02em;
      }
      .pd-theme-toggle:hover { transform: translateY(-1px); }

      /* ── login card ── */
      .pd-login-card {
        border: 1px solid var(--border2); border-radius: 16px; padding: 2.5rem;
        display: flex; flex-direction: column; align-items: center;
        gap: .75rem; text-align: center; max-width: 360px; width: 100%;
        transition: background .3s, border-color .3s;
      }
      .pd-login-title { font-size: 1rem; font-weight: 700; margin: 0; transition: color .3s; }
      .pd-login-sub   { font-size: .8rem; font-style: italic; margin: 0; line-height: 1.55; transition: color .3s; }

      /* ── header ── */
      .pd-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; flex-wrap: wrap;
        padding-bottom: 1.25rem; border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both; transition: border-color .3s;
      }
      .pd-header-left { display: flex; align-items: center; gap: .85rem; }
      .pd-icon-wrap {
        width: 40px; height: 40px; flex-shrink: 0;
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; transition: background .3s, box-shadow .3s;
      }
      .pd-title    { font-size: 1.5rem; font-weight: 700; margin: 0 0 .15rem; transition: color .3s; }
      .pd-subtitle { font-size: .78rem; font-style: italic; margin: 0; transition: color .3s; }
      .pd-global-badge {
        border: 1px solid transparent; border-radius: 20px; padding: .28rem .85rem;
        font-size: .75rem; font-weight: 700; white-space: nowrap;
        transition: background .3s, color .3s, border-color .3s;
      }

      /* ── stats ── */
      .pd-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: .7rem; }
      @media (max-width: 520px) { .pd-stats { grid-template-columns: repeat(2, 1fr); } }
      .pd-stat {
        border: 1px solid var(--border); border-top: 2px solid var(--accent);
        border-radius: 13px; padding: .85rem .6rem;
        display: flex; flex-direction: column; align-items: center; gap: .18rem;
        text-align: center; transition: border-color .15s, background .3s;
        animation: fadeUp .4s ease both;
      }
      .pd-stat:hover { border-color: var(--accent); }
      .pd-stat-icon  { color: var(--accent); margin-bottom: .1rem; }
      .pd-stat-value { font-size: 1.55rem; font-weight: 700; color: var(--accent); line-height: 1; }
      .pd-stat-label { font-size: .68rem; font-weight: 600; transition: color .3s; }
      .pd-stat-sub   { font-size: .62rem; line-height: 1.3; text-align: center; transition: color .3s; }

      /* ── card ── */
      .pd-card {
        border: 1px solid var(--border); border-radius: 16px; padding: 1.3rem;
        display: flex; flex-direction: column; gap: 1rem;
        animation: fadeUp .45s ease both; transition: background .3s, border-color .3s;
      }
      .pd-card-header {
        display: flex; align-items: center; gap: .5rem;
        font-size: .7rem; text-transform: uppercase; letter-spacing: .09em;
        font-style: italic; padding-bottom: .85rem; border-bottom: 1px solid var(--border);
        transition: color .3s, border-color .3s;
      }
      .pd-card-icon { opacity: .8; }

      /* ── chart ── */
      .pd-chart-wrap { height: 200px; width: 100%; }
      .pd-chart-empty { font-size: .75rem; font-style: italic; transition: color .3s; }
      .pd-tooltip { border-radius: 8px; padding: .45rem .7rem; display: flex; flex-direction: column; gap: .15rem; }
      .pd-tooltip-date { font-size: .68rem; }
      .pd-tooltip-val  { font-size: .82rem; font-weight: 700; }

      /* ── upcoming ── */
      .pd-upcoming-list { display: flex; flex-direction: column; gap: .45rem; }
      .pd-upcoming-row {
        display: flex; align-items: center; gap: .75rem;
        border: 1px solid var(--border); border-radius: 10px; padding: .65rem .85rem;
        animation: fadeUp .35s ease both; animation-delay: var(--delay, 0ms);
        transition: border-color .15s, background .3s;
      }
      .pd-upcoming-num {
        width: 30px; height: 30px; flex-shrink: 0;
        border-radius: 8px; display: flex; align-items: center; justify-content: center;
        font-size: .68rem; font-weight: 700; color: #fff;
        transition: background .3s;
      }
      .pd-upcoming-info { flex: 1; min-width: 0; }
      .pd-upcoming-title { display: block; font-size: .83rem; font-weight: 700; transition: color .3s; }
      .pd-upcoming-meta  { display: block; font-size: .68rem; transition: color .3s; }
      .pd-upcoming-date  { text-align: right; flex-shrink: 0; }
      .pd-upcoming-date span:first-child { display: block; font-size: .8rem; font-weight: 700; transition: color .3s; }
      .pd-upcoming-date-sub { font-size: .62rem; transition: color .3s; }
      .pd-empty-txt { font-size: .82rem; font-style: italic; transition: color .3s; }

      /* ── detail list ── */
      .pd-skeleton-list { display: flex; flex-direction: column; gap: .4rem; }
      .pd-skeleton-row  { height: 52px; border-radius: 10px; animation: pulse 1.4s ease infinite; transition: background .3s; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

      .pd-detail-list { display: flex; flex-direction: column; gap: .35rem; }
      .pd-detail-row {
        display: flex; align-items: center; gap: 0;
        border: 1px solid var(--border); border-radius: 10px; overflow: hidden;
        transition: border-color .13s, transform .13s, background .3s;
        animation: fadeUp .3s ease both; animation-delay: var(--delay, 0ms);
      }
      .pd-detail-row:hover { transform: translateX(2px); }
      .pd-detail-bar  { width: 3px; flex-shrink: 0; align-self: stretch; background: var(--status-clr, var(--muted)); }
      .pd-detail-num  { width: 36px; flex-shrink: 0; text-align: center; font-size: .7rem; font-weight: 700; padding: 0 .25rem; transition: color .3s; }
      .pd-detail-body { flex: 1; min-width: 0; padding: .6rem .5rem; display: flex; flex-direction: column; gap: .15rem; }
      .pd-detail-title { font-size: .82rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .3s; }
      .pd-detail-meta  { font-size: .65rem; transition: color .3s; }
      .pd-detail-right { padding: .6rem .75rem; display: flex; flex-direction: column; align-items: flex-end; gap: .2rem; flex-shrink: 0; }
      .pd-detail-status {
        display: inline-flex; align-items: center; gap: .28rem;
        font-size: .68rem; color: var(--clr);
        background: color-mix(in srgb, var(--clr) 12%, transparent);
        border-radius: 20px; padding: 1px 7px;
      }
      .pd-detail-dot  { width: 5px; height: 5px; border-radius: 50%; background: var(--clr); flex-shrink: 0; }
      .pd-detail-date { display: flex; align-items: center; gap: .25rem; font-size: .62rem; transition: color .3s; }

      @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

      ${dark}
      ${light}
    `}</style>
  );
}