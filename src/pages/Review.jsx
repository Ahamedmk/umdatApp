// /src/pages/Review.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { setHadithDueBadge } from "@/lib/appBadge";

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

import { saveReviewResult } from "../lib/hadithProgress";
import { supabase } from "../lib/supabase";
import { HADITHS_1_15 } from "../data/seed_hadiths_1_15";

function toLocalISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function Review() {
  const { user } = useAuth();

  const [showFullArabic, setShowFullArabic] = useState(false);
  const [hadiths, setHadiths] = useState([]);
  const [progressByNumber, setProgressByNumber] = useState({});
  const [idx, setIdx] = useState(0);
  const [showFr, setShowFr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    perfect: 0,
    good: 0,
    needs_work: 0,
  });

  // Hadiths déjà traités dans la session courante
  const answeredInSessionRef = useRef(new Set());

  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  async function loadDue(userId) {
    if (!userId) {
      setHadiths([]);
      setHadithDueBadge(0);
      setProgressByNumber({});
      setIdx(0);
      setShowFr(false);
      setShowFullArabic(false);
      setSessionStats({ total: 0, perfect: 0, good: 0, needs_work: 0 });
      return;
    }

    setLoading(true);
    try {
      const today = toLocalISODate(new Date());

      const { data: progress, error: progError } = await supabase
        .from("user_hadith_progress")
        .select(
          "hadith_number, ease_factor, interval_days, repetitions, next_review_date, last_result, status, mastery_wins"
        )
        .eq("user_id", userId)
        .lte("next_review_date", today);

      if (progError) throw progError;

      if (!progress || progress.length === 0) {
        setHadiths([]);
        setHadithDueBadge(0);
        setProgressByNumber({});
        setIdx(0);
        setShowFr(false);
        setShowFullArabic(false);
        return;
      }

      const progMap = {};
      const dueNumbers = progress.map((p) => {
        progMap[p.hadith_number] = p;
        return p.hadith_number;
      });

      const { data: hadithData, error: hadithError } = await supabase
        .from("hadiths")
        .select("number, arabic_text, french_text, source")
        .in("number", dueNumbers)
        .order("number", { ascending: true });

      if (hadithError) throw hadithError;

      const dbMap = new Map((hadithData || []).map((h) => [h.number, h]));
      const merged = [];

      for (const n of dueNumbers) {
        const fromDb = dbMap.get(n);
        const fromSeed = HADITHS_1_15.find((x) => x.number === n);
        if (fromDb) merged.push(fromDb);
        else if (fromSeed) merged.push(fromSeed);
      }

      // Très important : on exclut les hadiths déjà traités pendant cette session
      const filteredMerged = merged.filter(
        (item) => !answeredInSessionRef.current.has(item.number)
      );

      setHadiths(filteredMerged);
      setHadithDueBadge(filteredMerged.length);
      setProgressByNumber(progMap);
      setIdx(0);
      setShowFr(false);
      setShowFullArabic(false);
    } catch (err) {
      console.error("Erreur chargement révision:", err);
      setHadiths([]);
      setHadithDueBadge(0);
      setProgressByNumber({});
      setIdx(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    answeredInSessionRef.current = new Set();

    if (user?.id) {
      loadDue(user.id);
    } else {
      loadDue(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const h = useMemo(() => hadiths[idx], [hadiths, idx]);
  const arabicText = h?.arabic_text || "";
  const visibleChars = 35;
  const visiblePart = arabicText.slice(0, visibleChars);
  const hiddenPart = arabicText.slice(visibleChars);

  const progressPercent = hadiths.length
    ? Math.round(((idx + 1) / hadiths.length) * 100)
    : 0;

  const answer = async (quality) => {
    if (!h || !user || saving) return;

    const currentHadithNumber = h.number;

    setSaving(true);

    setSessionStats((prev) => ({
      total: prev.total + 1,
      perfect: prev.perfect + (quality === 5 ? 1 : 0),
      good: prev.good + (quality === 4 ? 1 : 0),
      needs_work: prev.needs_work + (quality < 3 ? 1 : 0),
    }));

    // On marque le hadith comme traité dans la session
    answeredInSessionRef.current.add(currentHadithNumber);

    // On le retire immédiatement de la session locale
    setHadiths((prev) => {
      const currentIndex = prev.findIndex(
        (item) => item.number === currentHadithNumber
      );

      if (currentIndex === -1) return prev;

      const nextList = prev.filter((item) => item.number !== currentHadithNumber);

      setIdx((oldIdx) => {
        if (nextList.length === 0) return 0;
        if (oldIdx >= nextList.length) return nextList.length - 1;
        return oldIdx;
      });

      setHadithDueBadge(nextList.length);
      return nextList;
    });

    setProgressByNumber((prev) => {
      const copy = { ...prev };
      delete copy[currentHadithNumber];
      return copy;
    });

    setShowFr(false);
    setShowFullArabic(false);

    try {
      await saveReviewResult(user.id, currentHadithNumber, quality);
      // Surtout ne pas recharger toute la liste ici
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la révision:", err);

      // rollback simple si erreur
      answeredInSessionRef.current.delete(currentHadithNumber);
      await loadDue(user.id);
    } finally {
      setSaving(false);
    }
  };

  const qualityLabels = [
    {
      value: 0,
      label: "Trou noir",
      desc: "Je ne me souviens pas du tout",
      delay: "demain",
    },
    {
      value: 1,
      label: "Très difficile",
      desc: "Très difficile à rappeler",
      delay: "demain",
    },
    {
      value: 2,
      label: "Après avoir regardé",
      desc: "Je dois regarder pour continuer",
      delay: "demain",
    },
    {
      value: 3,
      label: "Hésitations",
      desc: "Ça revient mais avec effort",
      delay: "2 jours",
    },
    {
      value: 4,
      label: "Fluide",
      desc: "Récitation fluide",
      delay: "3 jours",
    },
    {
      value: 5,
      label: "Parfait",
      desc: "Instantané",
      delay: "4 jours",
    },
  ];

  const isLoadingInitial = loading && !hadiths.length;
  const noHadiths = !loading && !hadiths.length;
  const hCurrent = h || null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="max-w-4xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">{sessionStats.total}</div>
                <div className="text-xs opacity-90">Total notés</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">{sessionStats.perfect}</div>
                <div className="text-xs opacity-90">Parfait</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">{sessionStats.good}</div>
                <div className="text-xs opacity-90">Fluide</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">{sessionStats.needs_work}</div>
                <div className="text-xs opacity-90">À revoir</div>
              </CardContent>
            </Card>
          </div>

          {isLoadingInitial && (
            <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white/80 dark:bg-slate-800/80 overflow-hidden relative">
              <CardContent className="pt-6 space-y-4 animate-pulse min-h-[320px]">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded" />
              </CardContent>
            </Card>
          )}

          {noHadiths && !isLoadingInitial && (
            <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
              <CardContent className="py-12 text-center space-y-3">
                <RotateCcw className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-700 dark:text-slate-200 font-semibold">
                  Tu as terminé toutes tes révisions pour aujourd’hui ✅
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Reviens demain in châ Allah pour la prochaine session, ou apprends
                  un nouveau hadith depuis la page{" "}
                  <span className="font-semibold">Apprendre</span>.
                </p>
              </CardContent>
            </Card>
          )}

          {hCurrent && !isLoadingInitial && (
            <>
              <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 overflow-hidden relative">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />

                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="secondary" className="rounded-full shrink-0">
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
                            style={{
                              background: "transparent",
                              border: "none",
                            }}
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

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Trophy className="h-4 w-4" />
                      <span className="font-medium">Comment était ta récitation ?</span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Note ta récitation honnêtement pour améliorer la mémorisation.
                    </p>

                    <div className="sm:hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <p>
                        <strong>0</strong> → Trou noir
                      </p>
                      <p>
                        <strong>1</strong> → Très difficile
                      </p>
                      <p>
                        <strong>2</strong> → Après avoir regardé
                      </p>
                      <p>
                        <strong>3</strong> → Hésitations
                      </p>
                      <p>
                        <strong>4</strong> → Fluide
                      </p>
                      <p>
                        <strong>5</strong> → Parfait
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {qualityLabels.map((q) => (
                        <Tooltip key={q.value}>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => answer(q.value)}
                              disabled={saving}
                              className="h-auto py-4 px-3 flex flex-col items-center gap-1 rounded-lg"
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
                              <span className="text-2xl font-bold">{q.value}</span>
                              <span className="text-xs font-medium">{q.label}</span>
                              <span
                                className={`text-[10px] ${
                                  q.value >= 4 ? "text-white/80" : "text-slate-500"
                                }`}
                              >
                                ↺ {q.delay}
                              </span>
                            </Button>
                          </TooltipTrigger>

                          <TooltipContent className="hidden sm:block">
                            <p className="text-xs">{q.desc}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {hadiths.length > 1 && (
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
                  <Button
                    onClick={() => {
                      setIdx((i) =>
                        hadiths.length ? (i - 1 + hadiths.length) % hadiths.length : 0
                      );
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

                  <Button
                    onClick={() => {
                      setIdx((i) => (hadiths.length ? (i + 1) % hadiths.length : 0));
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
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Review;