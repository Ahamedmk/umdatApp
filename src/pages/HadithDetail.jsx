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
  Scale3d, // ⬅️ remplace Scale
} from "lucide-react";

// === dépendances app (réelles) ===
import { supabase } from "../lib/supabase";
import { nextReview } from "../lib/spaced";
import { HADITHS_1_15 } from "../data/seed_hadiths_1_15";
import { useAuth } from "../context/AuthContext";

// --- util: récupérer le numéro depuis /hadith/:n ou ?n= ---
function useHadithNumberFromRouter() {
  const { n: nParam } = useParams(); // route style /hadith/:n
  const [sp] = useSearchParams(); // route style /hadith?n=8
  const loc = useLocation(); // force update quand l’URL change
  const raw = nParam ?? sp.get("n") ?? "8";
  const num = parseInt(raw, 10);
  return Number.isNaN(num) ? 8 : num;
}

// --- lecteur audio inline ---
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
  const [hideFR, setHideFR] = useState(false);
  const [dark, setDark] = useState(false);

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

  // charge le hadith (DB -> fallback seed)
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setHadith(null);
      setProgress(null);

      try {
        // 1) hadith
        const { data: rows, error } = await supabase
          .from("hadiths")
          .select("id, number, arabic_text, french_text, source, audio_url")
          .eq("number", hadithNumber)
          .limit(1);

        if (error) throw error;

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

          const full = {
            id: row.id,
            number: row.number,
            arabic_text: row.arabic_text,
            french_text: row.french_text,
            source: row.source,
            audio_url: row.audio_url || null,
            opinions,
          };
          if (active) setHadith(full);
        } else {
          if (active) setHadith(localSeed);
        }
      } catch (e) {
        if (active) setHadith(localSeed);
      } finally {
        if (active) setLoading(false);
        // remonte en haut à chaque changement
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [hadithNumber, localSeed]);

  const handleQuality = async (quality) => {
    if (!hadith) return;
    setSaving(true);
    try {
      const base = progress || { ease: 2.5, interval_days: 0, repetitions: 0 };
      const calc = nextReview(base, quality);
      const payload = {
        user_id: user ? user.id : null,
        hadith_id: hadith.id || null,
        status: quality >= 4 ? "learned" : "learning",
        ease: calc.ease,
        interval_days: calc.interval_days,
        repetitions: calc.repetitions,
        last_review_date: new Date().toISOString().slice(0, 10),
        next_review_date: calc.next_review_date,
      };

      // si pas connecté ou pas d’id DB, stock local
      if (!user || !hadith.id) {
        localStorage.setItem(
          `progress_${hadith.number}`,
          JSON.stringify(payload)
        );
        setProgress(payload);
      } else {
        const { error } = await supabase.from("user_progress").upsert(payload);
        if (error) throw error;
        setProgress(payload);
      }
    } catch {
      // fallback local si échec
      const base = progress || { ease: 2.5, interval_days: 0, repetitions: 0 };
      const calc = nextReview(base, quality);
      const payload = {
        status: quality >= 4 ? "learned" : "learning",
        ease: calc.ease,
        interval_days: calc.interval_days,
        repetitions: calc.repetitions,
        last_review_date: new Date().toISOString().slice(0, 10),
        next_review_date: calc.next_review_date,
      };
      localStorage.setItem(
        `progress_${hadith?.number || "local"}`,
        JSON.stringify(payload)
      );
      setProgress(payload);
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
    { value: 3, label: "Moyen", emoji: "🤔" },
    { value: 4, label: "Facile", emoji: "😊" },
    { value: 5, label: "Parfait", emoji: "✨" },
  ];

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

          {/* Texte & audio */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Texte & Audio
              </CardTitle>
              <CardDescription>
                Lis attentivement, écoute, puis mémorise.
              </CardDescription>
            </CardHeader>
            <Separator className="bg-slate-200 dark:bg-slate-700" />
            <CardContent className="space-y-6 pt-6 relative z-10">
              <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 border border-slate-200 dark:border-slate-700">
                <div
                  dir="rtl"
                  className="text-2xl md:text-3xl leading-[2.5rem] font-serif tracking-wide text-slate-900 dark:text-slate-100 text-center"
                >
                  {hadith.arabic_text}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <InlineAudio url={hadith.audio_url} />
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

          {/* Auto-évaluation */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Auto-évaluation (SM-2)
              </CardTitle>
              <CardDescription>
                Note ta maîtrise pour planifier la prochaine révision.
              </CardDescription>
            </CardHeader>
            <Separator className="bg-slate-200 dark:bg-slate-700" />
            <CardContent className="space-y-6 pt-6">
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
                          {progress.status === "learned"
                            ? "✅ Appris"
                            : "📚 En cours"}
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
    </TooltipProvider>
  );
}
