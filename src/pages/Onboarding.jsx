// /src/pages/Onboarding.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ONBOARDING_KEY } from "../components/OnboardingGate";

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
import { Switch } from "@/components/ui/switch";

import {
  BookOpen,
  Sparkles,
  Target,
  Clock,
  CheckCircle2,
  Brain,
  Scale3d,
  Zap,
  ChevronLeft,
  ChevronRight,
  Play,
  Sun,
  Moon,
} from "lucide-react";

const SCREENS = [
  {
    key: "welcome",
    badge: "Bienvenue",
    title: "Mémorise Umdat al-Ahkām… sereinement",
    subtitle:
      "Une seule app pour apprendre les hadiths, suivre ta progression et comparer les avis des quatre écoles.",
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-600",
    bullets: [
      "Un design pensé pour le mobile et les révisions rapides.",
      "Tout est centré sur les 7 premiers hadiths… puis beaucoup plus.",
    ],
  },
  {
    key: "learn",
    badge: "Étape 1 · Apprendre",
    title: "Lis, écoute… puis coche ce que tu connais",
    subtitle:
      "Chaque hadith a son texte arabe, sa traduction et son audio pour t’accompagner.",
    icon: Sparkles,
    gradient: "from-green-500 to-emerald-600",
    bullets: [
      "Ouverture du détail du hadith depuis la page « Apprendre ».",
      "Lecture arabe + traduction française claire.",
      "Audio intégré pour répéter et affiner ta prononciation.",
    ],
  },
  {
    key: "schools",
    badge: "Étape 2 · Comprendre",
    title: "Compare les 4 écoles en un coup d’œil",
    subtitle:
      "Accède à la page « Comparateur » pour visualiser les divergences et les points d’accord.",
    icon: Scale3d,
    gradient: "from-amber-500 to-orange-600",
    bullets: [
      "Tableau adapté desktop + cartes lisibles sur mobile.",
      "Avis en arabe et en français pour chaque école.",
      "Badges « Consensus », « Majorité », « Divergence ».",
    ],
  },
  {
    key: "sm2",
    badge: "Étape 3 · Réviser intelligemment",
    title: "Ton cerveau + SM-2 = équipe gagnante",
    subtitle:
      "Depuis chaque hadith, tu t’auto-évalues et l’app planifie la prochaine révision.",
    icon: Brain,
    gradient: "from-blue-500 to-indigo-600",
    bullets: [
      "Boutons 0 → 5 pour dire si c’était facile ou difficile.",
      "Algorithme SM-2 : plus tu maîtrises, plus les révisions s’espacent.",
      "Tu ne révises que ce qui est vraiment nécessaire.",
    ],
  },
  {
    key: "exam",
    badge: "Étape 4 · Mode examen",
    title: "Teste-toi comme un vrai contrôle",
    subtitle:
      "Questionnaire chronométré, score final, correction détaillée… sans stress mais avec sérieux.",
    icon: CheckCircle2,
    gradient: "from-rose-500 to-red-600",
    bullets: [
      "Questions générées à partir des hadiths déjà appris.",
      "Deux modes : examen global et révision ciblée.",
      "Score, pourcentage et conseils pour t’améliorer.",
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [dark, setDark] = useState(false);
  const touchStartX = useRef(null);

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    navigate("/learn", { replace: true });
  };

  // thème sombre
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

  const current = SCREENS[index];
  const progressValue = ((index + 1) / SCREENS.length) * 100;

 const handleNext = () => {
  if (index < SCREENS.length - 1) {
    setIndex((i) => i + 1);
  } else {
    localStorage.setItem(ONBOARDING_KEY, "1");
    navigate("/learn", { replace: true });
  }
};

  const handlePrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const handlePrimaryClick = () => {
    handleNext();
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50;
    if (deltaX < -threshold) handleNext();
    else if (deltaX > threshold) handlePrev();
    touchStartX.current = null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 px-4 py-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="relative overflow-hidden border-slate-200 dark:border-slate-700 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${current.gradient} opacity-10`}
          />

          <CardHeader className="relative z-10 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                    >
                      Umdat al-Ahkām
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Étape {index + 1}/{SCREENS.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Memorisation & Fiqh assistés
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-700">
                <Sun className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                <Switch
                  checked={dark}
                  onCheckedChange={toggleTheme}
                  className="scale-75"
                />
                <Moon className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              </div>
            </div>
          </CardHeader>

          <CardContent
            className="relative z-10 pt-1 pb-5"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="mb-4">
              <Progress value={progressValue} className="h-1.5" />
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {SCREENS.map((screen, i) => {
                  const Icon = screen.icon;
                  return (
                    <div key={screen.key} className="w-full shrink-0 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`bg-gradient-to-r ${screen.gradient} text-white text-[11px]`}
                        >
                          {screen.badge}
                        </Badge>
                      </div>

                      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                        {screen.title}
                      </h1>

                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {screen.subtitle}
                      </p>

                      <div className="mt-2 p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex gap-3">
                        <div
                          className={`h-10 w-10 rounded-full bg-gradient-to-br ${screen.gradient} flex items-center justify-center shadow-sm`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                          {screen.bullets.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-0.5">
                                <Zap className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                              </span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {i === 0 && (
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>Onboarding : moins d’une minute.</span>
                        </div>
                      )}
                      {i === SCREENS.length - 1 && (
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>
                            Tu pourras toujours revenir ici depuis le menu plus tard.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={handlePrev}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>

                <div className="flex gap-1">
                  {SCREENS.map((s, i) => (
                    <button
                      key={s.key}
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === index
                          ? "w-5 bg-slate-900 dark:bg-slate-100"
                          : "w-2 bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                  ))}
                </div>

                <Button
  size="sm"
  variant="ghost"
  onClick={() => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    navigate("/learn", { replace: true });
  }}
  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-300"
>
  Passer
</Button>

              </div>

              <Button
                onClick={handlePrimaryClick}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg"
              >
                {index < SCREENS.length - 1 ? (
                  <>
                    Continuer
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Commencer à apprendre
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
