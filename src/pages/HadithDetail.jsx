// /src/pages/HadithDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play, Pause, Moon, Sun, ChevronLeft, ChevronRight,
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

const SCHOOL_META = {
  Hanafi:  { label: "Hanafite",   color: "#4a9fc8" },
  Maliki:  { label: "Malikite",   color: "#4a9f82" },
  Shafi:   { label: "Chafi'ite",  color: "#9f7ae0" },
  Hanbali: { label: "Hanbalite",  color: "#c9a84c" },
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
  const [dark, setDark]               = useState(true);

  const [unlockedNarrators, setUnlockedNarrators] = useState([]);
  const [showUnlockModal, setShowUnlockModal]     = useState(false);

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

  // theme
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  const toggleTheme = checked => {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  const localSeed = useMemo(() => {
  return (
    HADITHS_TAHARA.find(h => h.number === hadithNumber) ||
    HADITHS_SALAT.find(h => h.number === hadithNumber) ||
    null
  );
}, [hadithNumber]);

  // load hadith + progress
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setHadith(null); setProgress(null); setHasProgress(false);
      try {
        const { data: rows, error } = await supabase
          .from("hadiths")
          .select("id, number, arabic_text, french_text, source, audio_url")
          .eq("number", hadithNumber).limit(1);
        if (error) throw error;

        let full = null;
        if (rows?.length) {
          const row = rows[0];
          const { data: ops } = await supabase
            .from("schools_opinions")
            .select("school, arabic_text, french_text")
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
    const seedHadith = hadith;
    const narratorId = seedHadith?.narratorId ?? null;
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
      const calc = nextReview(
  {
    ease_factor: base.ease_factor,
    interval_days: base.interval_days,
    repetitions: base.repetitions,
  },
  quality
);

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

  /* ── loading ── */
  if (loading || !hadith) return (
    <>
      <HadithStyles />
      <div className="hd-root">
        <div className="hd-skeleton" />
        <div className="hd-skeleton" style={{ height: 200 }} />
      </div>
    </>
  );

  const qualityLabels = [
    { value: 0, label: "Oublié",                       emoji: "❌" },
    { value: 1, label: "Très difficile",               emoji: "😰" },
    { value: 2, label: "Difficile",                    emoji: "😕" },
    { value: 3, label: "Avec effort",                  emoji: "🤔" },
    { value: 4, label: "Je le connais bien",           emoji: "😊" },
    { value: 5, label: "Maîtrisé",                     emoji: "✨" },
  ];

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <TooltipProvider>
      <HadithStyles />
      <div className="hd-root">

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

          <div className="hd-theme-toggle">
            <Sun size={13} />
            <Switch checked={dark} onCheckedChange={toggleTheme} />
            <Moon size={13} />
          </div>
        </header>

        {/* ── Arabic text card ── */}
        <section className="hd-card hd-text-card">
          <div className="hd-card-header">
            <span className="hd-card-icon"><Sparkles size={14} /></span>
            <span>Texte & Récitation</span>
          </div>

          {/* Arabic */}
          <div className="hd-arabic-block">
            <div className="hd-arabic-ornament" aria-hidden="true">❧</div>
            <p className="hd-arabic" dir="rtl">
              {!isRecording && hadith.arabic_text}
              {isRecording && (
                <>
                  <span>{visibleArabic}</span>
                  {hiddenArabic && (
                    <span className="hd-arabic-blur">{" "}{hiddenArabic}</span>
                  )}
                </>
              )}
            </p>
            {isRecording && (
              <p className="hd-blur-hint">
                Le texte est partiellement masqué pour t'aider à réciter de mémoire.
              </p>
            )}
          </div>

          {/* Controls row */}
          <div className="hd-controls-row">
            <InlineAudio url={hadith.audio_url} />
            <button className="hd-toggle-btn" onClick={() => setHideFR(v => !v)}>
              {hideFR ? <Eye size={13} /> : <EyeOff size={13} />}
              {hideFR ? "Afficher la traduction" : "Masquer la traduction"}
            </button>
          </div>

          {/* French translation */}
          {!hideFR && (
            <div className="hd-french-block">
              <p className="hd-french">{hadith.french_text}</p>
            </div>
          )}

          {/* Recorder */}
          <div className="hd-recorder">
            <div className="hd-recorder-header">
              <div className="hd-rec-icon-wrap"><Mic size={14} /></div>
              <div className="hd-recorder-info">
                <span className="hd-recorder-title">Ta récitation</span>
                <span className="hd-recorder-sub">Stockée localement — non envoyée</span>
              </div>
              <span className="hd-timer">{minutes}:{seconds}</span>
            </div>

            {!isRecSupported && (
              <p className="hd-rec-error">Ton navigateur ne supporte pas l'enregistrement audio.</p>
            )}

            {isRecSupported && (
              <div className="hd-rec-controls">
                {!isRecording ? (
                  <button className="hd-btn-record" onClick={startRecording}>
                    <Mic size={13} /> Commencer
                  </button>
                ) : (
                  <button className="hd-btn-stop" onClick={stopRecording}>
                    <Square size={13} /> Arrêter
                  </button>
                )}

                {audioUrl && !isRecording && (
                  <>
                    <button className="hd-btn-ghost-sm" onClick={() => {
                      if (playerRef.current) { playerRef.current.currentTime = 0; playerRef.current.play(); }
                    }}>
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
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="hd-tab-trigger"
                    style={{ "--school-clr": color }}
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(SCHOOL_META).map(([key, { color }]) => (
                <TabsContent key={key} value={key} className="hd-tab-content">
                  <div className="hd-school-grid">
                    <div className="hd-school-panel" style={{ "--school-clr": color }}>
                      <div className="hd-school-panel-head">
                        <span>النص الفقهي</span>
                        <span className="hd-school-badge">عربي</span>
                      </div>
                      <ScrollArea className="hd-school-scroll">
                        <p className="hd-school-ar" dir="rtl">
                          {hadith.opinions?.[key]?.ar || "—"}
                        </p>
                      </ScrollArea>
                    </div>
                    <div className="hd-school-panel" style={{ "--school-clr": color }}>
                      <div className="hd-school-panel-head">
                        <span>Texte français</span>
                        <span className="hd-school-badge">FR</span>
                      </div>
                      <ScrollArea className="hd-school-scroll">
                        <p className="hd-school-fr">
                          {hadith.opinions?.[key]?.fr || "—"}
                        </p>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>
        )}

        {/* ── Auto-evaluation (first time) ── */}
        {!hasProgress && (
          <section className="hd-card">
            <div className="hd-card-header">
              <span className="hd-card-icon"><CheckCircle2 size={14} /></span>
              <span>Auto-évaluation · SM-2</span>
            </div>
            <p className="hd-eval-desc">
              Répète le hadith de mémoire, puis choisis une note. Cela planifie tes révisions.
            </p>

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
                  &nbsp;·&nbsp;
                  {progress.status === "learned" ? "✅ Appris" : "📚 En cours"}
                  &nbsp;·&nbsp;
                  {progress.repetitions} révision{progress.repetitions > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Already has progress ── */}
        {hasProgress && progress?.next_review_date && (
          <div className="hd-notice hd-notice--review">
            <Clock size={15} />
            <div>
              Ce hadith est dans ton planning.&nbsp;
              Prochaine révision : <strong>{progress.next_review_date}</strong>
            </div>
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
                      Décès :&nbsp;
                      {n.death_year ? `${n.death_year} EC` : ""}
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

/* ═══════════════════════════════════════
   SCOPED STYLES
═══════════════════════════════════════ */
function HadithStyles() {
  return (
    <style>{`
      /* ── tokens ── */
      .hd-root {
        --bg:         #0d1117;
        --surface:    #161c24;
        --surface2:   #1e2630;
        --border:     rgba(255,255,255,.07);
        --border2:    rgba(255,255,255,.13);
        --fg:         #e8e0d0;
        --muted:      #7a8694;
        --gold:       #c9a84c;
        --gold-dim:   rgba(201,168,76,.14);
        --gold-dim2:  rgba(201,168,76,.07);
        --amber:      #e08a3c;
        --accent:     #4a9f82;
        --accent-dim: rgba(74,159,130,.13);
        --danger:     #c95a4a;
        --serif:      Georgia, 'Times New Roman', serif;

        font-family: var(--serif);
        background: var(--bg);
        color: var(--fg);
        min-height: 100vh;
        max-width: 860px;
        margin: 0 auto;
        padding: 1.5rem 1rem 5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      /* ── top bar ── */
      .hd-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--border2);
        animation: fadeDown .4s ease both;
      }
      .hd-topbar-left { display: flex; align-items: center; gap: .85rem; }
      .hd-book-icon {
        width: 38px; height: 38px;
        background: linear-gradient(135deg, var(--accent), #2d7a62);
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: #fff;
        flex-shrink: 0;
      }
      .hd-topbar-meta {
        display: flex; align-items: center; gap: .5rem;
        margin-bottom: .25rem;
      }
      .hd-badge-umdat {
        font-size: .68rem;
        background: var(--gold-dim);
        color: var(--gold);
        border: 1px solid rgba(201,168,76,.3);
        border-radius: 20px;
        padding: 1px 8px;
        letter-spacing: .04em;
      }
      .hd-source { font-size: .72rem; color: var(--muted); font-style: italic; }
      .hd-title {
        font-size: 1.5rem; font-weight: 700;
        color: var(--fg); margin: 0; line-height: 1.1;
      }
      .hd-title-num { color: var(--gold); }

      .hd-theme-toggle {
        display: flex; align-items: center; gap: .4rem;
        background: var(--surface);
        border: 1px solid var(--border2);
        border-radius: 99px;
        padding: .3rem .6rem;
        color: var(--muted);
        font-size: .75rem;
        flex-shrink: 0;
      }

      /* ── cards ── */
      .hd-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 1.3rem;
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
        animation: fadeUp .4s ease both;
      }
      .hd-card-header {
        display: flex; align-items: center; gap: .5rem;
        font-size: .72rem;
        text-transform: uppercase;
        letter-spacing: .09em;
        color: var(--gold);
        font-style: italic;
        padding-bottom: .9rem;
        border-bottom: 1px solid var(--border);
      }
      .hd-card-icon { opacity: .8; }

      /* ── arabic block ── */
      .hd-text-card { position: relative; overflow: hidden; }
      .hd-text-card::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, var(--gold), transparent);
        border-radius: 16px 16px 0 0;
      }
      .hd-arabic-block {
        background: linear-gradient(135deg, var(--surface2) 0%, rgba(201,168,76,.05) 100%);
        border: 1px solid var(--border2);
        border-radius: 12px;
        padding: 1.75rem 1.5rem;
        text-align: center;
        position: relative;
      }
      .hd-arabic-ornament {
        position: absolute; top: .6rem; left: 50%;
        transform: translateX(-50%);
        color: var(--gold); opacity: .2;
        font-size: 1.2rem; line-height: 1;
        pointer-events: none;
      }
      .hd-arabic {
        font-size: clamp(1.4rem, 3.5vw, 2.1rem);
        line-height: 2.4;
        color: var(--fg);
        margin: .5rem 0 0;
        font-family: 'Amiri', 'Scheherazade New', var(--serif);
        letter-spacing: .02em;
      }
      .hd-arabic-blur { filter: blur(6px); user-select: none; display: inline; }
      .hd-blur-hint {
        margin-top: .75rem;
        font-size: .72rem;
        color: var(--amber);
        font-style: italic;
      }

      /* ── controls row ── */
      .hd-controls-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        flex-wrap: wrap;
      }
      .hd-audio-wrap { display: flex; align-items: center; gap: .55rem; }
      .hd-audio-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        background: linear-gradient(135deg, var(--accent), #2d7a62);
        color: #fff;
        border: none; border-radius: 9px;
        padding: .42rem .9rem;
        font-size: .8rem; font-family: var(--serif);
        cursor: pointer;
        transition: opacity .15s, transform .15s;
      }
      .hd-audio-btn:hover { opacity: .88; transform: translateY(-1px); }
      .hd-audio-rate {
        font-size: .68rem; color: var(--muted);
        background: var(--surface2);
        border: 1px solid var(--border2);
        border-radius: 20px; padding: 2px 7px;
      }
      .hd-audio-unavail {
        display: flex; align-items: center; gap: .4rem;
        font-size: .8rem; color: var(--muted); font-style: italic;
      }
      .hd-toggle-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        background: transparent;
        border: 1px solid var(--border2);
        border-radius: 9px;
        padding: .4rem .85rem;
        font-size: .78rem; color: var(--muted);
        font-family: var(--serif);
        cursor: pointer;
        transition: border-color .15s, color .15s;
      }
      .hd-toggle-btn:hover { border-color: var(--gold); color: var(--gold); }

      /* ── french ── */
      .hd-french-block {
        background: var(--surface2);
        border-left: 3px solid var(--gold);
        border-radius: 0 10px 10px 0;
        padding: 1rem 1.2rem;
      }
      .hd-french {
        font-size: .9rem;
        line-height: 1.75;
        color: var(--fg);
        margin: 0;
        font-style: italic;
      }

      /* ── recorder ── */
      .hd-recorder {
        background: var(--surface2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1rem 1.1rem;
        display: flex; flex-direction: column; gap: .75rem;
      }
      .hd-recorder-header {
        display: flex; align-items: center; gap: .75rem;
      }
      .hd-rec-icon-wrap {
        width: 32px; height: 32px; flex-shrink: 0;
        background: linear-gradient(135deg, var(--accent), #2d7a62);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: #fff;
      }
      .hd-recorder-info { flex: 1; min-width: 0; }
      .hd-recorder-title { display: block; font-size: .83rem; font-weight: 700; color: var(--fg); }
      .hd-recorder-sub   { display: block; font-size: .7rem;  color: var(--muted); }
      .hd-timer {
        font-family: 'Courier New', monospace;
        font-size: .85rem; color: var(--muted);
        flex-shrink: 0;
      }
      .hd-rec-controls { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
      .hd-btn-record {
        display: inline-flex; align-items: center; gap: .4rem;
        background: linear-gradient(135deg, var(--accent), #2d7a62);
        color: #fff; border: none; border-radius: 99px;
        padding: .4rem 1rem; font-size: .8rem; font-family: var(--serif);
        cursor: pointer; transition: opacity .15s;
      }
      .hd-btn-record:hover { opacity: .85; }
      .hd-btn-stop {
        display: inline-flex; align-items: center; gap: .4rem;
        background: var(--danger); color: #fff;
        border: none; border-radius: 99px;
        padding: .4rem 1rem; font-size: .8rem; font-family: var(--serif);
        cursor: pointer; transition: opacity .15s;
      }
      .hd-btn-stop:hover { opacity: .85; }
      .hd-btn-ghost-sm {
        display: inline-flex; align-items: center; gap: .35rem;
        background: transparent;
        border: 1px solid var(--border2);
        border-radius: 99px;
        padding: .35rem .8rem; font-size: .75rem; color: var(--muted);
        font-family: var(--serif); cursor: pointer;
        transition: border-color .15s, color .15s;
      }
      .hd-btn-ghost-sm:hover { border-color: var(--gold); color: var(--gold); }
      .hd-btn-reset:hover { border-color: var(--danger); color: var(--danger); }
      .hd-rec-error { font-size: .75rem; color: var(--danger); }
      .hd-audio-player { width: 100%; height: 36px; opacity: .85; }

      /* ── schools ── */
      .hd-tabs { margin-top: -.25rem; }
      .hd-tabs-list {
        display: grid; grid-template-columns: repeat(4, 1fr);
        gap: .4rem; background: var(--surface2);
        border: 1px solid var(--border); border-radius: 10px; padding: .3rem;
      }
      .hd-tab-trigger {
        background: transparent; border: none; border-radius: 7px;
        padding: .45rem; font-size: .75rem; font-family: var(--serif);
        color: var(--muted); cursor: pointer;
        transition: background .15s, color .15s;
      }
      .hd-tab-trigger[data-state="active"] {
        background: var(--school-clr);
        color: #0d1117; font-weight: 700;
      }
      .hd-tab-content { margin-top: 1rem; }
      .hd-school-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .85rem; }
      @media (max-width: 560px) { .hd-school-grid { grid-template-columns: 1fr; } }
      .hd-school-panel {
        background: var(--surface2);
        border: 1px solid color-mix(in srgb, var(--school-clr) 25%, transparent);
        border-top: 2px solid var(--school-clr);
        border-radius: 10px;
        overflow: hidden;
      }
      .hd-school-panel-head {
        display: flex; justify-content: space-between; align-items: center;
        padding: .6rem .9rem;
        border-bottom: 1px solid var(--border);
        font-size: .7rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em;
      }
      .hd-school-badge {
        background: color-mix(in srgb, var(--school-clr) 18%, transparent);
        color: var(--school-clr);
        border-radius: 20px; padding: 1px 7px; font-size: .65rem;
      }
      .hd-school-scroll { height: 11rem; }
      .hd-school-ar { padding: .85rem; font-size: 1rem; line-height: 2; color: var(--fg); }
      .hd-school-fr { padding: .85rem; font-size: .85rem; line-height: 1.7; color: var(--fg); font-style: italic; }

      /* ── eval ── */
      .hd-eval-desc { font-size: .82rem; color: var(--muted); font-style: italic; }
      .hd-quality-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: .5rem;
      }
      @media (max-width: 600px) { .hd-quality-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 380px) { .hd-quality-grid { grid-template-columns: repeat(2, 1fr); } }
      .hd-quality-btn {
        background: var(--surface2);
        border: 1px solid var(--border2);
        border-radius: 12px;
        padding: .85rem .4rem;
        display: flex; flex-direction: column; align-items: center; gap: .3rem;
        cursor: pointer;
        transition: border-color .15s, transform .15s, background .15s;
      }
      .hd-quality-btn:hover { border-color: var(--gold); transform: translateY(-2px); }
      .hd-quality-btn:disabled { opacity: .5; pointer-events: none; }
      .hd-quality-btn--good {
        background: var(--accent-dim);
        border-color: rgba(74,159,130,.35);
      }
      .hd-quality-btn--good:hover { border-color: var(--accent); }
      .hd-quality-emoji { font-size: 1.6rem; line-height: 1; }
      .hd-quality-num   { font-size: 1.1rem; font-weight: 700; color: var(--fg); }
      .hd-quality-label { font-size: .62rem; color: var(--muted); text-align: center; line-height: 1.3; }

      /* ── notices ── */
      .hd-notice {
        display: flex; align-items: flex-start; gap: .65rem;
        border-radius: 10px; padding: .8rem 1rem;
        font-size: .82rem; line-height: 1.55;
      }
      .hd-notice svg { flex-shrink: 0; margin-top: 1px; }
      .hd-notice--info {
        background: var(--surface2);
        border: 1px solid var(--border2);
        color: var(--muted);
      }
      .hd-notice--review {
        background: var(--accent-dim);
        border: 1px solid rgba(74,159,130,.3);
        color: var(--fg);
      }
      .hd-notice--review svg { color: var(--accent); }

      /* ── nav ── */
      .hd-nav {
        display: flex; align-items: center; justify-content: space-between; gap: .75rem;
        padding-top: .5rem;
        border-top: 1px solid var(--border);
      }
      .hd-nav-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        background: var(--surface);
        border: 1px solid var(--border2);
        border-radius: 10px;
        padding: .5rem 1rem; font-size: .83rem; color: var(--fg);
        font-family: var(--serif); text-decoration: none;
        transition: border-color .15s, color .15s, transform .15s;
      }
      .hd-nav-btn:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-1px); }
      .hd-nav-btn--disabled { opacity: .35; pointer-events: none; }
      .hd-nav-btn--center {
        font-size: .78rem; color: var(--muted);
        padding: .45rem .85rem;
      }
      .hd-nav-btn--center:hover { color: var(--gold); }

      /* ── unlock modal ── */
      .hd-modal-backdrop {
        position: fixed; inset: 0; z-index: 50;
        background: rgba(0,0,0,.65);
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
        backdrop-filter: blur(3px);
      }
      .hd-modal {
        background: linear-gradient(135deg, #1a2030, #161c24);
        border: 1px solid var(--border2);
        border-top: 2px solid var(--gold);
        border-radius: 18px;
        padding: 1.5rem;
        max-width: 440px; width: 100%;
        position: relative;
        box-shadow: 0 24px 64px rgba(0,0,0,.5);
        animation: modalIn .3s ease both;
      }
      .hd-modal-close {
        position: absolute; top: .9rem; right: .9rem;
        background: var(--surface2); border: 1px solid var(--border2);
        color: var(--muted); border-radius: 50%;
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        font-size: .85rem; cursor: pointer;
        transition: color .15s;
      }
      .hd-modal-close:hover { color: var(--fg); }
      .hd-modal-header { display: flex; align-items: flex-start; gap: .75rem; margin-bottom: 1.1rem; }
      .hd-modal-sparkle { color: var(--gold); flex-shrink: 0; margin-top: .15rem; }
      .hd-modal-title { font-size: 1.05rem; font-weight: 700; color: var(--fg); margin: 0 0 .2rem; }
      .hd-modal-sub   { font-size: .78rem; color: var(--muted); font-style: italic; margin: 0; }
      .hd-modal-narrators { display: flex; flex-direction: column; gap: .65rem; max-height: 280px; overflow-y: auto; margin-bottom: 1rem; }
      .hd-narrator-card {
        background: var(--surface2);
        border: 1px solid var(--border);
        border-radius: 10px; padding: .8rem;
        display: flex; flex-direction: column; gap: .3rem;
      }
      .hd-narrator-row  { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
      .hd-narrator-name { font-weight: 700; font-size: .88rem; color: var(--fg); }
      .hd-narrator-kunya {
        font-size: .68rem; color: var(--gold);
        background: var(--gold-dim);
        border: 1px solid rgba(201,168,76,.25);
        border-radius: 20px; padding: 1px 7px;
      }
      .hd-narrator-bio  { font-size: .78rem; color: var(--muted); line-height: 1.5; }
      .hd-narrator-death { font-size: .68rem; color: var(--muted); }
      .hd-modal-cta {
        width: 100%;
        background: linear-gradient(135deg, var(--accent), #2d7a62);
        color: #fff; border: none; border-radius: 10px;
        padding: .65rem; font-size: .85rem; font-family: var(--serif);
        font-weight: 700; cursor: pointer;
        transition: opacity .15s;
      }
      .hd-modal-cta:hover { opacity: .88; }

      /* ── skeleton ── */
      .hd-skeleton {
        height: 100px; background: var(--surface);
        border-radius: 16px;
        animation: pulse 1.4s ease infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: .4; }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeDown {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes modalIn {
        from { opacity: 0; transform: scale(.94) translateY(10px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
    `}</style>
  );
}