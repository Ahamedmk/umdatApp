// /src/pages/ExamQuizTargeted.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { HADITHS_8_15 } from "../data/seed_hadiths_8_15";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

// UI shadcn
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

// ————— Reprend le même pool de questions que ExamQuiz —————
const QUESTIONS = [
  // H8
  { n: 8, q: "Dans le hadith 8, quel geste est explicitement décrit après avoir lavé le visage ?", options: ["Essuyage de la tête (avant/arrière)", "Lavage des avant-bras sans mention des coudes", "Passage d’eau sur les oreilles sans essuyage de la tête", "Lavage des pieds avant le visage"], correctIndex: 0, explain: "Essuyage avant/arrière (‘أقبل وأدبر’) après le visage." },
  { n: 8, q: "Selon le seed (avis hanbalites), quel est le statut de la basmala au wudû’ ?", options: ["Nulle part mentionnée", "Recommandée (sunna) seulement", "Obligatoire, mais tombe en cas d’oubli", "Interdite"], correctIndex: 2, explain: "Hanbalites : wâjib, tombe par oubli." },
  { n: 8, q: "Selon la majorité, combien de lavages valident le membre au minimum ?", options: ["Deux", "Un", "Quatre", "Trois"], correctIndex: 1, explain: "Une fois suffit pour la validité." },
  // H9
  { n: 9, q: "Le ‘tayammun’ s’applique : ", options: ["À tout sans exception", "Uniquement à la purification", "Aux actes d’honneur (purification, habillement…)", "Seulement au chaussage"], correctIndex: 2, explain: "Actes d’honneur → droite ; inverse → gauche." },
  { n: 9, q: "S’il existe un texte d’exception pour la gauche ?", options: ["Toujours droite", "On suit l’exception", "Libre choix", "On alterne"], correctIndex: 1, explain: "L’exception prévaut." },
  { n: 9, q: "Nature du ‘tayammun’ :", options: ["Obligation stricte", "Égalité D/G", "Recommandation (adab)", "Interdiction de la gauche"], correctIndex: 2, explain: "Recommandation/adab, pas obligation." },
  // H10
  { n: 10, q: "« الغُرّة والتحجيل » : ", options: ["Invocations", "Marques lumineuses des membres lavés", "Vêtements spéciaux", "Tayammum"], correctIndex: 1, explain: "Traces lumineuses du wudû’." },
  { n: 10, q: "Hanafites/Malikites sur l’extension :", options: ["Toujours recommandée", "Indifférente", "Déconseillée (makrûh)", "Obligatoire"], correctIndex: 2, explain: "Éviter l’excès, rester aux limites." },
  { n: 10, q: "Shafi‘ites/Hanbalites sur l’extension modérée :", options: ["Interdite", "Recommandée sans excès", "Toujours obligatoire", "Nulle"], correctIndex: 1, explain: "Recommandée avec mesure." },
  // H11
  { n: 11, q: "Invocation à l’entrée :", options: ["Silence", "اللهم إني أعوذ بك من الخبث والخبائث", "Basmala seule", "Dhikr fort"], correctIndex: 1, explain: "Protection contre les démons." },
  { n: 11, q: "Quand la prononcer ?", options: ["Après entrée", "Avant d’entrer", "Pendant le besoin", "En sortant seulement"], correctIndex: 1, explain: "Avant l’entrée ; éviter le dhikr dedans." },
  { n: 11, q: "Adab latéral associé :", options: ["Droite pour entrer", "Gauche pour entrer, droite pour sortir", "Toujours droite", "Toujours gauche"], correctIndex: 1, explain: "Entrer du pied gauche, sortir du droit." },
  // H12
  { n: 12, q: "Plein air (désert) :", options: ["Face permis", "Dos permis", "Interdit face/dos", "Indifférent"], correctIndex: 2, explain: "Ne pas faire face ni dos." },
  { n: 12, q: "Conciliation (12/13) :", options: ["Toujours interdit", "Toujours Est/Ouest", "Permis en bâti, interdit dehors", "Identique en tout lieu"], correctIndex: 2, explain: "Extérieur interdit, intérieur permis." },
  { n: 12, q: "Même en bâti, on recommande :", options: ["Chercher l’axe exact", "Toujours face", "S’écarter de l’axe si possible", "Nord"], correctIndex: 2, explain: "S’écarter si possible." },
  // H13
  { n: 13, q: "Ibn ‘Umar a vu :", options: ["Désert face à la qibla", "En maison, dos à la Ka‘ba", "Interdiction en ville", "Wudû’ partiel"], correctIndex: 1, explain: "En maison, dos à la Ka‘ba (vers Shâm)." },
  { n: 13, q: "Déduction (12 & 13) :", options: ["Interdit tout lieu", "Toujours permis", "Interdit dehors, permis dedans", "Interdit dedans, permis dehors"], correctIndex: 2, explain: "Conciliation classique." },
  { n: 13, q: "Adab en intérieur :", options: ["Axe exact", "Est obligatoire", "S’écarter de l’axe", "Nord"], correctIndex: 2, explain: "S’écarter si possible." },
  // H14
  { n: 14, q: "Istinjā’ :", options: ["Eau seule", "Pierres seules", "Eau ou pierres (2 valides)", "Ni l’un ni l’autre"], correctIndex: 2, explain: "Les deux valides ; eau plus nette ; pierres min. 3." },
  { n: 14, q: "Minimum pierres :", options: ["1", "2", "3", "4"], correctIndex: 2, explain: "Trois passages." },
  { n: 14, q: "Meilleur :", options: ["Pierres seules", "Eau seule (toujours)", "Combiner pierres puis eau", "Respirer dans récipient"], correctIndex: 2, explain: "Combiner est mieux." },
  // H15
  { n: 15, q: "Main droite pendant qu’on urine :", options: ["Ouvrir la porte", "Tenir le sexe", "Se moucher", "Se peigner"], correctIndex: 1, explain: "Ne pas tenir de la droite." },
  { n: 15, q: "Usage main droite pour istinjā’ (majorité) :", options: ["Recommandé", "Obligatoire", "Makrûh (réprouvé)", "Sans jugement"], correctIndex: 2, explain: "Makrûh ; certains hanbalites tendent au tahrîm pour tenir en urinant." },
  { n: 15, q: "Récipient :", options: ["Respirer dedans", "Souffler dessus", "Ne pas respirer dans le récipient", "Boire à gauche"], correctIndex: 2, explain: "« ولا يتنفس في الإناء »." }
];

// utils
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// —— charge la liste de hadiths “faibles/à revoir” ——
// critères : status !== 'learned' OU ease < 2.4 OU révision due (next_review_date <= today)
async function loadWeakHadithNumbers(user) {
  const today = new Date().toISOString().slice(0, 10);

  // 1) Supabase si connecté
  if (user) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('hadith_id, status, ease, next_review_date, hadiths(number)')
        .lte('next_review_date', today); // dues
      if (error) throw error;

      // si rien de dû, on prend ceux en apprentissage
      let rows = data || [];
      if (!rows.length) {
        const { data: all, error: e2 } = await supabase
          .from('user_progress')
          .select('hadith_id, status, ease, hadiths(number)');
        if (!e2 && all) rows = all.filter(r => (r.status !== 'learned') || (r.ease != null && r.ease < 2.4));
      }

      const set = new Set();
      rows.forEach(r => {
        const n = r?.hadiths?.number;
        if (n && n >= 8 && n <= 15) set.add(n);
      });
      return Array.from(set);
    } catch {
      // tombe sur localStorage si souci
    }
  }

  // 2) LocalStorage si non connecté
  const numbers = [];
  for (let n = 8; n <= 15; n++) {
    const raw = localStorage.getItem(`progress_${n}`);
    if (!raw) {
      numbers.push(n); // jamais révisé → cibler
      continue;
    }
    try {
      const p = JSON.parse(raw);
      const due = p.next_review_date && p.next_review_date <= today;
      const weak = p.status !== 'learned' || (p.ease != null && p.ease < 2.4);
      if (due || weak) numbers.push(n);
    } catch {
      numbers.push(n);
    }
  }
  return numbers;
}

export default function ExamQuizTargeted() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState([]); // hadith numbers ciblés
  const [duration, setDuration] = useState(6); // minutes (ciblé → plus court)
  const [started, setStarted] = useState(false);

  const [pool, setPool] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  // charge la cible
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const targets = await loadWeakHadithNumbers(user);
      if (!active) return;
      setScope(targets.length ? targets : [8,9,10,11,12,13,14,15]); // fallback tous
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  // prépare le pool (toutes les questions des hadiths ciblés, mélangées)
  const preparedPool = useMemo(() => {
    const list = QUESTIONS.filter(q => scope.includes(q.n));
    return shuffle(list);
  }, [scope]);

  const startExam = () => {
    const list = preparedPool;
    setPool(list);
    setIndex(0);
    setAnswers(Array(list.length).fill(null));
    const totalSeconds = Math.max(1, Math.floor(duration * 60));
    setTimeLeft(totalSeconds);
    setStarted(true);
    setFinished(false);
  };

  // timer
  const timerRef = useRef(null);
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (started && timeLeft === 0 && !finished) setFinished(true);
  }, [timeLeft, started, finished]);

  const selectAnswer = (i) => {
    if (finished) return;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = i;
      return copy;
    });
  };
  const nextQ = () => { if (!finished && index + 1 < pool.length) setIndex(i => i + 1); };
  const endExam = () => { setFinished(true); clearInterval(timerRef.current); };

  const score = useMemo(() => {
    if (!finished) return 0;
    return pool.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  }, [finished, pool, answers]);

  const progressPct = pool.length ? Math.round((index / pool.length) * 100) : 0;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  // UI
  if (loading) {
    return (
      <section className="space-y-6">
        <Card><CardContent className="h-24 animate-pulse" /></Card>
        <Card><CardContent className="h-40 animate-pulse" /></Card>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">Umdat</Badge>
            <h2 className="text-xl font-semibold">Examen — Révision ciblée</h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Périmètre détecté</CardTitle>
            <CardDescription>
              Hadiths à revoir (dus/faibles) d’après ta progression {user ? "Supabase" : "locale"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              {scope.map(n => <Badge key={n} variant="outline" className="mr-1">H{n}</Badge>)}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Durée (minutes)</div>
              <Select value={String(duration)} onValueChange={(v)=>setDuration(parseInt(v,10))}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Durée" /></SelectTrigger>
                <SelectContent>
                  {[4,6,8,10,12].map(m => (
                    <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />
            <Button onClick={startExam}>Commencer</Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">Umdat</Badge>
            <h2 className="text-xl font-semibold">Résultats — Révision ciblée</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Score : <span className="font-medium">{score}</span> / {pool.length}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Correction</CardTitle>
            <CardDescription>Réponses et explications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pool.map((q, i) => {
              const userA = answers[i];
              const ok = userA === q.correctIndex;
              return (
                <div key={i} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">H{q.n} — Q{i+1}</div>
                    <Badge variant={ok ? "default" : "outline"}>{ok ? "✅" : "❌"}</Badge>
                  </div>
                  <div className="text-sm">{q.q}</div>
                  <div className="text-sm">Votre réponse : {userA == null ? <em>—</em> : q.options[userA]}</div>
                  <div className="text-sm">Bonne réponse : {q.options[q.correctIndex]}</div>
                  {q.explain && (
                    <>
                      <Separator />
                      <div className="text-xs text-muted-foreground">{q.explain}</div>
                    </>
                  )}
                </div>
              );
            })}
            <div className="flex gap-2">
              <Button onClick={() => { window.location.href = "/exam/targeted"; }}>Relancer</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // en cours
  const q = pool[index];
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">Umdat</Badge>
          <h2 className="text-xl font-semibold">Révision ciblée</h2>
        </div>
        <div className="text-sm">Temps : <span className="font-medium tabular-nums">{String(Math.floor(timeLeft/60)).padStart(2,"0")}:{String(timeLeft%60).padStart(2,"0")}</span></div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question {index + 1} / {pool.length}</CardTitle>
          <CardDescription>Hadith {q?.n}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-base font-medium">{q?.q}</div>
          <div className="grid gap-2">
            {q?.options.map((opt, i) => {
              const selected = answers[index] === i;
              return (
                <Button key={i} variant={selected ? "default" : "outline"} onClick={() => selectAnswer(i)} className="justify-start">
                  {opt}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="w-full mr-3"><Progress value={pool.length ? Math.round((index / pool.length) * 100) : 0} /></div>
            <div className="flex gap-2">
              <Button onClick={index + 1 < pool.length ? () => setIndex(i=>i+1) : endExam}>
                {index + 1 < pool.length ? "Suivant" : "Terminer"}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">Pas de retour en arrière. Corrections à la fin.</div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={endExam}>Terminer maintenant</Button>
      </div>
    </section>
  );
}
