// /src/pages/SiraTimeline.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import {
  Sun,
  Moon,
  Map,
  Sparkles,
  BookOpen,
  ChevronRight,
  Compass,
  MapPin,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { HADITHS_1_15 } from "@/data/seed_hadiths_1_15";

// ──────────────────────────────────────
// 1. TIMELINE : mapping Sîra + hadiths 1–15
//    + stories immersives
// ──────────────────────────────────────

const SIRA_TIMELINE = [
  {
    id: "foundations-makkah",
    label: "Fondations cachées à La Mecque",
    approxYear: "Avant l’Hégire",
    place: "Mecque",
    theme: "Sincérité, intention, construction du cœur",
    color: "from-emerald-500 to-teal-600",
    vibes: ["Ikhlâs", "Niyya", "Début du chemin"],
    hadithNumbers: [1],
    story: {
      hook: "Imagine une petite maison à La Mecque, discrète, perdue au milieu des bruits de la ville… mais où Allah prépare des cœurs pour porter l’Islam jusqu’aux quatre coins du monde.",
      body: `
C’est l’époque où les musulmans sont peu nombreux. Ils se cachent, ils chuchotent, ils se retrouvent en secret dans la maison d’al-Arqam. Pas de grands discours, pas de batailles encore. Juste des cœurs qui apprennent à être sincères.

Dans cette phase, le Prophète ﷺ ne construit pas une armée. Il construit des intentions.

Le hadith des intentions — « les actes ne valent que par les intentions » — n’est pas juste une phrase de fiqh. C’est la clé de lecture de toute cette période mecquoise : chaque prière cachée, chaque sourire risqué, chaque pas vers la maison d’al-Arqam… Tout cela n’a de valeur qu’en fonction de ce qu’il y a dans le cœur.

Tu peux imaginer Bilâl, ‘Ammâr, Khabbâb… Ils n’ont pas encore de statut social, pas de victoire apparente. Mais ils ont quelque chose de plus fort que toute autorité : des intentions pures, alignées sur Allah.`,
      action: `
Application pour toi aujourd’hui :
Avant d’apprendre un hadith, de prier, ou même d’ouvrir cette application, pose-toi deux secondes : « Pourquoi je le fais ? Qui est-ce que j’essaie vraiment de satisfaire ? »
Même si ton apprentissage est encore “petit”, si ton intention est grande, tu es déjà dans la maison d’al-Arqam avec eux.`
    },
  },
  {
    id: "arrival-medina",
    label: "Arrivée à Médine – Purifier une nouvelle vie",
    approxYear: "Années 1–2 après l’Hégire",
    place: "Médine",
    theme: "Purification, eau, hygiène, préparation au culte",
    color: "from-blue-500 to-indigo-600",
    vibes: ["Tahâra", "Nouvelle communauté", "Préparation à la prière"],
    hadithNumbers: [2, 3, 4, 5],
    story: {
      hook: "Tu arrives dans une nouvelle ville. Nouveau climat, nouvelles personnes, nouvelle ambiance… et la première chose qu’Allah t’apprend, ce n’est pas la stratégie politique, mais comment te laver.",
      body: `
L’Hégire vers Médine, ce n’est pas juste un déménagement collectif. C’est une renaissance.

Les émigrés arrivent fatigués, blessés, pauvres pour certains. Les médinois les accueillent, partagent leurs maisons, leurs palmiers, leurs repas. Et au milieu de tout cela, le Prophète ﷺ enseigne des détails qui semblent simples : comment faire les ablutions, comment se purifier, comment utiliser l’eau, comment garder le corps propre.

Pourquoi ? Parce qu’une communauté qui veut se connecter à Allah doit être propre — dans ses cœurs, mais aussi dans ses habitudes.

Les hadiths sur la purification, l’eau qui coule, le lavage des membres, ce ne sont pas que des règles techniques. C’est comme si Allah te disait : « Avant de changer le monde, nettoie ce qui t’entoure. Avant de demander un haut niveau spirituel, commence par tes mains, ton visage, ton corps. »`,
      action: `
Application pour toi aujourd’hui :
La prochaine fois que tu fais tes ablutions, ralentis un peu. Imagine que tu te prépares à entrer dans la mosquée du Prophète ﷺ à Médine. Chaque goutte d’eau n’est pas juste de l’hygiène : c’est une préparation pour te tenir devant Allah.`
    },
  },
  {
    id: "prayer-structure",
    label: "La prière devient le centre de la Umma",
    approxYear: "Années 2–3 après l’Hégire",
    place: "Médine",
    theme: "Organisation de la prière, masjid, présence à Allah",
    color: "from-purple-500 to-pink-500",
    vibes: ["Salât", "Masjid", "Présence du cœur"],
    hadithNumbers: [6, 7, 8, 9],
    story: {
      hook: "Imagine entendre le adhân pour la première fois de ta vie… dans une ville qui, hier encore, ne connaissait même pas l’Islam.",
      body: `
La mosquée du Prophète ﷺ à Médine est simple. Le sol est en terre, le toit en troncs et feuilles de palmiers. Mais spirituellement, c’est le cœur du monde.

C’est là que les hadiths sur la prière prennent vie : comment se tenir, comment se concentrer, comment se préparer, comment respecter les horaires. Petit à petit, la prière n’est plus juste un acte individuel, elle devient le rythme de la ville.

On raconte que si tu observais Médine à cette époque, tu verrais des gens arrêter leurs discussions, fermer leurs boutiques, sortir de leurs maisons dès que l’appel à la prière retentit. La prière structure les journées, apaise les tensions, rassemble les cœurs.

Les hadiths que tu apprends sur la prière sont les briques invisibles de cette mosquée vivante. Chaque règle, chaque recommandation, chaque détail — c’est un morceau de l’ambiance de Médine que tu invites dans ta vie.`,
      action: `
Application pour toi aujourd’hui :
Regarde comment ta journée est construite. Est-ce que la prière s’adapte à ton planning… ou est-ce que ton planning tourne autour de la prière ?
Si tu commences juste par une seule prière que tu protèges vraiment à l’heure, avec concentration, tu t’installes symboliquement dans la mosquée de Médine avec eux.`
    },
  },
  {
    id: "daily-life-medina",
    label: "Vie quotidienne des compagnons",
    approxYear: "Années 3–5 après l’Hégire",
    place: "Médine",
    theme: "Vie de famille, relations, comportements du quotidien",
    color: "from-amber-500 to-orange-500",
    vibes: ["Famille", "Voisins", "Règles de vie"],
    hadithNumbers: [10, 11, 12],
    story: {
      hook: "Médine, ce n’est pas que la mosquée et les batailles. C’est des cuisines, des voisins, des enfants qui jouent, des disputes, des réconciliations… exactement comme chez toi.",
      body: `
À ce moment de la Sîra, l’Islam n’est plus seulement une croyance intime ou une petite communauté persécutée. C’est une société qui vit.

Les hadiths de cette période touchent à la vie de tous les jours : comment entrer chez quelqu’un, comment manger, comment parler, comment gérer les conflits, comment respecter la vie privée, comment se comporter en famille.

Tu peux imaginer les ruelles de Médine : des odeurs de pain chaud, des dattes, des maisons simples… mais une ambiance où chaque geste est l’occasion de se rapprocher d’Allah. Une porte qu’on frappe avec délicatesse, une parole qu’on retient, un droit qu’on respecte — tout cela devient ‘ibâda.

Les hadiths que tu apprends sur ces thèmes ne sont pas “moins spirituels” que ceux sur la prière. Au contraire : ils montrent que l’Islam veut transformer la façon dont tu vis chez toi, que personne ne voit sur TikTok ou dans les mosquées.`,
      action: `
Application pour toi aujourd’hui :
Choisis un seul comportement du quotidien — par exemple : ne pas élever la voix à la maison, dire “bismillah” avant de manger, ou respecter mieux la vie privée des autres — et décide d’en faire un acte d’adoration conscient.
Tu deviendras un petit morceau de Médine dans ton propre salon.`
    },
  },
  {
    id: "ethics-protection",
    label: "Protéger la dignité & les limites",
    approxYear: "Années 5–10 après l’Hégire",
    place: "Médine",
    theme: "Étiquette, protection de l’intimité, respect des règles",
    color: "from-rose-500 to-red-500",
    vibes: ["Adab", "Haya’", "Discipline spirituelle"],
    hadithNumbers: [13, 14, 15],
    story: {
      hook: "Plus la communauté grandit, plus une chose devient essentielle : protéger ce qui est sacré, visible comme invisible.",
      body: `
Dans cette phase, Médine est plus organisée, plus forte, plus reconnue. Mais avec la force vient aussi un danger : banaliser le respect des limites.

Les hadiths que tu apprends ici parlent d’étiquette, de pudeur, de protection de l’intimité, de respect des règles même dans des gestes très simples : entrer chez quelqu’un, utiliser un récipient, se comporter dans des moments de vulnérabilité.

On pourrait croire que ce sont des détails “durs” ou “compliqués”, mais en réalité ce sont des murs de protection : ils évitent les blessures, les malaises, les regrets. Ils construisent une société où chacun sait qu’il est respecté, où même ce qu’il fait seul est encadré par la conscience d’Allah.

Les compagnons ne voyaient pas ces règles comme des contraintes, mais comme un honneur : celui de vivre dans une communauté où tout — même le geste le plus banal — est connecté à la lumière de la Révélation.`,
      action: `
Application pour toi aujourd’hui :
Observe une limite qu’Allah t’a donnée (dans le regard, dans les réseaux, dans la parole, dans l’intimité) et dis-toi : « Ce n’est pas juste un “haram/halal” abstrait. C’est Allah qui protège ma dignité. »
Chaque fois que tu respectes cette limite, tu ressembles un peu plus aux habitants de Médine.`
    },
  },
];

const getHadithByNumber = (n) =>
  HADITHS_1_15.find((h) => h.number === n) || null;

// ──────────────────────────────────────
// 2. Composant principal
// ──────────────────────────────────────

export function SiraTimeline() {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);
  const [learnedSet, setLearnedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Story overlay
  const [storyStep, setStoryStep] = useState(null);

  // Thème persistant
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

  // Charger les hadiths appris
  useEffect(() => {
    let active = true;

    async function loadProgress() {
      setLoading(true);
      try {
        if (!user) {
          setLearnedSet(new Set());
          return;
        }

        const { data, error } = await supabase
          .from("user_hadith_progress")
          .select("hadith_number, status")
          .eq("user_id", user.id)
          .eq("status", "learned");

        if (error) throw error;

        const s = new Set((data || []).map((row) => row.hadith_number));
        if (active) setLearnedSet(s);
      } catch (e) {
        console.error("Erreur chargement progression timeline:", e);
        if (active) setLearnedSet(new Set());
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Stats globales
  const globalStats = useMemo(() => {
    const allNumbers = SIRA_TIMELINE.flatMap((b) => b.hadithNumbers);
    const unique = Array.from(new Set(allNumbers));
    const learned = unique.filter((n) => learnedSet.has(n));
    const pct = unique.length
      ? Math.round((learned.length / unique.length) * 100)
      : 0;

    return {
      total: unique.length,
      learned: learned.length,
      pct,
    };
  }, [learnedSet]);

  // Étape actuelle (mini badge)
  const currentStep = useMemo(() => {
    if (!learnedSet || learnedSet.size === 0) return null;

    const learnedNumbers = Array.from(learnedSet);
    const maxLearned = Math.max(...learnedNumbers);

    const directStep = SIRA_TIMELINE.find((step) =>
      step.hadithNumbers.includes(maxLearned)
    );
    if (directStep) return directStep;

    for (const step of SIRA_TIMELINE) {
      if (step.hadithNumbers.some((n) => learnedSet.has(n))) {
        return step;
      }
    }

    return null;
  }, [learnedSet]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 dark:from-slate-950 dark:via-emerald-950 dark:to-blue-950 px-4 sm:px-6 py-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HERO / HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-600 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff,_transparent_60%)]" />
          <div className="relative px-5 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-3 rounded-2xl bg-white/15 backdrop-blur-sm shadow-md">
                <Map className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/15 backdrop-blur text-xs border border-white/20 rounded-full">
                    Umdat al-Ahkām • 1–15
                  </Badge>
                  <Badge className="bg-emerald-900/40 border border-emerald-300/40 text-xs rounded-full">
                    Mode immersion Sîra
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  Ta progression dans l’histoire du Prophète ﷺ
                </h1>
                <p className="text-sm sm:text-[15px] text-emerald-50/90 max-w-xl">
                  Chaque hadith que tu mémorises n’est pas juste une phrase :
                  c’est un morceau de la Sîra qui s’allume dans ta mémoire.
                </p>

                {/* ⭐ Mini badge “Tu es ici dans la Sîra” */}
                {currentStep && (
                  <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full bg-black/15 border border-emerald-200/40 backdrop-blur-sm text-[11px] sm:text-xs">
                    <MapPin className="h-3.5 w-3.5 text-emerald-200" />
                    <span className="text-emerald-50/90">
                      Tu es actuellement dans :{" "}
                      <span className="font-semibold">
                        {currentStep.label}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2 bg-black/10 px-3 py-2 rounded-full border border-white/15 backdrop-blur">
                <Sun className="h-4 w-4" />
                <Switch checked={dark} onCheckedChange={toggleTheme} />
                <Moon className="h-4 w-4" />
              </div>

              <div className="hidden sm:flex flex-col items-end text-right text-sm">
                <span className="text-emerald-50/80">Hadiths liés appris</span>
                <span className="text-lg font-semibold">
                  {globalStats.learned} / {globalStats.total}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar globale */}
          <div className="relative bg-black/10 backdrop-blur-sm px-5 sm:px-8 py-3 border-t border-white/20">
            <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-50/90 mb-1.5">
              <span>Progression globale sur cette timeline</span>
              <span className="font-semibold">{globalStats.pct} %</span>
            </div>
            <Progress
              value={globalStats.pct}
              className="h-2 bg-emerald-950/40"
            />
          </div>
        </div>

        {/* Message si non connecté */}
        {!user && (
          <p className="text-xs text-red-500">
            Connecte-toi pour que ta progression soit prise en compte dans la
            timeline.
          </p>
        )}

        {/* TIMELINE PRINCIPALE */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-500" />
              Parcours chronologique
            </CardTitle>
            <CardDescription>
              De la sincérité à La Mecque jusqu’aux règles de conduite à
              Médine : suis le fil de la Sîra à travers tes hadiths.
            </CardDescription>
          </CardHeader>
          <Separator className="bg-slate-200 dark:bg-slate-700" />
          <CardContent className="pt-6">
            <ScrollArea className="h-[540px] pr-4">
              <ol className="relative border-s border-slate-200 dark:border-slate-700 ml-3">
                {SIRA_TIMELINE.map((step) => {
                  const totalH = step.hadithNumbers.length;
                  const learnedCount = step.hadithNumbers.filter((n) =>
                    learnedSet.has(n)
                  ).length;
                  const pct =
                    totalH > 0
                      ? Math.round((learnedCount / totalH) * 100)
                      : 0;

                  const isCurrentBlock =
                    !loading &&
                    learnedCount > 0 &&
                    learnedCount < totalH;
                  const isCompleted = !loading && learnedCount === totalH;

                  return (
                    <li key={step.id} className="mb-10 ml-6 last:mb-4">
                      {/* Point de timeline */}
                      <span
                        className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-slate-100 dark:ring-slate-900 bg-gradient-to-br ${
                          isCompleted
                            ? "from-emerald-400 to-emerald-600"
                            : isCurrentBlock
                            ? "from-amber-400 to-orange-500"
                            : "from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500"
                        }`}
                      />

                      <Card className="group border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="pt-4 space-y-4">
                          {/* Titre + meta */}
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                                  {step.label}
                                </h3>
                                {isCompleted && (
                                  <Badge className="bg-emerald-500 text-white text-[11px] rounded-full">
                                    Étape complétée ✅
                                  </Badge>
                                )}
                                {isCurrentBlock && !isCompleted && (
                                  <Badge className="bg-amber-500 text-white text-[11px] rounded-full">
                                    En cours ✨
                                  </Badge>
                                )}
                                {currentStep?.id === step.id && (
                                  <Badge className="bg-black/80 text-emerald-200 text-[10px] rounded-full">
                                    Tu es ici 📍
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {step.place} • {step.approxYear}
                              </p>
                            </div>

                            <div className="text-right space-y-1">
                              <Badge
                                className={`bg-gradient-to-r ${step.color} text-white text-[11px] rounded-full`}
                              >
                                {learnedCount}/{totalH} hadiths
                              </Badge>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {pct}% maîtrisés sur cette étape
                              </div>
                            </div>
                          </div>

                          {/* Thème + vibes */}
                          <div className="space-y-2">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                Fil conducteur :
                              </span>{" "}
                              {step.theme}
                            </p>

                            {step.vibes?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {step.vibes.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-[11px] rounded-full border-dashed"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Progression locale */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 dark:text-slate-400">
                                Progression sur cette étape
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {pct} %
                              </span>
                            </div>
                            <Progress value={pct} className="h-2" />
                          </div>

                          {/* Liste des hadiths liés */}
                          <div className="space-y-2 pt-1">
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              Hadiths reliés
                            </p>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {step.hadithNumbers.map((n) => {
                                const h = getHadithByNumber(n);
                                const isLearned = learnedSet.has(n);
                                return (
                                  <Card
                                    key={n}
                                    className={`border text-xs transition-all duration-300 ${
                                      isLearned
                                        ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950"
                                        : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60"
                                    } group-hover:border-emerald-300/80`}
                                  >
                                    <CardContent className="pt-3 pb-3 space-y-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <Badge
                                          variant="secondary"
                                          className="rounded-full px-2 py-0.5 text-[11px]"
                                        >
                                          H{n}
                                        </Badge>
                                        {isLearned && (
                                          <Badge className="bg-emerald-500 text-white px-2 py-0.5 text-[11px] rounded-full">
                                            Appris
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                                        {h?.french_text ||
                                          "Hadith lié à cette période."}
                                      </div>
                                      <div className="flex justify-end">
                                        <Button
                                          asChild
                                          variant="ghost"
                                          size="xs"
                                          className="h-6 px-2 text-[11px]"
                                        >
                                          <a href={`/hadith/${n}`}>
                                            <BookOpen className="h-3 w-3 mr-1" />
                                            Voir le texte
                                          </a>
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>

                          {/* Bouton story */}
                          {step.story && (
                            <div className="pt-2 flex justify-end">
                              <Button
                                size="sm"
                                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md rounded-full"
                                onClick={() => setStoryStep(step)}
                              >
                                <Sparkles className="h-4 w-4" />
                                Raconte-moi cette étape
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ol>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* CTA bas de page */}
        <div className="flex justify-center">
          <Button
            asChild
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
          >
            <a href="/learn">
              Continuer à apprendre les hadiths
              <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* ──────────────────────────────── */}
      {/* OVERLAY STORY IMMERSIVE        */}
      {/* ──────────────────────────────── */}
      {storyStep && storyStep.story && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* fond sombre cliquable pour fermer */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setStoryStep(null)}
          />

          <Card className="relative z-10 max-w-2xl w-full max-h-[80vh] overflow-hidden border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 shadow-2xl rounded-3xl">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_60%)]" />
            <div className="relative flex items-start justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-2 gap-3">
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-500/20 border border-emerald-300/40 text-[11px] rounded-full">
                    Immersion Sîra
                  </Badge>
                  <Badge className="bg-slate-900/60 border border-slate-700 text-[10px] rounded-full">
                    {storyStep.place} • {storyStep.approxYear}
                  </Badge>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold leading-snug">
                  {storyStep.label}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full hover:bg-slate-800"
                onClick={() => setStoryStep(null)}
              >
                <X className="h-4 w-4 text-slate-300" />
              </Button>
            </div>

            <Separator className="relative z-10 bg-slate-700/80" />

            <CardContent className="relative z-10 px-5 sm:px-6 pb-4 pt-3">
              <ScrollArea className="max-h-[55vh] pr-3">
                <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed">
                  {/* Hook */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex gap-3">
                    <div className="mt-0.5">
                      <Sparkles className="h-4 w-4 text-emerald-300" />
                    </div>
                    <p className="text-emerald-50/95 whitespace-pre-wrap">
                      {storyStep.story.hook}
                    </p>
                  </div>

                  {/* Corps */}
                  <div className="space-y-3 text-slate-100/90 whitespace-pre-wrap">
                    {storyStep.story.body}
                  </div>

                  {/* Action concrète */}
                  {storyStep.story.action && (
                    <div className="mt-3 p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/40">
                      <p className="text-xs uppercase tracking-wide text-emerald-300 mb-1.5">
                        Et toi, aujourd’hui
                      </p>
                      <p className="text-slate-50/95 whitespace-pre-wrap">
                        {storyStep.story.action}
                      </p>
                    </div>
                  )}

                  {/* Raccourci vers les hadiths liés */}
                  {storyStep.hadithNumbers?.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Hadiths de cette étape
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {storyStep.hadithNumbers.map((n) => (
                          <Button
                            key={n}
                            asChild
                            size="xs"
                            variant="outline"
                            className="rounded-full border-slate-600 text-[11px] bg-slate-900/80 hover:bg-slate-800"
                          >
                            <a href={`/hadith/${n}`}>
                              <BookOpen className="h-3 w-3 mr-1" />
                              H{n}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SiraTimeline;
