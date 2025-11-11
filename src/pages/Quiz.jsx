import React, { useMemo, useState, useEffect } from "react";
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
import { Brain, CheckCircle2, XCircle, Lightbulb, Moon, Sun, Trophy, Target, RotateCcw, Sparkles } from 'lucide-react';

// Mock data
const HADITHS_8_15 = [
  { number: 8, arabic_text: 'النص العربي للحديث الثامن حول الوضوء...', french_text: 'Description du wudû\' par le Prophète ﷺ...' },
  { number: 9, arabic_text: 'النص العربي للحديث التاسع حول التيمن...', french_text: 'Commencer par la droite dans les actes d\'honneur...' },
  { number: 10, arabic_text: 'النص العربي للحديث العاشر...', french_text: 'Les marques lumineuses (ghurra/tahjîl)...' },
  { number: 11, arabic_text: 'النص العربي للحديث الحادي عشر...', french_text: 'Invocation à l\'entrée des latrines...' },
  { number: 12, arabic_text: 'النص العربي للحديث الثاني عشر...', french_text: 'Ne pas faire face à la qibla en plein air...' },
  { number: 13, arabic_text: 'النص العربي للحديث الثالث عشر...', french_text: 'Ibn \'Umar voit le Prophète ﷺ dans une maison...' },
  { number: 14, arabic_text: 'النص العربي للحديث الرابع عشر...', french_text: 'Istinjâ\' avec eau ou pierres...' },
  { number: 15, arabic_text: 'النص العربي للحديث الخامس عشر...', french_text: 'Ne pas tenir de la main droite pendant le besoin...' },
];

const QUESTIONS = [
  // HADITH 8
  {
    n: 8,
    q: "Dans le hadith 8, quel geste est explicitement décrit après avoir lavé le visage ?",
    options: [
      "Essuyage de la tête (avant/arrière)",
      "Lavage des avant-bras sans mention des coudes",
      "Passage d'eau sur les oreilles sans essuyage de la tête",
      "Lavage des pieds avant le visage"
    ],
    correctIndex: 0,
    explain: "La description authentique mentionne le passage humide sur la tête en allers/retours ('أقبل وأدبر') après le lavage du visage."
  },
  {
    n: 8,
    q: "Selon le seed (avis hanbalites), quel est le statut de la basmala au wudû' ?",
    options: [
      "Nulle part mentionnée",
      "Recommandée (sunna) seulement",
      "Obligatoire, mais tombe en cas d'oubli",
      "Interdite"
    ],
    correctIndex: 2,
    explain: "Chez les hanbalites (et certains), la basmala est tenue pour obligatoire, avec dispense en cas d'oubli."
  },
  {
    n: 8,
    q: "Selon la majorité (hanafites/malikites/shafi'ites), combien de lavages valident le membre au minimum ?",
    options: ["Deux", "Un", "Quatre", "Trois"],
    correctIndex: 1,
    explain: "Un seul lavage suffit pour la validité ; le triple est sunna, comme indiqué dans le seed."
  },

  // HADITH 9
  {
    n: 9,
    q: "Le hadith 9 enseigne le « tayammun ». Dans quels types d'actes commence-t-on par la droite ?",
    options: [
      "Dans tous les actes sans exception",
      "Uniquement dans les actes de purification",
      "Dans les actes d'honneur (purification, habillement, etc.)",
      "Seulement pour mettre les chaussures"
    ],
    correctIndex: 2,
    explain: "Les quatre écoles : la droite est recommandée dans les actes d'honneur (purification, habillement…), la gauche pour l'inverse (ôter, sortir…)."
  },
  {
    n: 9,
    q: "Que disent les écoles lorsqu'un texte prouve la priorité de la main gauche dans un cas précis ?",
    options: [
      "On reste toujours à droite",
      "On suit l'exception : la gauche est prioritaire",
      "On choisit librement",
      "On alterne une fois droite, une fois gauche"
    ],
    correctIndex: 1,
    explain: "Les shafi'ites, par exemple, mentionnent l'exception quand elle est textuelle."
  },

  // HADITH 10
  {
    n: 10,
    q: "Que signifie « الغُرّة والتحجيل » dans le hadith 10 ?",
    options: [
      "Des invocations après le wudû'",
      "Des marques lumineuses sur les membres lavés",
      "Des vêtements spéciaux",
      "Des ablutions sèches"
    ],
    correctIndex: 1,
    explain: "La communauté sera appelée avec des traces lumineuses dues au wudû' (front/membres)."
  },

  // HADITH 11
  {
    n: 11,
    q: "Que dit-on à l'entrée des latrines selon le hadith 11 ?",
    options: [
      "On reste silencieux",
      "On dit : « اللهم إني أعوذ بك من الخبث والخبائث »",
      "On dit la basmala uniquement",
      "On fait du dhikr à voix haute"
    ],
    correctIndex: 1,
    explain: "C'est l'invocation enseignée par le Prophète ﷺ : demande de protection contre les démons mâles et femelles."
  },

  // HADITH 12
  {
    n: 12,
    q: "Que prescrit le hadith 12 en plein air (désert) ?",
    options: [
      "Permis de faire face à la qibla uniquement",
      "Permis de tourner le dos à la qibla uniquement",
      "Interdit de faire face ou dos à la qibla",
      "Indifférent"
    ],
    correctIndex: 2,
    explain: "En plein air : ne pas faire face ni dos à la qibla pour uriner/déféquer."
  },

  // HADITH 13
  {
    n: 13,
    q: "Que rapporte Ibn 'Umar dans le hadith 13 ?",
    options: [
      "Qu'il a vu le Prophète ﷺ en plein désert face à la qibla",
      "Qu'il a vu le Prophète ﷺ dans une maison, dos à la Ka'ba",
      "Qu'il a vu le Prophète ﷺ interdire le besoin en ville",
      "Qu'il a entendu un compagnon décrire un wudû' partiel"
    ],
    correctIndex: 1,
    explain: "Il voit le Prophète ﷺ sur deux briques, dans une maison, tourné vers le Shâm, dos à la Ka'ba."
  },

  // HADITH 14
  {
    n: 14,
    q: "Selon le hadith 14 et les avis, que peut-on utiliser pour l'istinjā' ?",
    options: [
      "Uniquement de l'eau",
      "Uniquement des pierres",
      "Eau ou pierres, avec validité des deux",
      "Ni l'un ni l'autre"
    ],
    correctIndex: 2,
    explain: "Les deux sont légitimes ; l'eau est plus nettoyante, et les pierres suffisent au minimum trois passages."
  },

  // HADITH 15
  {
    n: 15,
    q: "Selon le hadith 15, que ne faut-il pas faire avec la main droite pendant qu'on urine ?",
    options: [
      "Ouvrir la porte",
      "Tenir son sexe",
      "Se moucher",
      "Se peigner"
    ],
    correctIndex: 1,
    explain: "« لا يمسكنَّ أحدكم ذكره بيمينه وهو يبول » : ne pas tenir le sexe de la main droite."
  },
];

export function Quiz() {
  const [filterN, setFilterN] = useState("all");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [dark, setDark] = useState(false);
  const [showHint, setShowHint] = useState(false);

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

  const pool = useMemo(() => {
    if (filterN === "all") return QUESTIONS;
    const num = parseInt(filterN, 10);
    return QUESTIONS.filter((q) => q.n === num);
  }, [filterN]);

  const current = pool[index];
  const progress = pool.length ? Math.round(((index + (done ? 1 : 0)) / pool.length) * 100) : 0;
  const accuracy = pool.length ? Math.round((score / (index + (done ? 1 : 0))) * 100) : 0;

  const onValidate = () => {
    if (selected == null) return;
    const ok = selected === current.correctIndex;
    setScore((s) => s + (ok ? 1 : 0));
    setDone(true);
  };

  const onNext = () => {
    setSelected(null);
    setDone(false);
    setShowHint(false);
    if (index + 1 < pool.length) {
      setIndex((i) => i + 1);
    }
  };

  const onRestart = () => {
    setIndex(0);
    setSelected(null);
    setDone(false);
    setScore(0);
    setShowHint(false);
  };

  const handleFilterChange = (v) => {
    setFilterN(v);
    onRestart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quiz Interactif</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Teste tes connaissances sur les hadiths</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={filterN} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-40 bg-white dark:bg-slate-800">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous (8–15)</SelectItem>
                {[8,9,10,11,12,13,14,15].map(n => (
                  <SelectItem key={n} value={String(n)}>Hadith {n}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <Switch checked={dark} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white shadow-lg">
            <CardContent className="pt-4 pb-3 text-center">
              <Target className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-2xl font-bold mb-1">{index + (done ? 1 : 0)}</div>
              <div className="text-xs opacity-90">Questions</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white shadow-lg">
            <CardContent className="pt-4 pb-3 text-center">
              <Trophy className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-2xl font-bold mb-1">{score}</div>
              <div className="text-xs opacity-90">Bonnes</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-lg">
            <CardContent className="pt-4 pb-3 text-center">
              <Sparkles className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-2xl font-bold mb-1">{accuracy}%</div>
              <div className="text-xs opacity-90">Précision</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white shadow-lg">
            <CardContent className="pt-4 pb-3 text-center">
              <RotateCcw className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-2xl font-bold mb-1">{pool.length}</div>
              <div className="text-xs opacity-90">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Progression globale</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Main Quiz Card */}
        {pool.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
            <CardContent className="py-16 text-center">
              <Brain className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Sélectionne un hadith ci-dessus pour commencer</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
            
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="rounded-full">
                  Question {index + 1} / {pool.length}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Hadith {current.n}
                </Badge>
              </div>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
                {current.q}
              </CardTitle>
            </CardHeader>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            <CardContent className="space-y-6 pt-6 relative z-10">
              {/* Options */}
              <div className="grid gap-3">
                {current.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = done && i === current.correctIndex;
                  const isWrong = done && isSelected && i !== current.correctIndex;
                  
                  return (
                    <Button
                      key={i}
                      variant={isSelected && !done ? "default" : "outline"}
                      disabled={done}
                      onClick={() => setSelected(i)}
                      className={`justify-start text-left h-auto py-4 px-4 transition-all ${
                        isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950 border-2" : ""
                      } ${
                        isWrong ? "border-red-500 bg-red-50 dark:bg-red-950 border-2" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected && !done ? "border-white bg-white/20" : "border-slate-300 dark:border-slate-600"
                        } ${isCorrect ? "border-green-500 bg-green-500" : ""} ${isWrong ? "border-red-500 bg-red-500" : ""}`}>
                          {isCorrect && <CheckCircle2 className="h-4 w-4 text-white" />}
                          {isWrong && <XCircle className="h-4 w-4 text-white" />}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                {!done ? (
                  <>
                    <Button 
                      onClick={onValidate} 
                      disabled={selected == null}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md"
                    >
                      Valider ma réponse
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowHint(!showHint)}
                      className="gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      {showHint ? "Masquer" : "Indice"}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={onNext}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md"
                  >
                    {index + 1 < pool.length ? "Question suivante →" : "Terminer le quiz"}
                  </Button>
                )}
              </div>

              {/* Hint */}
              {showHint && !done && (
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        Relis le hadith {current.n} et ses commentaires pour trouver la réponse
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Explanation */}
              {done && (
                <Card className={selected === current.correctIndex 
                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" 
                  : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                }>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      {selected === current.correctIndex ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className={`text-sm font-semibold mb-1 ${
                          selected === current.correctIndex 
                            ? "text-green-800 dark:text-green-200" 
                            : "text-red-800 dark:text-red-200"
                        }`}>
                          {selected === current.correctIndex ? "Excellente réponse !" : "Pas tout à fait..."}
                        </div>
                        <div className={`text-sm ${
                          selected === current.correctIndex 
                            ? "text-green-700 dark:text-green-300" 
                            : "text-red-700 dark:text-red-300"
                        }`}>
                          {current.explain}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hadith Reference */}
        {pool.length > 0 && current && (
          <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Rappel — Hadith {current.n}
              </CardTitle>
              <CardDescription>Contexte pour ancrer ta compréhension</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-60">
                {(() => {
                  const h = HADITHS_8_15.find((x) => x.number === current.n);
                  if (!h) return <div className="text-sm text-muted-foreground">—</div>;
                  return (
                    <div className="space-y-3 pr-4">
                      <div dir="rtl" className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 border border-slate-200 dark:border-slate-700 font-serif text-lg leading-loose">
                        {h.arabic_text}
                      </div>
                      <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                        {h.french_text}
                      </div>
                    </div>
                  );
                })()}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Restart Button */}
        {pool.length > 0 && (
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={onRestart}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Recommencer ce quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;