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
  ClipboardCheck,
  Clock,
  Moon,
  Sun,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Target,
  Zap,
  RotateCcw,
} from "lucide-react";

const QUESTIONS = [
  { n: 8, q: "Dans le hadith 8, quel geste est explicitement décrit après avoir lavé le visage ?", options: ["Essuyage de la tête (avant/arrière)", "Lavage des avant-bras sans mention des coudes", "Passage d'eau sur les oreilles", "Lavage des pieds avant le visage"], correctIndex: 0, explain: "La description authentique mentionne le passage humide sur la tête." },
  { n: 8, q: "Selon les hanbalites, quel est le statut de la basmala au wudû' ?", options: ["Nulle part mentionnée", "Recommandée seulement", "Obligatoire, mais tombe en cas d'oubli", "Interdite"], correctIndex: 2, explain: "La basmala est tenue pour obligatoire avec dispense en cas d'oubli." },
  { n: 9, q: "Dans quels types d'actes commence-t-on par la droite ?", options: ["Dans tous les actes sans exception", "Uniquement purification", "Actes d'honneur (purification, habillement)", "Seulement les chaussures"], correctIndex: 2, explain: "La droite est recommandée dans les actes d'honneur." },
  { n: 10, q: "Que signifie « الغُرّة والتحجيل » ?", options: ["Invocations après wudû'", "Marques lumineuses sur membres lavés", "Vêtements spéciaux", "Ablutions sèches"], correctIndex: 1, explain: "Traces lumineuses dues au wudû'." },
  { n: 11, q: "Que dit-on à l'entrée des latrines ?", options: ["On reste silencieux", "« اللهم إني أعوذ بك من الخبث والخبائث »", "Basmala uniquement", "Dhikr à voix haute"], correctIndex: 1, explain: "Invocation de protection enseignée par le Prophète ﷺ." },
  { n: 12, q: "Que prescrit le hadith 12 en plein air ?", options: ["Permis face à qibla uniquement", "Permis dos à qibla uniquement", "Interdit face ou dos à qibla", "Indifférent"], correctIndex: 2, explain: "Ne pas faire face ni dos à la qibla en plein air." },
  { n: 13, q: "Que rapporte Ibn 'Umar ?", options: ["Prophète en désert face qibla", "Prophète en maison, dos à Ka'ba", "Interdiction besoin en ville", "Wudû' partiel"], correctIndex: 1, explain: "Dans une maison, dos à la Ka'ba." },
  { n: 14, q: "Que peut-on utiliser pour l'istinjā' ?", options: ["Uniquement eau", "Uniquement pierres", "Eau ou pierres, les deux valides", "Ni l'un ni l'autre"], correctIndex: 2, explain: "Deux voies légitimes." },
  { n: 15, q: "Que ne faut-il pas faire avec la main droite pendant qu'on urine ?", options: ["Ouvrir la porte", "Tenir son sexe", "Se moucher", "Se peigner"], correctIndex: 1, explain: "Interdit de tenir de la main droite." },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function ExamQuiz() {
  const [scope, setScope] = useState("all");
  const [duration, setDuration] = useState(8);
  const [started, setStarted] = useState(false);
  const [pool, setPool] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const pref = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const enable = pref ? pref === 'dark' : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle('dark', enable);
  }, []);

  const toggleTheme = (checked) => {
    setDark(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  const preparedPool = useMemo(() => {
    const list = scope === "all" ? QUESTIONS : QUESTIONS.filter((q) => q.n === parseInt(scope, 10));
    return shuffle(list);
  }, [scope]);

  const startExam = () => {
    const list = preparedPool;
    setPool(list);
    setIndex(0);
    setAnswers(Array(list.length).fill(null));
    setTimeLeft(Math.max(1, Math.floor(duration * 60)));
    setStarted(true);
    setFinished(false);
  };

  const timerRef = useRef(null);
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (started && timeLeft === 0 && !finished) {
      setFinished(true);
    }
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
    if (finished || index + 1 >= pool.length) return;
    setIndex((i) => i + 1);
  };

  const endExam = () => {
    setFinished(true);
    clearInterval(timerRef.current);
  };

  const score = useMemo(() => {
    if (!finished) return 0;
    return pool.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  }, [finished, pool, answers]);

  const progressPct = pool.length ? Math.round((index / pool.length) * 100) : 0;
  const scorePct = pool.length ? Math.round((score / pool.length) * 100) : 0;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const timeWarning = timeLeft > 0 && timeLeft <= 60;

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 dark:from-slate-950 dark:via-red-950 dark:to-rose-950 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mode Examen</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Teste tes connaissances sous pression</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border">
              <Sun className="h-4 w-4" />
              <Switch checked={dark} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4" />
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                Configuration
              </CardTitle>
              <CardDescription>Définis le périmètre et la durée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3 dark:text-gray-400">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Périmètre
                  </label>
                  <Select value={scope} onValueChange={setScope}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent  >
                      <SelectItem value="all">Tous (8–15)</SelectItem>
                      {[8,9,10,11,12,13,14,15].map(n => (
                        <SelectItem key={n} value={String(n)}>Hadith {n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">{preparedPool.length} questions</p>
                </div>

                <div className="space-y-3 dark:text-gray-400">
                  <label className="text-sm font-medium flex items-center gap-2 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    Durée
                  </label>
                  <Select value={String(duration)} onValueChange={(v)=>setDuration(parseInt(v,10))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5,8,10,12,15,20,30].map(m => (
                        <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">~{Math.round((duration*60)/preparedPool.length)}s/question</p>
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold">Règles :</p>
                    <ul className="space-y-1 list-disc list-inside text-xs">
                      <li>Pas de retour en arrière</li>
                      <li>Chronomètre dégressif</li>
                      <li>Correction à la fin uniquement</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={startExam} 
                className="w-full h-12 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                disabled={preparedPool.length === 0}
              >
                <Play className="h-5 w-5 mr-2" />
                Démarrer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (finished) {
    const getGrade = () => {
      if (scorePct >= 90) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-800' };
      if (scorePct >= 75) return { label: 'Très bien', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800' };
      if (scorePct >= 60) return { label: 'Bien', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800' };
      return { label: 'À améliorer', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800' };
    };

    const grade = getGrade();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 dark:from-slate-950 dark:via-red-950 dark:to-rose-950 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Résultats</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Analyse de performance</p>
            </div>
          </div>

          <Card className={`border-2 ${grade.border} ${grade.bg} shadow-xl`}>
            <CardContent className="pt-8">
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-white dark:bg-slate-800">
                  <Trophy className={`h-12 w-12 ${grade.color}`} />
                </div>
                <div>
                  <div className={`text-6xl font-bold ${grade.color}`}>{score} / {pool.length}</div>
                  <div className={`text-2xl font-semibold ${grade.color} mt-2`}>{scorePct}%</div>
                  <Badge className="mt-3 px-4 py-1 text-base">{grade.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Correction</CardTitle>
              <CardDescription>Revois tes réponses</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {pool.map((q, i) => {
                    const user = answers[i];
                    const ok = user === q.correctIndex;
                    
                    return (
                      <Card key={i} className={`border-2 ${ok ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'}`}>
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <Badge variant="outline">Q{i+1}</Badge>
                              <Badge variant="outline">H{q.n}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {ok ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                              <Badge variant={ok ? "default" : "destructive"}>{ok ? "Correct" : "Incorrect"}</Badge>
                            </div>
                          </div>

                          <div className="text-sm font-medium">{q.q}</div>

                          <div className="space-y-2 text-sm">
                            <div className={`p-2 rounded ${user != null ? 'bg-blue-100 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              <span className="font-semibold">Ta réponse :</span> {user == null ? <em>Aucune</em> : q.options[user]}
                            </div>
                            
                            {!ok && (
                              <div className="p-2 rounded bg-green-100 dark:bg-green-900">
                                <span className="font-semibold">Bonne réponse :</span> {q.options[q.correctIndex]}
                              </div>
                            )}
                          </div>

                          {q.explain && (
                            <>
                              <Separator />
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">Explication :</span> {q.explain}
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
              onClick={() => setStarted(false)}
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refaire
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const q = pool[index];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 dark:from-slate-950 dark:via-red-950 dark:to-rose-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Badge variant="secondary">Q {index + 1}/{pool.length}</Badge>
            <Badge variant="outline">H{q?.n}</Badge>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${
            timeWarning ? 'bg-red-100 dark:bg-red-900 text-red-700 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'
          }`}>
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
          <CardContent className="pt-6 space-y-4 dark:text-gray-400">
            <div className="grid gap-3">
              {q?.options.map((opt, i) => {
                const selected = answers[index] === i;
                return (
                  <Button
                    key={i}
                    variant={selected ? "default" : "outline"}
                    onClick={() => selectAnswer(i)}
                    className={`justify-start h-auto py-4 dark:text-gray-400 ${selected ? 'bg-gradient-to-r from-red-500 to-rose-600' : ''}`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selected ? 'border-white bg-white/20' : 'border-slate-300'
                      }`}>
                        {selected && <div className="w-3 h-3 rounded-full bg-white" />}
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
                Pas de retour
              </p>
              <Button 
                onClick={index + 1 < pool.length ? nextQ : endExam}
                disabled={answers[index] == null}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
              >
                {index + 1 < pool.length ? "Suivant →" : "Terminer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={endExam} className="w-full dark:text-gray-400">
          Terminer maintenant
        </Button>
      </div>
    </div>
  );
}

export default ExamQuiz;