import React, { useEffect, useMemo, useRef, useState } from "react"; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  Target,
  Clock,
  Moon,
  Sun,
  Play,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  RotateCcw,
  TrendingUp,
  Brain,
  Sparkles,
} from "lucide-react";

// 🔗 On utilise maintenant le gros fichier commun
import { QUIZ_QUESTIONS_1_15 } from "@/data/quiz_questions_1_15";

// 🧮 Liste dynamique des numéros de hadith présents dans le fichier
const HADITH_NUMBERS = Array.from(
  new Set(QUIZ_QUESTIONS_1_15.map((q) => q.n))
).sort((a, b) => a - b);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 🔍 Charge les hadiths "faibles" à partir du localStorage, de façon dynamique
async function loadWeakHadithNumbers() {
  const today = new Date().toISOString().slice(0, 10);
  const numbers = [];

  for (const n of HADITH_NUMBERS) {
    const raw = localStorage.getItem(`progress_${n}`);
    if (!raw) {
      numbers.push(n);
      continue;
    }
    try {
      const p = JSON.parse(raw);
      const due = p.next_review_date && p.next_review_date <= today;
      const weak = p.status !== "learned" || (p.ease != null && p.ease < 2.4);
      if (due || weak) numbers.push(n);
    } catch {
      numbers.push(n);
    }
  }

  return numbers.length ? numbers : HADITH_NUMBERS;
}

/**
 * Construit le pool ciblé :
 * - `scope` = tableau de numéros de hadith (ex: [1, 3, 7, 9])
 * - pour chaque hadith du scope → 1 question choisie au hasard
 */
const buildTargetedPool = (scope) => {
  if (!scope.length) return [];

  // 1. Filtrer toutes les questions correspondant aux hadiths du scope
  const base = QUIZ_QUESTIONS_1_15.filter((q) => scope.includes(q.n));
  if (!base.length) return [];

  // 2. Regrouper par hadith n
  const byHadith = base.reduce((acc, q) => {
    if (!acc[q.n]) acc[q.n] = [];
    acc[q.n].push(q);
    return acc;
  }, {});

  // 3. Pour chaque hadith du scope, prendre 1 question aléatoire (s'il y en a)
  const onePerHadith = scope
    .filter((n) => byHadith[n] && byHadith[n].length)
    .map((n) => {
      const arr = byHadith[n];
      const randIndex = Math.floor(Math.random() * arr.length);
      return arr[randIndex];
    });

  // 4. Mélanger le résultat
  return shuffle(onePerHadith);
};

export function ExamQuizTargeted() {
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState([]);           // tableau de hadiths ciblés
  const [duration, setDuration] = useState(6);
  const [started, setStarted] = useState(false);
  const [pool, setPool] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  const toggleTheme = (checked) => {
    setDark(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  // 🔁 On calcule les hadiths "faibles"
  useEffect(() => {
    (async () => {
      setLoading(true);
      const targets = await loadWeakHadithNumbers();
      setScope(targets);
      setLoading(false);
    })();
  }, []);

  // 🧠 Pool préparé : 1 question / hadith du scope
  const preparedPool = useMemo(() => buildTargetedPool(scope), [scope]);

  const startExam = () => {
    setPool(preparedPool);
    setIndex(0);
    setAnswers(Array(preparedPool.length).fill(null));
    setTimeLeft(Math.max(1, Math.floor(duration * 60)));
    setStarted(true);
    setFinished(false);
  };

  const timerRef = useRef(null);
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (started && timeLeft === 0 && !finished) setFinished(true);
  }, [timeLeft, started, finished]);

  const selectAnswer = (i) => {
    if (finished) return;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = i;
      return copy;
    });
  };

  const nextQ = () => {
    if (!finished && index + 1 < pool.length) setIndex((i) => i + 1);
  };

  const endExam = () => {
    setFinished(true);
    clearInterval(timerRef.current);
  };

  const score = useMemo(() => {
    if (!finished) return 0;
    return pool.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
  }, [finished, pool, answers]);

  const progressPct = pool.length ? Math.round((index / pool.length) * 100) : 0;
  const scorePct = pool.length ? Math.round((score / pool.length) * 100) : 0;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const timeWarning = timeLeft > 0 && timeLeft <= 60;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-cyan-950 dark:to-blue-950 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <Card className="animate-pulse">
            <CardContent className="h-24 pt-6" />
          </Card>
          <Card className="animate-pulse">
            <CardContent className="h-40 pt-6" />
          </Card>
        </div>
      </div>
    );
  }

  // --------- ÉCRAN AVANT DE COMMENCER ----------
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-cyan-950 dark:to-blue-950 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Révision ciblée</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Focus sur tes points faibles
                </p>
              </div>
            </div>

            {/* Si tu veux réactiver le toggle thème, dé-commente : */}
            {/* 
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border">
              <Sun className="h-4 w-4" />
              <Switch checked={dark} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4" />
            </div> 
            */}
          </div>

          <Card className="border-2 border-cyan-200 dark:border-cyan-800 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                  <Brain className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Analyse de progression</h3>
                  <p className="text-sm mb-3">
                    {scope.length} hadith{scope.length > 1 ? "s" : ""} nécessitant une
                    révision prioritaire
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scope.map((n) => (
                      <Badge
                        key={n}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600"
                      >
                        H{n}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-500" />
                Configuration
              </CardTitle>
              <CardDescription>
                {preparedPool.length} question
                {preparedPool.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Durée
                </label>
                <Select
                  value={String(duration)}
                  onValueChange={(v) => setDuration(parseInt(v, 10))}
                >
                  <SelectTrigger className="w-48 dark:text-gray-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 6, 8, 10, 12, 15].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {preparedPool.length > 0
                    ? `~${Math.round(
                        (duration * 60) / preparedPool.length
                      )}s/question`
                    : "-"}
                </p>
              </div>

              <Separator />

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Mode intelligent</p>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Questions sélectionnées selon ton historique
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={startExam}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                disabled={preparedPool.length === 0}
              >
                <Play className="h-5 w-5 mr-2" />
                Commencer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --------- ÉCRAN DE RÉSULTATS ----------
  if (finished) {
    const getGrade = () => {
      if (scorePct >= 90)
        return {
          label: "Excellent",
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-950",
          border: "border-emerald-200",
        };
      if (scorePct >= 75)
        return {
          label: "Très bien",
          color: "text-cyan-600",
          bg: "bg-cyan-50 dark:bg-cyan-950",
          border: "border-cyan-200",
        };
      if (scorePct >= 60)
        return {
          label: "Bien",
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-950",
          border: "border-blue-200",
        };
      return {
        label: "À retravailler",
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-950",
        border: "border-orange-200",
      };
    };

    const grade = getGrade();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-cyan-950 dark:to-blue-950 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Résultats</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Révision ciblée
              </p>
            </div>
          </div>

          <Card className={`border-2 ${grade.border} ${grade.bg} shadow-xl`}>
            <CardContent className="pt-8">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-white dark:bg-slate-800">
                  <Trophy className={`h-12 w-12 ${grade.color}`} />
                </div>
                <div>
                  <div className={`text-6xl font-bold ${grade.color}`}>
                    {score}/{pool.length}
                  </div>
                  <div
                    className={`text-2xl font-semibold ${grade.color} mt-2`}
                  >
                    {scorePct}%
                  </div>
                  <Badge className="mt-3 px-4 py-1">{grade.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Correction</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {pool.map((q, i) => {
                    const userA = answers[i];
                    const ok = userA === q.correctIndex;

                    return (
                      <Card
                        key={i}
                        className={`border-2 ${
                          ok
                            ? "border-green-200 bg-green-50 dark:bg-green-950"
                            : "border-orange-200 bg-orange-50 dark:bg-orange-950"
                        }`}
                      >
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between">
                            <div className="flex gap-2">
                              <Badge variant="outline">Q{i + 1}</Badge>
                              <Badge variant="outline">H{q.n}</Badge>
                            </div>
                            <div className="flex gap-2">
                              {ok ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-orange-600" />
                              )}
                              <Badge variant={ok ? "default" : "destructive"}>
                                {ok ? "✓" : "✗"}
                              </Badge>
                            </div>
                          </div>

                          <div className="text-sm font-medium">{q.q}</div>

                          <div className="space-y-2 text-sm">
                            <div className="p-2 rounded bg-blue-100 dark:bg-blue-900">
                              <span className="font-semibold">Ta réponse :</span>{" "}
                              {userA == null ? (
                                <em>Aucune</em>
                              ) : (
                                q.options[userA]
                              )}
                            </div>

                            {!ok && (
                              <div className="p-2 rounded bg-green-100 dark:bg-green-900">
                                <span className="font-semibold">
                                  Bonne réponse :
                                </span>{" "}
                                {q.options[q.correctIndex]}
                              </div>
                            )}
                          </div>

                          {q.explain && (
                            <>
                              <Separator />
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {q.explain}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refaire
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --------- ÉCRAN DE QUESTION ----------
  const q = pool[index];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-cyan-950 dark:to-blue-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Badge variant="secondary">
              Q{index + 1}/{pool.length}
            </Badge>
            <Badge variant="outline">H{q?.n}</Badge>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${
              timeWarning
                ? "bg-orange-100 dark:bg-orange-900 text-orange-700 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <Clock className="h-5 w-5" />
            {mm}:{ss}
          </div>
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span className="font-semibold">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">{q?.q}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-3">
              {q?.options.map((opt, i) => {
                const selected = answers[index] === i;
                return (
                  <Button
                    key={i}
                    variant={selected ? "default" : "outline"}
                    onClick={() => selectAnswer(i)}
                    className={`justify-start h-auto py-4 ${
                      selected
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selected
                            ? "border-white bg-white/20"
                            : "border-slate-300"
                        }`}
                      >
                        {selected && (
                          <div className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="flex-1 text-left">{opt}</span>
                    </div>
                  </Button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Mode ciblé
              </p>
              <Button
                onClick={index + 1 < pool.length ? nextQ : endExam}
                disabled={answers[index] == null}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                {index + 1 < pool.length ? "Suivant →" : "Terminer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={endExam} className="w-full">
          Terminer maintenant
        </Button>
      </div>
    </div>
  );
}

export default ExamQuizTargeted;
