// /src/pages/Learn.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import HowScoringWorksModal from "@/components/HowScoringWorksModal";

import { BookOpen, Search, Filter, ArrowRight, Sparkles } from "lucide-react";

import { supabase } from "../lib/supabase";
import { HADITHS_1_15 } from "../data/seed_hadiths_1_15";
import { useAuth } from "../context/AuthContext";

function toLocalISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getStatusMeta(status) {
  const STATUS_META = {
    new: {
      label: "Nouveau",
      className:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    },
    learning: {
      label: "En cours",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    },
    learned: {
      label: "Appris",
      className:
        "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    },
    mastered: {
      label: "Maîtrisé",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    },
    review: {
      label: "À revoir",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
    },
  };

  return STATUS_META[status] || STATUS_META.new;
}

function MasteryProgress({ wins = 0 }) {
  const safeWins = Math.min(Number(wins || 0), 3);

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i <= safeWins
                ? "bg-emerald-500"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] text-slate-500">{safeWins}/3</span>
    </div>
  );
}

function StatCard({ value, label, className }) {
  return (
    <Card className={`border-0 text-white shadow-lg ${className}`}>
      <CardContent className="pt-6 text-center">
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm opacity-90">{label}</div>
      </CardContent>
    </Card>
  );
}

export function Learn() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [loading, setLoading] = useState(true);
  const [progressByHadith, setProgressByHadith] = useState({});

  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadHadiths() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("hadiths")
          .select("number, arabic_text, french_text, source")
          .order("number", { ascending: true });

        if (error) throw error;
        if (!active) return;

        setItems(data?.length ? data : HADITHS_1_15);
      } catch (e) {
        console.error("Erreur chargement hadiths, fallback seeds:", e);
        if (active) setItems(HADITHS_1_15);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHadiths();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || items.length === 0) {
      setProgressByHadith({});
      return;
    }

    let active = true;

    async function loadProgress() {
      try {
        const numbers = items
          .map((h) => h.number)
          .filter((n) => typeof n === "number");

        if (numbers.length === 0) {
          if (active) setProgressByHadith({});
          return;
        }

        const { data, error } = await supabase
          .from("user_hadith_progress")
          .select(
            "hadith_number, status, next_review_date, last_result, mastery_wins"
          )
          .eq("user_id", user.id)
          .in("hadith_number", numbers);

        if (error) throw error;
        if (!active) return;

        const map = Object.fromEntries(
          (data || []).map((row) => [row.hadith_number, row])
        );

        setProgressByHadith(map);
      } catch (e) {
        console.error("Erreur loadProgress:", e);
        if (active) setProgressByHadith({});
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [user, items]);

  const sources = useMemo(() => {
    return [
      "all",
      ...new Set(items.map((h) => h.source).filter(Boolean)),
    ];
  }, [items]);

  const stats = useMemo(() => {
    const today = toLocalISODate();
    const rows = Object.values(progressByHadith);

    return rows.reduce(
      (acc, row) => {
        const masteryWins = Number(row.mastery_wins || 0);

        if (row.status === "learned") {
          acc.learned += 1;
          if (masteryWins >= 2) acc.almostMastered += 1;
        }

        if (row.status === "mastered") {
          acc.mastered += 1;
        }

        if (row.next_review_date && row.next_review_date <= today) {
          acc.dueToday += 1;
        }

        return acc;
      },
      {
        total: items.length,
        dueToday: 0,
        learned: 0,
        mastered: 0,
        almostMastered: 0,
      }
    );
  }, [items.length, progressByHadith]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return items.filter((h) => {
      const matchesSearch =
        !q ||
        String(h.number || "").includes(q) ||
        h.arabic_text?.includes(searchQuery.trim()) ||
        h.french_text?.toLowerCase().includes(q);

      const matchesSource =
        filterSource === "all" || h.source === filterSource;

      return matchesSearch && matchesSource;
    });
  }, [items, searchQuery, filterSource]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shrink-0">
              <BookOpen className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                  Apprendre
                </h2>
                <HowScoringWorksModal triggerText="Comment ça marche ?" />
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                {stats.total > 0
                  ? `Hadiths disponibles : ${stats.total}`
                  : "Aucun hadith pour le moment"}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {user
                  ? "Un hadith devient maîtrisé après 3 validations fortes (4 ou 5) espacées dans le temps."
                  : "Connecte-toi pour sauvegarder ta progression."}
              </p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="Rechercher par numéro, texte arabe ou français..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-900 w-full"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm max-w-[55vw] sm:max-w-none"
                >
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source === "all" ? "Toutes les sources" : source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            value={stats.total}
            label="Hadiths au total"
            className="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            value={user ? stats.dueToday : "–"}
            label="À réviser aujourd'hui"
            className="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <StatCard
            value={user ? stats.learned : "–"}
            label="Hadiths appris"
            className="bg-gradient-to-br from-teal-500 to-cyan-600"
          />
          <StatCard
            value={user ? stats.mastered : "–"}
            label="Hadiths maîtrisés"
            className="bg-gradient-to-br from-purple-500 to-pink-600"
          />
        </div>

        {user && stats.almostMastered > 0 && (
          <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Tu as <span className="font-semibold">{stats.almostMastered}</span>{" "}
                hadith{stats.almostMastered > 1 ? "s" : ""} presque maîtrisé
                {stats.almostMastered > 1 ? "s" : ""}{" "}
                <span className="text-slate-500 dark:text-slate-400">
                  (2 validations fortes sur 3).
                </span>
              </p>
            </CardContent>
          </Card>
        )}

        <ScrollArea className="h-[65vh] max-w-full overscroll-contain">
          <div className="space-y-4 px-0 sm:px-1">
            {loading ? (
              <>
                <Card className="animate-pulse border-slate-200 dark:border-slate-700">
                  <CardContent className="h-24 pt-6" />
                </Card>
                <Card className="animate-pulse border-slate-200 dark:border-slate-700">
                  <CardContent className="h-24 pt-6" />
                </Card>
              </>
            ) : filteredItems.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">
                    Aucun hadith trouvé
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((h) => {
                const progress = progressByHadith[h.number];
                const statusMeta = getStatusMeta(progress?.status);
                const masteryWins = Number(progress?.mastery_wins || 0);

                return (
                  <Card
                    key={h.number}
                    className="group relative w-full overflow-hidden border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-shadow duration-300 hover:shadow-lg"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge
                              variant="secondary"
                              className="rounded-full shrink-0"
                            >
                              #{h.number}
                            </Badge>

                            <Badge
                              variant="outline"
                              className="text-xs truncate max-w-[40vw] sm:max-w-none"
                            >
                              {h.source || "Source PDF"}
                            </Badge>

                            <Badge
                              variant="secondary"
                              className={`text-[10px] sm:text-xs rounded-full ${statusMeta.className}`}
                            >
                              {statusMeta.label}
                            </Badge>

                            {progress?.status === "learned" && (
                              <MasteryProgress wins={masteryWins} />
                            )}

                            {progress?.status === "mastered" && (
                              <Badge className="bg-emerald-500 text-white">
                                🏆
                              </Badge>
                            )}

                            <Sparkles className="h-3 w-3 text-yellow-500 shrink-0" />
                          </div>

                          <CardTitle className="text-lg text-slate-800 dark:text-slate-100 truncate">
                            Hadith {h.number}
                          </CardTitle>
                        </div>

                        <Button
                          asChild
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md md:group-hover:scale-[1.03] transition-transform will-change-transform"
                        >
                          <Link
                            to={`/hadith/${h.number}`}
                            className="flex items-center gap-2"
                          >
                            Ouvrir
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>

                    <Separator className="bg-slate-200 dark:bg-slate-700" />

                    <CardContent className="pt-4 relative z-10">
                      <div className="space-y-3">
                        <div
                          dir="rtl"
                          className="text-lg font-serif leading-loose text-slate-800 dark:text-slate-200 break-words overflow-hidden line-clamp-3 md:group-hover:line-clamp-none transition-all"
                        >
                          {h.arabic_text}
                        </div>

                        {h.french_text && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 md:group-hover:line-clamp-none transition-all">
                            {h.french_text}
                          </p>
                        )}

                        {progress?.next_review_date && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Prochaine révision : {progress.next_review_date}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default Learn;