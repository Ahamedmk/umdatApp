// /src/pages/Review.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { setHadithDueBadge } from "@/lib/appBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff, Trophy, Sparkles, Brain, Mic, Square } from "lucide-react";
import { saveReviewResult } from "../lib/hadithProgress";
import { supabase } from "../lib/supabase";
import { ALL_HADITHS } from "../data/allHadiths";
import { useTheme } from "@/hooks/useTheme";
import { DEBUG_SPEECH, useSpeechRecitation } from "@/hooks/useSpeechRecitation";
import { RECITATION_BANDS, evaluateRecitation, getRecitationBand, stabilizeSpokenArabic } from "@/lib/recitationEvaluation";

function toLocalISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const QUALITY_LABELS = [
  { value: 0, label: "Trou noir", desc: "Je ne me souviens pas du tout", delay: "demain" },
  { value: 1, label: "Tres difficile", desc: "Tres difficile a rappeler", delay: "demain" },
  { value: 2, label: "Apres regard", desc: "Je dois regarder pour continuer", delay: "demain" },
  { value: 3, label: "Hesitations", desc: "Ca revient mais avec effort", delay: "2 jours" },
  { value: 4, label: "Fluide", desc: "Recitation fluide", delay: "3 jours" },
  { value: 5, label: "Parfait", desc: "Instantane et sur", delay: "4 jours" },
];

function splitPreviewWords(text = "") {
  return text.trim().split(/\s+/).filter(Boolean);
}

function containsWordSequence(haystackWords = [], needleWords = []) {
  if (!needleWords.length) return true;
  if (needleWords.length > haystackWords.length) return false;

  for (let start = 0; start <= haystackWords.length - needleWords.length; start += 1) {
    let matches = true;
    for (let offset = 0; offset < needleWords.length; offset += 1) {
      if (haystackWords[start + offset] !== needleWords[offset]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return true;
    }
  }

  return false;
}

function mergeWordOverlap(left = "", right = "") {
  const leftWords = splitPreviewWords(left);
  const rightWords = splitPreviewWords(right);

  if (!leftWords.length) return rightWords.join(" ");
  if (!rightWords.length) return leftWords.join(" ");

  const leftText = leftWords.join(" ");
  const rightText = rightWords.join(" ");

  if (leftText === rightText) return leftText;
  if (containsWordSequence(rightWords, leftWords)) return rightText;
  if (containsWordSequence(leftWords, rightWords)) return leftText;

  const maxOverlap = Math.min(leftWords.length, rightWords.length);
  for (let size = maxOverlap; size > 0; size -= 1) {
    const leftSuffix = leftWords.slice(-size).join(" ");
    const rightPrefix = rightWords.slice(0, size).join(" ");
    if (leftSuffix === rightPrefix) {
      return [...leftWords, ...rightWords.slice(size)].join(" ");
    }
  }

  return [...leftWords, ...rightWords].join(" ");
}

function buildSpeechPreview(finalTranscript = "", interimTranscript = "") {
  const finalText = finalTranscript.trim();
  const interimText = interimTranscript.trim();
  if (!finalText) return interimText;
  if (!interimText) return finalText;
  return mergeWordOverlap(finalText, interimText);
}

export function Review() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [showFullArabic, setShowFullArabic] = useState(false);
  const [hadiths, setHadiths] = useState([]);
  const [idx, setIdx] = useState(0);
  const [showFr, setShowFr] = useState(false);
  const [reviewMode, setReviewMode] = useState("self");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionStats, setSessionStats] = useState({ total: 0, perfect: 0, good: 0, medium: 0, needs_work: 0 });
  const answeredInSessionRef = useRef(new Set());
  const {
    isSupported,
    isListening,
    finalTranscript,
    interimTranscript,
    error: recitationError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecitation();

  const resetRecitationFlow = () => {
    stopListening();
    resetTranscript();
  };

  async function loadDue(userId) {
    if (!userId) {
      setHadiths([]);
      setHadithDueBadge(0);
      setIdx(0);
      setShowFr(false);
      setShowFullArabic(false);
      setSessionStats({ total: 0, perfect: 0, good: 0, medium: 0, needs_work: 0 });
      return;
    }

    setLoading(true);
    try {
      const today = toLocalISODate();
      const { data: progress, error: progError } = await supabase
        .from("user_hadith_progress")
        .select("hadith_number, next_review_date")
        .eq("user_id", userId)
        .lte("next_review_date", today);
      if (progError) throw progError;

      if (!progress?.length) {
        setHadiths([]);
        setHadithDueBadge(0);
        setIdx(0);
        setShowFr(false);
        setShowFullArabic(false);
        return;
      }

      const dueNumbers = progress.map(item => item.hadith_number);
      const { data: hadithData, error: hadithError } = await supabase
        .from("hadiths")
        .select("number, arabic_text, french_text, source")
        .in("number", dueNumbers)
        .order("number", { ascending: true });
      if (hadithError) throw hadithError;

      const dbMap = new Map((hadithData || []).map(item => [item.number, item]));
      const merged = dueNumbers.map(number => dbMap.get(number) || ALL_HADITHS.find(item => item.number === number)).filter(Boolean);
      const filtered = merged.filter(item => !answeredInSessionRef.current.has(item.number));
      setHadiths(filtered);
      setHadithDueBadge(filtered.length);
      setIdx(0);
      setShowFr(false);
      setShowFullArabic(false);
    } catch (error) {
      console.error(error);
      setHadiths([]);
      setHadithDueBadge(0);
      setIdx(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    answeredInSessionRef.current = new Set();
    loadDue(user?.id || null);
  }, [user?.id]);

  const h = useMemo(() => hadiths[idx], [hadiths, idx]);
  const arabicText = h?.arabic_text || "";
  const visiblePart = arabicText.slice(0, 35);
  const hiddenPart = arabicText.slice(35);
  const progressPercent = hadiths.length ? Math.round(((idx + 1) / hadiths.length) * 100) : 0;
  const previewBeforeStabilization = useMemo(
    () => buildSpeechPreview(finalTranscript, interimTranscript),
    [finalTranscript, interimTranscript]
  );
  const speechPreview = useMemo(
    () => stabilizeSpokenArabic(arabicText, previewBeforeStabilization),
    [arabicText, previewBeforeStabilization]
  );
  const recitationEvaluation = useMemo(() => evaluateRecitation(arabicText, speechPreview), [arabicText, speechPreview]);
  const recitationQuality = recitationEvaluation.quality;
  const recitationLabel = QUALITY_LABELS.find(item => item.value === recitationQuality) || QUALITY_LABELS[0];
  const recitationBand = getRecitationBand(recitationQuality);
  const hasRecitationResult = Boolean(recitationEvaluation.normalizedSpoken);

  useEffect(() => {
    if (!DEBUG_SPEECH) return;
    console.log("[speech][review] transcripts", {
      finalTranscript,
      interimTranscript,
      previewBeforeStabilization,
      speechPreview,
    });
  }, [finalTranscript, interimTranscript, previewBeforeStabilization, speechPreview]);

  useEffect(() => {
    if (!DEBUG_SPEECH) return;
    console.log("[speech][review] evaluateRecitation-input", speechPreview);
    console.log("[speech][review] evaluation", recitationEvaluation);
  }, [speechPreview, recitationEvaluation]);

  const answer = async quality => {
    if (!h || !user || saving) return;
    const number = h.number;
    setSaving(true);
    setSessionStats(prev => ({
      total: prev.total + 1,
      perfect: prev.perfect + (quality === 5 ? 1 : 0),
      good: prev.good + (quality === 4 ? 1 : 0),
      medium: prev.medium + (quality === 3 ? 1 : 0),
      needs_work: prev.needs_work + (quality < 3 ? 1 : 0),
    }));
    answeredInSessionRef.current.add(number);
    setHadiths(prev => {
      const next = prev.filter(item => item.number !== number);
      setIdx(old => (next.length === 0 ? 0 : old >= next.length ? next.length - 1 : old));
      setHadithDueBadge(next.length);
      return next;
    });
    setShowFr(false);
    setShowFullArabic(false);
    resetRecitationFlow();
    try { await saveReviewResult(user.id, number, quality); }
    catch (error) { console.error(error); answeredInSessionRef.current.delete(number); await loadDue(user.id); }
    finally { setSaving(false); }
  };

  const isLoadingInitial = loading && !hadiths.length;
  const noHadiths = !loading && !hadiths.length;
  const themeClass = isDark ? "rv-dark" : "rv-light";
  const statsRow = [
    { label: "Notes", value: sessionStats.total, accent: isDark ? "#4a9fc8" : "#2a7ab0" },
    { label: "Parfait", value: sessionStats.perfect, accent: isDark ? "#4a9f82" : "#2d8c6a" },
    { label: "Fluide", value: sessionStats.good, accent: isDark ? "#c9a84c" : "#a07d28" },
    { label: "Avec effort", value: sessionStats.medium, accent: isDark ? "#9f7ae0" : "#7c56c8" },
    { label: "A revoir", value: sessionStats.needs_work, accent: isDark ? "#c95a4a" : "#a83030" },
  ];

  return (
    <TooltipProvider>
      <ReviewStyles isDark={isDark} />
      <div className={`rv-root ${themeClass}`}>
        <header className="rv-header">
          <div className="rv-header-left">
            <div className="rv-icon-wrap"><RotateCcw size={17} /></div>
            <div>
              <h1 className="rv-title">Revision espacee</h1>
              <p className="rv-subtitle">Systeme SM-2 · memorisation optimale</p>
              {!user && <p className="rv-warn">Non connecte - progression non sauvegardee</p>}
            </div>
          </div>
          {hadiths.length > 0 && (
            <div className="rv-progress-wrap">
              <div className="rv-progress-label">
                <span>{hadiths.length} restant{hadiths.length > 1 ? "s" : ""}</span>
                <span className="rv-progress-pct">{progressPercent}%</span>
              </div>
              <div className="rv-progress-track"><div className="rv-progress-fill" style={{ width: `${progressPercent}%` }} /></div>
            </div>
          )}
        </header>

        <div className="rv-stats">
          {statsRow.map(item => (
            <div key={item.label} className="rv-stat" style={{ "--accent": item.accent }}>
              <span className="rv-stat-value">{item.value}</span>
              <span className="rv-stat-label">{item.label}</span>
            </div>
          ))}
        </div>
        {isLoadingInitial && (
          <div className="rv-card rv-skeleton">
            <div className="rv-sk-line rv-sk-line--short" />
            <div className="rv-sk-line" />
            <div className="rv-sk-block" />
          </div>
        )}

        {noHadiths && !isLoadingInitial && (
          <div className="rv-empty">
            <div className="rv-empty-icon"><RotateCcw size={28} /></div>
            <p className="rv-empty-title">Toutes les revisions du jour sont terminees.</p>
            <p className="rv-empty-sub">Reviens demain in cha Allah, ou apprends un nouveau hadith depuis la page <strong>Apprendre</strong>.</p>
          </div>
        )}

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
              <div className="rv-hadith-sub"><Sparkles size={12} /> Recite en arabe, puis revele la traduction pour t'evaluer.</div>
              <div className="rv-arabic-block">
                <p className="rv-arabic" dir="rtl">
                  <span>{visiblePart}</span>
                  {hiddenPart && <span className={showFullArabic ? "" : "rv-arabic-blur"}>{" "}{hiddenPart}</span>}
                </p>
                {hiddenPart && (
                  <button className="rv-reveal-btn" onClick={() => setShowFullArabic(value => !value)} type="button">
                    {showFullArabic ? <><EyeOff size={12} /> Masquer la fin</> : <><Eye size={12} /> Afficher tout</>}
                  </button>
                )}
              </div>

              <div className="rv-translation">
                {!showFr ? (
                  <button className="rv-show-fr-btn" onClick={() => setShowFr(true)} type="button">
                    <Eye size={14} /> Afficher la traduction
                  </button>
                ) : (
                  <div className="rv-fr-wrap">
                    <div className="rv-fr-header">
                      <span>Traduction francaise</span>
                      <button className="rv-hide-btn" onClick={() => setShowFr(false)} type="button">
                        <EyeOff size={12} /> Masquer
                      </button>
                    </div>
                    <p className="rv-fr-text">{h.french_text}</p>
                  </div>
                )}
              </div>

              <div className="rv-eval">
                <div className="rv-eval-header"><Trophy size={13} /> <span>Choisis ton mode de validation</span></div>
                <div className="rv-mode-switch">
                  <button className={`rv-mode-btn ${reviewMode === "self" ? "rv-mode-btn--active" : ""}`} onClick={() => setReviewMode("self")} type="button">Auto-validation</button>
                  <button className={`rv-mode-btn ${reviewMode === "app" ? "rv-mode-btn--active" : ""}`} onClick={() => setReviewMode("app")} type="button">Evaluation par l'app</button>
                </div>

                <div className={`rv-eval-pane ${reviewMode === "self" ? "" : "rv-eval-pane--hidden"}`}>
                  <p className="rv-mode-copy">Tu peux garder la notation actuelle et t'auto-valider toi-meme comme avant.</p>
                  <div className="rv-mobile-legend">{QUALITY_LABELS.map(item => <span key={item.value}><strong>{item.value}</strong> {item.label}</span>)}</div>
                  <div className="rv-quality-grid">
                    {QUALITY_LABELS.map(item => (
                      <Tooltip key={item.value}>
                        <TooltipTrigger asChild>
                          <button className={`rv-quality-btn ${item.value >= 4 ? "rv-quality-btn--good" : ""} ${item.value === 5 ? "rv-quality-btn--perfect" : ""}`} onClick={() => answer(item.value)} disabled={saving} type="button">
                            <span className="rv-q-num">{item.value}</span>
                            <span className="rv-q-label">{item.label}</span>
                            <span className="rv-q-delay">? {item.delay}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">{item.desc}</p></TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                <div className={`rv-eval-pane ${reviewMode === "app" ? "" : "rv-eval-pane--hidden"}`}>
                  <div className="rv-recitation-panel">
                    <p className="rv-mode-copy">L'app ecoute ta recitation, transcrit en arabe puis calcule automatiquement le score, la note SM-2 et les ecarts detectes.</p>
                    <div className="rv-recitation-controls">
                      <div className="rv-record-head">
                        <div className="rv-record-copy">
                          <span className="rv-record-title">Evaluation par l'app</span>
                          <span className="rv-record-sub">Prototype Web Speech API. Le texte est compare apres normalisation arabe.</span>
                        </div>
                        <span className="rv-record-timer">{isListening ? "Ecoute..." : "Pret"}</span>
                      </div>
                      {!isSupported && <p className="rv-recitation-alert">La reconnaissance vocale n'est pas supportee sur ce navigateur. Utilise l'auto-validation pour l'instant.</p>}
                      {isSupported && (
                        <div className="rv-record-actions">
                          {!isListening ? (
                            <button className="rv-record-btn" onClick={() => { resetRecitationFlow(); startListening(); }} type="button">
                              <Mic size={13} /> Commencer la recitation
                            </button>
                          ) : (
                            <button className="rv-stop-btn" onClick={stopListening} type="button"><Square size={13} /> Arreter</button>
                          )}
                          {(hasRecitationResult || speechPreview) && <button className="rv-secondary-btn" onClick={resetRecitationFlow} type="button"><RotateCcw size={13} /> Nouvelle tentative</button>}
                        </div>
                      )}
                      {recitationError && <p className="rv-recitation-alert">{recitationError}</p>}
                      {speechPreview && (
                        <div className="rv-transcript-card">
                          <span className="rv-detail-label">Transcription reconnue</span>
                          <p className="rv-transcript-text" dir="rtl">{speechPreview}</p>
                        </div>
                      )}
                    </div>

                    <div className={`rv-percent-card ${!hasRecitationResult ? "rv-percent-card--muted" : ""}`}>
                      <div className="rv-percent-head">
                        <span className="rv-percent-value">{recitationEvaluation.percent}%</span>
                        <span className="rv-percent-label">{recitationBand.title}</span>
                      </div>
                      <div className="rv-percent-foot">
                        <span>{recitationBand.helper}</span>
                        <span>SM-2 : {recitationLabel.label}</span>
                      </div>
                    </div>

                    <div className="rv-recitation-band-list">
                      {RECITATION_BANDS.map(band => (
                        <span key={`${band.min}-${band.max}`} className={`rv-band-pill ${band.quality === recitationQuality ? "rv-band-pill--active" : ""}`}>
                          {band.min}-{band.max}% = {band.title}
                        </span>
                      ))}
                    </div>

                    {hasRecitationResult && (
                      <div className="rv-recitation-results">
                        <div className="rv-result-grid">
                          <div className="rv-result-box"><span className="rv-detail-label">Mots retrouves</span><strong>{recitationEvaluation.matchedWords.length}</strong></div>
                          <div className="rv-result-box"><span className="rv-detail-label">Mots oublies</span><strong>{recitationEvaluation.missedWords.length}</strong></div>
                          <div className="rv-result-box"><span className="rv-detail-label">Mots differents ou en trop</span><strong>{recitationEvaluation.extraWords.length}</strong></div>
                        </div>
                        <div className="rv-word-groups">
                          <div className="rv-word-group">
                            <span className="rv-detail-label">Mots oublies</span>
                            <p className="rv-word-list" dir="rtl">{recitationEvaluation.missedWords.length ? recitationEvaluation.missedWords.join(" • ") : "Aucun"}</p>
                          </div>
                          <div className="rv-word-group">
                            <span className="rv-detail-label">Mots differents ou en trop</span>
                            <p className="rv-word-list" dir="rtl">{recitationEvaluation.extraWords.length ? recitationEvaluation.extraWords.join(" • ") : "Aucun"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button className={`rv-recitation-validate ${recitationQuality === 5 ? "rv-recitation-validate--perfect" : ""}`} onClick={() => answer(recitationQuality)} disabled={saving || !hasRecitationResult} type="button">
                      Valider automatiquement a {recitationEvaluation.percent}% {"->"} {recitationLabel.label}
                    </button>
                    {!hasRecitationResult && <p className="rv-recitation-hint">Lance une recitation complete pour obtenir un score automatique avant validation.</p>}
                  </div>
                </div>
              </div>
            </div>

            {hadiths.length > 1 && (
              <div className="rv-nav">
                <button className="rv-nav-btn" onClick={() => { setIdx(value => (hadiths.length ? (value - 1 + hadiths.length) % hadiths.length : 0)); setShowFr(false); setShowFullArabic(false); resetRecitationFlow(); }} type="button">
                  <ChevronLeft size={15} /> Precedent
                </button>
                <span className="rv-nav-counter">{idx + 1} / {hadiths.length}</span>
                <button className="rv-nav-btn" onClick={() => { setIdx(value => (hadiths.length ? (value + 1) % hadiths.length : 0)); setShowFr(false); setShowFullArabic(false); resetRecitationFlow(); }} type="button">
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
    .rv-dark{--bg:#0d1117;--surface:#161c24;--surface2:#1e2630;--border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.13);--fg:#e8e0d0;--muted:#7a8694;--accent:#4a9fc8;--green:#4a9f82;--danger:#c95a4a}
    .rv-dark .rv-icon-wrap{background:linear-gradient(135deg,#4a9fc8,#2d6ca8);box-shadow:0 2px 10px rgba(74,159,200,.3)}
    .rv-dark .rv-progress-fill{background:linear-gradient(90deg,#4a9fc8,#2d6ca8)}
    .rv-dark .rv-progress-pct,.rv-dark .rv-record-timer,.rv-dark .rv-percent-value{color:#4a9fc8}
    .rv-dark .rv-card,.rv-dark .rv-stat{background:#161c24;border-color:rgba(255,255,255,.07)}
    .rv-dark .rv-card-topline{background:linear-gradient(90deg,#4a9fc8,transparent)}
    .rv-dark .rv-badge-num{background:rgba(201,168,76,.13);color:#c9a84c;border-color:rgba(201,168,76,.25)}
    .rv-dark .rv-badge-source,.rv-dark .rv-mobile-legend,.rv-dark .rv-mode-btn,.rv-dark .rv-quality-btn,.rv-dark .rv-secondary-btn,.rv-dark .rv-recitation-controls,.rv-dark .rv-percent-card,.rv-dark .rv-recitation-results,.rv-dark .rv-result-box,.rv-dark .rv-word-group,.rv-dark .rv-transcript-card{background:#1e2630;border-color:rgba(255,255,255,.13)}
    .rv-dark .rv-arabic-block{background:linear-gradient(135deg,#1e2630 0%,rgba(74,159,200,.06) 100%);border-color:rgba(255,255,255,.13)}
    .rv-dark .rv-reveal-btn,.rv-dark .rv-nav-btn{background:#161c24;border-color:rgba(255,255,255,.13);color:#e8e0d0}
    .rv-dark .rv-fr-text{background:#1e2630;border-left-color:#4a9fc8}
    .rv-dark .rv-eval-header{color:#c9a84c}
    .rv-dark .rv-mode-btn--active{background:rgba(74,159,200,.16);border-color:rgba(74,159,200,.4);color:#e8e0d0}
    .rv-dark .rv-quality-btn--good{background:rgba(74,159,130,.1);border-color:rgba(74,159,130,.3)}
    .rv-dark .rv-quality-btn--perfect{background:rgba(74,159,130,.18);border-color:rgba(74,159,130,.45)}
    .rv-dark .rv-record-btn{background:linear-gradient(135deg,#4a9fc8,#2d6ca8)}
    .rv-dark .rv-stop-btn{background:linear-gradient(135deg,#c95a4a,#98392c)}
    .rv-dark .rv-band-pill{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.09);color:#7a8694}
    .rv-dark .rv-band-pill--active{background:rgba(74,159,130,.16);border-color:rgba(74,159,130,.34);color:#e8e0d0}
    .rv-dark .rv-recitation-validate{background:rgba(74,159,200,.14);border-color:rgba(74,159,200,.35);color:#e8e0d0}
    .rv-dark .rv-recitation-validate--perfect{background:rgba(74,159,130,.18);border-color:rgba(74,159,130,.38)}
  `;

  const light = `
    .rv-light{--bg:#fdf8f0;--surface:#ffffff;--surface2:#fef6e4;--border:rgba(160,125,40,.13);--border2:rgba(160,125,40,.25);--fg:#2c2416;--muted:#7a6d58;--accent:#2a7ab0;--green:#2d8c6a;--danger:#a83030}
    .rv-light .rv-icon-wrap{background:linear-gradient(135deg,#2a7ab0,#1a5a8a);box-shadow:0 2px 10px rgba(42,122,176,.25)}
    .rv-light .rv-progress-fill{background:linear-gradient(90deg,#2a7ab0,#1a5a8a)}
    .rv-light .rv-progress-pct,.rv-light .rv-record-timer,.rv-light .rv-percent-value{color:#2a7ab0}
    .rv-light .rv-card,.rv-light .rv-stat{background:#ffffff;border-color:rgba(160,125,40,.13);box-shadow:0 2px 12px rgba(160,125,40,.07)}
    .rv-light .rv-card-topline{background:linear-gradient(90deg,#2a7ab0,transparent)}
    .rv-light .rv-badge-num{background:rgba(160,125,40,.1);color:#a07d28;border-color:rgba(160,125,40,.25)}
    .rv-light .rv-badge-source,.rv-light .rv-mobile-legend,.rv-light .rv-mode-btn,.rv-light .rv-quality-btn,.rv-light .rv-secondary-btn,.rv-light .rv-recitation-controls,.rv-light .rv-percent-card,.rv-light .rv-recitation-results,.rv-light .rv-result-box,.rv-light .rv-word-group,.rv-light .rv-transcript-card{background:#fef6e4;border-color:rgba(160,125,40,.2)}
    .rv-light .rv-arabic-block{background:linear-gradient(135deg,#fef6e4 0%,rgba(42,122,176,.05) 100%);border-color:rgba(160,125,40,.2)}
    .rv-light .rv-reveal-btn,.rv-light .rv-nav-btn{background:#ffffff;border-color:rgba(160,125,40,.22);color:#2c2416}
    .rv-light .rv-fr-text{background:#fef6e4;border-left-color:#2a7ab0;color:#1e1810}
    .rv-light .rv-eval-header{color:#a07d28}
    .rv-light .rv-mode-btn--active{background:rgba(42,122,176,.1);border-color:rgba(42,122,176,.28);color:#1e1810}
    .rv-light .rv-quality-btn--good{background:rgba(45,140,106,.08);border-color:rgba(45,140,106,.25)}
    .rv-light .rv-quality-btn--perfect{background:rgba(45,140,106,.14);border-color:rgba(45,140,106,.4)}
    .rv-light .rv-record-btn{background:linear-gradient(135deg,#2a7ab0,#1a5a8a)}
    .rv-light .rv-stop-btn{background:linear-gradient(135deg,#c95a4a,#a83030)}
    .rv-light .rv-band-pill{background:rgba(160,125,40,.08);border-color:rgba(160,125,40,.14);color:#7a6d58}
    .rv-light .rv-band-pill--active{background:rgba(45,140,106,.12);border-color:rgba(45,140,106,.28);color:#1e1810}
    .rv-light .rv-recitation-validate{background:rgba(42,122,176,.08);border-color:rgba(42,122,176,.28);color:#1e1810}
    .rv-light .rv-recitation-validate--perfect{background:rgba(45,140,106,.12);border-color:rgba(45,140,106,.28)}
  `;
  return (
    <style>{`
      .rv-root{--serif:Georgia,'Times New Roman',serif;font-family:var(--serif);background:var(--bg);color:var(--fg);min-height:100vh;max-width:760px;margin:0 auto;padding:1.2rem 1rem 5rem;display:flex;flex-direction:column;gap:1.25rem;transition:background .3s ease,color .3s ease}
      .rv-header{display:flex;flex-direction:column;gap:.9rem;padding-bottom:1.25rem;border-bottom:1px solid var(--border2);animation:fadeDown .4s ease both}
      .rv-header-left{display:flex;align-items:flex-start;gap:.85rem}.rv-icon-wrap{width:40px;height:40px;flex-shrink:0;border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff}.rv-title{font-size:1.5rem;font-weight:700;margin:0 0 .2rem}.rv-subtitle{font-size:.78rem;font-style:italic;margin:0;color:var(--muted)}.rv-warn{font-size:.73rem;color:var(--danger);margin-top:.3rem}
      .rv-progress-wrap{display:flex;flex-direction:column;gap:.35rem}.rv-progress-label{display:flex;justify-content:space-between;font-size:.72rem;color:var(--muted)}.rv-progress-track{height:5px;background:var(--surface2);border-radius:99px;overflow:hidden}.rv-progress-fill{height:100%;border-radius:99px;transition:width .4s ease}
      .rv-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:.7rem}.rv-stat{border:1px solid var(--border);border-top-width:2px;border-radius:12px;padding:.75rem .5rem;text-align:center}.rv-stat-value{display:block;font-size:1.6rem;font-weight:700;color:var(--accent);line-height:1}.rv-stat-label{display:block;font-size:.65rem;margin-top:.25rem;letter-spacing:.04em}
      @media (max-width:700px){.rv-stats{grid-template-columns:repeat(3,1fr)}} @media (max-width:400px){.rv-stats{grid-template-columns:repeat(2,1fr)}}
      .rv-skeleton{gap:.9rem!important;animation:pulse 1.4s ease infinite}.rv-sk-line{height:18px;border-radius:6px}.rv-sk-line--short{width:40%}.rv-sk-block{height:140px;border-radius:10px}
      .rv-empty{border:2px dashed var(--border2);border-radius:16px;padding:2.5rem 1.5rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.75rem}.rv-empty-icon{opacity:.5}.rv-empty-title{font-size:.95rem;font-weight:700;margin:0}.rv-empty-sub{font-size:.82rem;font-style:italic;margin:0;line-height:1.6;color:var(--muted)}
      .rv-card{border:1px solid var(--border);border-radius:16px;padding:1.35rem;display:flex;flex-direction:column;gap:1.1rem;animation:fadeUp .4s ease both;position:relative;overflow:hidden}.rv-card-topline{position:absolute;top:0;left:0;right:0;height:2px;border-radius:16px 16px 0 0}
      .rv-hadith-meta{display:flex;justify-content:space-between;align-items:center}.rv-hadith-badges{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}.rv-badge-num,.rv-badge-source{border:1px solid transparent;border-radius:20px;padding:2px 8px;font-size:.68rem}.rv-badge-num{font-size:.72rem;font-weight:700;padding:2px 9px}.rv-badge-source{max-width:40vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rv-brain-icon{opacity:.6}.rv-hadith-sub{display:flex;align-items:center;gap:.4rem;font-size:.72rem;font-style:italic;color:var(--muted)}
      .rv-arabic-block{border:1px solid var(--border2);border-radius:12px;padding:1.5rem 1.25rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.8rem}.rv-arabic{font-size:clamp(1.3rem,3.5vw,2rem);line-height:2.3;margin:0;font-family:'Amiri','Scheherazade New',var(--serif)}.rv-arabic-blur{filter:blur(6px);user-select:none;display:inline}.rv-reveal-btn{display:inline-flex;align-items:center;gap:.4rem;border:1px solid transparent;border-radius:99px;padding:.3rem .85rem;font-size:.73rem;font-family:var(--serif);cursor:pointer}
      .rv-show-fr-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;color:#fff;border:none;border-radius:11px;padding:.75rem;font-size:.88rem;font-weight:700;font-family:var(--serif);cursor:pointer}.rv-fr-wrap{display:flex;flex-direction:column;gap:.6rem}.rv-fr-header{display:flex;justify-content:space-between;align-items:center;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em}.rv-hide-btn{display:inline-flex;align-items:center;gap:.3rem;background:transparent;border:none;font-size:.72rem;font-family:var(--serif);cursor:pointer}.rv-fr-text{border-left:3px solid transparent;border-radius:0 10px 10px 0;padding:.9rem 1.1rem;font-size:.88rem;line-height:1.75;font-style:italic;margin:0}
      .rv-eval{display:flex;flex-direction:column;gap:.8rem}.rv-eval-header{display:flex;align-items:center;gap:.45rem;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em}.rv-mode-switch{display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem}.rv-mode-btn{border:1px solid transparent;border-radius:12px;padding:.85rem 1rem;font-size:.84rem;font-family:var(--serif);font-weight:700;cursor:pointer}.rv-mode-copy{margin:0;font-size:.82rem;line-height:1.7;color:var(--muted)}.rv-eval-pane{display:flex;flex-direction:column;gap:.75rem}.rv-eval-pane--hidden{display:none}
      .rv-mobile-legend{display:none;flex-direction:column;gap:.2rem;border:1px solid var(--border);border-radius:9px;padding:.65rem .8rem;font-size:.72rem}.rv-quality-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem}.rv-quality-btn{border:1px solid transparent;border-radius:12px;padding:.8rem .4rem;display:flex;flex-direction:column;align-items:center;gap:.25rem;cursor:pointer;font-family:var(--serif)}.rv-q-num{font-size:1.4rem;font-weight:700;line-height:1}.rv-q-label{font-size:.68rem;text-align:center;line-height:1.3}.rv-q-delay{font-size:.62rem}
      .rv-recitation-panel{display:flex;flex-direction:column;gap:.8rem}.rv-recitation-controls,.rv-percent-card,.rv-recitation-results{border:1px solid var(--border2);border-radius:14px;padding:1rem}.rv-percent-card--muted{opacity:.8}.rv-record-head{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem}.rv-record-copy{display:flex;flex-direction:column;gap:.15rem}.rv-record-title{font-size:.88rem;font-weight:700}.rv-record-sub,.rv-recitation-alert,.rv-recitation-hint{font-size:.76rem;line-height:1.6;color:var(--muted)}.rv-record-actions{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:.85rem}
      .rv-record-btn,.rv-stop-btn,.rv-secondary-btn,.rv-recitation-validate{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;border:1px solid transparent;font-family:var(--serif);cursor:pointer}.rv-record-btn,.rv-stop-btn{border-radius:10px;padding:.7rem 1rem;color:#fff;font-size:.82rem;font-weight:700}.rv-secondary-btn{border-radius:10px;padding:.7rem .95rem;font-size:.8rem}.rv-transcript-card,.rv-result-box,.rv-word-group{border:1px solid var(--border2);border-radius:12px;padding:.9rem}.rv-detail-label{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:.45rem}.rv-transcript-text{margin:0;font-size:1rem;line-height:1.9}.rv-percent-head{display:flex;justify-content:space-between;align-items:center;gap:1rem}.rv-percent-label{font-size:.9rem;font-weight:700}.rv-percent-foot{display:flex;justify-content:space-between;gap:.8rem;font-size:.74rem;line-height:1.5;color:var(--muted)}.rv-recitation-band-list{display:flex;flex-wrap:wrap;gap:.5rem}.rv-band-pill{border:1px solid transparent;border-radius:999px;padding:.38rem .7rem;font-size:.68rem}.rv-result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem}.rv-word-groups{display:grid;gap:.7rem;margin-top:.7rem}.rv-word-list{margin:0;line-height:1.8;font-size:.92rem}.rv-recitation-validate{border-radius:12px;padding:.9rem 1rem;font-size:.88rem;font-weight:700}
      .rv-quality-btn:disabled,.rv-record-btn:disabled,.rv-stop-btn:disabled,.rv-mode-btn:disabled,.rv-secondary-btn:disabled,.rv-recitation-validate:disabled,.rv-nav-btn:disabled{opacity:.5;pointer-events:none}.rv-nav{display:flex;align-items:center;justify-content:space-between;gap:.75rem;border-top:1px solid var(--border);padding-top:.75rem}.rv-nav-btn{display:inline-flex;align-items:center;gap:.4rem;border:1px solid transparent;border-radius:10px;padding:.5rem 1rem;font-size:.82rem;font-family:var(--serif);cursor:pointer}.rv-nav-counter{font-size:.78rem;font-style:italic;color:var(--muted)}
      @media (max-width:520px){.rv-percent-foot{flex-direction:column}} @media (max-width:560px){.rv-result-grid{grid-template-columns:1fr}} @media (max-width:480px){.rv-mobile-legend{display:flex}} @media (max-width:380px){.rv-quality-grid{grid-template-columns:repeat(2,1fr)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
      ${isDark ? dark : light}
    `}</style>
  );
}

export default Review;

