import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff, Moon, Sun, Trophy, Sparkles, Brain } from 'lucide-react';

// Mock data - remplace par ton import réel
const HADITHS_8_15 = [
  { number: 8, arabic_text: 'النص العربي للحديث الثامن...', french_text: 'Traduction française du hadith 8...', source: 'Bukhari' },
  { number: 9, arabic_text: 'النص العربي للحديث التاسع...', french_text: 'Traduction française du hadith 9...', source: 'Muslim' },
  { number: 10, arabic_text: 'النص العربي للحديث العاشر...', french_text: 'Traduction française du hadith 10...', source: 'Tirmidhi' },
  { number: 11, arabic_text: 'النص العربي للحديث الحادي عشر...', french_text: 'Traduction française du hadith 11...', source: 'Abu Dawud' },
  { number: 12, arabic_text: 'النص العربي للحديث الثاني عشر...', french_text: 'Traduction française du hadith 12...', source: 'Bukhari' },
  { number: 13, arabic_text: 'النص العربي للحديث الثالث عشر...', french_text: 'Traduction française du hadith 13...', source: 'Muslim' },
  { number: 14, arabic_text: 'النص العربي للحديث الرابع عشر...', french_text: 'Traduction française du hadith 14...', source: 'Nasai' },
  { number: 15, arabic_text: 'النص العربي للحديث الخامس عشر...', french_text: 'Traduction française du hadith 15...', source: 'Ibn Majah' },
];

const nextReview = (current, quality) => {
  // Mock spaced repetition
  return {
    ease: current.ease + (quality >= 4 ? 0.1 : -0.2),
    interval_days: quality >= 4 ? current.interval_days + 1 : 0,
    repetitions: current.repetitions + 1,
    next_review_date: new Date(Date.now() + (quality >= 4 ? 86400000 : 3600000)).toISOString().slice(0, 10)
  };
};

export function Review() {
  const [idx, setIdx] = useState(0);
  const [showFr, setShowFr] = useState(false);
  const [dark, setDark] = useState(false);
  const [sessionStats, setSessionStats] = useState({ total: 0, perfect: 0, good: 0, needs_work: 0 });
  const hadiths = useMemo(() => HADITHS_8_15, []);
  const h = hadiths[idx];

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

  const answer = (quality) => {
    const current = { ease: 2.5, interval_days: 0, repetitions: 0 };
    const res = nextReview(current, quality);
    
    // Update session stats
    setSessionStats(prev => ({
      total: prev.total + 1,
      perfect: prev.perfect + (quality === 5 ? 1 : 0),
      good: prev.good + (quality === 4 ? 1 : 0),
      needs_work: prev.needs_work + (quality < 3 ? 1 : 0)
    }));
    
    console.log('Spaced result:', res);
    setIdx(i => (i + 1) % hadiths.length);
    setShowFr(false);
  };

  const progressPercent = ((idx + 1) / hadiths.length) * 100;

  const qualityLabels = [
    { value: 0, label: 'Oublié', desc: 'Je ne me souviens pas du tout', color: 'from-red-500 to-rose-600' },
    { value: 1, label: 'Très difficile', desc: 'Je me souviens à peine', color: 'from-orange-500 to-red-500' },
    { value: 2, label: 'Difficile', desc: 'Plusieurs erreurs', color: 'from-yellow-500 to-orange-500' },
    { value: 3, label: 'Moyen', desc: 'Quelques hésitations', color: 'from-blue-500 to-indigo-500' },
    { value: 4, label: 'Facile', desc: 'Bien mémorisé', color: 'from-emerald-500 to-teal-600' },
    { value: 5, label: 'Parfait', desc: 'Récitation fluide', color: 'from-green-500 to-emerald-600' },
  ];

  if (!h) return null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <RotateCcw className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Révision espacée</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Système SM-2 pour mémorisation optimale</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <Switch checked={dark} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </div>

          {/* Progress bar */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Progression de la session</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {idx + 1} / {hadiths.length}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Session stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">{sessionStats.total}</div>
                <div className="text-xs opacity-90">Total</div>
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
                <div className="text-xs opacity-90">Facile</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white shadow-lg">
              <CardContent className="pt-4 pb-3 text-center">
                <div className="text-2xl font-bold mb-1">{sessionStats.needs_work}</div>
                <div className="text-xs opacity-90">À revoir</div>
              </CardContent>
            </Card>
          </div>

          {/* Main review card */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
            
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    #{h.number}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {h.source || 'Source PDF'}
                  </Badge>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </div>
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100">
                Hadith {h.number}
              </CardTitle>
              <CardDescription>
                Récite en arabe, puis révèle la traduction pour t'auto-évaluer
              </CardDescription>
            </CardHeader>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            <CardContent className="space-y-6 pt-6 relative z-10">
              {/* Texte arabe */}
              <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div 
                  dir="rtl" 
                  className="text-2xl md:text-3xl leading-[2.5rem] font-serif text-slate-900 dark:text-slate-100 text-center"
                >
                  {h.arabic_text}
                </div>
              </div>

              {/* Bouton reveal / Traduction */}
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
                      <span className="text-sm text-slate-600 dark:text-slate-400">Traduction française</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowFr(false)}
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Masquer
                      </Button>
                    </div>
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {h.french_text}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-évaluation */}
              {showFr && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">Comment était ta récitation ?</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {qualityLabels.map((q) => (
                      <Tooltip key={q.value}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={q.value >= 4 ? 'default' : 'outline'}
                            onClick={() => answer(q.value)}
                            className={`h-auto py-4 flex-col gap-1 ${
                              q.value >= 4 
                                ? `bg-gradient-to-br ${q.color} text-white hover:opacity-90 border-0` 
                                : 'hover:border-slate-400 dark:hover:border-slate-500'
                            }`}
                          >
                            <span className="text-2xl font-bold">{q.value}</span>
                            <span className="text-xs font-medium">{q.label}</span>
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
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIdx(i => (i - 1 + hadiths.length) % hadiths.length)}
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            
            <Button 
              variant="ghost" 
              asChild
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <a href="/learn">Retour à la liste</a>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIdx(i => (i + 1) % hadiths.length)}
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Review;