// /src/pages/ExamQuiz.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  ClipboardCheck, Clock, Moon, Sun, Play, CheckCircle2,
  XCircle, AlertCircle, Trophy, Target, Zap, RotateCcw,
} from "lucide-react";

import { QUIZ_QUESTIONS_1_15 } from "@/data/quiz_questions_1_15";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

/* ─── helpers ─── */
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildPool = (scope, allowed) => {
  if (!allowed?.length) return [];
  const target = scope === "all" ? null : parseInt(scope, 10) || null;
  const filtered = QUIZ_QUESTIONS_1_15.filter(q =>
    allowed.includes(q.n) && (!target || q.n === target)
  );
  if (!filtered.length) return [];
  const byH = filtered.reduce((acc, q) => { (acc[q.n] = acc[q.n] || []).push(q); return acc; }, {});
  return shuffle(Object.values(byH).map(qs => qs[Math.floor(Math.random() * qs.length)]));
};

const GRADE = pct => {
  if (pct >= 90) return { label: "Excellent",   color: "#4a9f82", emoji: "✨" };
  if (pct >= 75) return { label: "Très bien",   color: "#4a9fc8", emoji: "😊" };
  if (pct >= 60) return { label: "Bien",         color: "#c9a84c", emoji: "🤔" };
  return              { label: "À améliorer",   color: "#c95a4a", emoji: "💪" };
};

/* ══════════════════════════════════════════ */
export function ExamQuiz() {
  const { user } = useAuth();

  const [scope, setScope]     = useState("all");
  const [duration, setDuration] = useState(8);
  const [started, setStarted] = useState(false);
  const [pool, setPool]       = useState([]);
  const [index, setIndex]     = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [dark, setDark]       = useState(false);

  const [learnedNumbers, setLearnedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      try {
        if (!user?.id) { if (active) setLearnedNumbers([]); return; }
        const { data, error } = await supabase
          .from("user_hadith_progress").select("hadith_number, status")
          .eq("user_id", user.id).eq("status", "learned");
        if (error) throw error;
        const nums = [...new Set((data || []).map(r => r.hadith_number).filter(n => typeof n === "number"))].sort((a,b) => a-b);
        if (active) setLearnedNumbers(nums);
      } catch (err) {
        console.error(err);
        if (active) setLearnedNumbers([]);
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [user?.id]);

  const preparedPool = useMemo(() => buildPool(scope, learnedNumbers), [scope, learnedNumbers]);

  const startExam = () => {
    setPool(preparedPool);
    setIndex(0);
    setAnswers(Array(preparedPool.length).fill(null));
    setTimeLeft(Math.max(1, Math.floor(duration * 60)));
    setStarted(true);
    setFinished(false);
  };

  /* timer */
  const timerRef = useRef(null);
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (started && timeLeft === 0 && !finished) setFinished(true);
  }, [timeLeft, started, finished]);

  const selectAnswer = i => { if (finished) return; setAnswers(prev => { const c=[...prev]; c[index]=i; return c; }); };
  const nextQ = () => { if (!finished && index + 1 < pool.length) setIndex(i => i + 1); };
  const endExam = () => { setFinished(true); clearInterval(timerRef.current); };
  const resetExam = () => { setStarted(false); setFinished(false); setPool([]); setAnswers([]); setIndex(0); setTimeLeft(0); };

  const score = useMemo(() => {
    if (!finished) return 0;
    return pool.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  }, [finished, pool, answers]);

  const progressPct = pool.length ? Math.round(((index + 1) / pool.length) * 100) : 0;
  const scorePct    = pool.length ? Math.round((score / pool.length) * 100) : 0;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const timeWarning = timeLeft > 0 && timeLeft <= 60;
  const noLearned = !loading && learnedNumbers.length === 0;

  const ThemeToggle = () => (
    <div className="eq-theme-toggle">
      <Sun size={13} />
      <Switch checked={dark} onCheckedChange={toggleTheme} />
      <Moon size={13} />
    </div>
  );

  /* ════════════════════════════════
     SCREEN: CONFIG
  ════════════════════════════════ */
  if (!started) return (
    <>
      <ExamStyles dark={dark} />
      <div className="eq-root">
        <header className="eq-header">
          <div className="eq-header-left">
            <div className="eq-icon-wrap"><ClipboardCheck size={17} /></div>
            <div>
              <h1 className="eq-title">Mode Examen</h1>
              <p className="eq-subtitle">Teste tes connaissances sous pression</p>
              {noLearned && <p className="eq-warn">Apprends au moins un hadith avant de lancer l'examen.</p>}
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div className="eq-config-card">
          <div className="eq-card-header">
            <Target size={14} className="eq-card-header-icon" />
            <span>Configuration</span>
          </div>

          <div className="eq-config-grid">
            {/* Scope */}
            <div className="eq-config-field">
              <label className="eq-field-label"><Target size={13} /> Périmètre</label>
              <Select value={scope} onValueChange={setScope} disabled={noLearned}>
                <SelectTrigger className="eq-select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="eq-select-content">
                  <SelectItem value="all">Tous les hadiths appris</SelectItem>
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(n => (
                    <SelectItem key={n} value={String(n)} disabled={!learnedNumbers.includes(n)}>
                      Hadith {n}{!learnedNumbers.includes(n) ? " (non appris)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="eq-field-hint">
                {loading ? "Chargement…"
                  : learnedNumbers.length > 0 ? `${preparedPool.length} question(s) sélectionnée(s)`
                  : "Aucun hadith appris"}
              </p>
            </div>

            {/* Duration */}
            <div className="eq-config-field">
              <label className="eq-field-label"><Clock size={13} /> Durée</label>
              <Select value={String(duration)} onValueChange={v => setDuration(parseInt(v,10))} disabled={noLearned}>
                <SelectTrigger className="eq-select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="eq-select-content">
                  {[5,8,10,12,15,20,30].map(m => (
                    <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="eq-field-hint">
                {preparedPool.length > 0 ? `~${Math.round((duration * 60) / preparedPool.length)}s / question` : "—"}
              </p>
            </div>
          </div>

          {/* Rules */}
          <div className="eq-rules">
            <AlertCircle size={14} className="eq-rules-icon" />
            <div>
              <p className="eq-rules-title">Règles de l'examen</p>
              <ul className="eq-rules-list">
                <li>Pas de retour en arrière</li>
                <li>Chronomètre dégressif</li>
                <li>Correction uniquement à la fin</li>
                <li>Questions sur les hadiths appris uniquement</li>
              </ul>
            </div>
          </div>

          <button
            className="eq-start-btn"
            onClick={startExam}
            disabled={preparedPool.length === 0}
          >
            <Play size={16} /> Démarrer l'examen
          </button>
        </div>

        {/* Stats preview */}
        <div className="eq-preview-stats">
          <div className="eq-preview-stat">
            <span className="eq-preview-val">{learnedNumbers.length}</span>
            <span className="eq-preview-lbl">Hadiths appris</span>
          </div>
          <div className="eq-preview-stat">
            <span className="eq-preview-val">{preparedPool.length}</span>
            <span className="eq-preview-lbl">Questions</span>
          </div>
          <div className="eq-preview-stat">
            <span className="eq-preview-val">{duration}min</span>
            <span className="eq-preview-lbl">Durée</span>
          </div>
        </div>
      </div>
    </>
  );

  /* ════════════════════════════════
     SCREEN: RESULT
  ════════════════════════════════ */
  if (finished) {
    const grade = GRADE(scorePct);
    return (
      <>
        <ExamStyles dark={dark} />
        <div className="eq-root">
          <header className="eq-header">
            <div className="eq-header-left">
              <div className="eq-icon-wrap" style={{ background: grade.color }}><Trophy size={17} /></div>
              <div>
                <h1 className="eq-title">Résultats</h1>
                <p className="eq-subtitle">Analyse de ta performance</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          {/* Score card */}
          <div className="eq-score-card" style={{ "--grade-clr": grade.color }}>
            <div className="eq-score-emoji">{grade.emoji}</div>
            <div className="eq-score-num">{score}<span className="eq-score-total">/{pool.length}</span></div>
            <div className="eq-score-pct">{scorePct}%</div>
            <span className="eq-grade-pill">{grade.label}</span>

            <div className="eq-score-bar-track">
              <div className="eq-score-bar-fill" style={{ width: `${scorePct}%` }} />
            </div>
          </div>

          {/* Correction */}
          <div className="eq-card">
            <div className="eq-card-header">
              <ClipboardCheck size={14} className="eq-card-header-icon" />
              <span>Correction détaillée</span>
            </div>
            <ScrollArea className="eq-scroll-area">
              <div className="eq-correction-list">
                {pool.map((q, i) => {
                  const chosen = answers[i];
                  const ok = chosen === q.correctIndex;
                  return (
                    <div key={i} className={`eq-correction-row ${ok ? "eq-correction-row--ok" : "eq-correction-row--ko"}`}>
                      <div className="eq-correction-row-bar" />
                      <div className="eq-correction-body">
                        <div className="eq-correction-top">
                          <div className="eq-correction-badges">
                            <span className="eq-badge">Q{i+1}</span>
                            <span className="eq-badge eq-badge--hadith">H{q.n}</span>
                          </div>
                          <div className={`eq-correction-verdict ${ok ? "eq-verdict--ok" : "eq-verdict--ko"}`}>
                            {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            {ok ? "Correct" : "Incorrect"}
                          </div>
                        </div>

                        <p className="eq-correction-question">{q.q}</p>

                        <div className="eq-correction-answers">
                          <div className={`eq-correction-answer eq-correction-answer--user`}>
                            <span className="eq-ca-label">Ta réponse</span>
                            <span>{chosen != null ? q.options[chosen] : <em>Aucune réponse</em>}</span>
                          </div>
                          {!ok && (
                            <div className="eq-correction-answer eq-correction-answer--correct">
                              <span className="eq-ca-label">Bonne réponse</span>
                              <span>{q.options[q.correctIndex]}</span>
                            </div>
                          )}
                        </div>

                        {q.explain && (
                          <div className="eq-correction-explain">
                            <strong>Explication : </strong>{q.explain}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <button className="eq-start-btn" onClick={resetExam}>
            <RotateCcw size={15} /> Refaire un examen
          </button>
        </div>
      </>
    );
  }

  /* ════════════════════════════════
     SCREEN: QUESTION
  ════════════════════════════════ */
  const q = pool[index];
  return (
    <>
      <ExamStyles dark={dark} />
      <div className="eq-root">

        {/* Top bar */}
        <div className="eq-question-topbar">
          <div className="eq-question-badges">
            <span className="eq-badge">Q {index + 1}/{pool.length}</span>
            <span className="eq-badge eq-badge--hadith">H{q?.n}</span>
          </div>

          <div className={`eq-timer ${timeWarning ? "eq-timer--warning" : ""}`}>
            <Clock size={14} />
            <span>{mm}:{ss}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="eq-progress-wrap">
          <div className="eq-progress-track">
            <div className="eq-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="eq-progress-pct">{progressPct}%</span>
        </div>

        {/* Question card */}
        <div className="eq-question-card">
          <p className="eq-question-text">{q?.q}</p>

          <div className="eq-options">
            {q?.options.map((opt, i) => {
              const selected = answers[index] === i;
              return (
                <button
                  key={i}
                  className={`eq-option ${selected ? "eq-option--selected" : ""}`}
                  onClick={() => selectAnswer(i)}
                >
                  <div className="eq-option-radio">
                    {selected && <div className="eq-option-radio-dot" />}
                  </div>
                  <span className="eq-option-text">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="eq-question-footer">
            <span className="eq-no-back"><Zap size={11} /> Pas de retour en arrière</span>
            <button
              className="eq-next-btn"
              onClick={index + 1 < pool.length ? nextQ : endExam}
              disabled={answers[index] == null}
            >
              {index + 1 < pool.length ? "Suivant →" : "Terminer"}
            </button>
          </div>
        </div>

        <button className="eq-abort-btn" onClick={endExam}>
          Terminer maintenant
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   STYLES — full dark/light support
═══════════════════════════════════════ */
function ExamStyles({ dark }) {
  /* Light mode: warm ivory + gold + green islamic tones */
  const light = {
    bg:       "#faf6ee",
    surface:  "#fff8ed",
    surface2: "#f3ead8",
    border:   "rgba(160,120,48,.15)",
    border2:  "rgba(160,120,48,.28)",
    fg:       "#2c1f0e",
    muted:    "#7a6a48",
    gold:     "#a07830",
    goldDim:  "rgba(160,120,48,.12)",
    accent:   "#3d7a5f",
    accentDim:"rgba(61,122,95,.12)",
    danger:   "#b54a3a",
  };
  const d = {
    bg:       "#0d1117",
    surface:  "#161c24",
    surface2: "#1e2630",
    border:   "rgba(255,255,255,.07)",
    border2:  "rgba(255,255,255,.13)",
    fg:       "#e8e0d0",
    muted:    "#7a8694",
    gold:     "#c9a84c",
    goldDim:  "rgba(201,168,76,.13)",
    accent:   "#4a9f82",
    accentDim:"rgba(74,159,130,.12)",
    danger:   "#c95a4a",
  };
  const t = dark ? d : light;

  return (
    <style>{`
      .eq-root {
        --bg:        ${t.bg};
        --surface:   ${t.surface};
        --surface2:  ${t.surface2};
        --border:    ${t.border};
        --border2:   ${t.border2};
        --fg:        ${t.fg};
        --muted:     ${t.muted};
        --gold:      ${t.gold};
        --gold-dim:  ${t.goldDim};
        --accent:    ${t.accent};
        --accent-dim:${t.accentDim};
        --danger:    ${t.danger};
        --serif:     Georgia, 'Times New Roman', serif;

        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 740px;
        margin: 0 auto;
        padding: 1.5rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
        transition: background .3s, color .3s;
      }

      /* ── header ── */
      .eq-header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both;
      }
      .eq-header-left { display: flex; align-items: center; gap: .85rem; }
      .eq-icon-wrap {
        width: 40px; height: 40px; flex-shrink: 0;
        background: linear-gradient(135deg, #c95a4a, #a03030);
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; box-shadow: 0 2px 10px rgba(201,90,74,.35);
        transition: background .3s;
      }
      .eq-title    { font-size: 1.5rem; font-weight: 700; margin: 0 0 .15rem; color: var(--fg); }
      .eq-subtitle { font-size: .78rem; color: var(--muted); font-style: italic; margin: 0; }
      .eq-warn     { font-size: .72rem; color: var(--danger); margin-top: .3rem; }

      .eq-theme-toggle {
        display: flex; align-items: center; gap: .4rem;
        background: var(--surface);
        border: 1px solid var(--border2);
        border-radius: 99px; padding: .3rem .65rem;
        color: var(--muted); font-size: .75rem; flex-shrink: 0;
        transition: background .3s, border-color .3s;
      }

      /* ── config card ── */
      .eq-config-card {
        background: var(--surface); border: 1px solid var(--border);
        border-top: 2px solid var(--danger);
        border-radius: 16px; padding: 1.35rem;
        display: flex; flex-direction: column; gap: 1.1rem;
        animation: fadeUp .4s ease both;
        transition: background .3s, border-color .3s;
      }
      .eq-card-header {
        display: flex; align-items: center; gap: .5rem;
        font-size: .7rem; text-transform: uppercase; letter-spacing: .09em;
        color: var(--gold); font-style: italic;
        padding-bottom: .85rem; border-bottom: 1px solid var(--border);
      }
      .eq-card-header-icon { opacity: .75; }

      .eq-config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      @media (max-width: 480px) { .eq-config-grid { grid-template-columns: 1fr; } }

      .eq-config-field { display: flex; flex-direction: column; gap: .45rem; }
      .eq-field-label {
        display: flex; align-items: center; gap: .35rem;
        font-size: .78rem; font-weight: 700; color: var(--fg);
      }
      .eq-field-hint { font-size: .7rem; color: var(--muted); font-style: italic; }

      /* shadcn select overrides */
      .eq-select-trigger {
        background: var(--surface2) !important;
        border: 1px solid var(--border2) !important;
        border-radius: 9px !important;
        color: var(--fg) !important;
        font-family: var(--serif) !important;
        font-size: .83rem !important;
        height: 38px !important;
        transition: background .3s, border-color .3s !important;
      }
      .eq-select-trigger:focus { border-color: var(--gold) !important; }
      .eq-select-content {
        background: var(--surface) !important;
        border: 1px solid var(--border2) !important;
        border-radius: 11px !important;
        color: var(--fg) !important;
        font-family: var(--serif) !important;
      }

      /* rules */
      .eq-rules {
        display: flex; align-items: flex-start; gap: .65rem;
        background: var(--accent-dim);
        border: 1px solid rgba(74,159,130,.2);
        border-radius: 11px; padding: .85rem 1rem;
        transition: background .3s;
      }
      .eq-rules-icon { color: var(--accent); flex-shrink: 0; margin-top: .1rem; }
      .eq-rules-title { font-size: .8rem; font-weight: 700; color: var(--fg); margin-bottom: .35rem; }
      .eq-rules-list {
        list-style: disc; list-style-position: inside;
        font-size: .73rem; color: var(--muted);
        line-height: 1.7; margin: 0; padding: 0;
      }

      /* start button */
      .eq-start-btn {
        display: flex; align-items: center; justify-content: center; gap: .5rem;
        width: 100%;
        background: linear-gradient(135deg, #c95a4a, #a03030);
        color: #fff; border: none; border-radius: 12px;
        padding: .85rem; font-size: .92rem; font-weight: 700;
        font-family: var(--serif); cursor: pointer;
        transition: opacity .15s, transform .15s;
        box-shadow: 0 4px 14px rgba(201,90,74,.3);
      }
      .eq-start-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
      .eq-start-btn:disabled { opacity: .4; cursor: not-allowed; }

      /* preview stats */
      .eq-preview-stats {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: .65rem;
        animation: fadeUp .45s ease both;
      }
      .eq-preview-stat {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 12px; padding: .8rem .5rem;
        text-align: center; transition: background .3s;
      }
      .eq-preview-val  { display: block; font-size: 1.4rem; font-weight: 700; color: var(--gold); line-height: 1; }
      .eq-preview-lbl  { display: block; font-size: .65rem; color: var(--muted); margin-top: .2rem; }

      /* ── question screen ── */
      .eq-question-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        animation: fadeDown .35s ease both;
      }
      .eq-question-badges { display: flex; gap: .4rem; }
      .eq-badge {
        display: inline-flex; align-items: center;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 20px; padding: 2px 9px;
        font-size: .7rem; color: var(--muted);
        transition: background .3s;
      }
      .eq-badge--hadith { color: var(--gold); border-color: rgba(160,120,48,.3); }

      .eq-timer {
        display: flex; align-items: center; gap: .4rem;
        background: var(--surface); border: 1px solid var(--border2);
        border-radius: 99px; padding: .32rem .85rem;
        font-family: 'Courier New', monospace;
        font-size: .95rem; font-weight: 700; color: var(--fg);
        transition: background .2s, border-color .2s, color .2s;
      }
      .eq-timer--warning {
        background: rgba(201,90,74,.12);
        border-color: rgba(201,90,74,.5);
        color: var(--danger);
        animation: pulse .8s ease infinite;
      }

      /* progress */
      .eq-progress-wrap { display: flex; align-items: center; gap: .65rem; }
      .eq-progress-track {
        flex: 1; height: 5px;
        background: var(--surface2); border-radius: 99px; overflow: hidden;
        transition: background .3s;
      }
      .eq-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #c95a4a, #e07a6a);
        border-radius: 99px; transition: width .35s ease;
      }
      .eq-progress-pct { font-size: .72rem; color: var(--muted); flex-shrink: 0; }

      /* question card */
      .eq-question-card {
        background: var(--surface); border: 1px solid var(--border);
        border-top: 2px solid var(--danger);
        border-radius: 16px; padding: 1.5rem 1.35rem;
        display: flex; flex-direction: column; gap: 1.25rem;
        animation: fadeUp .35s ease both;
        transition: background .3s;
      }
      .eq-question-text {
        font-size: 1.05rem; font-weight: 700; color: var(--fg);
        line-height: 1.5; margin: 0;
      }

      /* options */
      .eq-options { display: flex; flex-direction: column; gap: .55rem; }
      .eq-option {
        display: flex; align-items: center; gap: .85rem;
        background: var(--surface2); border: 1px solid var(--border2);
        border-radius: 11px; padding: .8rem 1rem;
        text-align: left; font-family: var(--serif);
        color: var(--fg); cursor: pointer;
        transition: border-color .15s, background .15s, transform .12s;
      }
      .eq-option:hover { border-color: var(--gold); transform: translateX(3px); }
      .eq-option--selected {
        border-color: #c95a4a;
        background: rgba(201,90,74,.1);
        transform: translateX(4px);
      }
      .eq-option-radio {
        width: 18px; height: 18px; flex-shrink: 0;
        border-radius: 50%; border: 2px solid var(--border2);
        display: flex; align-items: center; justify-content: center;
        transition: border-color .15s;
      }
      .eq-option--selected .eq-option-radio { border-color: #c95a4a; }
      .eq-option-radio-dot {
        width: 8px; height: 8px; border-radius: 50%; background: #c95a4a;
      }
      .eq-option-text { font-size: .88rem; line-height: 1.45; }

      /* footer */
      .eq-question-footer {
        display: flex; align-items: center; justify-content: space-between;
        gap: .75rem; padding-top: .25rem;
        border-top: 1px solid var(--border);
      }
      .eq-no-back { font-size: .7rem; color: var(--muted); display: flex; align-items: center; gap: .3rem; font-style: italic; }
      .eq-next-btn {
        background: linear-gradient(135deg, #c95a4a, #a03030);
        color: #fff; border: none; border-radius: 9px;
        padding: .5rem 1.2rem; font-size: .85rem; font-weight: 700;
        font-family: var(--serif); cursor: pointer;
        transition: opacity .15s, transform .15s;
      }
      .eq-next-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
      .eq-next-btn:disabled { opacity: .35; cursor: not-allowed; }

      .eq-abort-btn {
        width: 100%; background: transparent;
        border: 1px solid var(--border2); border-radius: 10px;
        padding: .5rem; font-size: .8rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s;
      }
      .eq-abort-btn:hover { border-color: var(--danger); color: var(--danger); }

      /* ── result screen ── */
      .eq-score-card {
        background: var(--surface); border: 1px solid var(--border);
        border-top: 3px solid var(--grade-clr, var(--gold));
        border-radius: 18px; padding: 2rem 1.5rem;
        text-align: center; display: flex; flex-direction: column;
        align-items: center; gap: .6rem;
        animation: fadeUp .4s ease both;
        transition: background .3s;
      }
      .eq-score-emoji { font-size: 2.5rem; line-height: 1; }
      .eq-score-num {
        font-size: 3.5rem; font-weight: 700;
        color: var(--grade-clr, var(--gold)); line-height: 1;
      }
      .eq-score-total { font-size: 1.8rem; opacity: .55; }
      .eq-score-pct { font-size: 1.1rem; color: var(--muted); }
      .eq-grade-pill {
        background: color-mix(in srgb, var(--grade-clr, var(--gold)) 15%, transparent);
        color: var(--grade-clr, var(--gold));
        border-radius: 20px; padding: .3rem 1.1rem;
        font-size: .82rem; font-weight: 700;
      }
      .eq-score-bar-track {
        width: 100%; max-width: 300px; height: 6px;
        background: var(--surface2); border-radius: 99px; overflow: hidden;
        margin-top: .35rem; transition: background .3s;
      }
      .eq-score-bar-fill {
        height: 100%; background: var(--grade-clr, var(--gold));
        border-radius: 99px; transition: width .6s ease;
      }

      /* card (generic) */
      .eq-card {
        background: var(--surface); border: 1px solid var(--border);
        border-radius: 16px; padding: 1.3rem;
        display: flex; flex-direction: column; gap: 1rem;
        animation: fadeUp .45s ease both;
        transition: background .3s;
      }
      .eq-scroll-area { max-height: 500px; overflow-y: auto; }

      /* correction */
      .eq-correction-list { display: flex; flex-direction: column; gap: .55rem; }
      .eq-correction-row {
        display: flex; align-items: stretch;
        border-radius: 11px; overflow: hidden;
        border: 1px solid var(--border);
        transition: border-color .13s;
      }
      .eq-correction-row--ok  { border-color: rgba(74,159,130,.3); }
      .eq-correction-row--ko  { border-color: rgba(201,90,74,.3);  }
      .eq-correction-row-bar  { width: 3px; flex-shrink: 0; }
      .eq-correction-row--ok  .eq-correction-row-bar { background: #4a9f82; }
      .eq-correction-row--ko  .eq-correction-row-bar { background: #c95a4a; }
      .eq-correction-body { flex: 1; padding: .85rem .95rem; display: flex; flex-direction: column; gap: .5rem; }
      .eq-correction-top  { display: flex; align-items: center; justify-content: space-between; gap: .5rem; flex-wrap: wrap; }
      .eq-correction-badges { display: flex; gap: .35rem; }
      .eq-correction-verdict {
        display: flex; align-items: center; gap: .3rem;
        font-size: .72rem; font-weight: 700; border-radius: 20px; padding: 2px 9px;
      }
      .eq-verdict--ok { color: #4a9f82; background: rgba(74,159,130,.12); }
      .eq-verdict--ko { color: #c95a4a; background: rgba(201,90,74,.12);  }
      .eq-correction-question { font-size: .85rem; font-weight: 700; color: var(--fg); margin: 0; line-height: 1.4; }
      .eq-correction-answers  { display: flex; flex-direction: column; gap: .35rem; }
      .eq-correction-answer {
        font-size: .78rem; color: var(--fg); line-height: 1.5;
        border-radius: 8px; padding: .45rem .7rem;
      }
      .eq-correction-answer--user    { background: var(--surface2); }
      .eq-correction-answer--correct { background: rgba(74,159,130,.12); color: #4a9f82; }
      .eq-ca-label { font-weight: 700; margin-right: .4rem; }
      .eq-correction-explain {
        font-size: .73rem; color: var(--muted); font-style: italic; line-height: 1.55;
        border-top: 1px solid var(--border); padding-top: .4rem;
      }

      /* animations */
      @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.55} }
    `}</style>
  );
}

export default ExamQuiz;