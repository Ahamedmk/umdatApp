import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Scale, Moon, Sun, Search, Filter, BookMarked, ChevronDown, ChevronUp } from 'lucide-react';

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
        details: "Les hanbalites considèrent la basmala comme obligatoire mais elle tombe en cas d'oubli."
      },
      { 
        point: "Nombre minimum de lavages", 
        hanafi: "Un seul suffit", 
        maliki: "Un seul suffit", 
        shafi: "Un seul suffit", 
        hanbali: "Un seul suffit",
        details: "Consensus sur la validité d'un seul lavage, le triple étant sunna."
      },
      { 
        point: "Allonger الغرّة والتحجيل", 
        hanafi: "Déconseillé (makrûh)", 
        maliki: "Déconseillé (makrûh)", 
        shafi: "Recommandé (modéré)", 
        hanbali: "Recommandé (modéré)",
        details: "Divergence sur l'extension des lavages au-delà des zones obligatoires."
      },
    ]
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
        details: "Consensus : droite pour les actes d'honneur, gauche pour leur contraire."
      },
      { 
        point: "Main droite pendant le besoin", 
        hanafi: "Makrûh", 
        maliki: "Makrûh", 
        shafi: "Makrûh", 
        hanbali: "Interdit (tahrîm)",
        details: "Les hanbalites sont plus stricts sur l'interdiction."
      },
    ]
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
        details: "Consensus absolu : ne pas faire face ni dos à la qibla en plein air."
      },
      { 
        point: "Qibla (toilettes bâties)", 
        hanafi: "Permis", 
        maliki: "Permis", 
        shafi: "Permis", 
        hanbali: "Interdit",
        details: "Les hanbalites maintiennent l'interdiction même en intérieur, contrairement à la majorité."
      },
      { 
        point: "Invocation à l'entrée", 
        hanafi: "Recommandée", 
        maliki: "Recommandée", 
        shafi: "Recommandée", 
        hanbali: "Recommandée",
        details: "« اللهم إني أعوذ بك من الخبث والخبائث » avant d'entrer."
      },
    ]
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
        details: "Consensus : eau et pierres (minimum 3) sont légitimes."
      },
      { 
        point: "Meilleure méthode", 
        hanafi: "Combiner (pierres + eau)", 
        maliki: "Combiner (pierres + eau)", 
        shafi: "Combiner (pierres + eau)", 
        hanbali: "Combiner (pierres + eau)",
        details: "Consensus sur la supériorité de combiner les deux méthodes."
      },
    ]
  },
];

const SCHOOL_COLORS = {
  hanafi: "from-blue-500 to-blue-600",
  maliki: "from-green-500 to-green-600",
  shafi: "from-purple-500 to-purple-600",
  hanbali: "from-amber-500 to-amber-600",
};

export function Compare() {
  const [dark, setDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['Purification (Wuḍūʾ)']));
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [expandedDetails, setExpandedDetails] = useState(new Set());

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

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleDetails = (key) => {
    setExpandedDetails(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredData = COMPARISON_DATA.map(category => ({
    ...category,
    items: category.items.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.point.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
  })).filter(category => category.items.length > 0);

  const getConsensusLevel = (item) => {
    const opinions = [item.hanafi, item.maliki, item.shafi, item.hanbali];
    const unique = new Set(opinions);
    if (unique.size === 1) return { level: 'consensus', label: 'Consensus', color: 'emerald' };
    if (unique.size === 2) return { level: 'majority', label: 'Majorité', color: 'blue' };
    return { level: 'divergence', label: 'Divergence', color: 'orange' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-950 dark:via-amber-950 dark:to-orange-950 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Comparateur des 4 écoles</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Analyse comparative des divergences majeures</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <Switch checked={dark} onCheckedChange={toggleTheme} />
            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedSchool(selectedSchool === 'hanafi' ? 'all' : 'hanafi')}>
            <CardContent className="pt-4 pb-3 text-center">
              <BookMarked className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-xl font-bold mb-1">Hanafite</div>
              <div className="text-xs opacity-90">École d'Abu Hanifa</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedSchool(selectedSchool === 'maliki' ? 'all' : 'maliki')}>
            <CardContent className="pt-4 pb-3 text-center">
              <BookMarked className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-xl font-bold mb-1">Malikite</div>
              <div className="text-xs opacity-90">École de Malik</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedSchool(selectedSchool === 'shafi' ? 'all' : 'shafi')}>
            <CardContent className="pt-4 pb-3 text-center">
              <BookMarked className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-xl font-bold mb-1">Chafi'ite</div>
              <div className="text-xs opacity-90">École d'al-Shafi'i</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedSchool(selectedSchool === 'hanbali' ? 'all' : 'hanbali')}>
            <CardContent className="pt-4 pb-3 text-center">
              <BookMarked className="h-5 w-5 mx-auto mb-1 opacity-90" />
              <div className="text-xl font-bold mb-1">Hanbalite</div>
              <div className="text-xs opacity-90">École d'Ahmad</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un point de fiqh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-900"
                />
              </div>
              {selectedSchool !== 'all' && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSchool('all')}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Réinitialiser le filtre
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Tables by Category */}
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
              <Card key={catIdx} className="border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800 overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleCategory(category.category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                        <BookMarked className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-100">
                          {category.category}
                        </CardTitle>
                        <CardDescription>
                          {category.items.length} point{category.items.length > 1 ? 's' : ''} de comparaison
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
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10">
                              <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300 min-w-[250px]">
                                  Point de fiqh
                                </th>
                                <th className="text-left p-4 font-semibold text-blue-700 dark:text-blue-400 min-w-[180px]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                                    Hanafite
                                  </div>
                                </th>
                                <th className="text-left p-4 font-semibold text-green-700 dark:text-green-400 min-w-[180px]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-green-600" />
                                    Malikite
                                  </div>
                                </th>
                                <th className="text-left p-4 font-semibold text-purple-700 dark:text-purple-400 min-w-[180px]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600" />
                                    Chafi'ite
                                  </div>
                                </th>
                                <th className="text-left p-4 font-semibold text-amber-700 dark:text-amber-400 min-w-[180px]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-500 to-amber-600" />
                                    Hanbalite
                                  </div>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.items.map((item, idx) => {
                                const consensus = getConsensusLevel(item);
                                const detailKey = `${catIdx}-${idx}`;
                                const isExpanded = expandedDetails.has(detailKey);
                                
                                return (
                                  <React.Fragment key={idx}>
                                    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                      <td className="p-4">
                                        <div className="space-y-2">
                                          <div className="font-medium text-slate-800 dark:text-slate-200">
                                            {item.point}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge 
                                              variant="outline" 
                                              className={`text-xs bg-${consensus.color}-50 dark:bg-${consensus.color}-950 border-${consensus.color}-200 dark:border-${consensus.color}-800 text-${consensus.color}-700 dark:text-${consensus.color}-300`}
                                            >
                                              {consensus.label}
                                            </Badge>
                                            {item.details && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleDetails(detailKey)}
                                                className="h-6 px-2 text-xs"
                                              >
                                                {isExpanded ? 'Masquer' : 'Détails'}
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4 text-slate-700 dark:text-slate-300">
                                        <div className="flex items-start gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                          {item.hanafi}
                                        </div>
                                      </td>
                                      <td className="p-4 text-slate-700 dark:text-slate-300">
                                        <div className="flex items-start gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                          {item.maliki}
                                        </div>
                                      </td>
                                      <td className="p-4 text-slate-700 dark:text-slate-300">
                                        <div className="flex items-start gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                          {item.shafi}
                                        </div>
                                      </td>
                                      <td className="p-4 text-slate-700 dark:text-slate-300">
                                        <div className="flex items-start gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                          {item.hanbali}
                                        </div>
                                      </td>
                                    </tr>
                                    {isExpanded && item.details && (
                                      <tr className="bg-slate-50 dark:bg-slate-900/50">
                                        <td colSpan={5} className="p-4">
                                          <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                                              <BookMarked className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="leading-relaxed">
                                              <span className="font-semibold text-slate-700 dark:text-slate-300">Précision : </span>
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

        {/* Legend */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Légende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                  Consensus
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">Les 4 écoles s'accordent</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                  Majorité
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">3 écoles s'accordent</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
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