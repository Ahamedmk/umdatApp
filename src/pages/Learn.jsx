import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search, Filter, ArrowRight, Moon, Sun, Sparkles } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

// Mock data - remplace par ton import réel
const HADITHS_8_15 = [
  { number: 8, arabic_text: 'النص العربي للحديث الثامن...', french_text: 'Traduction française...', source: 'Bukhari' },
  { number: 9, arabic_text: 'النص العربي للحديث التاسع...', french_text: 'Traduction française...', source: 'Muslim' },
  { number: 10, arabic_text: 'النص العربي للحديث العاشر...', french_text: 'Traduction française...', source: 'Tirmidhi' },
  { number: 11, arabic_text: 'النص العربي للحديث الحادي عشر...', french_text: 'Traduction française...', source: 'Abu Dawud' },
  { number: 12, arabic_text: 'النص العربي للحديث الثاني عشر...', french_text: 'Traduction française...', source: 'Bukhari' },
  { number: 13, arabic_text: 'النص العربي للحديث الثالث عشر...', french_text: 'Traduction française...', source: 'Muslim' },
  { number: 14, arabic_text: 'النص العربي للحديث الرابع عشر...', french_text: 'Traduction française...', source: 'Nasai' },
  { number: 15, arabic_text: 'النص العربي للحديث الخامس عشر...', french_text: 'Traduction française...', source: 'Ibn Majah' },
];

export function Learn() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setItems(HADITHS_8_15);
    // Load theme preference
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

  // Filter logic
  const filteredItems = items.filter(h => {
    const matchesSearch = searchQuery === '' || 
      h.arabic_text.includes(searchQuery) || 
      h.french_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.number.toString().includes(searchQuery);
    const matchesSource = filterSource === 'all' || h.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const sources = ['all', ...new Set(items.map(h => h.source))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header avec toggle dark mode */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Apprendre</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Hadiths 8 → 15</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
            <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <Switch checked={dark} onCheckedChange={toggleTheme} />
            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par numéro, texte arabe ou français..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                >
                  {sources.map(s => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'Toutes les sources' : s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">{items.length}</div>
              <div className="text-sm opacity-90">Hadiths</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">{filteredItems.length}</div>
              <div className="text-sm opacity-90">Résultats</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold mb-1">{sources.length - 1}</div>
              <div className="text-sm opacity-90">Sources</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des hadiths */}
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">Aucun hadith trouvé</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((h) => (
                <Card 
                  key={h.number} 
                  className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="rounded-full">
                            #{h.number}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {h.source || 'Source PDF'}
                          </Badge>
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                        </div>
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-100">
                          Hadith {h.number}
                        </CardTitle>
                      </div>
                      <Button 
                        asChild 
                        size="sm" 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md group-hover:scale-105 transition-transform"
                      >
                        <a href={`/hadith?n=${h.number}`} className="flex items-center gap-2">
                          Ouvrir
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <Separator className="bg-slate-200 dark:bg-slate-700" />
                  
                  <CardContent className="pt-4 relative z-10">
                    <div className="space-y-3">
                      <div 
                        dir="rtl" 
                        className="text-lg font-serif leading-loose text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:line-clamp-none transition-all"
                      >
                        {h.arabic_text}
                      </div>
                      {h.french_text && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 group-hover:line-clamp-none transition-all">
                          {h.french_text}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default Learn;