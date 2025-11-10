// /src/pages/ExamQuiz.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

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

// -------------------------------------------
// Questions source (reprend la base du Quiz standard)
// -------------------------------------------
const QUESTIONS = [
  // H8
  { n: 8, q: "Dans le hadith 8, quel geste est explicitement décrit après avoir lavé le visage ?", options: ["Essuyage de la tête (avant/arrière)", "Lavage des avant-bras sans mention des coudes", "Passage d’eau sur les oreilles sans essuyage de la tête", "Lavage des pieds avant le visage"], correctIndex: 0, explain: "La description authentique mentionne le passage humide sur la tête en allers/retours (‘أقبل وأدبر’) après le lavage du visage." },
  { n: 8, q: "Selon le seed (avis hanbalites), quel est le statut de la basmala au wudû’ ?", options: ["Nulle part mentionnée", "Recommandée (sunna) seulement", "Obligatoire, mais tombe en cas d’oubli", "Interdite"], correctIndex: 2, explain: "Chez les hanbalites (et certains), la basmala est tenue pour obligatoire, avec dispense en cas d’oubli." },
  { n: 8, q: "Selon la majorité (hanafites/malikites/shafi‘ites), combien de lavages valident le membre au minimum ?", options: ["Deux", "Un", "Quatre", "Trois"], correctIndex: 1, explain: "Un seul lavage suffit pour la validité ; le triple est sunna, comme indiqué dans le seed." },
  // H9
  { n: 9, q: "Le hadith 9 enseigne le « tayammun ». Dans quels types d’actes commence-t-on par la droite ?", options: ["Dans tous les actes sans exception", "Uniquement dans les actes de purification", "Dans les actes d’honneur (purification, habillement, etc.)", "Seulement pour mettre les chaussures"], correctIndex: 2, explain: "Les quatre écoles : la droite est recommandée dans les actes d’honneur (purification, habillement…), la gauche pour l’inverse (ôter, sortir…)." },
  { n: 9, q: "Que disent les écoles lorsqu’un texte prouve la priorité de la main gauche dans un cas précis ?", options: ["On reste toujours à droite", "On suit l’exception : la gauche est prioritaire", "On choisit librement", "On alterne une fois droite, une fois gauche"], correctIndex: 1, explain: "Les shafi‘ites, par exemple, mentionnent l’exception quand elle est textuelle." },
  { n: 9, q: "Quel énoncé correspond le mieux à l’esprit du hadith 9 ?", options: ["Obligation stricte de commencer par la droite", "L’égalité complète entre droite et gauche", "Recommandation (sunna/adab) d’honorer la droite", "Interdiction d’utiliser la main gauche"], correctIndex: 2, explain: "C’est une recommandation, pas une obligation stricte ni une interdiction de la gauche." },
  // H10
  { n: 10, q: "Que signifie « الغُرّة والتحجيل » dans le hadith 10 ?", options: ["Des invocations après le wudû’", "Des marques lumineuses sur les membres lavés", "Des vêtements spéciaux", "Des ablutions sèches"], correctIndex: 1, explain: "La communauté sera appelée avec des traces lumineuses dues au wudû’ (front/membres)." },
  { n: 10, q: "Selon le seed, que disent globalement les hanafites et malikites de l’extension au-delà du fard ?", options: ["Recommandée sans limites", "Indifférente", "Déconseillée (makrûh) — éviter l’excès", "Obligatoire"], correctIndex: 2, explain: "Hanafites/Malikites : on se limite aux zones obligatoires, l’excès est réprouvé (ghulûw)." },
  { n: 10, q: "Selon le seed, que disent les shafi‘ites et hanbalites de l’extension modérée ?", options: ["Interdite", "Recommandée (sans excès)", "Toujours obligatoire", "Toujours nulle"], correctIndex: 1, explain: "Shafi‘ites/Hanbalites : extension légère recommandée, en évitant l’exagération." },
  // H11
  { n: 11, q: "Que dit-on à l’entrée des latrines selon le hadith 11 ?", options: ["On reste silencieux", "On dit : « اللهم إني أعوذ بك من الخبث والخبائث »", "On dit la basmala uniquement", "On fait du dhikr à voix haute"], correctIndex: 1, explain: "Invocation enseignée par le Prophète ﷺ : protection contre les démons mâles et femelles." },
  { n: 11, q: "Selon les écoles, quand prononce-t-on cette invocation ?", options: ["Après être entré et assis", "Avant d’entrer", "Pendant le besoin", "Uniquement en sortant"], correctIndex: 1, explain: "Elle se dit avant d’entrer. On évite le dhikr à l’intérieur (sauf besoin)." },
  { n: 11, q: "Quel adab latéral est souvent mentionné avec cette invocation ?", options: ["Droite pour entrer, gauche pour sortir", "Gauche pour entrer, droite pour sortir", "Toujours la droite", "Toujours la gauche"], correctIndex: 1, explain: "Entrer avec le pied gauche, sortir avec le pied droit." },
  // H12
  { n: 12, q: "Que prescrit le hadith 12 en plein air (désert) ?", options: ["Permis de faire face à la qibla uniquement", "Permis de tourner le dos à la qibla uniquement", "Interdit de faire face ou dos à la qibla", "Indifférent"], correctIndex: 2, explain: "En plein air : ne pas faire face ni dos à la qibla." },
  { n: 12, q: "Que disent les écoles au sujet des toilettes bâties (intérieur) en conciliant les textes (12/13) ?", options: ["Toujours interdit", "Toujours obligatoire de s’orienter Est/Ouest", "Permis en bâti, interdit en plein air", "Identique en tout lieu"], correctIndex: 2, explain: "Majorité : extérieur = interdit ; intérieur (bâti) = permis." },
  { n: 12, q: "Que recommande-t-on même en bâti quand c’est possible ?", options: ["Se tourner légèrement pour éviter l’axe de la qibla", "Toujours faire face à la qibla", "Toujours lui tourner le dos", "Regarder vers le nord"], correctIndex: 0, explain: "S’écarter de l’axe reste préférable si possible." },
  // H13
  { n: 13, q: "Que rapporte Ibn ‘Umar dans le hadith 13 ?", options: ["Prophète ﷺ en plein désert face à la qibla", "Prophète ﷺ en maison, dos à la Ka‘ba", "Interdiction du besoin en ville", "Un compagnon décrit un wudû’ partiel"], correctIndex: 1, explain: "Dans une maison, sur deux briques, dos à la Ka‘ba (vers le Shâm)." },
  { n: 13, q: "Que déduisent les écoles de 12 & 13 ensemble ?", options: ["Interdit en tout lieu", "Toujours permis", "Interdit dehors, permis dedans", "Interdit dedans, permis dehors"], correctIndex: 2, explain: "Conciliation : extérieur = interdit ; intérieur = permis." },
  { n: 13, q: "Quel adab reste préférable en intérieur quand la configuration le permet ?", options: ["Chercher l’axe exact de la qibla", "S’orienter Est obligatoire", "S’écarter de l’axe de la qibla", "Se tourner vers le nord"], correctIndex: 2, explain: "S’écarter de l’axe quand c’est possible." },
  // H14
  { n: 14, q: "Selon le hadith 14 et les avis, que peut-on utiliser pour l’istinjā’ ?", options: ["Uniquement de l’eau", "Uniquement des pierres", "Eau ou pierres, les deux valides", "Ni l’un ni l’autre"], correctIndex: 2, explain: "Deux voies légitimes ; l’eau nettoie mieux ; les pierres suffisent (min. 3)." },
  { n: 14, q: "Quel est le minimum pour l’istinjā’ aux pierres ?", options: ["1", "2", "3", "4"], correctIndex: 2, explain: "Minimum trois passages." },
  { n: 14, q: "Quel est le mieux selon de nombreux avis ?", options: ["Pierres seules", "Eau seule toujours", "Combiner pierres puis eau", "Respirer dans un récipient avant"], correctIndex: 2, explain: "Combiner (pierres puis eau) est souvent indiqué comme meilleur." },
  // H15
  { n: 15, q: "Selon le hadith 15, que ne faut-il pas faire avec la main droite pendant qu’on urine ?", options: ["Ouvrir la porte", "Tenir son sexe", "Se moucher", "Se peigner"], correctIndex: 1, explain: "« لا يمسكنَّ أحدكم ذكره بيمينه وهو يبول »." },
  { n: 15, q: "Quel est l’avis majoritaire sur l’usage de la main droite pour l’istinjā’ ?", options: ["Recommandé", "Obligatoire", "Makrûh (réprouvé) — adab", "Sans jugement"], correctIndex: 2, explain: "Majorité : makrûh. Certains hanbalites : tahrîm pour tenir de la droite en urinant." },
  { n: 15, q: "Que dit la fin du hadith 15 au sujet du récipient ?", options: ["Respirer dedans", "Souffler dessus", "Ne pas respirer (souffler) dans le récipient", "En boire à gauche"], correctIndex: 2, explain: "« ولا يتنفس في الإناء »." }
];

// outils
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// -------------------------------------------
// Exam component
// -------------------------------------------
export default function ExamQuiz() {
  // Écran d’accueil — configuration
  const [scope, setScope] = useState("all"); // "all" | "8"|"9"|...|"15"
  const [duration, setDuration] = useState(8); // minutes (par défaut 8 min pour 24 q)
  const [started, setStarted] = useState(false);

  // État d’examen
  const [pool, setPool] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // indices choisis (ou null)
  const [timeLeft, setTimeLeft] = useState(0); // en secondes
  const [finished, setFinished] = useState(false);

  // Prépare le pool selon le scope
  const preparedPool = useMemo(() => {
    const list = scope === "all"
      ? QUESTIONS
      : QUESTIONS.filter((q) => q.n === parseInt(scope, 10));
    return shuffle(list);
  }, [scope]);

  // Démarrer l’examen
  const startExam = () => {
    const list = preparedPool;
    setPool(list);
    setIndex(0);
    setAnswers(Array(list.length).fill(null));
    // Minuteur total (minutes -> secondes)
    const totalSeconds = Math.max(1, Math.floor(duration * 60));
    setTimeLeft(totalSeconds);
    setStarted(true);
    setFinished(false);
  };

  // Minuteur
  const timerRef = useRef(null);
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  // Fin automatique (temps écoulé)
  useEffect(() => {
    if (started && timeLeft === 0 && !finished) {
      setFinished(true);
    }
  }, [timeLeft, started, finished]);

  // Navigation et réponses
  const selectAnswer = (i) => {
    if (finished) return;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = i;
      return copy;
    });
  };

  const nextQ = () => {
    if (finished) return;
    if (index + 1 < pool.length) setIndex((i) => i + 1);
  };

  const prevQ = () => {
    // Mode examen : pas de retour en arrière (désactivé)
    // On peut laisser vide, ou autoriser si tu le souhaites.
  };

  const endExam = () => {
    setFinished(true);
    clearInterval(timerRef.current);
  };

  // Score final
  const score = useMemo(() => {
    if (!finished) return 0;
    return pool.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  }, [finished, pool, answers]);

  const progressPct = pool.length ? Math.round(((index) / pool.length) * 100) : 0;

  // Formatage
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  // UI
  if (!started) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">Umdat</Badge>
            <h2 className="text-xl font-semibold">Examen — Hadiths 8 à 15</h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de l’examen</CardTitle>
            <CardDescription>Choisis le périmètre et la durée, puis démarre.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Périmètre</div>
                <Select value={scope} onValueChange={setScope}>
                  <SelectTrigger><SelectValue placeholder="Tous (8–15)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les hadiths (8–15)</SelectItem>
                    {[8,9,10,11,12,13,14,15].map(n => (
                      <SelectItem key={n} value={String(n)}>Hadith {n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Durée totale (minutes)</div>
                <Select value={String(duration)} onValueChange={(v)=>setDuration(parseInt(v,10))}>
                  <SelectTrigger><SelectValue placeholder="Durée" /></SelectTrigger>
                  <SelectContent>
                    {[5,8,10,12,15,20].map(m => (
                      <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            <Button onClick={startExam}>Démarrer l’examen</Button>
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
            <h2 className="text-xl font-semibold">Résultats</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Temps écoulé • Score : <span className="font-medium">{score}</span> / {pool.length}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Correction</CardTitle>
            <CardDescription>Vos réponses vs. réponses attendues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pool.map((q, i) => {
              const user = answers[i];
              const correct = q.correctIndex;
              const ok = user === correct;
              return (
                <div key={i} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">Q{i+1} — Hadith {q.n}</div>
                    <Badge variant={ok ? "default" : "outline"}>{ok ? "✅ Correct" : "❌ Incorrect"}</Badge>
                  </div>
                  <div className="text-sm">{q.q}</div>
                  <div className="text-sm">
                    <span className="font-medium">Votre réponse :</span>{" "}
                    {user == null ? <em>—</em> : q.options[user]}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Bonne réponse :</span>{" "}
                    {q.options[correct]}
                  </div>
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
              <Button onClick={() => { setStarted(false); }}>Refaire un examen</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Écran examen en cours
  const q = pool[index];
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">Umdat</Badge>
          <h2 className="text-xl font-semibold">Examen — Hadiths 8 à 15</h2>
        </div>
        <div className="text-sm">
          Temps restant : <span className="font-medium tabular-nums">{mm}:{ss}</span>
        </div>
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
                <Button
                  key={i}
                  variant={selected ? "default" : "outline"}
                  onClick={() => selectAnswer(i)}
                  className="justify-start"
                >
                  {opt}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="w-full mr-3">
              <Progress value={progressPct} />
            </div>
            <div className="flex gap-2">
              {/* <Button variant="ghost" disabled onClick={prevQ}>Précédent</Button>  // désactivé en mode exam */}
              <Button onClick={index + 1 < pool.length ? nextQ : endExam}>
                {index + 1 < pool.length ? "Suivant" : "Terminer"}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Pas de retour en arrière. Aucune correction affichée avant la fin.
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={endExam}>Terminer maintenant</Button>
      </div>
    </section>
  );
}
