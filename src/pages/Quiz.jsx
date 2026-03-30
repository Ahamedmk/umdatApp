// src/pages/Quiz.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Brain, CheckCircle2, XCircle, Lightbulb, Moon, Sun,
  Trophy, Target, RotateCcw, Sparkles,
} from "lucide-react";

import { HADITHS_TAHARA } from "@/data/seed_hadiths_tahara";
import { QUIZ_QUESTIONS_1_15 } from "@/data/quiz_questions_1_15";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

/* ══════════════════════════════════════════ */
export function Quiz() {
  const { user } = useAuth();

  const [filterN, setFilterN]           = useState("all");
  const [index, setIndex]               = useState(0);
  const [selected, setSelected]         = useState(null);
  const [score, setScore]               = useState(0);
  const [done, setDone]                 = useState(false);
  const [dark, setDark]                 = useState(false);
  const [showHint, setShowHint]         = useState(false);
  const [showFrenchRef, setShowFrenchRef] = useState(false);
  const [learnedNumbers, setLearnedNumbers] = useState([]);
  const [loadingLearned, setLoadingLearned] = useState(true);

  /* theme */
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  const toggleTheme = v => {
    const checked = typeof v === "boolean" ? v : !dark;
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  /* load learned hadiths */
  useEffect(() => {
    let active = true;
    async function load() {
      setLoadingLearned(true);
      try {
        if (!user) { if (active) setLearnedNumbers([]); return; }
        const { data, error } = await supabase
          .from("user_hadith_progress").select("hadith_number, status")
          .eq("user_id", user.id).eq("status", "learned");
        if (error) throw error;
        const nums = [...new Set((data || []).map(r => r.hadith_number))].sort((a,b)=>a-b);
        if (active) {
          setLearnedNumbers(nums);
          if (nums.length === 0 || (filterN !== "all" && !nums.includes(parseInt(filterN,10)))) {
            setFilterN("all"); setIndex(0);
          }
        }
      } catch(e) { console.error(e); if (active) setLearnedNumbers([]); }
      finally { if (active) setLoadingLearned(false); }
    }
    load();
    return () => { active = false; };
  }, [user?.id]);

  const pool = useMemo(() => {
    if (!learnedNumbers.length) return [];
    let base = QUIZ_QUESTIONS_1_15.filter(q => learnedNumbers.includes(q.n));
    if (filterN !== "all") base = base.filter(q => q.n === parseInt(filterN,10));
    return base;
  }, [learnedNumbers, filterN]);

  const current  = pool[index];
  const answered = index + (done ? 1 : 0);
  const progressPct = pool.length ? Math.round((answered / pool.length) * 100) : 0;
  const accuracy    = answered ? Math.round((score / answered) * 100) : 0;

  const onValidate = () => {
    if (selected == null || !current) return;
    setScore(s => s + (selected === current.correctIndex ? 1 : 0));
    setDone(true);
  };

  const onNext = () => {
    if (!pool.length) return;
    if (index + 1 < pool.length) {
      setIndex(i => i + 1); setSelected(null); setDone(false);
      setShowHint(false); setShowFrenchRef(false);
    } else {
      setIndex(0); setSelected(null); setDone(false); setScore(0);
      setShowHint(false); setShowFrenchRef(false);
    }
  };

  const onRestart = () => {
    setIndex(0); setSelected(null); setDone(false); setScore(0);
    setShowHint(false); setShowFrenchRef(false);
  };

  const handleFilter = v => {
    setFilterN(v); setIndex(0); setSelected(null); setDone(false);
    setScore(0); setShowHint(false); setShowFrenchRef(false);
  };

  useEffect(() => { setShowFrenchRef(false); }, [index, filterN]);

  const isCorrect = i => done && i === current?.correctIndex;
  const isWrong   = i => done && selected === i && i !== current?.correctIndex;

  return (
    <>
      <QuizStyles dark={dark} />
      <div className="qz-root">

        {/* ── Header ── */}
        <header className="qz-header">
          <div className="qz-header-left">
            <div className="qz-icon-wrap"><Brain size={17} /></div>
            <div>
              <h1 className="qz-title">Quiz Interactif</h1>
              <p className="qz-subtitle">Teste tes connaissances sur les hadiths appris</p>
            </div>
          </div>

          <div className="qz-header-right">
            <Select value={filterN} onValueChange={handleFilter}>
              <SelectTrigger className="qz-select-trigger">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent className="qz-select-content">
                <SelectItem value="all">Tous les hadiths appris</SelectItem>
                {learnedNumbers.map(n => (
                  <SelectItem key={n} value={String(n)}>Hadith {n}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="qz-theme-toggle">
              <Sun size={12} />
              <Switch checked={dark} onCheckedChange={toggleTheme} />
              <Moon size={12} />
            </div>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="qz-stats">
          {[
            { icon: Target,   label: "Questions vues",   value: answered,  accent: "#9f7ae0" },
            { icon: Trophy,   label: "Bonnes réponses",  value: score,     accent: "#4a9f82" },
            { icon: Sparkles, label: "Précision",        value: `${isNaN(accuracy) ? 0 : accuracy}%`, accent: "#4a9fc8" },
            { icon: RotateCcw,label: "Dispo",            value: pool.length, accent: "#c9a84c" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="qz-stat" style={{ "--accent": s.accent }}>
                <Icon size={14} className="qz-stat-icon" />
                <span className="qz-stat-value">{s.value}</span>
                <span className="qz-stat-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Progress ── */}
        <div className="qz-progress-wrap">
          <div className="qz-progress-label">
            <span>Progression</span>
            <span className="qz-progress-pct">{progressPct}%</span>
          </div>
          <div className="qz-progress-track">
            <div className="qz-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* ── Empty / loading states ── */}
        {loadingLearned && (
          <div className="qz-state-card qz-state-card--pulse">
            <Brain size={28} className="qz-state-icon" />
            <p>Chargement de tes hadiths appris…</p>
          </div>
        )}

        {!loadingLearned && !user && (
          <div className="qz-state-card">
            <Brain size={28} className="qz-state-icon" />
            <p className="qz-state-title">Connecte-toi pour accéder au quiz.</p>
            <p className="qz-state-sub">Le quiz utilise ta progression personnelle.</p>
          </div>
        )}

        {!loadingLearned && user && learnedNumbers.length === 0 && (
          <div className="qz-state-card qz-state-card--dashed">
            <Brain size={28} className="qz-state-icon" />
            <p className="qz-state-title">Aucun hadith appris pour l'instant.</p>
            <p className="qz-state-sub">
              Va dans <strong>Apprendre</strong>, note un hadith <strong>4 ou 5</strong>, puis reviens ici.
            </p>
          </div>
        )}

        {/* ── Main quiz card ── */}
        {pool.length > 0 && current && (
          <>
            <div className="qz-question-card">
              <div className="qz-question-card-topline" />

              {/* Question meta */}
              <div className="qz-question-meta">
                <span className="qz-badge">Q {index + 1} / {pool.length}</span>
                <span className="qz-badge qz-badge--hadith">Hadith {current.n}</span>
              </div>

              <p className="qz-question-text">{current.q}</p>

              {/* Options */}
              <div className="qz-options">
                {current.options.map((opt, i) => {
                  const ok  = isCorrect(i);
                  const bad = isWrong(i);
                  const sel = !done && selected === i;
                  return (
                    <button
                      key={i}
                      className={`qz-option ${sel ? "qz-option--selected" : ""} ${ok ? "qz-option--correct" : ""} ${bad ? "qz-option--wrong" : ""}`}
                      onClick={() => !done && setSelected(i)}
                      disabled={done}
                    >
                      <div className={`qz-option-radio ${sel ? "qz-option-radio--sel" : ""} ${ok ? "qz-option-radio--ok" : ""} ${bad ? "qz-option-radio--bad" : ""}`}>
                        {ok  && <CheckCircle2 size={12} />}
                        {bad && <XCircle size={12} />}
                        {sel && !done && <div className="qz-option-radio-dot" />}
                      </div>
                      <span className="qz-option-text">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="qz-actions">
                {!done ? (
                  <>
                    <button
                      className="qz-btn-validate"
                      onClick={onValidate}
                      disabled={selected == null}
                    >
                      Valider ma réponse
                    </button>
                    <button
                      className="qz-btn-hint"
                      onClick={() => setShowHint(v => !v)}
                    >
                      <Lightbulb size={13} /> {showHint ? "Masquer l'indice" : "Indice"}
                    </button>
                  </>
                ) : (
                  <button className="qz-btn-next" onClick={onNext}>
                    {index + 1 < pool.length ? "Question suivante →" : "Recommencer le quiz"}
                  </button>
                )}
              </div>

              {/* Hint */}
              {showHint && !done && (
                <div className="qz-hint">
                  <Lightbulb size={14} className="qz-hint-icon" />
                  <span>Relis le hadith {current.n} et son explication pour retrouver la bonne réponse.</span>
                </div>
              )}

              {/* Result feedback */}
              {done && (
                <div className={`qz-feedback ${selected === current.correctIndex ? "qz-feedback--ok" : "qz-feedback--ko"}`}>
                  <div className="qz-feedback-bar" />
                  <div className="qz-feedback-body">
                    {selected === current.correctIndex
                      ? <CheckCircle2 size={15} className="qz-feedback-icon" />
                      : <XCircle size={15} className="qz-feedback-icon" />
                    }
                    <div>
                      <p className="qz-feedback-title">
                        {selected === current.correctIndex ? "Excellente réponse !" : "Pas tout à fait…"}
                      </p>
                      {current.explain && <p className="qz-feedback-explain">{current.explain}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Hadith recall card ── */}
            <div className="qz-recall-card">
              <div className="qz-recall-header">
                <Sparkles size={13} className="qz-recall-sparkle" />
                <span>Rappel — Hadith {current.n}</span>
              </div>

              {(() => {
                const h = HADITHS_TAHARA.find(x => x.number === current.n);
                if (!h) return <p className="qz-recall-empty">—</p>;
                return (
                  <>
                    <div className="qz-arabic-block">
                      <p className="qz-arabic" dir="rtl">{h.arabic_text}</p>
                    </div>
                    {showFrenchRef && (
                      <div className="qz-french-block">
                        <p className="qz-french">{h.french_text}</p>
                      </div>
                    )}
                    <button className="qz-toggle-fr-btn" onClick={() => setShowFrenchRef(v => !v)}>
                      {showFrenchRef ? "Masquer la traduction" : "Afficher la traduction"}
                    </button>
                  </>
                );
              })()}
            </div>

            {/* ── Restart ── */}
            <button className="qz-restart-btn" onClick={onRestart}>
              <RotateCcw size={14} /> Recommencer ce quiz
            </button>
          </>
        )}

      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   STYLES — full dark / light
═══════════════════════════════════════ */
function QuizStyles({ dark }) {
  const light = {
    bg:        "#faf6ee",
    surface:   "#fff8ed",
    surface2:  "#f3ead8",
    border:    "rgba(160,120,48,.15)",
    border2:   "rgba(160,120,48,.28)",
    fg:        "#2c1f0e",
    muted:     "#7a6a48",
    gold:      "#a07830",
    goldDim:   "rgba(160,120,48,.12)",
    accent:    "#6a3acd",   /* violet for quiz */
    accentDim: "rgba(106,58,205,.1)",
    green:     "#3d7a5f",
    greenDim:  "rgba(61,122,95,.12)",
    danger:    "#b54a3a",
  };
  const d = {
    bg:        "#0d1117",
    surface:   "#161c24",
    surface2:  "#1e2630",
    border:    "rgba(255,255,255,.07)",
    border2:   "rgba(255,255,255,.13)",
    fg:        "#e8e0d0",
    muted:     "#7a8694",
    gold:      "#c9a84c",
    goldDim:   "rgba(201,168,76,.13)",
    accent:    "#9f7ae0",
    accentDim: "rgba(159,122,224,.12)",
    green:     "#4a9f82",
    greenDim:  "rgba(74,159,130,.12)",
    danger:    "#c95a4a",
  };
  const t = dark ? d : light;

  return (
    <style>{`
      .qz-root {
        --bg:         ${t.bg};
        --surface:    ${t.surface};
        --surface2:   ${t.surface2};
        --border:     ${t.border};
        --border2:    ${t.border2};
        --fg:         ${t.fg};
        --muted:      ${t.muted};
        --gold:       ${t.gold};
        --gold-dim:   ${t.goldDim};
        --accent:     ${t.accent};
        --accent-dim: ${t.accentDim};
        --green:      ${t.green};
        --green-dim:  ${t.greenDim};
        --danger:     ${t.danger};
        --serif:      Georgia, 'Times New Roman', serif;

        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 760px;
        margin: 0 auto;
        padding: 1.5rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
        transition: background .3s, color .3s;
      }

      /* ── header ── */
      .qz-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border2);
        flex-wrap: wrap;
        animation: fadeDown .4s ease both;
      }
      .qz-header-left { display: flex; align-items: center; gap: .85rem; }
      .qz-icon-wrap {
        width: 40px; height: 40px; flex-shrink: 0;
        background: linear-gradient(135deg, var(--accent), #5a2aad);
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; box-shadow: 0 2px 10px rgba(159,122,224,.35);
        transition: background .3s;
      }
      .qz-title    { font-size: 1.5rem; font-weight: 700; margin: 0 0 .15rem; color: var(--fg); }
      .qz-subtitle { font-size: .78rem; color: var(--muted); font-style: italic; margin: 0; }

      .qz-header-right { display: flex; align-items: center; gap: .65rem; flex-wrap: wrap; }

      .qz-select-trigger {
        background: var(--surface2) !important;
        border: 1px solid var(--border2) !important;
        border-radius: 9px !important;
        color: var(--fg) !important;
        font-family: var(--serif) !important;
        font-size: .8rem !important;
        height: 34px !important;
        min-width: 160px;
        transition: background .3s, border-color .3s !important;
      }
      .qz-select-content {
        background: var(--surface) !important;
        border: 1px solid var(--border2) !important;
        border-radius: 11px !important;
        color: var(--fg) !important;
        font-family: var(--serif) !important;
      }

      .qz-theme-toggle {
        display: flex; align-items: center; gap: .35rem;
        background: var(--surface);
        border: 1px solid var(--border2);
        border-radius: 99px; padding: .28rem .6rem;
        color: var(--muted); flex-shrink: 0;
        transition: background .3s;
      }

      /* ── stats ── */
      .qz-stats {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: .65rem;
      }
      @media (max-width: 480px) { .qz-stats { grid-template-columns: repeat(2, 1fr); } }
      .qz-stat {
        background: var(--surface); border: 1px solid var(--border);
        border-top: 2px solid var(--accent);
        border-radius: 12px; padding: .75rem .5rem;
        text-align: center; display: flex; flex-direction: column;
        align-items: center; gap: .18rem;
        transition: background .3s;
        animation: fadeUp .4s ease both;
      }
      .qz-stat-icon  { color: var(--accent); }
      .qz-stat-value { font-size: 1.45rem; font-weight: 700; color: var(--accent); line-height: 1; }
      .qz-stat-label { font-size: .63rem; color: var(--muted); }

      /* ── progress ── */
      .qz-progress-wrap { display: flex; flex-direction: column; gap: .35rem; }
      .qz-progress-label {
        display: flex; justify-content: space-between;
        font-size: .72rem; color: var(--muted);
      }
      .qz-progress-pct { color: var(--accent); font-weight: 700; }
      .qz-progress-track {
        height: 5px; background: var(--surface2);
        border-radius: 99px; overflow: hidden;
        transition: background .3s;
      }
      .qz-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent), #7a5abf);
        border-radius: 99px; transition: width .4s ease;
      }

      /* ── empty states ── */
      .qz-state-card {
        background: var(--surface); border: 1px solid var(--border2);
        border-radius: 16px; padding: 2.5rem 1.5rem;
        text-align: center; display: flex; flex-direction: column;
        align-items: center; gap: .65rem;
        transition: background .3s;
      }
      .qz-state-card--dashed { border-style: dashed; }
      .qz-state-card--pulse  { animation: pulse 1.4s ease infinite; }
      .qz-state-icon  { color: var(--muted); opacity: .5; }
      .qz-state-title { font-size: .92rem; font-weight: 700; color: var(--fg); margin: 0; }
      .qz-state-sub   { font-size: .8rem; color: var(--muted); font-style: italic; margin: 0; line-height: 1.55; }

      /* ── question card ── */
      .qz-question-card {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 16px; padding: 1.4rem 1.3rem;
        display: flex; flex-direction: column; gap: 1.1rem;
        position: relative; overflow: hidden;
        animation: fadeUp .4s ease both;
        transition: background .3s;
      }
      .qz-question-card-topline {
        position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, var(--accent), transparent);
        border-radius: 16px 16px 0 0;
      }
      .qz-question-meta { display: flex; gap: .4rem; }
      .qz-badge {
        display: inline-flex; align-items: center;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 20px; padding: 2px 9px;
        font-size: .7rem; color: var(--muted);
        transition: background .3s;
      }
      .qz-badge--hadith { color: var(--gold); border-color: rgba(160,120,48,.25); }
      .qz-question-text {
        font-size: 1.05rem; font-weight: 700; color: var(--fg);
        line-height: 1.5; margin: 0;
      }

      /* ── options ── */
      .qz-options { display: flex; flex-direction: column; gap: .5rem; }
      .qz-option {
        display: flex; align-items: center; gap: .85rem;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 11px; padding: .8rem 1rem;
        text-align: left; font-family: var(--serif);
        color: var(--fg); cursor: pointer;
        transition: border-color .13s, background .13s, transform .12s;
      }
      .qz-option:not(:disabled):hover { border-color: var(--accent); transform: translateX(3px); }
      .qz-option:disabled { cursor: default; }
      .qz-option--selected {
        border-color: var(--accent);
        background: var(--accent-dim);
        transform: translateX(4px);
      }
      .qz-option--correct {
        border-color: var(--green) !important;
        background: var(--green-dim) !important;
      }
      .qz-option--wrong {
        border-color: var(--danger) !important;
        background: rgba(181,74,58,.1) !important;
      }

      .qz-option-radio {
        width: 20px; height: 20px; flex-shrink: 0;
        border-radius: 50%; border: 2px solid var(--border2);
        display: flex; align-items: center; justify-content: center;
        transition: border-color .13s, background .13s;
        color: #fff;
      }
      .qz-option-radio--sel { border-color: var(--accent); }
      .qz-option-radio--ok  { border-color: var(--green); background: var(--green); }
      .qz-option-radio--bad { border-color: var(--danger); background: var(--danger); }
      .qz-option-radio-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: var(--accent);
      }
      .qz-option-text { font-size: .88rem; line-height: 1.45; }

      /* ── actions ── */
      .qz-actions { display: flex; gap: .6rem; flex-wrap: wrap; }
      .qz-btn-validate {
        background: linear-gradient(135deg, var(--accent), #5a2aad);
        color: #fff; border: none; border-radius: 10px;
        padding: .6rem 1.25rem; font-size: .88rem; font-weight: 700;
        font-family: var(--serif); cursor: pointer;
        box-shadow: 0 3px 12px rgba(159,122,224,.3);
        transition: opacity .15s, transform .15s;
      }
      .qz-btn-validate:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
      .qz-btn-validate:disabled { opacity: .35; cursor: not-allowed; }

      .qz-btn-hint {
        display: inline-flex; align-items: center; gap: .4rem;
        background: transparent; border: 1px solid var(--border2);
        border-radius: 10px; padding: .6rem 1rem;
        font-size: .83rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .13s, color .13s;
      }
      .qz-btn-hint:hover { border-color: var(--gold); color: var(--gold); }

      .qz-btn-next {
        background: linear-gradient(135deg, #4a9fc8, #2d6ca8);
        color: #fff; border: none; border-radius: 10px;
        padding: .6rem 1.25rem; font-size: .88rem; font-weight: 700;
        font-family: var(--serif); cursor: pointer;
        transition: opacity .15s, transform .15s;
      }
      .qz-btn-next:hover { opacity: .88; transform: translateY(-1px); }

      /* ── hint ── */
      .qz-hint {
        display: flex; align-items: flex-start; gap: .6rem;
        background: color-mix(in srgb, #4a9fc8 10%, transparent);
        border: 1px solid rgba(74,159,200,.25);
        border-radius: 10px; padding: .75rem .9rem;
        font-size: .8rem; color: var(--fg); line-height: 1.55;
      }
      .qz-hint-icon { color: #4a9fc8; flex-shrink: 0; margin-top: .1rem; }

      /* ── feedback ── */
      .qz-feedback {
        display: flex; align-items: stretch;
        border-radius: 11px; overflow: hidden;
        border: 1px solid transparent;
      }
      .qz-feedback--ok { border-color: rgba(74,159,130,.3); background: var(--green-dim); }
      .qz-feedback--ko { border-color: rgba(181,74,58,.3);  background: rgba(181,74,58,.08); }
      .qz-feedback-bar { width: 3px; flex-shrink: 0; }
      .qz-feedback--ok .qz-feedback-bar { background: var(--green); }
      .qz-feedback--ko .qz-feedback-bar { background: var(--danger); }
      .qz-feedback-body {
        flex: 1; padding: .8rem .95rem;
        display: flex; align-items: flex-start; gap: .55rem;
      }
      .qz-feedback-icon { flex-shrink: 0; margin-top: .1rem; }
      .qz-feedback--ok .qz-feedback-icon { color: var(--green); }
      .qz-feedback--ko .qz-feedback-icon { color: var(--danger); }
      .qz-feedback-title {
        font-size: .83rem; font-weight: 700; color: var(--fg); margin: 0 0 .25rem;
      }
      .qz-feedback-explain {
        font-size: .78rem; color: var(--muted); font-style: italic;
        line-height: 1.55; margin: 0;
      }

      /* ── recall card ── */
      .qz-recall-card {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 14px; padding: 1.15rem 1.2rem;
        display: flex; flex-direction: column; gap: .85rem;
        animation: fadeUp .45s ease both;
        transition: background .3s;
      }
      .qz-recall-header {
        display: flex; align-items: center; gap: .4rem;
        font-size: .7rem; text-transform: uppercase; letter-spacing: .09em;
        color: var(--gold); font-style: italic;
        padding-bottom: .75rem; border-bottom: 1px solid var(--border);
      }
      .qz-recall-sparkle { opacity: .75; }
      .qz-recall-empty { font-size: .82rem; color: var(--muted); font-style: italic; }

      .qz-arabic-block {
        background: color-mix(in srgb, var(--accent) 5%, var(--surface2));
        border: 1px solid var(--border2);
        border-radius: 11px; padding: 1.1rem 1.2rem;
        transition: background .3s;
      }
      .qz-arabic {
        font-size: clamp(1.1rem, 3vw, 1.5rem);
        line-height: 2.2; color: var(--fg); margin: 0;
        font-family: 'Amiri', 'Scheherazade New', var(--serif);
        text-align: center;
      }
      .qz-french-block {
        background: var(--surface2);
        border-left: 3px solid var(--accent);
        border-radius: 0 9px 9px 0; padding: .8rem 1rem;
        transition: background .3s;
      }
      .qz-french {
        font-size: .85rem; line-height: 1.7; color: var(--fg);
        font-style: italic; margin: 0;
      }
      .qz-toggle-fr-btn {
        display: inline-flex; align-items: center;
        background: transparent; border: 1px solid var(--border2);
        border-radius: 9px; padding: .35rem .85rem;
        font-size: .75rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .13s, color .13s;
        align-self: flex-start;
      }
      .qz-toggle-fr-btn:hover { border-color: var(--gold); color: var(--gold); }

      /* ── restart ── */
      .qz-restart-btn {
        display: flex; align-items: center; justify-content: center; gap: .5rem;
        width: 100%; background: transparent;
        border: 1px solid var(--border2);
        border-radius: 11px; padding: .6rem;
        font-size: .82rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .13s, color .13s;
      }
      .qz-restart-btn:hover { border-color: var(--accent); color: var(--accent); }

      /* ── animations ── */
      @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.45} }
    `}</style>
  );
}

export default Quiz;