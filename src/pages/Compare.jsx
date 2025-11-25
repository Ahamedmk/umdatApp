import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Scale, Moon, Sun, Search, Filter, BookMarked, ChevronDown, ChevronUp } from "lucide-react";

/* ---- Données (remplace par vraies données quand prêtes) ---- */
const COMPARISON_DATA = [
  {
    category: "Purification (Wuḍūʾ)",
    items: [
      {
        point: "Basmala au wuḍūʾ",
        hanafi: "Sunna confirmée",
        maliki: "Recommandée",
        shafi: "Sunna",
        hanbali: "Obligatoire (sauf oubli)",
        details:
          "Les hanbalites considèrent la basmala comme obligatoire mais elle tombe en cas d'oubli.",
      },
      {
        point: "Nombre minimum de lavages",
        hanafi: "Un seul suffit",
        maliki: "Un seul suffit",
        shafi: "Un seul suffit",
        hanbali: "Un seul suffit",
        details: "Consensus sur la validité d'un seul lavage, le triple étant sunna.",
      },
      {
        point: "Allonger الغرّة والتحجيل",
        hanafi: "Déconseillé (makrûh)",
        maliki: "Déconseillé (makrûh)",
        shafi: "Recommandé (modéré)",
        hanbali: "Recommandé (modéré)",
        details:
          "Divergence sur l'extension des lavages au-delà des zones obligatoires.",
      },
    ],
  },
  {
    category: "Étiquette (Ādāb)",
    items: [
      {
        point: "Commencer par la droite (tayammun)",
        hanafi: "Recommandé dans l'honneur",
        maliki: "Recommandé dans l'honneur",
        shafi: "Recommandé dans l'honneur",
        hanbali: "Recommandé dans l'honneur",
        details:
          "Consensus : droite pour les actes d'honneur, gauche pour leur contraire.",
      },
      {
        point: "Main droite pendant le besoin",
        hanafi: "Makrûh",
        maliki: "Makrûh",
        shafi: "Makrûh",
        hanbali: "Interdit (tahrîm)",
        details: "Les hanbalites sont plus stricts sur l'interdiction.",
      },
    ],
  },
  {
    category: "Toilettes & Qibla",
    items: [
      {
        point: "Qibla en plein air",
        hanafi: "Interdit (face/dos)",
        maliki: "Interdit (face/dos)",
        shafi: "Interdit (face/dos)",
        hanbali: "Interdit (face/dos)",
        details:
          "Consensus absolu : ne pas faire face ni dos à la qibla en plein air.",
      },
      {
        point: "Qibla (toilettes bâties)",
        hanafi: "Permis",
        maliki: "Permis",
        shafi: "Permis",
        hanbali: "Interdit",
        details:
          "Les hanbalites maintiennent l'interdiction même en intérieur, contrairement à la majorité.",
      },
      {
        point: "Invocation à l'entrée",
        hanafi: "Recommandée",
        maliki: "Recommandée",
        shafi: "Recommandée",
        hanbali: "Recommandée",
        details:
          "« اللهم إني أعوذ بك من الخبث والخبائث » avant d'entrer.",
      },
    ],
  },
  {
    category: "Istinjāʾ",
    items: [
      {
        point: "Eau ou pierres",
        hanafi: "Les deux valides",
        maliki: "Les deux valides",
        shafi: "Les deux valides",
        hanbali: "Les deux valides",
        details:
          "Consensus : eau et pierres (minimum 3) sont légitimes.",
      },
      {
        point: "Meilleure méthode",
        hanafi: "Combiner (pierres + eau)",
        maliki: "Combiner (pierres + eau)",
        shafi: "Combiner (pierres + eau)",
        hanbali: "Combiner (pierres + eau)",
        details:
          "Consensus sur la supériorité de combiner les deux méthodes.",
      },
    ],
  },
];

/* ---- Couleurs fixes (pas de classes dynamiques) ---- */
const CONSENSUS_STYLES = {
  consensus:
    "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
  majority:
    "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  divergence:
    "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
};

function getConsensus(item) {
  const opinions = [item.hanafi, item.maliki, item.shafi, item.hanbali];
  const unique = new Set(opinions);
  if (unique.size === 1) return { level: "consensus", label: "Consensus" };
  if (unique.size === 2) return { level: "majority", label: "Majorité" };
  return { level: "divergence", label: "Divergence" };
}

export function Compare() {
  const [dark, setDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(["Purification (Wuḍūʾ)"])
  );
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState(new Set());

  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
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

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  const toggleDetails = (key) => {
    setExpandedDetails((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  /* ---- Filtrage texte ---- */
  const filteredData = useMemo(() => {
    return COMPARISON_DATA.map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.point.toLowerCase().includes(q) ||
          item.details?.toLowerCase().includes(q) ||
          item.hanafi.toLowerCase().includes(q) ||
          item.maliki.toLowerCase().includes(q) ||
          item.shafi.toLowerCase().includes(q) ||
          item.hanbali.toLowerCase().includes(q)
        );
      }),
    })).filter((c) => c.items.length);
  }, [searchQuery]);

  /* ---- Rendu d’une ligne “mobile card” ---- */
const MobileItem = ({ item, detailKey, isExpanded }) => {
    const { level, label } = getConsensus(item);
    const consensusClass = CONSENSUS_STYLES[level];

    const pairs = [
      {
        label: "Hanafite",
        color: "bg-blue-500",
        value: item.hanafi,
        key: "hanafi",
      },
      {
        label: "Malikite",
        color: "bg-green-500",
        value: item.maliki,
        key: "maliki",
      },
      {
        label: "Chafi'ite",
        color: "bg-purple-500",
        value: item.shafi,
        key: "shafi",
      },
      {
        label: "Hanbalite",
        color: "bg-amber-500",
        value: item.hanbali,
        key: "hanbali",
      },
    ].filter((p) => (selectedSchool === "all" ? true : p.key === selectedSchool));

    return (
      <div
        className="
          rounded-lg border w-full border-slate-200 dark:border-slate-700 
          p-4 space-y-3 
          max-h-64  /* ≈ 256px */
        "
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium text-slate-800 dark:text-slate-200 break-words text-pretty">
              {item.point}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className={consensusClass + " text-xs whitespace-nowrap"}
              >
                {label}
              </Badge>
              {item.details && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDetails(detailKey)}
                  className="h-6 px-2 text-xs text-black dark:hover:text-black"
                >
                  {isExpanded ? "Masquer" : "Détails"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {pairs.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${p.color} mt-2 shrink-0`}
              />
              <div className="text-slate-700 dark:text-slate-300 break-words">
                <span className="font-semibold">{p.label} : </span>
                {p.value}
              </div>
            </div>
          ))}
        </div>

        {isExpanded && item.details && (
          <div className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 text-sm text-slate-600 dark:text-slate-400 break-words">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Précision :{" "}
            </span>
            {item.details}
          </div>
        )}
      </div>
    );
  };



  return (
    <div className="min-h-screen w-full overflow-x-clip bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-950 dark:via-amber-950 dark:to-orange-950 px-4 sm:px-6 py-6 transition-colors duration-300">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shrink-0">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                Comparateur des 4 écoles
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Analyse comparative des divergences majeures
              </p>
            </div>
          </div>

          {/* <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <Switch checked={dark} onCheckedChange={toggleTheme} className="scale-90" />
            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div> */}
        </div>

        {/* Stat Cards (filtre par école) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "hanafi", label: "Hanafite", grad: "from-blue-500 to-blue-600" },
            { key: "maliki", label: "Malikite", grad: "from-green-500 to-green-600" },
            { key: "shafi", label: "Chafi'ite", grad: "from-purple-500 to-purple-600" },
            { key: "hanbali", label: "Hanbalite", grad: "from-amber-500 to-amber-600" },
          ].map((s) => (
            <Card
              key={s.key}
              className={`bg-gradient-to-br ${s.grad} border-0 text-white shadow-lg cursor-pointer hover:scale-105 transition-transform ${
                selectedSchool === s.key ? "ring-2 ring-offset-2 ring-white/70" : ""
              }`}
              onClick={() => setSelectedSchool(selectedSchool === s.key ? "all" : s.key)}
            >
              <CardContent className="pt-4 pb-3 text-center">
                <BookMarked className="h-5 w-5 mx-auto mb-1 opacity-90" />
                <div className="text-base font-bold mb-1">{s.label}</div>
                <div className="text-xs opacity-90">
                  {selectedSchool === s.key ? "Filtre actif" : "Cliquer pour filtrer"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un point de fiqh…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-900"
                />
              </div>
              {selectedSchool !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedSchool("all")}
                  className="gap-2 w-full sm:w-auto bg-slate-900! text-gray-500" 
                >
                  <Filter className="h-4 w-4 " />
                  Réinitialiser le filtre
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
              <CardContent className="py-16 text-center">
                <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Aucun résultat trouvé</p>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((category, catIdx) => (
              <Card
                key={catIdx}
                className="border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800 overflow-auto"
              >
                <CardHeader
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  onClick={() => toggleCategory(category.category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shrink-0">
                        <BookMarked className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-100 break-words">
                          {category.category}
                        </CardTitle>
                        <CardDescription>
                          {category.items.length} point{category.items.length > 1 ? "s" : ""} de comparaison
                        </CardDescription>
                      </div>
                    </div>
                    {expandedCategories.has(category.category) ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </CardHeader>

                {expandedCategories.has(category.category) && (
                  <>
                    <Separator className="bg-slate-200 dark:bg-slate-700" />
                    <CardContent className="p-0">
                      <ScrollArea className="max-h-[600px]">
                        {/* --- Mobile: cartes empilées --- */}
                        <div className="block md:hidden p-4 space-y-4">
                          {category.items.map((item, idx) => {
                            const detailKey = `${catIdx}-${idx}`;
                            const isExpanded = expandedDetails.has(detailKey);
                            return (
                              <MobileItem
                                key={idx}
                                item={item}
                                detailKey={detailKey}
                                isExpanded={isExpanded}
                              />
                            );
                          })}
                        </div>

                        {/* --- Desktop (md+): tableau --- */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10">
                              <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300 min-w-[260px]">
                                  Point de fiqh
                                </th>
                                <th className={`text-left p-4 font-semibold min-w-[220px] ${selectedSchool==='hanafi'?'bg-blue-50/60 dark:bg-blue-950/30':''}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    Hanafite
                                  </div>
                                </th>
                                <th className={`text-left p-4 font-semibold min-w-[220px] ${selectedSchool==='maliki'?'bg-green-50/60 dark:bg-green-950/30':''}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    Malikite
                                  </div>
                                </th>
                                <th className={`text-left p-4 font-semibold min-w-[220px] ${selectedSchool==='shafi'?'bg-purple-50/60 dark:bg-purple-950/30':''}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                                    Chafi'ite
                                  </div>
                                </th>
                                <th className={`text-left p-4 font-semibold min-w-[220px] ${selectedSchool==='hanbali'?'bg-amber-50/60 dark:bg-amber-950/30':''}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    Hanbalite
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.items.map((item, idx) => {
                                const { level, label } = getConsensus(item);
                                const detailKey = `${catIdx}-${idx}`;
                                const isExpanded = expandedDetails.has(detailKey);
                                const badgeClass = CONSENSUS_STYLES[level];

                                const SchoolCell = ({ value, dot }) => (
                                  <td className="p-4 text-slate-700 dark:text-slate-300 align-top">
                                    <div className="flex items-start gap-2">
                                      <div className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />
                                      <div className="break-words text-pretty">{value}</div>
                                    </div>
                                  </td>
                                );

                                return (
                                  <React.Fragment key={idx}>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                      <td className="p-4 align-top">
                                        <div className="space-y-2">
                                          <div className="font-medium text-slate-800 dark:text-slate-200 break-words text-pretty">
                                            {item.point}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`text-xs ${badgeClass}`}>
                                              {label}
                                            </Badge>
                                            {item.details && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDetails(detailKey)}
                                                className="h-6 px-2 text-xs text-black"
                                              >
                                                {isExpanded ? "Masquer" : "Détails"}
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      <SchoolCell value={item.hanafi} dot="bg-blue-500" />
                                      <SchoolCell value={item.maliki} dot="bg-green-500" />
                                      <SchoolCell value={item.shafi} dot="bg-purple-500" />
                                      <SchoolCell value={item.hanbali} dot="bg-amber-500" />
                                    </tr>

                                    {isExpanded && item.details && (
                                      <tr className="bg-slate-50 dark:bg-slate-900/40">
                                        <td colSpan={5} className="p-4">
                                          <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                                              <BookMarked className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="leading-relaxed break-words">
                                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                Précision :{" "}
                                              </span>
                                              {item.details}
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Légende */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Légende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={CONSENSUS_STYLES.consensus}>
                  Consensus
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">
                  Les 4 écoles s'accordent
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={CONSENSUS_STYLES.majority}>
                  Majorité
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">
                  3 écoles s'accordent
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={CONSENSUS_STYLES.divergence}>
                  Divergence
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">Avis variés</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Compare;
