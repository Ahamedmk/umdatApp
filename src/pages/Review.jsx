// /src/pages/Review.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { setHadithDueBadge } from "@/lib/appBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff, Trophy, Sparkles, Brain } from "lucide-react";

import { saveReviewResult } from "../lib/hadithProgress";
import { supabase } from "../lib/supabase";
import { ALL_HADITHS } from "../data/allHadiths";
import { useTheme } from "@/hooks/useTheme";

function toLocalISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const QUALITY_LABELS = [
  { value: 0, label: "Trou noir",       desc: "Je ne me souviens pas du tout", delay: "demain"  },
  { value: 1, label: "Très difficile",  desc: "Très difficile à rappeler",      delay: "demain"  },
  { value: 2, label: "Après regard",    desc: "Je dois regarder pour continuer",delay: "demain"  },
  { value: 3, label: "Hésitations",     desc: "Ça revient mais avec effort",    delay: "2 jours" },
  { value: 4, label: "Fluide",          desc: "Récitation fluide",              delay: "3 jours" },
  { value: 5, label: "Parfait",         desc: "Instantané et sûr",              delay: "4 jours" },
];

export function Review() {
  const { user } = useAuth();

  const [showFullArabic, setShowFullArabic] = useState(false);
  const [hadiths, setHadiths]               = useState([]);
  const [progressByNumber, setProgressByNumber] = useState({});
  const [idx, setIdx]         = useState(0);
  const [showFr, setShowFr]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0, perfect: 0, good: 0, medium: 0, needs_work: 0,
  });

  const answeredInSessionRef = useRef(new Set());
  const { isDark } = useTheme();

  async function loadDue(userId) {
    if (!userId) {
      setHadiths([]); setHadithDueBadge(0); setProgressByNumber({});
      setIdx(0); setShowFr(false); setShowFullArabic(false);
      setSessionStats({ total: 0, perfect: 0, good: 0, medium: 0, needs_work: 0 });
      return;
    }
    setLoading(true);
    try {
      const today = toLocalISODate();
      const { data: progress, error: progError } = await supabase
        .from("user_hadith_progress")
        .select("hadith_number, ease_factor, interval_days, repetitions, next_review_date, last_result, status, mastery_wins")
        .eq("user_id", userId).lte("next_review_date", today);
      if (progError) throw progError;
      if (!progress?.length) {
        setHadiths([]); setHadithDueBadge(0); setProgressByNumber({});
        setIdx(0); setShowFr(false); setShowFullArabic(false); return;
      }
      const progMap = {};
      const dueNumbers = progress.map(p => { progMap[p.hadith_number] = p; return p.hadith_number; });
      const { data: hadithData, error: hadithError } = await supabase
        .from("hadiths").select("number, arabic_text, french_text, source")
        .in("number", dueNumbers).order("number", { ascending: true });
      if (hadithError) throw hadithError;
      const dbMap = new Map((hadithData || []).map(h => [h.number, h]));
      const merged = dueNumbers.map(n => dbMap.get(n) || ALL_HADITHS.find(x => x.number === n)).filter(Boolean);
      const filtered = merged.filter(item => !answeredInSessionRef.current.has(item.number));
      setHadiths(filtered); setHadithDueBadge(filtered.length);
      setProgressByNumber(progMap); setIdx(0); setShowFr(false); setShowFullArabic(false);
    } catch (err) {
      console.error(err);
      setHadiths([]); setHadithDueBadge(0); setProgressByNumber({}); setIdx(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    answeredInSessionRef.current = new Set();
    loadDue(user?.id || null);
  }, [user?.id]);

  const h = useMemo(() => hadiths[idx], [hadiths, idx]);
  const arabicText   = h?.arabic_text || "";
  const visiblePart  = arabicText.slice(0, 35);
  const hiddenPart   = arabicText.slice(35);
  const progressPercent = hadiths.length ? Math.round(((idx + 1) / hadiths.length) * 100) : 0;

  const answer = async (quality) => {
    if (!h || !user || saving) return;
    const num = h.number;
    setSaving(true);
    setSessionStats(prev => ({
      total: prev.total + 1,
      perfect:    prev.perfect    + (quality === 5 ? 1 : 0),
      good:       prev.good       + (quality === 4 ? 1 : 0),
      medium:     prev.medium     + (quality === 3 ? 1 : 0),
      needs_work: prev.needs_work + (quality < 3 ? 1 : 0),
    }));
    answeredInSessionRef.current.add(num);
    setHadiths(prev => {
      const next = prev.filter(item => item.number !== num);
      setIdx(old => next.length === 0 ? 0 : old >= next.length ? next.length - 1 : old);
      setHadithDueBadge(next.length);
      return next;
    });
    setProgressByNumber(prev => { const c = { ...prev }; delete c[num]; return c; });
    setShowFr(false); setShowFullArabic(false);
    try {
      await saveReviewResult(user.id, num, quality);
    } catch (err) {
      console.error(err);
      answeredInSessionRef.current.delete(num);
      await loadDue(user.id);
    } finally {
      setSaving(false);
    }
  };

  const isLoadingInitial = loading && !hadiths.length;
  const noHadiths = !loading && !hadiths.length;
  const themeClass = isDark ? "rv-dark" : "rv-light";

  /* accent colors per theme */
  const accentColor = isDark ? "#4a9fc8" : "#2a7ab0";
  const greenColor  = isDark ? "#4a9f82" : "#2d8c6a";
  const dangerColor = isDark ? "#c95a4a" : "#a83030";

  const statsRow = [
    { label: "Notés",       value: sessionStats.total,      accent: accentColor },
    { label: "Parfait",     value: sessionStats.perfect,    accent: greenColor  },
    { label: "Fluide",      value: sessionStats.good,       accent: isDark ? "#c9a84c" : "#a07d28" },
    { label: "Avec effort", value: sessionStats.medium,     accent: isDark ? "#9f7ae0" : "#7c56c8" },
    { label: "À revoir",    value: sessionStats.needs_work, accent: dangerColor },
  ];

  return (
    <TooltipProvider>
      <ReviewStyles isDark={isDark} />
      <div className={`rv-root ${themeClass}`}>

        {/* ── Topbar ── */}
        {/* ── Header ── */}
        <header className="rv-header">
          <div className="rv-header-left">
            <div className="rv-icon-wrap"><RotateCcw size={17} /></div>
            <div>
              <h1 className="rv-title">Révision espacée</h1>
              <p className="rv-subtitle">Système SM-2 · mémorisation optimale</p>
              {!user && <p className="rv-warn">Non connecté — progression non sauvegardée</p>}
            </div>
          </div>
          {hadiths.length > 0 && (
            <div className="rv-progress-wrap">
              <div className="rv-progress-label">
                <span>{hadiths.length} restant{hadiths.length > 1 ? "s" : ""}</span>
                <span className="rv-progress-pct">{progressPercent}%</span>
              </div>
              <div className="rv-progress-track">
                <div className="rv-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </header>

        {/* ── Session stats ── */}
        <div className="rv-stats">
          {statsRow.map(s => (
            <div key={s.label} className="rv-stat" style={{ "--accent": s.accent }}>
              <span className="rv-stat-value">{s.value}</span>
              <span className="rv-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Loading skeleton ── */}
        {isLoadingInitial && (
          <div className="rv-card rv-skeleton">
            <div className="rv-sk-line rv-sk-line--short" />
            <div className="rv-sk-line" />
            <div className="rv-sk-block" />
          </div>
        )}

        {/* ── Empty state ── */}
        {noHadiths && !isLoadingInitial && (
          <div className="rv-empty">
            <div className="rv-empty-icon"><RotateCcw size={28} /></div>
            <p className="rv-empty-title">Toutes les révisions du jour sont terminées ✅</p>
            <p className="rv-empty-sub">
              Reviens demain in châ Allah, ou apprends un nouveau hadith depuis la page <strong>Apprendre</strong>.
            </p>
          </div>
        )}

        {/* ── Hadith card ── */}
        {h && !isLoadingInitial && (
          <>
            <div className="rv-card rv-hadith-card">
              <div className="rv-card-topline" />

              <div className="rv-hadith-meta">
                <div className="rv-hadith-badges">
                  <span className="rv-badge-num">#{h.number}</span>
                  {h.source && <span className="rv-badge-source">{h.source}</span>}
                </div>
                <Brain size={15} className="rv-brain-icon" />
              </div>

              <div className="rv-hadith-sub">
                <Sparkles size={12} />
                Récite en arabe, puis révèle la traduction pour t'auto-évaluer
              </div>

              <div className="rv-arabic-block">
                <p className="rv-arabic" dir="rtl">
                  <span>{visiblePart}</span>
                  {hiddenPart && (
                    <span className={showFullArabic ? "" : "rv-arabic-blur"}>{" "}{hiddenPart}</span>
                  )}
                </p>
                {hiddenPart && (
                  <button className="rv-reveal-btn" onClick={() => setShowFullArabic(v => !v)}>
                    {showFullArabic ? <><EyeOff size={12} /> Masquer la fin</> : <><Eye size={12} /> Afficher tout</>}
                  </button>
                )}
              </div>

              <div className="rv-translation">
                {!showFr ? (
                  <button className="rv-show-fr-btn" onClick={() => setShowFr(true)}>
                    <Eye size={14} /> Afficher la traduction
                  </button>
                ) : (
                  <div className="rv-fr-wrap">
                    <div className="rv-fr-header">
                      <span>Traduction française</span>
                      <button className="rv-hide-btn" onClick={() => setShowFr(false)}>
                        <EyeOff size={12} /> Masquer
                      </button>
                    </div>
                    <p className="rv-fr-text">{h.french_text}</p>
                  </div>
                )}
              </div>

              <div className="rv-eval">
                <div className="rv-eval-header">
                  <Trophy size={13} />
                  <span>Comment était ta récitation ?</span>
                </div>
                <div className="rv-mobile-legend">
                  {QUALITY_LABELS.map(q => (
                    <span key={q.value}><strong>{q.value}</strong> {q.label}</span>
                  ))}
                </div>
                <div className="rv-quality-grid">
                  {QUALITY_LABELS.map(q => (
                    <Tooltip key={q.value}>
                      <TooltipTrigger asChild>
                        <button
                          className={`rv-quality-btn ${q.value >= 4 ? "rv-quality-btn--good" : ""} ${q.value === 5 ? "rv-quality-btn--perfect" : ""}`}
                          onClick={() => answer(q.value)}
                          disabled={saving}
                        >
                          <span className="rv-q-num">{q.value}</span>
                          <span className="rv-q-label">{q.label}</span>
                          <span className="rv-q-delay">↺ {q.delay}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">{q.desc}</p></TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            {hadiths.length > 1 && (
              <div className="rv-nav">
                <button className="rv-nav-btn" onClick={() => {
                  setIdx(i => hadiths.length ? (i - 1 + hadiths.length) % hadiths.length : 0);
                  setShowFr(false); setShowFullArabic(false);
                }}>
                  <ChevronLeft size={15} /> Précédent
                </button>
                <span className="rv-nav-counter">{idx + 1} / {hadiths.length}</span>
                <button className="rv-nav-btn" onClick={() => {
                  setIdx(i => hadiths.length ? (i + 1) % hadiths.length : 0);
                  setShowFr(false); setShowFullArabic(false);
                }}>
                  Suivant <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </TooltipProvider>
  );
}

function ReviewStyles({ isDark }) {
  const dark = `
    .rv-dark {
      --bg:       #0d1117;
      --surface:  #161c24;
      --surface2: #1e2630;
      --border:   rgba(255,255,255,.07);
      --border2:  rgba(255,255,255,.13);
      --fg:       #e8e0d0;
      --muted:    #7a8694;
      --gold:     #c9a84c;
      --gold-dim: rgba(201,168,76,.13);
      --accent:   #4a9fc8;
      --green:    #4a9f82;
      --danger:   #c95a4a;
    }
    .rv-dark .rv-theme-toggle { background: rgba(255,255,255,.07); color: #c9a84c; border-color: rgba(201,168,76,.2); }
    .rv-dark .rv-theme-toggle:hover { background: rgba(201,168,76,.12); }
    .rv-dark .rv-icon-wrap { background: linear-gradient(135deg, #4a9fc8, #2d6ca8); box-shadow: 0 2px 10px rgba(74,159,200,.3); }
    .rv-dark .rv-progress-fill { background: linear-gradient(90deg, #4a9fc8, #2d6ca8); }
    .rv-dark .rv-progress-pct  { color: #4a9fc8; }
    .rv-dark .rv-stat  { background: #161c24; border-color: rgba(255,255,255,.07); border-top-color: var(--accent); }
    .rv-dark .rv-card  { background: #161c24; border-color: rgba(255,255,255,.07); }
    .rv-dark .rv-card-topline { background: linear-gradient(90deg, #4a9fc8, transparent); }
    .rv-dark .rv-badge-num { background: rgba(201,168,76,.13); color: #c9a84c; border-color: rgba(201,168,76,.25); }
    .rv-dark .rv-badge-source { color: #7a8694; background: #1e2630; border-color: rgba(255,255,255,.13); }
    .rv-dark .rv-brain-icon { color: #4a9fc8; }
    .rv-dark .rv-arabic-block { background: linear-gradient(135deg, #1e2630 0%, rgba(74,159,200,.06) 100%); border-color: rgba(255,255,255,.13); }
    .rv-dark .rv-reveal-btn { background: #161c24; border-color: rgba(255,255,255,.13); color: #7a8694; }
    .rv-dark .rv-reveal-btn:hover { border-color: #c9a84c; color: #c9a84c; }
    .rv-dark .rv-show-fr-btn { background: linear-gradient(135deg, #4a9fc8, #2d6ca8); }
    .rv-dark .rv-fr-text { background: #1e2630; border-left-color: #4a9fc8; }
    .rv-dark .rv-eval-header { color: #c9a84c; }
    .rv-dark .rv-mobile-legend { background: #1e2630; border-color: rgba(255,255,255,.07); }
    .rv-dark .rv-quality-btn { background: #1e2630; border-color: rgba(255,255,255,.13); }
    .rv-dark .rv-quality-btn--good    { background: rgba(74,159,130,.1);  border-color: rgba(74,159,130,.3); }
    .rv-dark .rv-quality-btn--perfect { background: rgba(74,159,130,.18); border-color: rgba(74,159,130,.45); }
    .rv-dark .rv-quality-btn--good:hover    { border-color: #4a9f82; }
    .rv-dark .rv-quality-btn--perfect:hover { border-color: #6fcfaa; }
    .rv-dark .rv-quality-btn--good    .rv-q-num,
    .rv-dark .rv-quality-btn--perfect .rv-q-num { color: #4a9f82; }
    .rv-dark .rv-q-delay { color: #4a9fc8; }
    .rv-dark .rv-empty { background: #161c24; border-color: rgba(255,255,255,.13); }
    .rv-dark .rv-empty-icon { color: #7a8694; }
    .rv-dark .rv-empty-title { color: #e8e0d0; }
    .rv-dark .rv-nav { border-top-color: rgba(255,255,255,.07); }
    .rv-dark .rv-nav-btn { background: #161c24; border-color: rgba(255,255,255,.13); color: #e8e0d0; }
    .rv-dark .rv-nav-btn:hover { border-color: #c9a84c; color: #c9a84c; }
    .rv-dark .rv-sk-line, .rv-dark .rv-sk-block { background: #1e2630; }
    .rv-dark .rv-header { border-bottom-color: rgba(255,255,255,.13); }
  `;

  const light = `
    .rv-light {
      --bg:       #fdf8f0;
      --surface:  #ffffff;
      --surface2: #fef6e4;
      --border:   rgba(160,125,40,.13);
      --border2:  rgba(160,125,40,.25);
      --fg:       #2c2416;
      --muted:    #7a6d58;
      --gold:     #a07d28;
      --gold-dim: rgba(160,125,40,.1);
      --accent:   #2a7ab0;
      --green:    #2d8c6a;
      --danger:   #a83030;
    }
    .rv-light .rv-theme-toggle { background: rgba(160,125,40,.08); color: #7c56c8; border-color: rgba(124,86,200,.2); }
    .rv-light .rv-theme-toggle:hover { background: rgba(124,86,200,.1); }
    .rv-light .rv-icon-wrap { background: linear-gradient(135deg, #2a7ab0, #1a5a8a); box-shadow: 0 2px 10px rgba(42,122,176,.25); }
    .rv-light .rv-title    { color: #1e1810; }
    .rv-light .rv-subtitle { color: #7a6d58; }
    .rv-light .rv-progress-fill { background: linear-gradient(90deg, #2a7ab0, #1a5a8a); }
    .rv-light .rv-progress-pct  { color: #2a7ab0; }
    .rv-light .rv-progress-track { background: #fef6e4; }
    .rv-light .rv-stat { background: #ffffff; border-color: rgba(160,125,40,.13); border-top-color: var(--accent); box-shadow: 0 1px 4px rgba(160,125,40,.06); }
    .rv-light .rv-stat-label { color: #7a6d58; }
    .rv-light .rv-card { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 2px 12px rgba(160,125,40,.07); }
    .rv-light .rv-card-topline { background: linear-gradient(90deg, #2a7ab0, transparent); }
    .rv-light .rv-badge-num { background: rgba(160,125,40,.1); color: #a07d28; border-color: rgba(160,125,40,.25); }
    .rv-light .rv-badge-source { color: #7a6d58; background: #fef6e4; border-color: rgba(160,125,40,.2); }
    .rv-light .rv-brain-icon { color: #2a7ab0; }
    .rv-light .rv-hadith-sub { color: #7a6d58; }
    .rv-light .rv-arabic { color: #1e1810; }
    .rv-light .rv-arabic-block { background: linear-gradient(135deg, #fef6e4 0%, rgba(42,122,176,.05) 100%); border-color: rgba(160,125,40,.2); }
    .rv-light .rv-reveal-btn { background: #ffffff; border-color: rgba(160,125,40,.22); color: #7a6d58; }
    .rv-light .rv-reveal-btn:hover { border-color: #a07d28; color: #a07d28; }
    .rv-light .rv-show-fr-btn { background: linear-gradient(135deg, #2a7ab0, #1a5a8a); }
    .rv-light .rv-fr-header { color: #7a6d58; }
    .rv-light .rv-hide-btn { color: #7a6d58; }
    .rv-light .rv-hide-btn:hover { color: #1e1810; }
    .rv-light .rv-fr-text { background: #fef6e4; border-left-color: #2a7ab0; color: #1e1810; }
    .rv-light .rv-eval-header { color: #a07d28; }
    .rv-light .rv-mobile-legend { background: #fef6e4; border-color: rgba(160,125,40,.15); color: #7a6d58; }
    .rv-light .rv-mobile-legend strong { color: #1e1810; }
    .rv-light .rv-quality-btn { background: #fef6e4; border-color: rgba(160,125,40,.2); }
    .rv-light .rv-quality-btn:hover { border-color: #7a6d58; }
    .rv-light .rv-q-num   { color: #1e1810; }
    .rv-light .rv-q-label { color: #7a6d58; }
    .rv-light .rv-q-delay { color: #2a7ab0; }
    .rv-light .rv-quality-btn--good    { background: rgba(45,140,106,.08);  border-color: rgba(45,140,106,.25); }
    .rv-light .rv-quality-btn--perfect { background: rgba(45,140,106,.14); border-color: rgba(45,140,106,.4); }
    .rv-light .rv-quality-btn--good:hover    { border-color: #2d8c6a; }
    .rv-light .rv-quality-btn--perfect:hover { border-color: #3ab880; }
    .rv-light .rv-quality-btn--good    .rv-q-num,
    .rv-light .rv-quality-btn--perfect .rv-q-num { color: #2d8c6a; }
    .rv-light .rv-empty { background: #ffffff; border-color: rgba(160,125,40,.2); }
    .rv-light .rv-empty-icon  { color: #7a6d58; }
    .rv-light .rv-empty-title { color: #1e1810; }
    .rv-light .rv-empty-sub   { color: #7a6d58; }
    .rv-light .rv-nav { border-top-color: rgba(160,125,40,.13); }
    .rv-light .rv-nav-btn { background: #ffffff; border-color: rgba(160,125,40,.22); color: #2c2416; box-shadow: 0 1px 4px rgba(160,125,40,.06); }
    .rv-light .rv-nav-btn:hover { border-color: #a07d28; color: #a07d28; }
    .rv-light .rv-nav-counter { color: #7a6d58; }
    .rv-light .rv-sk-line, .rv-light .rv-sk-block { background: #fef6e4; }
    .rv-light .rv-header { border-bottom-color: rgba(160,125,40,.15); }
  `;

  return (
    <style>{`
      .rv-root {
        --serif: Georgia, 'Times New Roman', serif;
        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 760px;
        margin: 0 auto;
        padding: 1.2rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
        transition: background .3s ease, color .3s ease;
      }

      /* ── topbar ── */
      .rv-topbar { display: flex; justify-content: flex-end; }
      .rv-theme-toggle {
        display: flex; align-items: center; gap: .45rem;
        border: 1px solid transparent; border-radius: 20px;
        padding: .38rem .85rem;
        font-size: .78rem; font-family: var(--serif); font-weight: 600;
        cursor: pointer; transition: background .2s, color .2s, transform .15s;
        letter-spacing: .02em;
      }
      .rv-theme-toggle:hover { transform: translateY(-1px); }

      /* ── header ── */
      .rv-header {
        display: flex; flex-direction: column; gap: .9rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both;
        transition: border-color .3s;
      }
      .rv-header-left { display: flex; align-items: flex-start; gap: .85rem; }
      .rv-icon-wrap {
        width: 40px; height: 40px; flex-shrink: 0;
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; transition: background .3s, box-shadow .3s;
      }
      .rv-title    { font-size: 1.5rem; font-weight: 700; margin: 0 0 .2rem; transition: color .3s; }
      .rv-subtitle { font-size: .78rem; font-style: italic; margin: 0; color: var(--muted); transition: color .3s; }
      .rv-warn     { font-size: .73rem; color: var(--danger); margin-top: .3rem; }

      .rv-progress-wrap { display: flex; flex-direction: column; gap: .35rem; }
      .rv-progress-label { display: flex; justify-content: space-between; font-size: .72rem; color: var(--muted); }
      .rv-progress-pct   { font-weight: 700; transition: color .3s; }
      .rv-progress-track { height: 5px; background: var(--surface2); border-radius: 99px; overflow: hidden; transition: background .3s; }
      .rv-progress-fill  { height: 100%; border-radius: 99px; transition: width .4s ease, background .3s; }

      /* ── stats ── */
      .rv-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: .7rem; }
      @media (max-width: 700px) { .rv-stats { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 400px) { .rv-stats { grid-template-columns: repeat(2, 1fr); } }
      .rv-stat {
        border: 1px solid var(--border);
        border-top-width: 2px;
        border-radius: 12px; padding: .75rem .5rem; text-align: center;
        transition: border-color .15s, background .3s;
        animation: fadeUp .4s ease both;
      }
      .rv-stat-value { display: block; font-size: 1.6rem; font-weight: 700; color: var(--accent); line-height: 1; }
      .rv-stat-label { display: block; font-size: .65rem; margin-top: .25rem; letter-spacing: .04em; transition: color .3s; }

      /* ── skeleton ── */
      .rv-skeleton { gap: .9rem !important; animation: pulse 1.4s ease infinite; }
      .rv-sk-line  { height: 18px; border-radius: 6px; transition: background .3s; }
      .rv-sk-line--short { width: 40%; }
      .rv-sk-block { height: 140px; border-radius: 10px; transition: background .3s; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

      /* ── empty ── */
      .rv-empty {
        border: 2px dashed var(--border2); border-radius: 16px; padding: 2.5rem 1.5rem;
        text-align: center; display: flex; flex-direction: column; align-items: center; gap: .75rem;
        transition: background .3s, border-color .3s;
      }
      .rv-empty-icon  { opacity: .5; transition: color .3s; }
      .rv-empty-title { font-size: .95rem; font-weight: 700; margin: 0; transition: color .3s; }
      .rv-empty-sub   { font-size: .82rem; font-style: italic; margin: 0; line-height: 1.6; color: var(--muted); }

      /* ── card ── */
      .rv-card {
        border: 1px solid var(--border); border-radius: 16px; padding: 1.35rem;
        display: flex; flex-direction: column; gap: 1.1rem;
        animation: fadeUp .4s ease both; position: relative; overflow: hidden;
        transition: background .3s, border-color .3s, box-shadow .3s;
      }
      .rv-card-topline {
        position: absolute; top: 0; left: 0; right: 0; height: 2px;
        border-radius: 16px 16px 0 0; transition: background .3s;
      }

      .rv-hadith-meta { display: flex; justify-content: space-between; align-items: center; }
      .rv-hadith-badges { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
      .rv-badge-num {
        border: 1px solid transparent; border-radius: 20px; padding: 2px 9px;
        font-size: .72rem; font-weight: 700; transition: background .3s, color .3s;
      }
      .rv-badge-source {
        font-size: .68px; border: 1px solid transparent; border-radius: 20px; padding: 2px 8px;
        max-width: 40vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font-size: .68rem; transition: background .3s, color .3s;
      }
      .rv-brain-icon { opacity: .6; transition: color .3s; }
      .rv-hadith-sub { display: flex; align-items: center; gap: .4rem; font-size: .72rem; font-style: italic; color: var(--muted); }

      .rv-arabic-block {
        border: 1px solid var(--border2); border-radius: 12px; padding: 1.5rem 1.25rem;
        text-align: center; display: flex; flex-direction: column; align-items: center; gap: .8rem;
        transition: background .3s, border-color .3s;
      }
      .rv-arabic {
        font-size: clamp(1.3rem, 3.5vw, 2rem); line-height: 2.3; margin: 0;
        font-family: 'Amiri', 'Scheherazade New', var(--serif);
        transition: color .3s;
      }
      .rv-arabic-blur { filter: blur(6px); user-select: none; display: inline; }
      .rv-reveal-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        border: 1px solid transparent; border-radius: 99px; padding: .3rem .85rem;
        font-size: .73rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s, background .3s;
      }

      .rv-show-fr-btn {
        display: flex; align-items: center; justify-content: center; gap: .5rem;
        width: 100%; color: #fff; border: none; border-radius: 11px;
        padding: .75rem; font-size: .88rem; font-weight: 700;
        font-family: var(--serif); cursor: pointer;
        transition: opacity .15s, transform .15s, background .3s;
      }
      .rv-show-fr-btn:hover { opacity: .88; transform: translateY(-1px); }
      .rv-fr-wrap { display: flex; flex-direction: column; gap: .6rem; }
      .rv-fr-header {
        display: flex; justify-content: space-between; align-items: center;
        font-size: .72rem; text-transform: uppercase; letter-spacing: .07em;
        transition: color .3s;
      }
      .rv-hide-btn {
        display: inline-flex; align-items: center; gap: .3rem;
        background: transparent; border: none;
        font-size: .72rem; font-family: var(--serif); cursor: pointer;
        transition: color .15s;
      }
      .rv-fr-text {
        border-left: 3px solid transparent; border-radius: 0 10px 10px 0;
        padding: .9rem 1.1rem; font-size: .88rem; line-height: 1.75;
        font-style: italic; margin: 0; transition: background .3s, border-color .3s, color .3s;
      }

      .rv-eval { display: flex; flex-direction: column; gap: .75rem; }
      .rv-eval-header {
        display: flex; align-items: center; gap: .45rem;
        font-size: .75rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: .07em; transition: color .3s;
      }
      .rv-mobile-legend {
        display: none; flex-direction: column; gap: .2rem;
        border: 1px solid var(--border); border-radius: 9px;
        padding: .65rem .8rem; font-size: .72rem; transition: background .3s, border-color .3s;
      }
      @media (max-width: 480px) { .rv-mobile-legend { display: flex; } }

      .rv-quality-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .55rem; }
      @media (max-width: 380px) { .rv-quality-grid { grid-template-columns: repeat(2, 1fr); } }

      .rv-quality-btn {
        border: 1px solid transparent; border-radius: 12px; padding: .8rem .4rem;
        display: flex; flex-direction: column; align-items: center; gap: .25rem;
        cursor: pointer; font-family: var(--serif);
        transition: border-color .15s, transform .15s, background .3s;
      }
      .rv-quality-btn:hover { transform: translateY(-2px); }
      .rv-quality-btn:disabled { opacity: .45; pointer-events: none; }
      .rv-q-num   { font-size: 1.4rem; font-weight: 700; line-height: 1; transition: color .3s; }
      .rv-q-label { font-size: .68rem; text-align: center; line-height: 1.3; transition: color .3s; }
      .rv-q-delay { font-size: .62rem; transition: color .3s; }

      .rv-nav {
        display: flex; align-items: center; justify-content: space-between; gap: .75rem;
        border-top: 1px solid var(--border); padding-top: .75rem; transition: border-color .3s;
      }
      .rv-nav-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        border: 1px solid transparent; border-radius: 10px; padding: .5rem 1rem;
        font-size: .82rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s, transform .15s, background .3s;
      }
      .rv-nav-btn:hover { transform: translateY(-1px); }
      .rv-nav-counter { font-size: .78rem; font-style: italic; color: var(--muted); }

      @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

      ${dark}
      ${light}
    `}</style>
  );
}

export default Review;
