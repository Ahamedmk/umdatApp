// /src/pages/HadithDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play, Pause, Sun, Moon, ChevronLeft, ChevronRight,
  BookOpen, Sparkles, Volume2, Eye, EyeOff, CheckCircle2,
  Clock, RotateCcw, Scale3d, Mic, Square,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { nextReview } from "../lib/spaced";
import { HADITHS_TAHARA } from "../data/seed_hadiths_tahara";
import { HADITHS_SALAT } from "../data/seed_hadiths_salat";
import { NARRATORS_MOCK } from "@/data/narrators_mock";
import { useAuth } from "../context/AuthContext";

/* ─── router helper ─── */
function useHadithNumberFromRouter() {
  const { n: nParam } = useParams();
  const [sp] = useSearchParams();
  useLocation();
  const raw = nParam ?? sp.get("n") ?? "8";
  const num = parseInt(raw, 10);
  return Number.isNaN(num) ? 8 : num;
}

/* ─── InlineAudio ─── */
function InlineAudio({ url }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.playbackRate = 0.9; audioRef.current.play(); setPlaying(true); }
  };

  if (!url) return (
    <div className="hd-audio-unavail">
      <Volume2 size={14} />
      <span>Audio indisponible</span>
    </div>
  );

  return (
    <div className="hd-audio-wrap">
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      <button className="hd-audio-btn" onClick={toggle}>
        {playing ? <Pause size={14} /> : <Volume2 size={14} />}
        {playing ? "Pause" : "Écouter la récitation"}
      </button>
      <span className="hd-audio-rate">0.9×</span>
    </div>
  );
}

/* ─── useAudioRecorder ─── */
function useAudioRecorder() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    setIsSupported(!!(typeof window !== "undefined" && navigator.mediaDevices?.getUserMedia));
  }, []);

  const startRecording = async () => {
    if (!isSupported || isRecording) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      const chunks = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    } catch (e) {
      setError("Impossible d'accéder au micro.");
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const resetRecording = () => {
    if (isRecording) stopRecording();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null); setElapsed(0); setError(null);
    if (playerRef.current) { playerRef.current.pause(); playerRef.current.currentTime = 0; }
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
  }, [audioUrl]);

  return { isSupported, isRecording, audioUrl, error, elapsed, startRecording, stopRecording, resetRecording, playerRef };
}

const SCHOOL_META_DARK = {
  Hanafi:  { label: "Hanafite",  color: "#4a9fc8" },
  Maliki:  { label: "Malikite",  color: "#4a9f82" },
  Shafi:   { label: "Chafi'ite", color: "#9f7ae0" },
  Hanbali: { label: "Hanbalite", color: "#c9a84c" },
};
const SCHOOL_META_LIGHT = {
  Hanafi:  { label: "Hanafite",  color: "#2a7ab0" },
  Maliki:  { label: "Malikite",  color: "#2d8c6a" },
  Shafi:   { label: "Chafi'ite", color: "#7c56c8" },
  Hanbali: { label: "Hanbalite", color: "#a07d28" },
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function HadithDetail() {
  const hadithNumber = useHadithNumberFromRouter();
  const { user } = useAuth();

  const [hadith, setHadith]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [progress, setProgress]       = useState(null);
  const [hasProgress, setHasProgress] = useState(false);
  const [hideFR, setHideFR]           = useState(false);
  const [isDark, setIsDark]           = useState(true);

  const [unlockedNarrators, setUnlockedNarrators] = useState([]);
  const [showUnlockModal, setShowUnlockModal]     = useState(false);

  const SCHOOL_META = isDark ? SCHOOL_META_DARK : SCHOOL_META_LIGHT;
  const hasReviewPlan = !!progress?.next_review_date;

  const [visibleArabic, hiddenArabic] = useMemo(() => {
    const full = hadith?.arabic_text || "";
    if (!full) return ["", ""];
    const words = full.split(" ");
    if (words.length <= 8) return [full, ""];
    return [words.slice(0, 8).join(" "), words.slice(8).join(" ")];
  }, [hadith?.arabic_text]);

  const {
    isSupported: isRecSupported, isRecording, audioUrl, error: recError,
    elapsed, startRecording, stopRecording, resetRecording, playerRef,
  } = useAudioRecorder();

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

  const localSeed = useMemo(() => (
    HADITHS_TAHARA.find(h => h.number === hadithNumber) ||
    HADITHS_SALAT.find(h => h.number === hadithNumber) ||
    null
  ), [hadithNumber]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setHadith(null); setProgress(null); setHasProgress(false);
      try {
        const { data: rows, error } = await supabase
          .from("hadiths").select("id, number, arabic_text, french_text, source, audio_url")
          .eq("number", hadithNumber).limit(1);
        if (error) throw error;

        let full = null;
        if (rows?.length) {
          const row = rows[0];
          const { data: ops } = await supabase
            .from("schools_opinions").select("school, arabic_text, french_text")
            .eq("hadith_id", row.id);
          const opinions = { Hanafi: {}, Maliki: {}, Shafi: {}, Hanbali: {} };
          (ops || []).forEach(o => {
            if (opinions[o.school] !== undefined)
              opinions[o.school] = { ar: o.arabic_text, fr: o.french_text };
          });
          full = { ...row, audio_url: row.audio_url || null, opinions, narratorId: localSeed?.narratorId ?? null };
        } else if (localSeed) {
          full = localSeed;
        }
        if (!full) { if (active) setHadith(null); return; }

        let progRow = null;
        if (user?.id) {
          const { data: p } = await supabase
            .from("user_hadith_progress")
            .select("hadith_number, ease_factor, interval_days, repetitions, next_review_date, last_result, status")
            .eq("user_id", user.id).eq("hadith_number", full.number).maybeSingle();
          if (p) progRow = p;
        } else {
          try { progRow = JSON.parse(localStorage.getItem(`progress_${full.number}`) || "null"); } catch {}
        }

        if (active) { setHadith(full); setProgress(progRow); setHasProgress(!!progRow); }
      } catch (e) {
        console.error(e);
        if (active) { setHadith(localSeed); setProgress(null); setHasProgress(false); }
      } finally {
        if (active) setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    load();
    return () => { active = false; };
  }, [hadithNumber, localSeed, user?.id]);

  const handleHadithMastered = hadithNum => {
    const narratorId = hadith?.narratorId ?? null;
    if (!narratorId) return;
    const raw = localStorage.getItem("unlocked_narrators");
    let ids = [];
    try { ids = raw ? JSON.parse(raw) : []; } catch {}
    if (ids.includes(narratorId)) return;
    localStorage.setItem("unlocked_narrators", JSON.stringify([...ids, narratorId]));
    const narrator = NARRATORS_MOCK.find(n => n.id === narratorId);
    if (!narrator) return;
    setUnlockedNarrators([narrator]);
    setShowUnlockModal(true);
  };

  const handleQuality = async quality => {
    if (!hadith) return;
    setSaving(true);
    try {
      const userId = user?.id || null;
      const base = progress || { ease_factor: 2.5, interval_days: 0, repetitions: 0 };
      const calc = nextReview({ ease_factor: base.ease_factor, interval_days: base.interval_days, repetitions: base.repetitions }, quality);
      const payload = {
        user_id: userId,
        hadith_number: hadith.number,
        status: quality >= 4 ? "learned" : "learning",
        ease_factor: calc.ease_factor ?? calc.ease ?? base.ease_factor ?? 2.5,
        interval_days: calc.interval_days ?? 0,
        repetitions: calc.repetitions ?? 0,
        next_review_date: calc.next_review_date ?? null,
        last_review_date: new Date().toISOString().slice(0, 10),
        last_result: quality,
      };
      if (userId) { const { error } = await supabase.from("user_hadith_progress").upsert(payload); if (error) throw error; }
      else localStorage.setItem(`progress_${hadith.number}`, JSON.stringify(payload));
      setProgress(payload); setHasProgress(true);
      if (quality >= 4) handleHadithMastered(hadith.number);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading || !hadith) return (
    <>
      <HadithStyles isDark={isDark} />
      <div className={`hd-root ${isDark ? "hd-dark" : "hd-light"}`}>
        <div className="hd-skeleton" />
        <div className="hd-skeleton" style={{ height: 200 }} />
      </div>
    </>
  );

  const qualityLabels = [
    { value: 0, label: "Oublié",            emoji: "❌" },
    { value: 1, label: "Très difficile",    emoji: "😰" },
    { value: 2, label: "Difficile",         emoji: "😕" },
    { value: 3, label: "Avec effort",       emoji: "🤔" },
    { value: 4, label: "Je le connais bien",emoji: "😊" },
    { value: 5, label: "Maîtrisé",          emoji: "✨" },
  ];

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const themeClass = isDark ? "hd-dark" : "hd-light";

  return (
    <TooltipProvider>
      <HadithStyles isDark={isDark} />
      <div className={`hd-root ${themeClass}`}>

        {/* ── Top bar ── */}
        <header className="hd-topbar">
          <div className="hd-topbar-left">
            <div className="hd-book-icon"><BookOpen size={16} /></div>
            <div>
              <div className="hd-topbar-meta">
                <span className="hd-badge-umdat">Umdat al-Ahkam</span>
                {hadith.source && <span className="hd-source">{hadith.source}</span>}
              </div>
              <h1 className="hd-title">Hadith <span className="hd-title-num">{hadith.number}</span></h1>
            </div>
          </div>

          <button className="hd-theme-btn" onClick={toggleTheme} aria-label="Changer de thème">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
          </button>
        </header>

        {/* ── Arabic text card ── */}
        <section className="hd-card hd-text-card">
          <div className="hd-card-header">
            <span className="hd-card-icon"><Sparkles size={14} /></span>
            <span>Texte & Récitation</span>
          </div>

          <div className="hd-arabic-block">
            <div className="hd-arabic-ornament" aria-hidden="true">❧</div>
            <p className="hd-arabic" dir="rtl">
              {!isRecording && hadith.arabic_text}
              {isRecording && (
                <>
                  <span>{visibleArabic}</span>
                  {hiddenArabic && <span className="hd-arabic-blur">{" "}{hiddenArabic}</span>}
                </>
              )}
            </p>
            {isRecording && <p className="hd-blur-hint">Le texte est partiellement masqué pour t'aider à réciter de mémoire.</p>}
          </div>

          <div className="hd-controls-row">
            <InlineAudio url={hadith.audio_url} />
            <button className="hd-toggle-btn" onClick={() => setHideFR(v => !v)}>
              {hideFR ? <Eye size={13} /> : <EyeOff size={13} />}
              {hideFR ? "Afficher la traduction" : "Masquer la traduction"}
            </button>
          </div>

          {!hideFR && (
            <div className="hd-french-block">
              <p className="hd-french">{hadith.french_text}</p>
            </div>
          )}

          <div className="hd-recorder">
            <div className="hd-recorder-header">
              <div className="hd-rec-icon-wrap"><Mic size={14} /></div>
              <div className="hd-recorder-info">
                <span className="hd-recorder-title">Ta récitation</span>
                <span className="hd-recorder-sub">Stockée localement — non envoyée</span>
              </div>
              <span className="hd-timer">{minutes}:{seconds}</span>
            </div>

            {!isRecSupported && <p className="hd-rec-error">Ton navigateur ne supporte pas l'enregistrement audio.</p>}

            {isRecSupported && (
              <div className="hd-rec-controls">
                {!isRecording ? (
                  <button className="hd-btn-record" onClick={startRecording}><Mic size={13} /> Commencer</button>
                ) : (
                  <button className="hd-btn-stop" onClick={stopRecording}><Square size={13} /> Arrêter</button>
                )}
                {audioUrl && !isRecording && (
                  <>
                    <button className="hd-btn-ghost-sm" onClick={() => { if (playerRef.current) { playerRef.current.currentTime = 0; playerRef.current.play(); } }}>
                      <Play size={13} /> Réécouter
                    </button>
                    <button className="hd-btn-ghost-sm hd-btn-reset" onClick={resetRecording}>
                      <RotateCcw size={12} /> Effacer
                    </button>
                  </>
                )}
              </div>
            )}

            {recError && <p className="hd-rec-error">{recError}</p>}
            {audioUrl && <audio ref={playerRef} src={audioUrl} className="hd-audio-player" controls />}
          </div>
        </section>

        {/* ── Schools opinions ── */}
        {hadith.opinions && (
          <section className="hd-card">
            <div className="hd-card-header">
              <span className="hd-card-icon"><Scale3d size={14} /></span>
              <span>Avis des quatre écoles juridiques</span>
            </div>

            <Tabs defaultValue="Hanafi" className="hd-tabs">
              <TabsList className="hd-tabs-list">
                {Object.entries(SCHOOL_META).map(([key, { label, color }]) => (
                  <TabsTrigger key={key} value={key} className="hd-tab-trigger" style={{ "--school-clr": color }}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(SCHOOL_META).map(([key, { color }]) => (
                <TabsContent key={key} value={key} className="hd-tab-content">
                  <div className="hd-school-grid">
                    {[
                      { lang: "النص الفقهي", badge: "عربي", text: hadith.opinions?.[key]?.ar, isAr: true },
                      { lang: "Texte français", badge: "FR", text: hadith.opinions?.[key]?.fr, isAr: false },
                    ].map(({ lang, badge, text, isAr }) => (
                      <div key={lang} className="hd-school-panel" style={{ "--school-clr": color }}>
                        <div className="hd-school-panel-head">
                          <span>{lang}</span>
                          <span className="hd-school-badge">{badge}</span>
                        </div>
                        <ScrollArea className="hd-school-scroll">
                          <p className={isAr ? "hd-school-ar" : "hd-school-fr"} dir={isAr ? "rtl" : undefined}>
                            {text || "—"}
                          </p>
                        </ScrollArea>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>
        )}

        {/* ── Auto-evaluation ── */}
        {!hasProgress && (
          <section className="hd-card">
            <div className="hd-card-header">
              <span className="hd-card-icon"><CheckCircle2 size={14} /></span>
              <span>Auto-évaluation · SM-2</span>
            </div>
            <p className="hd-eval-desc">Répète le hadith de mémoire, puis choisis une note. Cela planifie tes révisions.</p>

            {!hasReviewPlan && (
              <div className="hd-quality-grid">
                {qualityLabels.map(q => (
                  <Tooltip key={q.value}>
                    <TooltipTrigger asChild>
                      <button
                        className={`hd-quality-btn ${q.value >= 4 ? "hd-quality-btn--good" : ""}`}
                        onClick={() => handleQuality(q.value)}
                        disabled={saving}
                      >
                        <span className="hd-quality-emoji">{q.emoji}</span>
                        <span className="hd-quality-num">{q.value}</span>
                        <span className="hd-quality-label">{q.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">{q.label}</p></TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}

            {hasReviewPlan && (
              <div className="hd-notice hd-notice--info">
                <CheckCircle2 size={15} />
                <span>Ce hadith a déjà été évalué. Retrouve-le dans l'onglet <strong>Révision</strong>.</span>
              </div>
            )}

            {progress?.next_review_date && (
              <div className="hd-notice hd-notice--review">
                <Clock size={15} />
                <div>
                  <strong>Prochaine révision :</strong> {progress.next_review_date}
                  &nbsp;·&nbsp;{progress.status === "learned" ? "✅ Appris" : "📚 En cours"}
                  &nbsp;·&nbsp;{progress.repetitions} révision{progress.repetitions > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </section>
        )}

        {hasProgress && progress?.next_review_date && (
          <div className="hd-notice hd-notice--review">
            <Clock size={15} />
            <div>Ce hadith est dans ton planning.&nbsp;Prochaine révision : <strong>{progress.next_review_date}</strong></div>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="hd-nav">
          <Link
            to={`/hadith/${hadith.number - 1}`}
            className={`hd-nav-btn ${hadith.number <= 1 ? "hd-nav-btn--disabled" : ""}`}
            aria-disabled={hadith.number <= 1}
            onClick={e => hadith.number <= 1 && e.preventDefault()}
          >
            <ChevronLeft size={16} /> Précédent
          </Link>
          <Link to="/learn" className="hd-nav-btn hd-nav-btn--center">
            <RotateCcw size={14} /> Tous les hadiths
          </Link>
          <Link to={`/hadith/${hadith.number + 1}`} className="hd-nav-btn">
            Suivant <ChevronRight size={16} />
          </Link>
        </nav>

      </div>

      {/* ── Unlock modal ── */}
      {showUnlockModal && unlockedNarrators.length > 0 && (
        <div className="hd-modal-backdrop" onClick={() => setShowUnlockModal(false)}>
          <div className="hd-modal" onClick={e => e.stopPropagation()}>
            <button className="hd-modal-close" onClick={() => setShowUnlockModal(false)}>✕</button>
            <div className="hd-modal-header">
              <Sparkles size={18} className="hd-modal-sparkle" />
              <div>
                <h2 className="hd-modal-title">Nouveau rapporteur débloqué !</h2>
                <p className="hd-modal-sub">Tu viens d'ajouter un maillon à ta chaîne de transmission 📜</p>
              </div>
            </div>
            <div className="hd-modal-narrators">
              {unlockedNarrators.map(n => (
                <div key={n.id} className="hd-narrator-card">
                  <div className="hd-narrator-row">
                    <span className="hd-narrator-name">{n.name_fr || n.name}</span>
                    {n.kunya && <span className="hd-narrator-kunya">{n.kunya}</span>}
                  </div>
                  {n.short_bio && <p className="hd-narrator-bio">{n.short_bio}</p>}
                  {(n.death_year || n.death_year_h || n.death_hijri) && (
                    <p className="hd-narrator-death">
                      Décès :&nbsp;{n.death_year ? `${n.death_year} EC` : ""}
                      {n.death_year && (n.death_year_h || n.death_hijri) ? " · " : ""}
                      {(n.death_year_h || n.death_hijri) ? `${n.death_year_h || n.death_hijri} H` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button className="hd-modal-cta" onClick={() => setShowUnlockModal(false)}>
              Voir ma collection de rapporteurs
            </button>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}

/* ═══════════════════════════════════════ */
function HadithStyles({ isDark }) {
  const dark = `
    .hd-dark {
      --bg:         #0d1117;
      --surface:    #161c24;
      --surface2:   #1e2630;
      --border:     rgba(255,255,255,.07);
      --border2:    rgba(255,255,255,.13);
      --fg:         #e8e0d0;
      --muted:      #7a8694;
      --gold:       #c9a84c;
      --gold-dim:   rgba(201,168,76,.14);
      --amber:      #e08a3c;
      --accent:     #4a9f82;
      --accent-dim: rgba(74,159,130,.13);
      --danger:     #c95a4a;
    }
    .hd-dark .hd-theme-btn { background: rgba(255,255,255,.07); border-color: rgba(201,168,76,.2); color: #c9a84c; }
    .hd-dark .hd-theme-btn:hover { background: rgba(201,168,76,.12); }
    .hd-dark .hd-book-icon { background: linear-gradient(135deg, #4a9f82, #2d7a62); }
    .hd-dark .hd-badge-umdat { background: rgba(201,168,76,.14); color: #c9a84c; border-color: rgba(201,168,76,.3); }
    .hd-dark .hd-title    { color: #e8e0d0; }
    .hd-dark .hd-title-num { color: #c9a84c; }
    .hd-dark .hd-source   { color: #7a8694; }
    .hd-dark .hd-topbar   { border-bottom-color: rgba(255,255,255,.13); }
    .hd-dark .hd-card     { background: #161c24; border-color: rgba(255,255,255,.07); }
    .hd-dark .hd-card-header { color: #c9a84c; border-bottom-color: rgba(255,255,255,.07); }
    .hd-dark .hd-text-card::before { background: linear-gradient(90deg, #c9a84c, transparent); }
    .hd-dark .hd-arabic-block { background: linear-gradient(135deg, #1e2630 0%, rgba(201,168,76,.05) 100%); border-color: rgba(255,255,255,.13); }
    .hd-dark .hd-arabic  { color: #e8e0d0; }
    .hd-dark .hd-blur-hint { color: #e08a3c; }
    .hd-dark .hd-audio-btn { background: linear-gradient(135deg, #4a9f82, #2d7a62); }
    .hd-dark .hd-audio-rate { background: #1e2630; border-color: rgba(255,255,255,.13); color: #7a8694; }
    .hd-dark .hd-audio-unavail { color: #7a8694; }
    .hd-dark .hd-toggle-btn { border-color: rgba(255,255,255,.13); color: #7a8694; }
    .hd-dark .hd-toggle-btn:hover { border-color: #c9a84c; color: #c9a84c; }
    .hd-dark .hd-french-block { background: #1e2630; border-left-color: #c9a84c; }
    .hd-dark .hd-french  { color: #e8e0d0; }
    .hd-dark .hd-recorder { background: #1e2630; border-color: rgba(255,255,255,.07); }
    .hd-dark .hd-rec-icon-wrap { background: linear-gradient(135deg, #4a9f82, #2d7a62); }
    .hd-dark .hd-recorder-title { color: #e8e0d0; }
    .hd-dark .hd-recorder-sub   { color: #7a8694; }
    .hd-dark .hd-timer    { color: #7a8694; }
    .hd-dark .hd-btn-record { background: linear-gradient(135deg, #4a9f82, #2d7a62); }
    .hd-dark .hd-btn-stop   { background: #c95a4a; }
    .hd-dark .hd-btn-ghost-sm { border-color: rgba(255,255,255,.13); color: #7a8694; }
    .hd-dark .hd-btn-ghost-sm:hover { border-color: #c9a84c; color: #c9a84c; }
    .hd-dark .hd-btn-reset:hover { border-color: #c95a4a; color: #c95a4a; }
    .hd-dark .hd-tabs-list { background: #1e2630; border-color: rgba(255,255,255,.07); }
    .hd-dark .hd-tab-trigger { color: #7a8694; }
    .hd-dark .hd-tab-trigger[data-state="active"] { color: #0d1117; }
    .hd-dark .hd-school-panel { background: #1e2630; }
    .hd-dark .hd-school-panel-head { border-bottom-color: rgba(255,255,255,.07); color: #7a8694; }
    .hd-dark .hd-school-ar { color: #e8e0d0; }
    .hd-dark .hd-school-fr { color: #e8e0d0; }
    .hd-dark .hd-eval-desc { color: #7a8694; }
    .hd-dark .hd-quality-btn { background: #1e2630; border-color: rgba(255,255,255,.13); }
    .hd-dark .hd-quality-btn:hover { border-color: #c9a84c; }
    .hd-dark .hd-quality-btn--good { background: rgba(74,159,130,.13); border-color: rgba(74,159,130,.35); }
    .hd-dark .hd-quality-num   { color: #e8e0d0; }
    .hd-dark .hd-quality-label { color: #7a8694; }
    .hd-dark .hd-notice--info { background: #1e2630; border-color: rgba(255,255,255,.13); color: #7a8694; }
    .hd-dark .hd-notice--review { background: rgba(74,159,130,.13); border-color: rgba(74,159,130,.3); color: #e8e0d0; }
    .hd-dark .hd-notice--review svg { color: #4a9f82; }
    .hd-dark .hd-nav { border-top-color: rgba(255,255,255,.07); }
    .hd-dark .hd-nav-btn { background: #161c24; border-color: rgba(255,255,255,.13); color: #e8e0d0; }
    .hd-dark .hd-nav-btn:hover { border-color: #c9a84c; color: #c9a84c; }
    .hd-dark .hd-nav-btn--center { color: #7a8694; }
    .hd-dark .hd-skeleton { background: #161c24; }
    .hd-dark .hd-modal { background: linear-gradient(135deg, #1a2030, #161c24); border-color: rgba(255,255,255,.13); border-top-color: #c9a84c; }
    .hd-dark .hd-modal-close { background: #1e2630; border-color: rgba(255,255,255,.13); color: #7a8694; }
    .hd-dark .hd-modal-close:hover { color: #e8e0d0; }
    .hd-dark .hd-modal-title { color: #e8e0d0; }
    .hd-dark .hd-modal-sub   { color: #7a8694; }
    .hd-dark .hd-modal-sparkle { color: #c9a84c; }
    .hd-dark .hd-narrator-card { background: #1e2630; border-color: rgba(255,255,255,.07); }
    .hd-dark .hd-narrator-name { color: #e8e0d0; }
    .hd-dark .hd-narrator-kunya { color: #c9a84c; background: rgba(201,168,76,.14); border-color: rgba(201,168,76,.25); }
    .hd-dark .hd-narrator-bio  { color: #7a8694; }
    .hd-dark .hd-narrator-death { color: #7a8694; }
    .hd-dark .hd-modal-cta { background: linear-gradient(135deg, #4a9f82, #2d7a62); }
    .hd-dark .hd-rec-error { color: #c95a4a; }
  `;

  const light = `
    .hd-light {
      --bg:         #fdf8f0;
      --surface:    #ffffff;
      --surface2:   #fef6e4;
      --border:     rgba(160,125,40,.13);
      --border2:    rgba(160,125,40,.25);
      --fg:         #2c2416;
      --muted:      #7a6d58;
      --gold:       #a07d28;
      --gold-dim:   rgba(160,125,40,.1);
      --amber:      #bf6a1a;
      --accent:     #2d8c6a;
      --accent-dim: rgba(45,140,106,.1);
      --danger:     #a83030;
    }
    .hd-light .hd-theme-btn { background: rgba(160,125,40,.08); border-color: rgba(124,86,200,.2); color: #7c56c8; }
    .hd-light .hd-theme-btn:hover { background: rgba(124,86,200,.1); }
    .hd-light .hd-book-icon { background: linear-gradient(135deg, #2d8c6a, #1e6a50); }
    .hd-light .hd-badge-umdat { background: rgba(160,125,40,.1); color: #a07d28; border-color: rgba(160,125,40,.28); }
    .hd-light .hd-title    { color: #1e1810; }
    .hd-light .hd-title-num { color: #a07d28; }
    .hd-light .hd-source   { color: #7a6d58; }
    .hd-light .hd-topbar   { border-bottom-color: rgba(160,125,40,.15); }
    .hd-light .hd-card     { background: #ffffff; border-color: rgba(160,125,40,.13); box-shadow: 0 1px 6px rgba(160,125,40,.06); }
    .hd-light .hd-card-header { color: #a07d28; border-bottom-color: rgba(160,125,40,.1); }
    .hd-light .hd-text-card::before { background: linear-gradient(90deg, #a07d28, transparent); }
    .hd-light .hd-arabic-block { background: linear-gradient(135deg, #fef6e4 0%, rgba(160,125,40,.04) 100%); border-color: rgba(160,125,40,.2); }
    .hd-light .hd-arabic  { color: #1e1810; }
    .hd-light .hd-blur-hint { color: #bf6a1a; }
    .hd-light .hd-audio-btn { background: linear-gradient(135deg, #2d8c6a, #1e6a50); }
    .hd-light .hd-audio-rate { background: #fef6e4; border-color: rgba(160,125,40,.2); color: #7a6d58; }
    .hd-light .hd-audio-unavail { color: #7a6d58; }
    .hd-light .hd-toggle-btn { border-color: rgba(160,125,40,.22); color: #7a6d58; }
    .hd-light .hd-toggle-btn:hover { border-color: #a07d28; color: #a07d28; }
    .hd-light .hd-french-block { background: #fef6e4; border-left-color: #a07d28; }
    .hd-light .hd-french  { color: #1e1810; }
    .hd-light .hd-recorder { background: #fef6e4; border-color: rgba(160,125,40,.13); }
    .hd-light .hd-rec-icon-wrap { background: linear-gradient(135deg, #2d8c6a, #1e6a50); }
    .hd-light .hd-recorder-title { color: #1e1810; }
    .hd-light .hd-recorder-sub   { color: #7a6d58; }
    .hd-light .hd-timer    { color: #7a6d58; }
    .hd-light .hd-btn-record { background: linear-gradient(135deg, #2d8c6a, #1e6a50); }
    .hd-light .hd-btn-stop   { background: #a83030; }
    .hd-light .hd-btn-ghost-sm { border-color: rgba(160,125,40,.22); color: #7a6d58; }
    .hd-light .hd-btn-ghost-sm:hover { border-color: #a07d28; color: #a07d28; }
    .hd-light .hd-btn-reset:hover { border-color: #a83030; color: #a83030; }
    .hd-light .hd-tabs-list { background: #fef6e4; border-color: rgba(160,125,40,.13); }
    .hd-light .hd-tab-trigger { color: #7a6d58; }
    .hd-light .hd-tab-trigger[data-state="active"] { color: #ffffff; }
    .hd-light .hd-school-panel { background: #fef6e4; }
    .hd-light .hd-school-panel-head { border-bottom-color: rgba(160,125,40,.1); color: #7a6d58; }
    .hd-light .hd-school-ar { color: #1e1810; }
    .hd-light .hd-school-fr { color: #1e1810; }
    .hd-light .hd-eval-desc { color: #7a6d58; }
    .hd-light .hd-quality-btn { background: #fef6e4; border-color: rgba(160,125,40,.2); }
    .hd-light .hd-quality-btn:hover { border-color: #a07d28; }
    .hd-light .hd-quality-btn--good { background: rgba(45,140,106,.08); border-color: rgba(45,140,106,.28); }
    .hd-light .hd-quality-num   { color: #1e1810; }
    .hd-light .hd-quality-label { color: #7a6d58; }
    .hd-light .hd-notice--info { background: #fef6e4; border-color: rgba(160,125,40,.2); color: #7a6d58; }
    .hd-light .hd-notice--review { background: rgba(45,140,106,.08); border-color: rgba(45,140,106,.25); color: #1e1810; }
    .hd-light .hd-notice--review svg { color: #2d8c6a; }
    .hd-light .hd-nav { border-top-color: rgba(160,125,40,.13); }
    .hd-light .hd-nav-btn { background: #ffffff; border-color: rgba(160,125,40,.22); color: #2c2416; box-shadow: 0 1px 4px rgba(160,125,40,.06); }
    .hd-light .hd-nav-btn:hover { border-color: #a07d28; color: #a07d28; }
    .hd-light .hd-nav-btn--center { color: #7a6d58; }
    .hd-light .hd-skeleton { background: #ffffff; }
    .hd-light .hd-modal { background: linear-gradient(135deg, #ffffff, #fef6e4); border-color: rgba(160,125,40,.2); border-top-color: #a07d28; box-shadow: 0 24px 64px rgba(160,125,40,.15); }
    .hd-light .hd-modal-close { background: #fef6e4; border-color: rgba(160,125,40,.2); color: #7a6d58; }
    .hd-light .hd-modal-close:hover { color: #1e1810; }
    .hd-light .hd-modal-title { color: #1e1810; }
    .hd-light .hd-modal-sub   { color: #7a6d58; }
    .hd-light .hd-modal-sparkle { color: #a07d28; }
    .hd-light .hd-narrator-card { background: #fef6e4; border-color: rgba(160,125,40,.13); }
    .hd-light .hd-narrator-name { color: #1e1810; }
    .hd-light .hd-narrator-kunya { color: #a07d28; background: rgba(160,125,40,.1); border-color: rgba(160,125,40,.25); }
    .hd-light .hd-narrator-bio  { color: #7a6d58; }
    .hd-light .hd-narrator-death { color: #7a6d58; }
    .hd-light .hd-modal-cta { background: linear-gradient(135deg, #2d8c6a, #1e6a50); }
    .hd-light .hd-rec-error { color: #a83030; }
  `;

  return (
    <style>{`
      .hd-root {
        --serif: Georgia, 'Times New Roman', serif;
        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 860px;
        margin: 0 auto;
        padding: 1.2rem 1rem 5rem;
        display: flex; flex-direction: column; gap: 1.25rem;
        transition: background .3s ease, color .3s ease;
      }

      /* ── topbar ── */
      .hd-topbar {
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both; transition: border-color .3s;
      }
      .hd-topbar-left { display: flex; align-items: center; gap: .85rem; }
      .hd-book-icon {
        width: 38px; height: 38px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; flex-shrink: 0; transition: background .3s;
      }
      .hd-topbar-meta { display: flex; align-items: center; gap: .5rem; margin-bottom: .25rem; }
      .hd-badge-umdat {
        font-size: .68rem; border: 1px solid transparent;
        border-radius: 20px; padding: 1px 8px; letter-spacing: .04em;
        transition: background .3s, color .3s;
      }
      .hd-source { font-size: .72rem; font-style: italic; transition: color .3s; }
      .hd-title  { font-size: 1.5rem; font-weight: 700; margin: 0; line-height: 1.1; transition: color .3s; }
      .hd-title-num { transition: color .3s; }

      .hd-theme-btn {
        display: flex; align-items: center; gap: .4rem;
        border: 1px solid transparent; border-radius: 20px;
        padding: .35rem .75rem; font-size: .78rem;
        font-family: var(--serif); font-weight: 600; cursor: pointer;
        transition: background .2s, color .2s, transform .15s;
        flex-shrink: 0;
      }
      .hd-theme-btn:hover { transform: translateY(-1px); }

      /* ── cards ── */
      .hd-card {
        border: 1px solid var(--border); border-radius: 16px; padding: 1.3rem;
        display: flex; flex-direction: column; gap: 1.1rem;
        animation: fadeUp .4s ease both; transition: background .3s, border-color .3s, box-shadow .3s;
      }
      .hd-card-header {
        display: flex; align-items: center; gap: .5rem;
        font-size: .72rem; text-transform: uppercase; letter-spacing: .09em;
        font-style: italic; padding-bottom: .9rem; border-bottom: 1px solid var(--border);
        transition: color .3s, border-color .3s;
      }
      .hd-card-icon { opacity: .8; }

      /* ── arabic ── */
      .hd-text-card { position: relative; overflow: hidden; }
      .hd-text-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
        border-radius: 16px 16px 0 0; transition: background .3s;
      }
      .hd-arabic-block {
        border: 1px solid var(--border2); border-radius: 12px;
        padding: 1.75rem 1.5rem; text-align: center; position: relative;
        transition: background .3s, border-color .3s;
      }
      .hd-arabic-ornament {
        position: absolute; top: .6rem; left: 50%; transform: translateX(-50%);
        color: var(--gold); opacity: .2; font-size: 1.2rem; line-height: 1; pointer-events: none;
      }
      .hd-arabic {
        font-size: clamp(1.4rem, 3.5vw, 2.1rem); line-height: 2.4; margin: .5rem 0 0;
        font-family: 'Amiri', 'Scheherazade New', var(--serif);
        letter-spacing: .02em; transition: color .3s;
      }
      .hd-arabic-blur { filter: blur(6px); user-select: none; display: inline; }
      .hd-blur-hint  { margin-top: .75rem; font-size: .72rem; font-style: italic; transition: color .3s; }

      /* ── controls ── */
      .hd-controls-row {
        display: flex; align-items: center; justify-content: space-between;
        gap: .75rem; flex-wrap: wrap;
      }
      .hd-audio-wrap { display: flex; align-items: center; gap: .55rem; }
      .hd-audio-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        color: #fff; border: none; border-radius: 9px;
        padding: .42rem .9rem; font-size: .8rem; font-family: var(--serif);
        cursor: pointer; transition: opacity .15s, transform .15s, background .3s;
      }
      .hd-audio-btn:hover { opacity: .88; transform: translateY(-1px); }
      .hd-audio-rate {
        font-size: .68rem; border: 1px solid transparent; border-radius: 20px; padding: 2px 7px;
        transition: background .3s, border-color .3s, color .3s;
      }
      .hd-audio-unavail { display: flex; align-items: center; gap: .4rem; font-size: .8rem; font-style: italic; transition: color .3s; }
      .hd-toggle-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        background: transparent; border: 1px solid transparent; border-radius: 9px;
        padding: .4rem .85rem; font-size: .78rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s;
      }

      /* ── french ── */
      .hd-french-block { border-left: 3px solid transparent; border-radius: 0 10px 10px 0; padding: 1rem 1.2rem; transition: background .3s, border-color .3s; }
      .hd-french { font-size: .9rem; line-height: 1.75; margin: 0; font-style: italic; transition: color .3s; }

      /* ── recorder ── */
      .hd-recorder { border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: .75rem; transition: background .3s, border-color .3s; }
      .hd-recorder-header { display: flex; align-items: center; gap: .75rem; }
      .hd-rec-icon-wrap { width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; transition: background .3s; }
      .hd-recorder-info { flex: 1; min-width: 0; }
      .hd-recorder-title { display: block; font-size: .83rem; font-weight: 700; transition: color .3s; }
      .hd-recorder-sub   { display: block; font-size: .7rem; transition: color .3s; }
      .hd-timer { font-family: 'Courier New', monospace; font-size: .85rem; flex-shrink: 0; transition: color .3s; }
      .hd-rec-controls { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
      .hd-btn-record {
        display: inline-flex; align-items: center; gap: .4rem;
        color: #fff; border: none; border-radius: 99px;
        padding: .4rem 1rem; font-size: .8rem; font-family: var(--serif); cursor: pointer;
        transition: opacity .15s, background .3s;
      }
      .hd-btn-record:hover { opacity: .85; }
      .hd-btn-stop {
        display: inline-flex; align-items: center; gap: .4rem;
        color: #fff; border: none; border-radius: 99px;
        padding: .4rem 1rem; font-size: .8rem; font-family: var(--serif); cursor: pointer;
        transition: opacity .15s, background .3s;
      }
      .hd-btn-stop:hover { opacity: .85; }
      .hd-btn-ghost-sm {
        display: inline-flex; align-items: center; gap: .35rem;
        background: transparent; border: 1px solid transparent; border-radius: 99px;
        padding: .35rem .8rem; font-size: .75rem; font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s;
      }
      .hd-rec-error { font-size: .75rem; transition: color .3s; }
      .hd-audio-player { width: 100%; height: 36px; opacity: .85; }

      /* ── schools ── */
      .hd-tabs { margin-top: -.25rem; }
      .hd-tabs-list {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: .4rem;
        border: 1px solid var(--border); border-radius: 10px; padding: .3rem;
        transition: background .3s, border-color .3s;
      }
      .hd-tab-trigger {
        background: transparent; border: none; border-radius: 7px;
        padding: .45rem; font-size: .75rem; font-family: var(--serif);
        cursor: pointer; transition: background .15s, color .15s;
      }
      .hd-tab-trigger[data-state="active"] { background: var(--school-clr); font-weight: 700; }
      .hd-tab-content { margin-top: 1rem; }
      .hd-school-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .85rem; }
      @media (max-width: 560px) { .hd-school-grid { grid-template-columns: 1fr; } }
      .hd-school-panel {
        border: 1px solid color-mix(in srgb, var(--school-clr) 25%, transparent);
        border-top: 2px solid var(--school-clr); border-radius: 10px; overflow: hidden;
        transition: background .3s;
      }
      .hd-school-panel-head {
        display: flex; justify-content: space-between; align-items: center;
        padding: .6rem .9rem; border-bottom: 1px solid var(--border);
        font-size: .7rem; text-transform: uppercase; letter-spacing: .06em;
        transition: border-color .3s, color .3s;
      }
      .hd-school-badge { background: color-mix(in srgb, var(--school-clr) 18%, transparent); color: var(--school-clr); border-radius: 20px; padding: 1px 7px; font-size: .65rem; }
      .hd-school-scroll { height: 11rem; }
      .hd-school-ar { padding: .85rem; font-size: 1rem; line-height: 2; transition: color .3s; }
      .hd-school-fr { padding: .85rem; font-size: .85rem; line-height: 1.7; font-style: italic; transition: color .3s; }

      /* ── eval ── */
      .hd-eval-desc { font-size: .82rem; font-style: italic; transition: color .3s; }
      .hd-quality-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: .5rem; }
      @media (max-width: 600px) { .hd-quality-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 380px) { .hd-quality-grid { grid-template-columns: repeat(2, 1fr); } }
      .hd-quality-btn {
        border: 1px solid var(--border2); border-radius: 12px; padding: .85rem .4rem;
        display: flex; flex-direction: column; align-items: center; gap: .3rem; cursor: pointer;
        transition: border-color .15s, transform .15s, background .3s;
      }
      .hd-quality-btn:hover { transform: translateY(-2px); }
      .hd-quality-btn:disabled { opacity: .5; pointer-events: none; }
      .hd-quality-emoji { font-size: 1.6rem; line-height: 1; }
      .hd-quality-num   { font-size: 1.1rem; font-weight: 700; transition: color .3s; }
      .hd-quality-label { font-size: .62rem; text-align: center; line-height: 1.3; transition: color .3s; }

      /* ── notices ── */
      .hd-notice { display: flex; align-items: flex-start; gap: .65rem; border-radius: 10px; padding: .8rem 1rem; font-size: .82rem; line-height: 1.55; transition: background .3s, border-color .3s, color .3s; }
      .hd-notice svg { flex-shrink: 0; margin-top: 1px; }
      .hd-notice--info { border: 1px solid transparent; }
      .hd-notice--review { border: 1px solid transparent; }

      /* ── nav ── */
      .hd-nav { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding-top: .5rem; border-top: 1px solid var(--border); transition: border-color .3s; }
      .hd-nav-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        border: 1px solid transparent; border-radius: 10px;
        padding: .5rem 1rem; font-size: .83rem; font-family: var(--serif); text-decoration: none;
        transition: border-color .15s, color .15s, transform .15s, background .3s;
      }
      .hd-nav-btn:hover { transform: translateY(-1px); }
      .hd-nav-btn--disabled { opacity: .35; pointer-events: none; }
      .hd-nav-btn--center { font-size: .78rem; padding: .45rem .85rem; }

      /* ── skeleton ── */
      .hd-skeleton { height: 100px; border-radius: 16px; animation: pulse 1.4s ease infinite; transition: background .3s; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

      /* ── modal ── */
      .hd-modal-backdrop { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,.65); display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(3px); }
      .hd-modal { border: 1px solid transparent; border-top-width: 2px; border-radius: 18px; padding: 1.5rem; max-width: 440px; width: 100%; position: relative; animation: modalIn .3s ease both; transition: background .3s, border-color .3s; }
      .hd-modal-close { position: absolute; top: .9rem; right: .9rem; border: 1px solid transparent; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: .85rem; cursor: pointer; transition: color .15s, background .3s; }
      .hd-modal-header { display: flex; align-items: flex-start; gap: .75rem; margin-bottom: 1.1rem; }
      .hd-modal-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 .2rem; transition: color .3s; }
      .hd-modal-sub   { font-size: .78rem; font-style: italic; margin: 0; transition: color .3s; }
      .hd-modal-narrators { display: flex; flex-direction: column; gap: .65rem; max-height: 280px; overflow-y: auto; margin-bottom: 1rem; }
      .hd-narrator-card { border: 1px solid var(--border); border-radius: 10px; padding: .8rem; display: flex; flex-direction: column; gap: .3rem; transition: background .3s, border-color .3s; }
      .hd-narrator-row  { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
      .hd-narrator-name { font-weight: 700; font-size: .88rem; transition: color .3s; }
      .hd-narrator-kunya { font-size: .68rem; border: 1px solid transparent; border-radius: 20px; padding: 1px 7px; transition: color .3s, background .3s; }
      .hd-narrator-bio  { font-size: .78rem; line-height: 1.5; transition: color .3s; }
      .hd-narrator-death { font-size: .68rem; transition: color .3s; }
      .hd-modal-cta { width: 100%; color: #fff; border: none; border-radius: 10px; padding: .65rem; font-size: .85rem; font-family: var(--serif); font-weight: 700; cursor: pointer; transition: opacity .15s, background .3s; }
      .hd-modal-cta:hover { opacity: .88; }

      @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes modalIn  { from{opacity:0;transform:scale(.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }

      ${dark}
      ${light}
    `}</style>
  );
}