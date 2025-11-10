// /src/pages/HadithDetail.jsx
// JSX pur, design refait avec shadcn/ui + mode sombre (toggle)
// Prérequis UI : card, tabs, button, badge, separator, tooltip, switch, progress, scroll-area
// (ex: npx shadcn@latest add card tabs button badge separator tooltip switch progress scroll-area)

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { nextReview } from '../lib/spaced';
import { HADITHS_8_15 } from '../data/seed_hadiths_8_15';
import { useAuth } from '../context/AuthContext';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';

// shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

// icônes
import { Play, Pause, Moon, Sun, ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';

function useHadithNumberFromRouter() {
  const { n: nParam } = useParams();
  const [sp] = useSearchParams();
  const loc = useLocation(); // if you want to react to ?n= changes too
  const n = nParam || sp.get('n') || '8';
  const num = parseInt(n, 10);
  return Number.isNaN(num) ? 8 : num;
}

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
      {/* Ne pas rendre <audio> si pas d'URL */}
      {url ? (
        <>
          <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
          <Button variant="secondary" size="sm" onClick={toggle} className="gap-2">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'Pause' : 'Écouter'}
          </Button>
          <Badge variant="outline" className="hidden sm:inline">Lecture lente</Badge>
        </>
      ) : (
        <>
          <Button variant="secondary" size="sm" disabled className="gap-2">
            <Play className="h-4 w-4" /> Audio indisponible
          </Button>
          <span className="text-xs text-muted-foreground">Ajoute un MP3 dans `audio_url` pour activer.</span>
        </>
      )}
    </div>
  );
}


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
  let active = true;

  async function load() {
    if (!hadithNumber) return;
    setLoading(true);
    setHadith(null);          // reset view so UI reflects the change immediately
    setProgress(null);

    try {
      // ... your Supabase fetch for hadith + opinions ...
      // setHadith(full) or setHadith(localSeed)
    } catch (err) {
      // fallback to seed
      if (active) setHadith(localSeed);
    } finally {
      if (active) setLoading(false);
      // optional: scroll back to top on hadith change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  load();
  return () => { active = false; };
  // IMPORTANT: depend on hadithNumber (and user if you need)
}, [hadithNumber, user]);  // <= was missing before


  useEffect(() => {
    const pref = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enable = pref ? pref === 'dark' : prefersDark;
    setDark(enable);
    document.documentElement.classList.toggle('dark', enable);
  }, []);

  const toggleTheme = (checked) => {
    setDark(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  const localSeed = useMemo(() => {
    if (!hadithNumber) return null;
    return HADITHS_8_15.find(h => h.number === hadithNumber) || null;
  }, [hadithNumber]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!hadithNumber) return;
      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from('hadiths')
          .select(`id, number, arabic_text, french_text, source, audio_url`)
          .eq('number', hadithNumber)
          .limit(1);
        if (error) throw error;

        if (rows && rows.length > 0) {
          const row = rows[0];
          const { data: ops, error: e2 } = await supabase
            .from('schools_opinions')
            .select('school, arabic_text, french_text')
            .eq('hadith_id', row.id);
          if (e2) throw e2;
          const opinions = { Hanafi: {}, Maliki: {}, Shafi: {}, Hanbali: {} };
          (ops || []).forEach(o => {
            if (o.school === 'Hanafi') opinions.Hanafi = { ar: o.arabic_text, fr: o.french_text };
            if (o.school === 'Maliki') opinions.Maliki = { ar: o.arabic_text, fr: o.french_text };
            if (o.school === 'Shafi')  opinions.Shafi  = { ar: o.arabic_text, fr: o.french_text };
            if (o.school === 'Hanbali')opinions.Hanbali= { ar: o.arabic_text, fr: o.french_text };
          });
          const full = { id: row.id, number: row.number, arabic_text: row.arabic_text, french_text: row.french_text, source: row.source, audio_url: row.audio_url, opinions };
          if (active) setHadith(full);
        } else {
          if (active) setHadith(localSeed);
        }

        // Progression (si connecté et id présent)
        // (chargée plus tard au premier enregistrement pour simplicité)
      } catch (err) {
        if (active && !hadith) setHadith(localSeed);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hadithNumber]);

  const handleQuality = async (quality) => {
    if (!hadith) return;
    setSaving(true);
    try {
      const base = progress || { ease: 2.5, interval_days: 0, repetitions: 0 };
      const calc = nextReview(base, quality);
      const payload = {
        user_id: user ? user.id : null,
        hadith_id: hadith.id || null,
        status: quality >= 4 ? 'learned' : 'learning',
        ease: calc.ease,
        interval_days: calc.interval_days,
        repetitions: calc.repetitions,
        last_review_date: new Date().toISOString().slice(0,10),
        next_review_date: calc.next_review_date,
      };

      if (!user || !hadith.id) {
        localStorage.setItem(`progress_${hadith.number}`, JSON.stringify(payload));
        setProgress(payload);
        return;
      }

      const { error } = await supabase.from('user_progress').upsert(payload);
      if (error) throw error;
      setProgress(payload);
    } catch (e) {
      const base = progress || { ease: 2.5, interval_days: 0, repetitions: 0 };
      const calc = nextReview(base, quality);
      const payload = {
        status: quality >= 4 ? 'learned' : 'learning',
        ease: calc.ease,
        interval_days: calc.interval_days,
        repetitions: calc.repetitions,
        last_review_date: new Date().toISOString().slice(0,10),
        next_review_date: calc.next_review_date,
      };
      localStorage.setItem(`progress_${hadith?.number || 'local'}`, JSON.stringify(payload));
      setProgress(payload);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !hadith) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse"><CardContent className="h-24" /></Card>
        <Card className="animate-pulse"><CardContent className="h-40" /></Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2 py-1">Umdat</Badge>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Hadith {hadith.number}
            </h2>
            {hadith.source && <span className="text-xs text-muted-foreground">• {hadith.source}</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Sun className="h-4 w-4" />
              <Switch checked={dark} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Carte texte */}
        <Card className="border-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" /> Texte & Audio
            </CardTitle>
            <CardDescription>Lis, écoute, puis passe en mode mémorisation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div dir="rtl" className="text-2xl leading-[2.2rem] font-serif tracking-wide">
              {hadith.arabic_text}
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <InlineAudio url={hadith.audio_url} />
              <Button size="sm" onClick={() => setHideFR(v=>!v)}>
                {hideFR ? 'Afficher la traduction' : 'Masquer la traduction'}
              </Button>
            </div>
            {!hideFR && (
              <p className="text-base text-muted-foreground">
                {hadith.french_text}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Avis des 4 écoles */}
        {hadith.opinions && (
          <Card className="border-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Avis des quatre écoles</CardTitle>
              <CardDescription>Compare rapidement les formulations arabe/français.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Hanafi" className="w-full">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="Hanafi">Hanafite</TabsTrigger>
                  <TabsTrigger value="Maliki">Malikite</TabsTrigger>
                  <TabsTrigger value="Shafi">Chafi‘ite</TabsTrigger>
                  <TabsTrigger value="Hanbali">Hanbalite</TabsTrigger>
                </TabsList>

                {['Hanafi','Maliki','Shafi','Hanbali'].map(key => (
                  <TabsContent key={key} value={key} className="mt-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <Card className="bg-muted/30">
                        <CardHeader>
                          <CardDescription className="text-xs">النص الفقهي</CardDescription>
                          <Separator />
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-40 pr-3">
                            <div dir="rtl" className="leading-8">{hadith.opinions?.[key]?.ar || '—'}</div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardHeader>
                          <CardDescription className="text-xs">Texte en français</CardDescription>
                          <Separator />
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-40 pr-3">
                            <div className="leading-7">{hadith.opinions?.[key]?.fr || '—'}</div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Ancrage mémoire / SM-2 */}
        <Card className="border-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Auto‑évaluation</CardTitle>
            <CardDescription>Note ta récitation/compréhension pour planifier la prochaine révision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[0,1,2,3,4,5].map(q => (
                <Tooltip key={q}>
                  <TooltipTrigger asChild>
                    <Button variant={q>=4?"default":"outline"} onClick={() => handleQuality(q)} disabled={saving}>
                      {q}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">{q===0?'Oublié': q===5?'Parfait': '…'}</TooltipContent>
                </Tooltip>
              ))}
            </div>
            {progress?.next_review_date && (
              <div className="text-sm text-muted-foreground">
                Prochaine révision : <span className="font-medium text-foreground">{progress.next_review_date}</span> • Statut : <Badge variant="outline">{progress.status}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild disabled={hadith.number <= 8}>
            <a href={`/hadith?n=${(hadith.number - 1)}`} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Précédent
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="/learn">Retour à la liste</a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/hadith?n=${(hadith.number + 1)}`} className="flex items-center gap-2">
              Suivant <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}



// =============================
// UI/UX SHADCN – PAGES & NAV
// =============================
// Les snippets ci-dessous appliquent le même look & feel (shadcn + dark mode) aux autres pages.
// Prérequis shadcn ajoutés : alert, input, textarea, dropdown-menu, avatar (facultatif)
// npx shadcn@latest add alert input textarea dropdown-menu avatar











// =============================
// NOTE DARK MODE (TAILWIND)
// =============================
// tailwind.config.js -> module.exports = { darkMode: 'class', ... }
// Applique la classe `dark` sur <html> (déjà géré par HadithDetail.jsx) pour propager le thème partout.
