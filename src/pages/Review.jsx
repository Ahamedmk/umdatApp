// /src/pages/Review.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { saveReviewResult } from "../lib/hadithProgress";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trophy,
  Sparkles,
  Brain,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { HADITHS_1_15 } from "../data/seed_hadiths_1_15";

// Mini SM-2 côté client
const nextReview = (current, quality) => {
  const ease =
    (current.ease ?? current.ease_factor ?? 2.5) +
    (quality >= 4 ? 0.1 : -0.2);
  const interval_days =
    quality >= 4 ? (current.interval_days ?? 0) + 1 : 0;
  const repetitions = (current.repetitions ?? 0) + 1;

  const next_review_date = new Date(
    Date.now() + (quality >= 4 ? 86400000 : 3600000) // 1 jour ou 1h
  )
    .toISOString()
    .slice(0, 10);

  return { ease, interval_days, repetitions, next_review_date };
};

export function Review() {
  const { user } = useAuth();

  const [showFullArabic, setShowFullArabic] = useState(false);
  const [hadiths, setHadiths] = useState([]);
  const [progressByNumber, setProgressByNumber] = useState({});
  const [idx, setIdx] = useState(0);
  const [showFr, setShowFr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    perfect: 0,
    good: 0,
    needs_work: 0,
  });

  // --- Thème (inchangé, mais simple) ---
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  // --- Chargement des hadiths à réviser ---
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        let dueNumbers = [];
        let progMap = {};

        if (user) {
          const { data: progress, error: progError } = await supabase
            .from("user_hadith_progress")
            .select(
              "hadith_number, ease_factor, interval_days, repetitions, next_review_date, last_result"
            )
            .eq("user_id", user.id)
            .lte("next_review_date", today);

          if (progError) throw progError;

          if (progress && progress.length > 0) {
            dueNumbers = progress.map((p) => p.hadith_number);
            progress.forEach((p) => {
              progMap[p.hadith_number] = p;
            });
          }
        }

        let hadithQuery = supabase
          .from("hadiths")
          .select("number, arabic_text, french_text, source");

        if (dueNumbers.length > 0) {
          hadithQuery = hadithQuery
            .in("number", dueNumbers)
            .order("number", { ascending: true });
        } else {
          // Fallback : 8 → 15
          dueNumbers = Array.from({ length: 8 }, (_, i) => 8 + i);
          hadithQuery = hadithQuery
            .gte("number", 8)
            .lte("number", 15)
            .order("number", { ascending: true });
        }

        const { data: hadithData, error } = await hadithQuery;
        if (error) throw error;

        const dbMap = new Map((hadithData || []).map((h) => [h.number, h]));
        const merged = [];

        for (const n of dueNumbers) {
          merged.push(
            dbMap.get(n) || HADITHS_1_15.find((x) => x.number === n) || null
          );
        }

        if (active) {
          setHadiths(merged.filter(Boolean));
          setProgressByNumber(progMap);
          setIdx(0);
          setShowFr(false);
          setShowFullArabic(false);
          setSessionStats({ total: 0, perfect: 0, good: 0, needs_work: 0 });
        }
      } catch (err) {
        console.error("Erreur chargement révision:", err);
        if (active) {
          setHadiths(HADITHS_1_15);
          setProgressByNumber({});
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const h = useMemo(() => hadiths[idx], [hadiths, idx]);
  const arabicText = h?.arabic_text || "";
  const visibleChars = 35;
  const visiblePart = arabicText.slice(0, visibleChars);
  const hiddenPart = arabicText.slice(visibleChars);

  const progressPercent = hadiths.length
    ? ((idx + 1) / hadiths.length) * 100
    : 0;

  const answer = (quality) => {
    if (!h) return;

    const currentProg = progressByNumber[h.number] || {};
    const current = {
      ease: currentProg.ease_factor ?? 2.5,
      interval_days: currentProg.interval_days ?? 0,
      repetitions: currentProg.repetitions ?? 0,
    };

    const res = nextReview(current, quality);

    setSessionStats((prev) => ({
      total: prev.total + 1,
      perfect: prev.perfect + (quality === 5 ? 1 : 0),
      good: prev.good + (quality === 4 ? 1 : 0),
      needs_work: prev.needs_work + (quality < 3 ? 1 : 0),
    }));

    const userId = user?.id || user?.user?.id || user?.uid;

    if (userId) {
      saveReviewResult(userId, h.number, quality, res);

      setProgressByNumber((prev) => ({
        ...prev,
        [h.number]: {
          ...currentProg,
          hadith_number: h.number,
          ease_factor: res.ease,
          interval_days: res.interval_days,
          repetitions: res.repetitions,
          next_review_date: res.next_review_date,
        },
      }));
    } else {
      console.warn(
        "Aucun userId détecté → progression non sauvegardée (es-tu bien connecté ?)"
      );
    }

    setIdx((i) => (i + 1) % (hadiths.length || 1));
    setShowFr(false);
    setShowFullArabic(false);
  };

  const qualityLabels = [
    {
      value: 0,
      label: "Oublié",
      desc: "Je ne me souviens pas du tout",
    },
    {
      value: 1,
      label: "Très difficile",
      desc: "Je me souviens à peine",
    },
    {
      value: 2,
      label: "Difficile",
      desc: "Plusieurs erreurs",
    },
    {
      value: 3,
      label: "Moyen",
      desc: "Quelques hésitations",
    },
    {
      value: 4,
      label: "Facile",
      desc: "Bien mémorisé",
    },
    {
      value: 5,
      label: "Parfait",
      desc: "Récitation fluide",
    },
  ];

  const isLoadingInitial = loading && !hadiths.length;
  const noHadiths = !loading && !hadiths.length;

  const hCurrent = h || null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="max-w-4xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shrink-0">
                <RotateCcw className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                  Révision espacée
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Système SM-2 pour mémorisation optimale
                </p>
                {!user && (
                  <p className="text-xs text-red-500 mt-1">
                    Tu n&apos;es pas connecté : ta progression ne sera pas sauvegardée.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Progression de la session
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hadiths.length ? `${idx + 1} / ${hadiths.length}` : "–"}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Session stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">
                  {sessionStats.total}
                </div>
                <div className="text-xs opacity-90">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">
                  {sessionStats.perfect}
                </div>
                <div className="text-xs opacity-90">Parfait</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">
                  {sessionStats.good}
                </div>
                <div className="text-xs opacity-90">Facile</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">
                  {sessionStats.needs_work}
                </div>
                <div className="text-xs opacity-90">À revoir</div>
              </CardContent>
            </Card>
          </div>

          {/* Cas 1 : chargement initial → skeleton dans une carte de hauteur fixe */}
          {isLoadingInitial && (
            <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white/80 dark:bg-slate-800/80 overflow-hidden relative">
              <CardContent className="pt-6 space-y-4 animate-pulse min-h-[320px]">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded" />
              </CardContent>
            </Card>
          )}

          {/* Cas 2 : aucun hadith à réviser */}
          {noHadiths && !isLoadingInitial && (
            <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
              <CardContent className="py-12 text-center space-y-3">
                <RotateCcw className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-700 dark:text-slate-200 font-semibold">
                  Aucun hadith à réviser pour l’instant.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Continue d’apprendre de nouveaux hadiths, ils apparaîtront ici
                  automatiquement quand ils seront à réviser.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Cas 3 : contenu normal */}
          {hCurrent && !isLoadingInitial && (
            <>
              {/* Carte principale */}
              <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 overflow-hidden relative">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />

                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge
                        variant="secondary"
                        className="rounded-full shrink-0"
                      >
                        #{hCurrent.number}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs truncate max-w-[40vw] sm:max-w-none"
                      >
                        {hCurrent.source || "Source PDF"}
                      </Badge>
                      <Sparkles className="h-4 w-4 text-yellow-500 shrink-0" />
                    </div>
                    <Brain className="h-5 w-5 text-blue-500 shrink-0" />
                  </div>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-100">
                    Hadith {hCurrent.number}
                  </CardTitle>
                  <CardDescription>
                    Récite en arabe, puis révèle la traduction pour t’auto-évaluer
                  </CardDescription>
                </CardHeader>

                <Separator className="bg-slate-200 dark:bg-slate-700 relative z-10" />

                <CardContent className="space-y-6 pt-6 relative z-10">
                  {/* Texte arabe + floutage */}
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div
                      dir="rtl"
                      className="text-2xl md:text-3xl leading-[2.5rem] font-serif text-slate-900 dark:text-slate-100 text-center break-words overflow-hidden"
                    >
                      <span>{visiblePart}</span>
                      {hiddenPart && (
                        <span
                          className={
                            showFullArabic
                              ? "transition-all"
                              : "blur-md select-none transition-all"
                          }
                        >
                          {hiddenPart}
                        </span>
                      )}
                    </div>

                    {hiddenPart && (
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          onClick={() => setShowFullArabic((v) => !v)}
                          className="border rounded-full px-3 py-1"
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#0f172a",
                            borderColor: "#e2e8f0",
                          }}
                        >
                          {showFullArabic ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Masquer la fin du hadith
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Afficher tout le texte arabe
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Traduction */}
                  <div className="space-y-4">
                    {!showFr ? (
                      <Button
                        size="lg"
                        onClick={() => setShowFr(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Afficher la traduction
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Traduction française
                          </span>
                          <Button
                            size="sm"
                            onClick={() => setShowFr(false)}
                            className="text-slate-700 dark:text-slate-100"
                            style={{ background: "transparent", border: "none" }}
                          >
                            <EyeOff className="h-4 w-4 mr-2" />
                            Masquer
                          </Button>
                        </div>
                        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words overflow-hidden">
                            {hCurrent.french_text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Auto-évaluation */}
                  {showFr && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Trophy className="h-4 w-4" />
                        <span className="font-medium">
                          Comment était ta récitation ?
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {qualityLabels.map((q) => (
                          <Tooltip key={q.value}>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => answer(q.value)}
                                className="h-auto py-4 flex-col gap-1 rounded-lg"
                                style={
                                  q.value >= 4
                                    ? {
                                        backgroundImage:
                                          q.value === 4
                                            ? "linear-gradient(135deg,#10b981,#0f766e)"
                                            : "linear-gradient(135deg,#22c55e,#16a34a)",
                                        color: "#ffffff",
                                        border: "none",
                                      }
                                    : {
                                        backgroundColor: "#ffffff",
                                        color: "#0f172a",
                                        border: "1px solid #e2e8f0",
                                      }
                                }
                              >
                                <span className="text-2xl font-bold">
                                  {q.value}
                                </span>
                                <span className="text-xs font-medium">
                                  {q.label}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{q.desc}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
                {/* Précédent */}
                <Button
                  onClick={() => {
                    setIdx((i) => (i - 1 + hadiths.length) % hadiths.length);
                    setShowFr(false);
                    setShowFullArabic(false);
                  }}
                  className="w-full sm:w-auto flex items-center gap-2 min-w-0 whitespace-nowrap rounded-lg px-4 py-2"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span className="truncate">Précédent</span>
                </Button>

                {/* Retour à la liste */}
                <Button
                  asChild
                  className="w-full sm:w-auto min-w-0 whitespace-nowrap rounded-lg px-4 py-2"
                  style={{
                    backgroundColor: "transparent",
                    color: "#0f172a",
                  }}
                >
                  <a href="/learn">
                    <span className="truncate">Retour à la liste</span>
                  </a>
                </Button>

                {/* Suivant */}
                <Button
                  onClick={() => {
                    setIdx((i) => (i + 1) % hadiths.length);
                    setShowFr(false);
                    setShowFullArabic(false);
                  }}
                  className="w-full sm:w-auto flex items-center gap-2 min-w-0 whitespace-nowrap rounded-lg px-4 py-2"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span className="truncate">Suivant</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Review;
