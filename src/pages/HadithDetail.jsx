// /src/pages/HadithDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Play,
  Pause,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Volume2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  RotateCcw,
  Scale3d,
  Mic,
  Square,
} from "lucide-react";

// === dépendances app (réelles) ===
import { supabase } from "../lib/supabase";
import { nextReview } from "../lib/spaced";
import { HADITHS_1_15 } from "../data/seed_hadiths_1_15";
import { useAuth } from "../context/AuthContext";
import { saveReviewResult } from "../lib/hadithProgress";

// --- util: récupérer le numéro depuis /hadith/:n ou ?n= ---
function useHadithNumberFromRouter() {
  const { n: nParam } = useParams(); // route style /hadith/:n
  const [sp] = useSearchParams(); // route style /hadith?n=8
  const loc = useLocation(); // force update quand l’URL change
  const raw = nParam ?? sp.get("n") ?? "8";
  const num = parseInt(raw, 10);
  return Number.isNaN(num) ? 8 : num;
}

// --- petit helper SM-2 (même logique que Review) ---
const computeNextReview = (current, quality) => {
  const easeBase = current.ease ?? current.ease_factor ?? 2.5;
  const intervalBase = current.interval_days ?? 0;
  const repetitionsBase = current.repetitions ?? 0;

  const ease = easeBase + (quality >= 4 ? 0.1 : -0.2);
  const interval_days = quality >= 4 ? intervalBase + 1 : 0;
  const repetitions = repetitionsBase + 1;

  const next_review_date = new Date(
    Date.now() + (quality >= 4 ? 86400000 : 3600000) // 1 jour ou 1h
  )
    .toISOString()
    .slice(0, 10);

  return { ease, interval_days, repetitions, next_review_date };
};

// --- lecteur audio inline (récitation modèle) ---
function InlineAudio({ url }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.playbackRate = 0.9;
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {url ? (
        <>
          <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
          <Button
            variant="secondary"
            size="sm"
            onClick={toggle}
            className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {playing ? "Pause" : "Écouter"}
          </Button>
          <Badge variant="outline" className="hidden sm:inline">
            0.9x
          </Badge>
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Volume2 className="h-4 w-4" />
          <span>Audio indisponible</span>
        </div>
      )}
    </div>
  );
}

// --- hook enregistrement audio local ---
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
    if (typeof window !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const startRecording = async () => {
    if (!isSupported || isRecording) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      const chunks = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((t) => t + 1);
      }, 1000);
    } catch (e) {
      console.error(e);
      setError("Impossible d'accéder au micro.");
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetRecording = () => {
    if (isRecording) stopRecording();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setElapsed(0);
    setError(null);
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  return {
    isSupported,
    isRecording,
    audioUrl,
    error,
    elapsed,
    startRecording,
    stopRecording,
    resetRecording,
    playerRef,
  };
}

const SCHOOL_COLORS = {
  Hanafi: {
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
  },
  Maliki: {
    gradient: "from-green-500 to-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
  },
  Shafi: {
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-800",
  },
  Hanbali: {
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
  },
};

export default function HadithDetail() {
  const hadithNumber = useHadithNumberFromRouter();
  const { user } = useAuth();

  const [hadith, setHadith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const hasReviewPlan = !!progress?.next_review_date;

  const [hasProgress, setHasProgress] = useState(false); // 👉 déjà planifié ?
  const [hideFR, setHideFR] = useState(false);
  const [dark, setDark] = useState(false);
  const [unlockedNarrators, setUnlockedNarrators] = useState([]);
const [showUnlockModal, setShowUnlockModal] = useState(false);


  const {
    isSupported: isRecSupported,
    isRecording,
    audioUrl,
    error: recError,
    elapsed,
    startRecording,
    stopRecording,
    resetRecording,
    playerRef,
  } = useAudioRecorder();

  // thème sombre persistant
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  const toggleTheme = (checked) => {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  // fallback local (seed) si pas en DB
  const localSeed = useMemo(
    () => HADITHS_1_15.find((h) => h.number === hadithNumber) || null,
    [hadithNumber]
  );

  // charge le hadith (DB -> fallback seed) + progression
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setHadith(null);
      setProgress(null);
      setHasProgress(false);

      try {
        // 1) hadith
        const { data: rows, error } = await supabase
          .from("hadiths")
          .select("id, number, arabic_text, french_text, source, audio_url")
          .eq("number", hadithNumber)
          .limit(1);

        if (error) throw error;

        let full = null;

        if (rows && rows.length) {
          const row = rows[0];

          // 2) avis des écoles
          const { data: ops, error: e2 } = await supabase
            .from("schools_opinions")
            .select("school, arabic_text, french_text")
            .eq("hadith_id", row.id);

          if (e2) throw e2;

          const opinions = { Hanafi: {}, Maliki: {}, Shafi: {}, Hanbali: {} };
          (ops || []).forEach((o) => {
            if (o.school === "Hanafi")
              opinions.Hanafi = { ar: o.arabic_text, fr: o.french_text };
            if (o.school === "Maliki")
              opinions.Maliki = { ar: o.arabic_text, fr: o.french_text };
            if (o.school === "Shafi")
              opinions.Shafi = { ar: o.arabic_text, fr: o.french_text };
            if (o.school === "Hanbali")
              opinions.Hanbali = { ar: o.arabic_text, fr: o.french_text };
          });

          full = {
            id: row.id,
            number: row.number,
            arabic_text: row.arabic_text,
            french_text: row.french_text,
            source: row.source,
            audio_url: row.audio_url || null,
            opinions,
          };
        } else {
          full = localSeed;
        }

        if (!full) {
          if (active) setHadith(null);
          return;
        }

        // 3) progression existante ?
        let progRow = null;

        const hadithNum = full.number;

        if (user?.id) {
          const { data: p, error: pErr } = await supabase
            .from("user_hadith_progress")
            .select(
              "hadith_number, ease_factor, interval_days, repetitions, next_review_date, last_result"
            )
            .eq("user_id", user.id)
            .eq("hadith_number", hadithNum)
            .maybeSingle();

          if (!pErr && p) {
            progRow = p;
          }
        } else {
          // petit fallback local éventuel
          const raw = localStorage.getItem(`progress_${hadithNum}`);
          if (raw) {
            try {
              progRow = JSON.parse(raw);
            } catch {
              progRow = null;
            }
          }
        }

        if (active) {
          setHadith(full);
          setProgress(progRow);
          setHasProgress(!!progRow);
        }
      } catch (e) {
        console.error(e);
        if (active) {
          setHadith(localSeed);
          setProgress(null);
          setHasProgress(false);
        }
      } finally {
        if (active) setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [hadithNumber, localSeed, user?.id]);

  // HadithDetail.jsx

const handleQuality = async (quality) => {
  if (!hadith) return;
  if (!user) {
    // on peut garder ton fallback localStorage si tu veux
    console.warn("Utilisateur non connecté → pas d’XP ni de déblocage narrateur.");
  }

  setSaving(true);

  try {
    const userId = user?.id || user?.user?.id || user?.uid || null;

    // 1) Snapshot AVANT : quels narrateurs sont déjà débloqués ?
    let beforeIds = new Set();
    if (userId) {
      const { data: beforeRows, error: beforeErr } = await supabase
        .from("user_narrator_unlocks")
        .select("narrator_id")
        .eq("user_id", userId);

      if (!beforeErr && beforeRows) {
        beforeIds = new Set(beforeRows.map((r) => r.narrator_id));
      }
    }

    // 2) Calcul SM-2 comme avant
    const base = progress || { ease: 2.5, interval_days: 0, repetitions: 0 };
    const calc = nextReview(base, quality);
    const payload = {
      user_id: userId,
      hadith_number: hadith.number,
      status: quality >= 4 ? "learned" : "learning",
      ease_factor: calc.ease,
      interval_days: calc.interval_days,
      repetitions: calc.repetitions,
      last_review_date: new Date().toISOString().slice(0, 10),
      next_review_date: calc.next_review_date,
      last_result: quality,
    };

    // 3) Sauvegarde dans user_hadith_progress (ce qui déclenche le trigger)
    if (userId) {
      const { error } = await supabase
        .from("user_hadith_progress")
        .upsert(payload);

      if (error) throw error;
    } else {
      // fallback local si tu veux garder quelque chose hors connexion
      localStorage.setItem(
        `progress_${hadith.number}`,
        JSON.stringify(payload)
      );
    }

    setProgress(payload);

    // 4) Snapshot APRÈS : quels narrateurs sont débloqués maintenant ?
    if (userId) {
      const { data: afterRows, error: afterErr } = await supabase
        .from("user_narrator_unlocks")
        .select("narrator_id")
        .eq("user_id", userId);

      if (!afterErr && afterRows) {
        const afterIds = afterRows.map((r) => r.narrator_id);

        // 5) Diff : narrateurs nouvellement débloqués
        const newIds = afterIds.filter((id) => !beforeIds.has(id));

        if (newIds.length > 0) {
          const { data: narratorsData, error: narrErr } = await supabase
            .from("narrators")
            .select("id, name, kunya, short_bio, death_year, death_hijri")
            .in("id", newIds);

          if (!narrErr && narratorsData && narratorsData.length > 0) {
            setUnlockedNarrators(narratorsData);
            setShowUnlockModal(true);
          }
        }
      }
    }
  } catch (e) {
    console.error("Erreur handleQuality / déblocage narrateurs:", e);
  } finally {
    setSaving(false);
  }
};



  if (loading || !hadith) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <Card className="animate-pulse border-slate-200 dark:border-slate-700">
            <CardContent className="h-24 pt-6" />
          </Card>
          <Card className="animate-pulse border-slate-200 dark:border-slate-700">
            <CardContent className="h-40 pt-6" />
          </Card>
        </div>
      </div>
    );
  }

  const qualityLabels = [
    { value: 0, label: "Oublié", emoji: "❌" },
    { value: 1, label: "Très difficile", emoji: "😰" },
    { value: 2, label: "Difficile", emoji: "😕" },
    { value: 3, label: "Je le retrouve avec effort", emoji: "🤔" },
    { value: 4, label: "Je le connais bien", emoji: "😊" },
    { value: 5, label: "Je le maîtrise parfaitement", emoji: "✨" },
  ];

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6 transition-colors duration-300">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    Umdat
                  </Badge>
                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Hadith {hadith.number}
                  </h1>
                </div>
                {hadith.source && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {hadith.source}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <Switch checked={dark} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </div>

          {/* Texte & récitation */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Texte & récitation
              </CardTitle>
              <CardDescription>
                Lis, écoute la récitation modèle, puis enregistre la tienne.
              </CardDescription>
            </CardHeader>
            <Separator className="bg-slate-200 dark:bg-slate-700" />
            <CardContent className="space-y-6 pt-6 relative z-10">
              {/* Texte arabe (flouté pendant l'enregistrement) */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 border border-slate-200 dark:border-slate-700">
                <div
                  dir="rtl"
                  className={`text-2xl md:text-3xl leading-[2.5rem] font-serif tracking-wide text-slate-900 dark:text-slate-100 text-center transition-all ${
                    isRecording ? "blur-md select-none" : ""
                  }`}
                >
                  {hadith.arabic_text}
                </div>
                {isRecording && (
                  <p className="mt-3 text-xs text-center text-amber-600 dark:text-amber-300">
                    Le texte est flouté pour t’aider à réciter de mémoire.
                  </p>
                )}
              </div>

              {/* Bandeau audio modèle + bouton traduction */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <InlineAudio url={hadith.audio_url} />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHideFR((v) => !v)}
                  className="gap-2 dark:text-gray-400"
                >
                  {hideFR ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Afficher traduction
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Masquer traduction
                    </>
                  )}
                </Button>
              </div>

              {!hideFR && (
                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {hadith.french_text}
                  </p>
                </div>
              )}

              {/* Enregistrement perso */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Mic className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Ta récitation (non envoyée, stockée localement)
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        1) Cache le texte en regardant ailleurs. 2) Lance
                        l’enregistrement. 3) Récite. 4) Réécoute en suivant le
                        texte.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {minutes}:{seconds}
                  </div>
                </div>

                {!isRecSupported && (
                  <p className="text-xs text-red-500">
                    Ton navigateur ne supporte pas l’enregistrement audio
                    (MediaRecorder).
                  </p>
                )}

                {isRecSupported && (
                  <>
                    <div className="flex flex-wrap gap-2 items-center">
                      {!isRecording ? (
                        <Button
                          size="sm"
                          onClick={startRecording}
                          className="gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        >
                          <Mic className="h-4 w-4" />
                          Commencer l&apos;enregistrement
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={stopRecording}
                          className="gap-2 rounded-full text-black"
                        >
                          <Square className="h-4 w-4" />
                          Arrêter
                        </Button>
                      )}

                      {audioUrl && !isRecording && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              if (playerRef.current) {
                                playerRef.current.currentTime = 0;
                                playerRef.current.play();
                              }
                            }}
                          >
                            <Play className="h-4 w-4" />
                            Réécouter ta récitation
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-2 text-xs"
                            onClick={resetRecording}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Effacer
                          </Button>
                        </>
                      )}
                    </div>

                    {recError && (
                      <p className="text-xs text-red-500 mt-1">{recError}</p>
                    )}

                    {audioUrl && (
                      <audio
                        ref={playerRef}
                        src={audioUrl}
                        className="w-full mt-2"
                        controls
                      />
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Avis des écoles */}
          {hadith.opinions && (
            <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale3d className="h-5 w-5 text-amber-500" />
                  Avis des quatre écoles juridiques
                </CardTitle>
                <CardDescription>
                  Compare rapidement les formulations ar/fr.
                </CardDescription>
              </CardHeader>
              <Separator className="bg-slate-200 dark:bg-slate-700" />
              <CardContent className="pt-6">
                <Tabs defaultValue="Hanafi" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full gap-3">
                    {["Hanafi", "Maliki", "Shafi", "Hanbali"].map((school) => (
                      <TabsTrigger
                        key={school}
                        value={school}
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                      >
                        {school === "Hanafi"
                          ? "Hanafite"
                          : school === "Maliki"
                          ? "Malikite"
                          : school === "Shafi"
                          ? "Chafi‘ite"
                          : "Hanbalite"}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {["Hanafi", "Maliki", "Shafi", "Hanbali"].map((key) => {
                    const colors = SCHOOL_COLORS[key];
                    return (
                      <TabsContent key={key} value={key} className="mt-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Card
                            className={`${colors.bg} ${colors.border} border-2`}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-semibold">
                                  النص الفقهي
                                </CardDescription>
                                <Badge
                                  className={`bg-gradient-to-r ${colors.gradient} text-white`}
                                >
                                  عربي
                                </Badge>
                              </div>
                              <Separator />
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-48 pr-3">
                                <div
                                  dir="rtl"
                                  className="leading-8 text-slate-800 dark:text-slate-200"
                                >
                                  {hadith.opinions?.[key]?.ar || "—"}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>

                          <Card
                            className={`${colors.bg} ${colors.border} border-2`}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardDescription className="text-xs font-semibold">
                                  Texte en français
                                </CardDescription>
                                <Badge
                                  className={`bg-gradient-to-r ${colors.gradient} text-white`}
                                >
                                  FR
                                </Badge>
                              </div>
                              <Separator />
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-48 pr-3">
                                <div className="leading-7 text-slate-700 dark:text-slate-300">
                                  {hadith.opinions?.[key]?.fr || "—"}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Auto-évaluation : UNIQUEMENT si pas encore de progression */}
          {!hasProgress && (
            <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800">
  <CardHeader>
    <CardTitle className="text-lg flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      Auto-évaluation (SM-2)
    </CardTitle>
    <CardDescription>
      1) Répète le hadith de mémoire. 2) Choisis une note : cela crée ton
      planning de révision. Ensuite, tu continueras dans l’onglet Révision.
    </CardDescription>
  </CardHeader>
  <Separator className="bg-slate-200 dark:bg-slate-700" />
  <CardContent className="space-y-6 pt-6">
    {/* 🟢 Si pas encore de planning → on affiche les boutons */}
    {!hasReviewPlan && (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {qualityLabels.map((q) => (
          <Tooltip key={q.value}>
            <TooltipTrigger asChild>
              <Button
                variant={q.value >= 4 ? "default" : "outline"}
                onClick={() => handleQuality(q.value)}
                disabled={saving}
                className={`h-auto py-4 flex-col gap-2 ${
                  q.value >= 4
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                    : "hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                <span className="text-3xl">{q.emoji}</span>
                <span className="text-lg font-bold">{q.value}</span>
                <span className="text-xs">{q.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{q.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    )}

    {/* 🟡 Si un planning existe déjà → petit message explicatif */}
    {hasReviewPlan && (
      <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm">
        <p className="font-semibold mb-1">
          Ce hadith a déjà été évalué une première fois ✅
        </p>
        <p className="text-slate-700 dark:text-slate-300">
          Tu retrouveras désormais ce hadith dans l’onglet{" "}
          <span className="font-semibold">Révision</span> à la date prévue
          ci-dessous. Pas besoin de re-noter ici.
        </p>
      </div>
    )}

    {/* 📝 Bloc "prochaine révision programmée" que tu avais déjà */}
    {progress?.next_review_date && (
      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-800 dark:text-emerald-200">
            <div className="font-semibold mb-1">
              Prochaine révision programmée
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>{progress.next_review_date}</span>
              <Badge
                variant="outline"
                className="bg-white dark:bg-slate-800"
              >
                {progress.status === "learned" ? "✅ Appris" : "📚 En cours"}
              </Badge>
              <span className="text-xs">
                • {progress.repetitions} révision
                {progress.repetitions > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
  </CardContent>
</Card>

          )}

          {/* Si progression existe déjà → petit rappel vers Révision */}
          {hasProgress && progress?.next_review_date && (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 shadow-lg">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div className="text-sm text-emerald-900 dark:text-emerald-100">
                    <div className="font-semibold mb-1">
                      Ce hadith est déjà dans ton planning de révision.
                    </div>
                    <p>
                      Tu le retrouveras dans l&apos;onglet{" "}
                      <strong>Révision</strong> à partir du{" "}
                      <strong>{progress.next_review_date}</strong>. À partir de
                      maintenant, c&apos;est cette page qui ajustera le rythme
                      en fonction de tes performances.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              asChild
              disabled={hadith.number <= 8}
              className="flex-1 sm:flex-none"
            >
              <Link
                to={`/hadith/${hadith.number - 1}`}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Link>
            </Button>

            <Button variant="secondary" asChild className="hidden sm:flex">
              <Link to="/learn" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Liste des hadiths
              </Link>
            </Button>

            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link
                to={`/hadith/${hadith.number + 1}`}
                className="flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {showUnlockModal && unlockedNarrators.length > 0 && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <Card className="max-w-md w-full shadow-2xl border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-3 right-3 text-slate-300 hover:text-white hover:bg-white/10"
        onClick={() => setShowUnlockModal(false)}
      >
        ×
      </Button>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <span>Nouveau rapporteur débloqué !</span>
        </CardTitle>
        <CardDescription className="text-slate-300">
          Grâce à ce hadith, tu viens d’ajouter un maillon à ta chaîne de
          transmission 📜
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
          {unlockedNarrators.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">
                  {n.name}
                </span>
                {n.kunya && (
                  <Badge
                    variant="outline"
                    className="border-amber-400 text-amber-200 text-xs"
                  >
                    {n.kunya}
                  </Badge>
                )}
              </div>
              {n.short_bio && (
                <p className="text-xs text-slate-200 leading-relaxed">
                  {n.short_bio}
                </p>
              )}
              {(n.death_year || n.death_hijri) && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Décès :{" "}
                  {n.death_year
                    ? `${n.death_year} EC`
                    : ""}
                  {n.death_year && n.death_hijri ? " • " : ""}
                  {n.death_hijri
                    ? `${n.death_hijri} H`
                    : ""}
                </p>
              )}
            </div>
          ))}
        </div>

        <Button
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          onClick={() => setShowUnlockModal(false)}
        >
          Voir ma collection de rapporteurs
        </Button>
      </CardContent>
    </Card>
  </div>
)}

    </TooltipProvider>
  );
}
