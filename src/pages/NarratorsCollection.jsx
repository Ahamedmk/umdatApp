import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, BookOpen, Lock, Unlock, Star, Filter, Search, Trophy, TrendingUp } from "lucide-react";

// Mock data
const NARRATORS_MOCK = [
  {
    id: 1,
    name_fr: "Abou Hourayra",
    name_ar: "أبو هريرة",
    rarity: "legendary",
    generation: "Compagnon",
    region: "Médine",
    death_year_h: "59",
    short_bio: "L'un des plus grands transmetteurs de hadiths, connu pour sa mémoire exceptionnelle et sa proximité avec le Prophète ﷺ.",
    key_anecdote: "Il a rapporté plus de 5000 hadiths grâce à sa mémoire prodigieuse",
    isUnlocked: true,
    stats: { learned: 8, total: 12 }
  },
  {
    id: 2,
    name_fr: "Aïcha bint Abi Bakr",
    name_ar: "عائشة بنت أبي بكر",
    rarity: "legendary",
    generation: "Compagnon",
    region: "Médine",
    death_year_h: "58",
    short_bio: "Épouse du Prophète ﷺ, elle est l'une des principales sources de hadiths concernant la vie privée du Prophète.",
    key_anecdote: "Sa science et sa sagesse étaient consultées par les plus grands compagnons",
    isUnlocked: true,
    stats: { learned: 5, total: 10 }
  },
  {
    id: 3,
    name_fr: "Abdullah ibn Umar",
    name_ar: "عبد الله بن عمر",
    rarity: "rare",
    generation: "Compagnon",
    region: "Médine",
    death_year_h: "73",
    short_bio: "Fils d'Omar ibn al-Khattab, connu pour sa piété et sa fidélité aux enseignements du Prophète ﷺ.",
    isUnlocked: true,
    stats: { learned: 3, total: 8 }
  },
  {
    id: 4,
    name_fr: "Ibn Abbas",
    name_ar: "ابن عباس",
    rarity: "rare",
    generation: "Compagnon",
    region: "La Mecque",
    death_year_h: "68",
    short_bio: "Cousin du Prophète ﷺ, surnommé 'l'interprète du Coran' pour sa profonde connaissance.",
    isUnlocked: false,
    stats: { learned: 0, total: 7 }
  },
  {
    id: 5,
    name_fr: "Anas ibn Malik",
    name_ar: "أنس بن مالك",
    rarity: "common",
    generation: "Compagnon",
    region: "Bassorah",
    death_year_h: "93",
    short_bio: "Serviteur personnel du Prophète ﷺ pendant dix ans, témoin privilégié de sa vie quotidienne.",
    isUnlocked: true,
    stats: { learned: 2, total: 5 }
  },
  {
    id: 6,
    name_fr: "Jabir ibn Abdullah",
    name_ar: "جابر بن عبد الله",
    rarity: "common",
    generation: "Compagnon",
    region: "Médine",
    death_year_h: "78",
    short_bio: "Compagnon qui a participé à de nombreuses batailles et rapporté de nombreux hadiths.",
    isUnlocked: false,
    stats: { learned: 0, total: 6 }
  }
];

const rarityConfig = {
  common: {
    label: "Commun",
    gradient: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.2)",
    borderGlow: "shadow-emerald-500/20"
  },
  rare: {
    label: "Rare",
    gradient: "from-indigo-500 to-purple-600",
    glowColor: "rgba(124, 58, 237, 0.2)",
    borderGlow: "shadow-indigo-500/20"
  },
  legendary: {
    label: "Légendaire",
    gradient: "from-amber-500 to-rose-600",
    glowColor: "rgba(251, 146, 60, 0.2)",
    borderGlow: "shadow-amber-500/20"
  },
};

function NarratorCard({ narrator, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const isUnlocked = narrator.isUnlocked;
  const rarity = rarityConfig[narrator.rarity || "common"];

  const initials = useMemo(() => {
    const parts = narrator.name_fr.split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  }, [narrator.name_fr]);

  const completionRate = narrator.stats 
    ? Math.round((narrator.stats.learned / narrator.stats.total) * 100)
    : 0;

  return (
    <div
      className="group"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`relative overflow-hidden border-2 transition-all duration-300 cursor-pointer h-full
          ${isUnlocked
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
              animation: "shimmer 2s infinite"
            }}
          />
        )}

        {/* Glow de fond */}
        {isUnlocked && (
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${rarity.gradient} transition-opacity duration-300 ${isHovered ? 'opacity-15' : 'opacity-10'}`} />
        )}

        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Avatar amélioré */}
              <div className="relative">
                <div
                  className={`h-14 w-14 flex items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg bg-gradient-to-br ${rarity.gradient} transition-transform duration-300 ${isHovered && isUnlocked ? 'scale-110 rotate-3' : ''}`}
                >
                  {isUnlocked ? initials : "?"}
                </div>
                {isUnlocked && completionRate === 100 && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 shadow-md">
                    <Trophy className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base flex items-center gap-1.5 mb-0.5">
                  <span className="truncate">{isUnlocked ? narrator.name_fr : "Narrateur à débloquer"}</span>
                  {isUnlocked ? (
                    <Unlock className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  )}
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {isUnlocked ? narrator.name_ar : "Continue ta mémorisation"}
                </CardDescription>
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
          {/* Badges infos - améliorés */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Badge variant="outline" className="border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50">
              {narrator.generation}
            </Badge>
            {narrator.region && (
              <Badge variant="outline" className="border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50">
                📍 {narrator.region}
              </Badge>
            )}
            {narrator.death_year_h && (
              <Badge variant="outline" className="border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50">
                † {narrator.death_year_h} H
              </Badge>
            )}
          </div>

          {/* Bio avec meilleure lisibilité */}
          <div className={`transition-all duration-300 ${isHovered ? 'max-h-40' : 'max-h-28'} overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600`}>
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
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-3 border border-dashed border-slate-300 dark:border-slate-600">
                <p className="text-slate-600 dark:text-slate-400 text-xs text-center leading-relaxed">
                  🔒 Continue d'apprendre les hadiths pour débloquer ce narrateur et découvrir son histoire fascinante
                </p>
              </div>
            )}
          </div>

          {/* Progress avec statistiques améliorées */}
          {isUnlocked && narrator.stats && (
            <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Progression
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {narrator.stats.learned}/{narrator.stats.total} hadiths
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={completionRate}
                  className="h-2 bg-slate-200 dark:bg-slate-700"
                />
                {completionRate > 0 && (
                  <span className="absolute right-0 -top-5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {completionRate}%
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
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

  const filteredNarrators = useMemo(() => {
    return NARRATORS_MOCK.filter(n => {
      const matchesRarity = filterRarity === "all" || n.rarity === filterRarity;
      const matchesSearch = !searchQuery || 
        n.name_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.name_ar.includes(searchQuery);
      return matchesRarity && matchesSearch;
    });
  }, [filterRarity, searchQuery]);

  const total = NARRATORS_MOCK.length;
  const unlocked = NARRATORS_MOCK.filter((n) => n.isUnlocked).length;
  const progress = total ? Math.round((unlocked / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-950 dark:via-emerald-950 dark:to-teal-900 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header amélioré */}
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

            {/* Carte de progression améliorée */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/30 backdrop-blur-sm">
              <CardContent className="px-5 py-4 space-y-3 min-w-[240px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Collection</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-3 bg-slate-200 dark:bg-slate-700" />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {unlocked} sur {total} narrateurs débloqués
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Barre de recherche et filtres */}
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

        {/* Grille de cartes */}
        {filteredNarrators.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNarrators.map((narrator, index) => (
              <NarratorCard key={narrator.id} narrator={narrator} index={index} />
            ))}
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
    </div>
  );
}

export default NarratorsCollection;