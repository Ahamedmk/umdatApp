// src/pages/Quiz.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Brain,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Moon,
  Sun,
  Trophy,
  Target,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { HADITHS_1_15 } from "@/data/seed_hadiths_1_15";
import { QUIZ_QUESTIONS_1_15 } from "@/data/quiz_questions_1_15";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function Quiz() {
  const { user } = useAuth();

  const [filterN, setFilterN] = useState("all");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [dark, setDark] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showFrenchRef, setShowFrenchRef] = useState(false);

  const [learnedNumbers, setLearnedNumbers] = useState([]); // hadith appris
  const [loadingLearned, setLoadingLearned] = useState(true);

  // Thème (light / dark) persistant
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    const enable = pref ? pref === "dark" : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  const toggleTheme = (checked) => {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  // 🔥 Charger la liste des hadiths APPRIS depuis user_hadith_progress
  useEffect(() => {
    let active = true;

    async function loadLearned() {
      setLoadingLearned(true);

      try {
        if (!user) {
          setLearnedNumbers([]);
          return;
        }

        const { data, error } = await supabase
          .from("user_hadith_progress")
          .select("hadith_number, status")
          .eq("user_id", user.id)
          .eq("status", "learned"); // ⚠️ on ne prend que les appris

        if (error) throw error;

        const nums = Array.from(
          new Set((data || []).map((r) => r.hadith_number))
        ).sort((a, b) => a - b);

        if (active) {
          setLearnedNumbers(nums);
          // si le filtre actuel ne fait pas partie des appris → reset
          if (nums.length === 0 || (filterN !== "all" && !nums.includes(parseInt(filterN, 10)))) {
            setFilterN("all");
            setIndex(0);
          }
        }
      } catch (e) {
        console.error("Erreur loadLearned:", e);
        if (active) setLearnedNumbers([]);
      } finally {
        if (active) setLoadingLearned(false);
      }
    }

    loadLearned();
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Pool de questions filtré :
  // 1) seulement les hadiths APPRIS
  // 2) + filtre optionnel sur un numéro précis
  const pool = useMemo(() => {
    if (!learnedNumbers.length) return [];

    let base = QUIZ_QUESTIONS_1_15.filter((q) =>
      learnedNumbers.includes(q.n)
    );

    if (filterN !== "all") {
      const num = parseInt(filterN, 10);
      base = base.filter((q) => q.n === num);
    }

    return base;
  }, [learnedNumbers, filterN]);

  const current = pool[index];

  const answered = index + (done ? 1 : 0);
  const progressValue = pool.length
    ? Math.round((answered / pool.length) * 100)
    : 0;
  const accuracy = answered ? Math.round((score / answered) * 100) : 0;

  const onValidate = () => {
    if (selected == null || !current) return;
    const ok = selected === current.correctIndex;
    setScore((s) => s + (ok ? 1 : 0));
    setDone(true);
  };

  const onNext = () => {
    if (!pool.length) return;
    if (index + 1 < pool.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setDone(false);
      setShowHint(false);
      setShowFrenchRef(false);
    } else {
      // fin de quiz → on reset la session
      setIndex(0);
      setSelected(null);
      setDone(false);
      setScore(0);
      setShowHint(false);
      setShowFrenchRef(false);
    }
  };

  const onRestart = () => {
    setIndex(0);
    setSelected(null);
    setDone(false);
    setScore(0);
    setShowHint(false);
    setShowFrenchRef(false);
  };

  const handleFilterChange = (v) => {
    setFilterN(v);
    setIndex(0);
    setSelected(null);
    setDone(false);
    setScore(0);
    setShowHint(false);
    setShowFrenchRef(false);
  };

  useEffect(() => {
    setShowFrenchRef(false);
  }, [index, filterN]);

  // Styles pour les options (identiques à ta version)
  const getOptionStyle = (isSelected, isCorrect, isWrong) => {
    if (done) {
      if (isCorrect) {
        return {
          backgroundImage: "linear-gradient(135deg,#22c55e,#16a34a)",
          color: "#ffffff",
          border: "none",
        };
      }
      if (isWrong) {
        return {
          backgroundImage: "linear-gradient(135deg,#f97373,#ef4444)",
          color: "#ffffff",
          border: "none",
        };
      }
      return dark
        ? {
            backgroundColor: "#020617",
            color: "#e5e7eb",
            border: "1px solid #1f2937",
          }
        : {
            backgroundColor: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
          };
    }

    if (isSelected) {
      return dark
        ? {
            backgroundImage: "linear-gradient(135deg,#4c1d95,#db2777)",
            color: "#ffffff",
            border: "none",
          }
        : {
            backgroundImage: "linear-gradient(135deg,#8b5cf6,#ec4899)",
            color: "#ffffff",
            border: "none",
          };
    }

    return dark
      ? {
          backgroundColor: "#020617",
          color: "#e5e7eb",
          border: "1px solid #1f2937",
        }
      : {
          backgroundColor: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
        };
  };

  const getRadioStyle = (isSelected, isCorrect, isWrong) => {
    if (done) {
      if (isCorrect) {
        return {
          borderColor: "#22c55e",
          backgroundColor: "#22c55e",
          color: "#ffffff",
        };
      }
      if (isWrong) {
        return {
          borderColor: "#ef4444",
          backgroundColor: "#ef4444",
          color: "#ffffff",
        };
      }
      return dark
        ? { borderColor: "#4b5563", backgroundColor: "transparent", color: "#e5e7eb" }
        : { borderColor: "#cbd5f5", backgroundColor: "transparent", color: "#0f172a" };
    }

    if (isSelected) {
      return dark
        ? { borderColor: "#e5e7eb", backgroundColor: "#e5e7eb33", color: "#e5e7eb" }
        : { borderColor: "#4c1d95", backgroundColor: "#4c1d95", color: "#ffffff" };
    }

    return dark
      ? { borderColor: "#4b5563", backgroundColor: "transparent", color: "#e5e7eb" }
      : { borderColor: "#cbd5f5", backgroundColor: "transparent", color: "#0f172a" };
  };

  // ================== RENDER ==================
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 px-4 sm:px-6 py-6 transition-colors duration-300">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shrink-0">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                Quiz Interactif
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Teste tes connaissances sur les hadiths que tu as déjà appris
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Select value={filterN} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous (appris)</SelectItem>
                {learnedNumbers.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Hadith {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between sm:justify-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <Switch
                checked={dark}
                onCheckedChange={toggleTheme}
                className="scale-90"
              />
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white shadow-lg">
            <CardContent className="pt-4 pb-3 text-center">
              <Target className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-2xl font-bold mb-1">{answered}</div>
              <div className="text-xs opacity-90">Questions vues</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white shadow-lg">
            <CardContent className="pt-4 pb-3 text-center">
              <Trophy className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-2xl font-bold mb-1">{score}</div>
              <div className="text-xs opacity-90">Bonnes réponses</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-lg">
            <CardContent className="pt-4 pb-3 text-center">
              <Sparkles className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-2xl font-bold mb-1">
                {isNaN(accuracy) ? 0 : accuracy}%
              </div>
              <div className="text-xs opacity-90">Précision</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white shadow-lg">
            <CardContent className="pt-4 pb-3 text-center">
              <RotateCcw className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-2xl font-bold mb-1">{pool.length}</div>
              <div className="text-xs opacity-90">Questions dispo</div>
            </CardContent>
          </Card>
        </div>

        {/* PROGRESSION */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Progression du quiz
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {progressValue}%
                </span>
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* CAS : pas connecté ou aucun hadith appris */}
        {loadingLearned ? (
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl">
            <CardContent className="py-12 text-center animate-pulse">
              <Brain className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Chargement de tes hadiths appris...
              </p>
            </CardContent>
          </Card>
        ) : !user ? (
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl">
            <CardContent className="py-12 text-center space-y-3">
              <Brain className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-700 dark:text-slate-200 font-semibold">
                Connecte-toi pour accéder au quiz.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Le quiz utilise ta progression personnelle (table
                <code className="mx-1">user_hadith_progress</code>).
              </p>
            </CardContent>
          </Card>
        ) : learnedNumbers.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
            <CardContent className="py-12 text-center space-y-3">
              <Brain className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-700 dark:text-slate-200 font-semibold">
                Tu n&apos;as pas encore de hadith marqué comme appris.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Va dans la page <span className="font-semibold">Apprendre</span>,
                auto-évalue un hadith avec une note <strong>4 ou 5</strong>, puis reviens
                ici pour l&apos;avoir en quiz.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* CARTE PRINCIPALE QUIZ */}
        {pool.length === 0 || !current ? null : (
          <>
            <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 overflow-hidden relative">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />

              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                  <Badge variant="secondary" className="rounded-full shrink-0">
                    Question {index + 1} / {pool.length}
                  </Badge>
                  <Badge variant="outline" className="text-xs shrink-0">
                    Hadith {current.n}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-100 break-words text-pretty">
                  {current.q}
                </CardTitle>
              </CardHeader>

              <Separator className="bg-slate-200 dark:bg-slate-700" />

              <CardContent className="space-y-6 pt-6 relative z-10">
                {/* OPTIONS */}
                <div className="grid gap-3">
                  {current.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = done && i === current.correctIndex;
                    const isWrong =
                      done && isSelected && i !== current.correctIndex;

                    const buttonStyle = getOptionStyle(
                      isSelected,
                      isCorrect,
                      isWrong
                    );
                    const radioStyle = getRadioStyle(
                      isSelected,
                      isCorrect,
                      isWrong
                    );

                    return (
                      <Button
                        key={i}
                        onClick={() => !done && setSelected(i)}
                        disabled={done}
                        className="justify-start text-left h-auto py-4 px-4 transition-all min-w-0 whitespace-normal break-words text-pretty rounded-xl"
                        style={buttonStyle}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div
                            className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                            style={radioStyle}
                          >
                            {isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            )}
                            {isWrong && (
                              <XCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <span className="flex-1 min-w-0 break-words">
                            {opt}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* ACTIONS */}
                <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2">
                  {!done ? (
                    <>
                      <Button
                        onClick={onValidate}
                        disabled={selected == null}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md"
                      >
                        Valider ma réponse
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                        className="w-full sm:w-auto gap-2 text-black "
                      >
                        <Lightbulb className="h-4 w-4 shrink-0 " />
                        {showHint ? "Masquer" : "Indice"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={onNext}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md"
                    >
                      {index + 1 < pool.length
                        ? "Question suivante →"
                        : "Recommencer le quiz"}
                    </Button>
                  )}
                </div>

                {/* INDICE */}
                {showHint && !done && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          Relis le hadith {current.n} et son explication pour
                          retrouver la bonne réponse.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* EXPLICATION APRES VALIDATION */}
                {done && (
                  <Card
                    className={
                      selected === current.correctIndex
                        ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                    }
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        {selected === current.correctIndex ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-semibold mb-1 ${
                              selected === current.correctIndex
                                ? "text-green-800 dark:text-green-200"
                                : "text-red-800 dark:text-red-200"
                            }`}
                          >
                            {selected === current.correctIndex
                              ? "Excellente réponse !"
                              : "Pas tout à fait..."}
                          </div>
                          <div
                            className={`text-sm break-words text-pretty ${
                              selected === current.correctIndex
                                ? "text-green-700 dark:text-green-300"
                                : "text-red-700 dark:text-red-300"
                            }`}
                          >
                            {current.explain}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* RAPPEL HADITH */}
            <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500 shrink-0" />
                  <span className="truncate">
                    Rappel — Hadith {current.n}
                  </span>
                </CardTitle>
                <CardDescription>
                  Contexte pour ancrer ta compréhension
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const h = HADITHS_1_15.find(
                    (x) => x.number === current.n
                  );
                  if (!h) {
                    return (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        —
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        <div
                          dir="rtl"
                          className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 border border-slate-200 dark:border-slate-700 font-serif text-lg leading-loose break-words"
                        >
                          {h.arabic_text}
                        </div>

                        {showFrenchRef && (
                          <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 break-words">
                            {h.french_text}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFrenchRef((v) => !v)}
                        className="mt-2 text-black"
                      >
                        {showFrenchRef
                          ? "Masquer la traduction"
                          : "Afficher la traduction"}
                      </Button>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* BOUTON RESTART GLOBAL */}
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button
                variant="outline"
                onClick={onRestart}
                className="w-full sm:w-auto gap-2 text-black"
              >
                <RotateCcw className="h-4 w-4" />
                Recommencer ce quiz
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Quiz;
