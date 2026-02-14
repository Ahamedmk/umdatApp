// /src/pages/NarratorsCollection.jsx

import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  Sparkles,
  BookOpen,
  Lock,
  Unlock,
  Star,
  Filter,
  Search,
} from "lucide-react";

import { NARRATORS_MOCK } from "@/data/narrators_mock";

const rarityConfig = {
  common: {
    label: "Commun",
    gradient: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.2)",
    borderGlow: "shadow-emerald-500/20",
  },
  rare: {
    label: "Rare",
    gradient: "from-indigo-500 to-purple-600",
    glowColor: "rgba(124, 58, 237, 0.2)",
    borderGlow: "shadow-indigo-500/20",
  },
  legendary: {
    label: "Légendaire",
    gradient: "from-amber-500 to-rose-600",
    glowColor: "rgba(251, 146, 60, 0.2)",
    borderGlow: "shadow-amber-500/20",
  },
  epic: {
  label: "Épique",
  gradient: "from-fuchsia-500 to-violet-600",
  glowColor: "rgba(217, 70, 239, 0.22)",
  borderGlow: "shadow-fuchsia-500/20",
},

};

function NarratorCard({
  narrator,
  index,
  isUnlocked: forcedUnlocked,
  onOpen,
}) {
  const [isHovered, setIsHovered] = useState(false);

  // 🔓 priorité à l’état calculé, sinon fallback sur le mock
  const isUnlocked =
    typeof forcedUnlocked === "boolean" ? forcedUnlocked : narrator.isUnlocked;

  const rarity = rarityConfig[narrator?.rarity] ?? rarityConfig.common;

  const initials = useMemo(() => {
    const parts = (narrator?.name_fr || "").split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase() || "??";
  }, [narrator?.name_fr]);

  return (
    <div
      className="group"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onOpen?.(narrator, isUnlocked)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen?.(narrator, isUnlocked);
          }
        }}
        className={`relative overflow-hidden border-2 transition-all duration-300 cursor-pointer h-full
          ${
            isUnlocked
              ? `border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 hover:shadow-2xl ${rarity.borderGlow} hover:-translate-y-1`
              : "border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/60 hover:shadow-lg hover:-translate-y-0.5"
          }
        `}
      >
        {/* Effet de brillance animé au survol */}
        {isUnlocked && isHovered && (
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 40%, ${rarity.glowColor} 50%, transparent 60%)`,
              animation: "shimmer 2s infinite",
            }}
          />
        )}

        {/* Glow de fond */}
        {isUnlocked && (
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${rarity.gradient} transition-opacity duration-300 ${
              isHovered ? "opacity-15" : "opacity-10"
            }`}
          />
        )}

        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Avatar initiales */}
              <div className="relative">
                <div className="h-14 w-14 rounded-xl overflow-hidden shadow-lg border-2 bg-slate-800/80 border-slate-200/60 dark:border-slate-700/80 flex items-center justify-center text-lg font-bold text-white">
                  <div
                    className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${rarity.gradient} ${
                      isHovered && isUnlocked ? "scale-110 rotate-3" : ""
                    }`}
                  >
                    {isUnlocked ? initials : "?"}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <CardTitle className="text-base flex items-center gap-1.5 mb-0.5">
                  <span className="truncate">
                    {isUnlocked ? narrator.name_fr : "Narrateur à débloquer"}
                  </span>
                  {isUnlocked ? (
                    <Unlock className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  )}
                </CardTitle>

                <CardDescription className="text-xs truncate">
                  {isUnlocked ? narrator.name_ar : "Continue ta mémorisation"}
                </CardDescription>

                {/* Badge nombre de hadiths */}
                {isUnlocked && narrator.hadith_count && (
                  <div className="mt-1">
                    <Badge className="bg-slate-900/90 dark:bg-slate-100 text-slate-50 dark:text-slate-900 border-0 text-[10px] flex items-center gap-1 px-2 py-0.5">
                      <BookOpen className="h-3 w-3" />
                      <span>{narrator.hadith_count} hadiths rapportés</span>
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <Badge
              className={`bg-gradient-to-r ${rarity.gradient} text-white border-0 flex items-center gap-1 shadow-md flex-shrink-0`}
            >
              <Star className="h-3 w-3" />
              <span className="text-[11px] font-semibold">{rarity.label}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-3 text-sm">
          {/* Badges infos */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {narrator.generation && (
              <Badge
                variant="outline"
                className="border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50"
              >
                {narrator.generation}
              </Badge>
            )}
            {narrator.region && (
              <Badge
                variant="outline"
                className="border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50"
              >
                📍 {narrator.region}
              </Badge>
            )}
            {narrator.death_year_h && (
              <Badge
                variant="outline"
                className="border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50"
              >
                † {narrator.death_year_h} H
              </Badge>
            )}
          </div>

          {/* Bio / locked message */}
          <div
            className={`transition-all duration-300 ${
              isHovered ? "max-h-40" : "max-h-28"
            } overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600`}
          >
            {isUnlocked ? (
              <>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed mb-2 text-sm">
                  {narrator.short_bio}
                </p>
                {narrator.key_anecdote && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-400 pl-2 py-1.5 rounded-r">
                    <p className="text-xs text-amber-700 dark:text-amber-300 italic">
                      💡 {narrator.key_anecdote}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 border border-dashed border-slate-300 dark:border-slate-600 space-y-2">
                <p className="text-slate-600 dark:text-slate-400 text-xs text-center leading-relaxed">
                  🔒 {narrator.unlock_by ||
                    "Maîtrise (4/5) un hadith rapporté par ce narrateur pour le débloquer."}
                </p>

                {narrator.unlock_hint && (
                  <div className="mx-auto w-fit px-3 py-1 rounded-full bg-white/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">
                    💡 Indice :{" "}
                    <span className="font-semibold">{narrator.unlock_hint}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CTA (facultatif) : page dédiée */}
          {isUnlocked && (
            <div className="pt-2">
              {/* IMPORTANT: stopPropagation pour ne pas ouvrir le Sheet quand on clique le lien */}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={(e) => e.stopPropagation()}
                asChild
              >
                <Link to={`/narrators/${narrator.slug}`}>
                  En savoir plus (page dédiée)
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Styles locaux (animations + scrollbar) */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thumb-slate-300::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}

export function NarratorsCollection() {
  const [filterRarity, setFilterRarity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unlockedIds, setUnlockedIds] = useState([]);

  // Drawer
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedNarrator, setSelectedNarrator] = useState(null);
  const [selectedUnlocked, setSelectedUnlocked] = useState(false);

  // 🔓 Récupérer les cartes débloquées depuis localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("unlocked_narrators");
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      setUnlockedIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setUnlockedIds([]);
    }
  }, []);

  const filteredNarrators = useMemo(() => {
    return NARRATORS_MOCK.filter((n) => {
      const matchesRarity =
        filterRarity === "all" || n.rarity === filterRarity;
      const matchesSearch =
        !searchQuery ||
        (n.name_fr || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.name_ar || "").includes(searchQuery);
      return matchesRarity && matchesSearch;
    });
  }, [filterRarity, searchQuery]);

  const total = NARRATORS_MOCK.length;

  // 🧮 Progression basée sur localStorage + mock
  const unlocked = NARRATORS_MOCK.filter(
    (n) => unlockedIds.includes(n.id) || n.isUnlocked
  ).length;

  const progress = total ? Math.round((unlocked / total) * 100) : 0;

  const openNarrator = (narrator, isUnlocked) => {
    setSelectedNarrator(narrator);
    setSelectedUnlocked(!!isUnlocked);
    setOpenSheet(true);
  };

  const rarity =
    selectedNarrator?.rarity && rarityConfig[selectedNarrator.rarity]
      ? rarityConfig[selectedNarrator.rarity]
      : rarityConfig.common;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-950 dark:via-emerald-950 dark:to-teal-900 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                  Collection des Narrateurs
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Débloque les grands transmetteurs de la Sunna 📚
                </p>
              </div>
            </div>

            {/* Carte de progression */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/30 backdrop-blur-sm">
              <CardContent className="px-5 py-4 space-y-3 min-w-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Collection
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {progress}%
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-3 bg-slate-200 dark:bg-slate-700"
                />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {unlocked} sur {total} narrateurs débloqués
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recherche + filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un narrateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 transition-all"
              />
            </div>

            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterRarity("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterRarity === "all"
                      ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  Tous
                </button>
                {Object.entries(rarityConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilterRarity(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterRarity === key
                        ? `bg-gradient-to-r ${config.gradient} text-white`
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grille */}
        {filteredNarrators.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNarrators.map((narrator, index) => {
              const unlockedComputed =
                unlockedIds.includes(narrator.id) || narrator.isUnlocked;

              return (
                <NarratorCard
                  key={narrator.id}
                  narrator={narrator}
                  index={index}
                  isUnlocked={unlockedComputed}
                  onOpen={openNarrator}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Aucun narrateur trouvé avec ces critères
            </p>
          </div>
        )}
      </div>

      {/* ✅ Drawer / Sheet "En savoir plus" */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          {selectedNarrator ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-bold">
                    {selectedUnlocked
                      ? selectedNarrator.name_fr
                      : "Narrateur à débloquer"}
                  </span>

                  <Badge
                    className={`ml-auto bg-gradient-to-r ${rarity.gradient} text-white border-0`}
                  >
                    {rarity.label}
                  </Badge>
                </SheetTitle>

                <SheetDescription>
                  {selectedUnlocked
                    ? selectedNarrator.name_ar
                    : selectedNarrator.unlock_by ||
                      "Maîtrise (4/5) un hadith rapporté par lui pour le débloquer."}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedNarrator.generation && (
                    <Badge variant="outline">{selectedNarrator.generation}</Badge>
                  )}
                  {selectedNarrator.region && (
                    <Badge variant="outline">📍 {selectedNarrator.region}</Badge>
                  )}
                  {selectedNarrator.death_year_h && (
                    <Badge variant="outline">† {selectedNarrator.death_year_h} H</Badge>
                  )}
                  {selectedNarrator.hadith_count && (
                    <Badge>📚 {selectedNarrator.hadith_count} hadiths</Badge>
                  )}
                </div>

                {selectedUnlocked ? (
                  <>
                    {/* Résumé */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Résumé</CardTitle>
                        <CardDescription>Lecture courte (≈ 2–3 minutes)</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {selectedNarrator.short_bio && <p>{selectedNarrator.short_bio}</p>}

                        {selectedNarrator.bio?.conversion_story && (
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                              Parcours / entrée dans l’islam
                            </p>
                            <p>{selectedNarrator.bio.conversion_story}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Anecdotes */}
                    {selectedNarrator.bio?.anecdotes?.length > 0 && (
                      <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Anecdotes marquantes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                          {selectedNarrator.bio.anecdotes.slice(0, 4).map((a, i) => (
                            <div key={i} className="flex gap-2">
                              <span>•</span>
                              <span>{a}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Sources */}
                    {selectedNarrator.bio?.sources?.length > 0 && (
                      <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Sources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          {selectedNarrator.bio.sources.map((s, i) => (
                            <div key={i}>- {s}</div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* CTA page dédiée */}
                    <Button className="w-full" asChild>
                      <Link to={`/narrators/${selectedNarrator.slug}`}>
                        Ouvrir la page complète
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Déblocage</CardTitle>
                      <CardDescription>Indice & condition</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                      <p>
                        🔒{" "}
                        {selectedNarrator.unlock_by ||
                          "Maîtrise (4/5) un hadith lié à ce narrateur."}
                      </p>
                      {selectedNarrator.unlock_hint && (
                        <p className="text-xs">
                          💡 <span className="font-semibold">Indice :</span>{" "}
                          {selectedNarrator.unlock_hint}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default NarratorsCollection;
