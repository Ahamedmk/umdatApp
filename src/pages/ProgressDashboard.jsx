// /src/pages/ProgressDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  BarChart3, Flame, CheckCircle2, Clock,
  CalendarDays, AlertTriangle, Sparkles,
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

  if (nextReviewDate && nextReviewDate <= todayStr) {
    return "review";
  }

  if (raw === "learned") return "scheduled";
  if (raw === "learning") return "learning";

  return "not_started";
}

/* ─── custom bar tooltip ─── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="pd-tooltip">
      <span className="pd-tooltip-date">{formatDate(d.date)}</span>
      <span className="pd-tooltip-val">{d.count} révision{d.count > 1 ? "s" : ""}</span>
    </div>
  );
}

/* ══════════════════════════════════════════ */
export default function ProgressDashboard() {
  const { user } = useAuth();

  const [loading, setLoading]         = useState(true);
  const [progressRows, setProgressRows] = useState([]);
  const [reviewDates, setReviewDates]   = useState([]);

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

  const hadithsWithProgress = useMemo(() => {
  return ALL_HADITHS.map(h => {
    const p = progressRows.find(x => x.hadith_number === h.number);

    return {
      ...h,
      progressStatus: p?.status || "not_started",
      next_review_date: p?.next_review_date,
      repetitions: p?.repetitions || 0,
      last_result: p?.last_result,
    };
  });
}, [progressRows]);

 const memorizedCount = useMemo(() =>
  hadithsWithProgress.filter(h => h.progressStatus === "mastered").length
, [hadithsWithProgress]);

const learningCount = useMemo(() =>
  hadithsWithProgress.filter(h =>
    h.progressStatus === "learning" || h.progressStatus === "scheduled"
  ).length
, [hadithsWithProgress]);

const newCount = useMemo(() =>
  hadithsWithProgress.filter(h =>
    !h.progressStatus || h.progressStatus === "not_started"
  ).length
, [hadithsWithProgress]);
  const dueTodayOrLate = useMemo(() => progressRows.filter(p => p.next_review_date && p.next_review_date <= todayStr).length, [progressRows, todayStr]);
  const streak         = useMemo(() => computeStreak(reviewDates), [reviewDates]);
  const memorizedPct   = totalHadiths ? Math.round((memorizedCount / totalHadiths) * 100) : 0;

  /* chart data — 14 days */
  const chartData = useMemo(() => {
    const counts = {};
    reviewDates.forEach(ts => {
      const k = new Date(ts).toISOString().slice(0, 10);
      counts[k] = (counts[k] || 0) + 1;
    });
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString("fr-FR", { day: "2-digit" }),
        count: counts[key] || 0,
      });
    }
    return days;
  }, [reviewDates]);

  /* upcoming reviews */
  const upcomingReviews = useMemo(() => (
    [...progressRows]
      .filter(p => p.next_review_date && p.next_review_date >= todayStr)
      .sort((a, b) => a.next_review_date < b.next_review_date ? -1 : 1)
      .slice(0, 5)
  ), [progressRows, todayStr]);

  /* ── not logged in ── */
  if (!user) return (
    <>
      <PdStyles />
      <div className="pd-root pd-center">
        <div className="pd-login-card">
          <BarChart3 size={28} className="pd-login-icon" />
          <p className="pd-login-title">Connecte-toi pour voir ta progression</p>
          <p className="pd-login-sub">Tes statistiques se calculent automatiquement à partir de tes révisions.</p>
        </div>
      </div>
    </>
  );

  /* ── status helpers ── */
  const STATUS_META = {
  mastered:    { label: "Maîtrisé",      color: "#4a9f82" },
  learning:    { label: "En cours",      color: "#4a9fc8" },
  scheduled:   { label: "En cours",      color: "#4a9fc8" },
  review:      { label: "À réviser",     color: "#e08a3c" },
  not_started: { label: "Non commencé",  color: "#7a8694" },
};

  return (
    <>
      <PdStyles />
      <div className="pd-root">

        {/* ── Header ── */}
        <header className="pd-header">
          <div className="pd-header-left">
            <div className="pd-icon-wrap"><BarChart3 size={17} /></div>
            <div>
              <h1 className="pd-title">Tableau de progression</h1>
              <p className="pd-subtitle">
                Mémorisation de {totalHadiths} hadiths · SM-2
              </p>
            </div>
          </div>
          <span className="pd-global-badge">
            {memorizedCount}/{totalHadiths} maîtrisés
          </span>
        </header>

        {/* ── Stats ── */}
        <div className="pd-stats">
          {[
            { icon: CheckCircle2, label: "Maîtrisés",  value: memorizedCount, sub: `${memorizedPct}% des ${totalHadiths}`, accent: "#4a9f82" },
            { icon: Sparkles,     label: "En cours",   value: learningCount,  sub: "Activement révisés",                    accent: "#4a9fc8" },
            { icon: Sparkles,     label: "Nouveaux",   value: newCount,       sub: "Jamais étudiés",                        accent: "#7a8694" },
            { icon: Clock,        label: "À réviser",  value: dueTodayOrLate, sub: "Aujourd'hui ou en retard",              accent: "#e08a3c" },
            { icon: Flame,        label: "Streak",     value: streak,         sub: "Jours de révision",                     accent: "#c95a4a" },
          ].map(s => {
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,.06)" />
                <XAxis dataKey="label" tick={{ fill: "#7a8694", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#7a8694", fontSize: 10 }} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,.04)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.count > 0 ? "#4a9fc8" : "rgba(255,255,255,.06)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {reviewDates.length === 0 && (
            <p className="pd-chart-empty">
              Aucune révision enregistrée. Lance ta première session pour alimenter ce graphique.
            </p>
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
                    <span className="pd-upcoming-meta">
                      Intervalle {p.interval_days}j · {p.repetitions} rép.
                    </span>
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

        {/* ── Detailed hadith list ── */}
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
                  <div
                    key={h.number}
                    className="pd-detail-row"
                    style={{ "--delay": `${i * 25}ms`, "--status-clr": meta.color }}
                  >
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
                        <span className="pd-detail-dot" />
                        {meta.label}
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

/* ═══════════════════════════════════════ */
function PdStyles() {
  return (
    <style>{`
      .pd-root {
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
        max-width: 800px;
        margin: 0 auto;
        padding: 1.5rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
      }
      .pd-center { justify-content: center; align-items: center; }

      /* ── login card ── */
      .pd-login-card {
        background: var(--surface); border: 1px solid var(--border2);
        border-radius: 16px; padding: 2.5rem;
        display: flex; flex-direction: column; align-items: center;
        gap: .75rem; text-align: center; max-width: 360px; width: 100%;
      }
      .pd-login-icon { color: var(--muted); }
      .pd-login-title { font-size: 1rem; font-weight: 700; color: var(--fg); margin: 0; }
      .pd-login-sub   { font-size: .8rem; color: var(--muted); font-style: italic; margin: 0; line-height: 1.55; }

      /* ── header ── */
      .pd-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; flex-wrap: wrap;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both;
      }
      .pd-header-left { display: flex; align-items: center; gap: .85rem; }
      .pd-icon-wrap {
        width: 40px; height: 40px; flex-shrink: 0;
        background: linear-gradient(135deg, #6a5acd, #4a3aad);
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        color: #fff;
        box-shadow: 0 2px 10px rgba(106,90,205,.3);
      }
      .pd-title    { font-size: 1.5rem; font-weight: 700; margin: 0 0 .15rem; color: var(--fg); }
      .pd-subtitle { font-size: .78rem; color: var(--muted); font-style: italic; margin: 0; }
      .pd-global-badge {
        background: var(--gold-dim); color: var(--gold);
        border: 1px solid rgba(201,168,76,.3);
        border-radius: 20px; padding: .28rem .85rem;
        font-size: .75rem; font-weight: 700;
        white-space: nowrap;
      }

      /* ── stats ── */
      .pd-stats {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: .7rem;
      }
      @media (max-width: 520px) { .pd-stats { grid-template-columns: repeat(2, 1fr); } }
      .pd-stat {
        background: var(--surface);
        border: 1px solid var(--border);
        border-top: 2px solid var(--accent);
        border-radius: 13px; padding: .85rem .6rem;
        display: flex; flex-direction: column; align-items: center; gap: .18rem;
        text-align: center;
        transition: border-color .15s;
        animation: fadeUp .4s ease both;
      }
      .pd-stat:hover { border-color: var(--accent); }
      .pd-stat-icon { color: var(--accent); margin-bottom: .1rem; }
      .pd-stat-value { font-size: 1.55rem; font-weight: 700; color: var(--accent); line-height: 1; }
      .pd-stat-label { font-size: .68rem; color: var(--fg); font-weight: 600; }
      .pd-stat-sub   { font-size: .62rem; color: var(--muted); line-height: 1.3; text-align: center; }

      /* ── card ── */
      .pd-card {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 16px; padding: 1.3rem;
        display: flex; flex-direction: column; gap: 1rem;
        animation: fadeUp .45s ease both;
      }
      .pd-card-header {
        display: flex; align-items: center; gap: .5rem;
        font-size: .7rem; text-transform: uppercase; letter-spacing: .09em;
        color: var(--gold); font-style: italic;
        padding-bottom: .85rem; border-bottom: 1px solid var(--border);
      }
      .pd-card-icon { opacity: .8; }

      /* ── chart ── */
      .pd-chart-wrap { height: 200px; width: 100%; }
      .pd-chart-empty { font-size: .75rem; color: var(--muted); font-style: italic; }
      .pd-tooltip {
        background: var(--surface2);
        border: 1px solid var(--border2);
        border-radius: 8px; padding: .45rem .7rem;
        display: flex; flex-direction: column; gap: .15rem;
      }
      .pd-tooltip-date { font-size: .68rem; color: var(--muted); }
      .pd-tooltip-val  { font-size: .82rem; font-weight: 700; color: var(--fg); }

      /* ── upcoming ── */
      .pd-upcoming-list { display: flex; flex-direction: column; gap: .45rem; }
      .pd-upcoming-row {
        display: flex; align-items: center; gap: .75rem;
        background: var(--surface2); border: 1px solid var(--border);
        border-radius: 10px; padding: .65rem .85rem;
        animation: fadeUp .35s ease both;
        animation-delay: var(--delay, 0ms);
        transition: border-color .15s;
      }
      .pd-upcoming-row:hover { border-color: var(--border2); }
      .pd-upcoming-num {
        width: 30px; height: 30px; flex-shrink: 0;
        background: linear-gradient(135deg, #4a9fc8, #2d6ca8);
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-size: .68rem; font-weight: 700; color: #fff;
      }
      .pd-upcoming-info { flex: 1; min-width: 0; }
      .pd-upcoming-title { display: block; font-size: .83rem; font-weight: 700; color: var(--fg); }
      .pd-upcoming-meta  { display: block; font-size: .68rem; color: var(--muted); }
      .pd-upcoming-date  { text-align: right; flex-shrink: 0; }
      .pd-upcoming-date span:first-child { display: block; font-size: .8rem; font-weight: 700; color: var(--fg); }
      .pd-upcoming-date-sub { font-size: .62rem; color: var(--muted); }
      .pd-empty-txt { font-size: .82rem; color: var(--muted); font-style: italic; }

      /* ── detail list ── */
      .pd-skeleton-list { display: flex; flex-direction: column; gap: .4rem; }
      .pd-skeleton-row {
        height: 52px; background: var(--surface2); border-radius: 10px;
        animation: pulse 1.4s ease infinite;
      }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

      .pd-detail-list { display: flex; flex-direction: column; gap: .35rem; }
      .pd-detail-row {
        display: flex; align-items: center; gap: 0;
        background: var(--surface2); border: 1px solid var(--border);
        border-radius: 10px; overflow: hidden;
        transition: border-color .13s, transform .13s;
        animation: fadeUp .3s ease both;
        animation-delay: var(--delay, 0ms);
      }
      .pd-detail-row:hover { border-color: var(--border2); transform: translateX(2px); }
      .pd-detail-bar {
        width: 3px; flex-shrink: 0; align-self: stretch;
        background: var(--status-clr, var(--muted));
      }
      .pd-detail-num {
        width: 36px; flex-shrink: 0; text-align: center;
        font-size: .7rem; font-weight: 700; color: var(--muted);
        padding: 0 .25rem;
      }
      .pd-detail-body {
        flex: 1; min-width: 0;
        padding: .6rem .5rem;
        display: flex; flex-direction: column; gap: .15rem;
      }
      .pd-detail-title { font-size: .82rem; font-weight: 700; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pd-detail-meta  { font-size: .65rem; color: var(--muted); }
      .pd-detail-right {
        padding: .6rem .75rem;
        display: flex; flex-direction: column; align-items: flex-end; gap: .2rem;
        flex-shrink: 0;
      }
      .pd-detail-status {
        display: inline-flex; align-items: center; gap: .28rem;
        font-size: .68rem; color: var(--clr);
        background: color-mix(in srgb, var(--clr) 12%, transparent);
        border-radius: 20px; padding: 1px 7px;
      }
      .pd-detail-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: var(--clr); flex-shrink: 0;
      }
      .pd-detail-date {
        display: flex; align-items: center; gap: .25rem;
        font-size: .62rem; color: var(--muted);
      }

      /* ── animations ── */
      @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
  );
}