// /src/pages/Learn.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { BookOpen, Search, Filter, ArrowRight, Sparkles } from "lucide-react";

import { supabase } from "../lib/supabase";
import { HADITHS_1_15 } from "../data/seed_hadiths_1_15";
import { useAuth } from "../context/AuthContext";

// Petit helper pour l'affichage des statuts
function getStatusMeta(row) {
  if (!row) {
    return {
      label: "Nouveau",
      className:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    };
  }

  switch (row.status) {
    case "mastered":
      return {
        label: "Maîtrisé",
        className:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
      };
    case "learning":
      return {
        label: "En cours",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
      };
    case "review":
      return {
        label: "À revoir",
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
      };
    case "new":
    default:
      return {
        label: "Nouveau",
        className:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      };
  }
}

export function Learn() {
  const { user } = useAuth();

  const [items, setItems] = useState([]); // liste dynamique de tous les hadiths
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [loading, setLoading] = useState(true);
  const [progressByHadith, setProgressByHadith] = useState({}); // { [number]: row }

  // thème déjà géré globalement → on garde juste la synchro initiale
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  // Charger tous les hadiths depuis la table `hadiths`
  // + fallback sur HADITHS_1_15 si la DB plante
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

        // Si la table est vide, on peut quand même fallback sur les seeds
        if (!data || data.length === 0) {
          if (active) setItems(HADITHS_1_15);
          return;
        }

        // data = liste complète des hadiths en DB
        if (active) setItems(data);
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

  // Charger la progression de l'utilisateur (si connecté),
  // en fonction des hadiths réellement présents (items)
  useEffect(() => {
    if (!user) {
      setProgressByHadith({});
      return;
    }

    let active = true;

    async function loadProgress() {
      try {
        // si aucun hadith chargé, on ne fait pas d'appel inutile
        if (!items || items.length === 0) {
          if (active) setProgressByHadith({});
          return;
        }

        const numbers = items
          .map((h) => h.number)
          .filter((n) => typeof n === "number");

        if (numbers.length === 0) {
          if (active) setProgressByHadith({});
          return;
        }

        const { data, error } = await supabase
          .from("user_hadith_progress")
          .select("hadith_number, status, next_review_date, last_result")
          .eq("user_id", user.id)
          .in("hadith_number", numbers);

        if (error) {
          console.error("Erreur loadProgress:", error);
          if (active) setProgressByHadith({});
          return;
        }

        const map = {};
        (data || []).forEach((row) => {
          map[row.hadith_number] = row;
        });

        if (active) setProgressByHadith(map);
      } catch (e) {
        console.error("Exception loadProgress:", e);
        if (active) setProgressByHadith({});
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, [user, items]);

  // Liste des sources pour le filtre (dynamique)
  const sources = useMemo(() => {
    const set = new Set();
    items.forEach((h) => h.source && set.add(h.source));
    return ["all", ...Array.from(set)];
  }, [items]);

  // Stats basées sur la progression Supabase
  const stats = useMemo(() => {
    const res = {
      total: items.length,
      dueToday: 0,
      mastered: 0,
    };

    const today = new Date().toISOString().slice(0, 10);

    Object.values(progressByHadith).forEach((row) => {
      if (row.status === "mastered") res.mastered += 1;
      if (row.next_review_date && row.next_review_date <= today) {
        res.dueToday += 1;
      }
    });

    return res;
  }, [items, progressByHadith]);

  // Filtrage (recherche + source)
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim();
    return (items || []).filter((h) => {
      const matchesSearch =
        q === "" ||
        h.number?.toString().includes(q) ||
        (h.arabic_text && h.arabic_text.includes(q)) ||
        (h.french_text &&
          h.french_text.toLowerCase().includes(q.toLowerCase()));

      const matchesSource = filterSource === "all" || h.source === filterSource;
      return matchesSearch && matchesSource;
    });
  }, [items, searchQuery, filterSource]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shrink-0">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                Apprendre
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {stats.total > 0
                  ? `Hadiths disponibles : ${stats.total}`
                  : "Aucun hadith pour le moment"}
              </p>
              {!user && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Connecte-toi pour sauvegarder ta progression.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recherche & filtre */}
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
                  {sources.map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? "Toutes les sources" : s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats rapides (connectées à Supabase) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">{stats.total}</div>
              <div className="text-sm opacity-90">Hadiths au total</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">
                {user ? stats.dueToday : "–"}
              </div>
              <div className="text-sm opacity-90">
                À réviser aujourd&apos;hui
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">
                {user ? stats.mastered : "–"}
              </div>
              <div className="text-sm opacity-90">Hadiths maîtrisés</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des hadiths */}
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
                const statusMeta = getStatusMeta(progress);

                return (
                  <Card
                    key={h.number}
                    className="group relative w-full overflow-hidden border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-shadow duration-300 hover:shadow-lg"
                  >
                    {/* overlay sécurisé */}
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
