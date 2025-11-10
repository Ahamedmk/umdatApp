// /src/pages/Quiz.jsx
import React, { useMemo, useState } from "react";
import { HADITHS_8_15 } from "../data/seed_hadiths_8_15";

// shadcn UI
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

// Small helper
const pick = (obj, key, fallback = "—") => (obj && obj[key] ? obj[key] : fallback);

// -------------------------------
// Questions (8 -> 15)
// -------------------------------
// 3 questions / hadith : contenu du texte + règles/avis des écoles selon le seed
const QUESTIONS = [
  // HADITH 8 — description du wudû’
  {
    n: 8,
    q: "Dans le hadith 8, quel geste est explicitement décrit après avoir lavé le visage ?",
    options: [
      "Essuyage de la tête (avant/arrière)",
      "Lavage des avant-bras sans mention des coudes",
      "Passage d’eau sur les oreilles sans essuyage de la tête",
      "Lavage des pieds avant le visage"
    ],
    correctIndex: 0,
    explain:
      "La description authentique mentionne le passage humide sur la tête en allers/retours (‘أقبل وأدبر’) après le lavage du visage."
  },
  {
    n: 8,
    q: "Selon le seed (avis hanbalites), quel est le statut de la basmala au wudû’ ?",
    options: [
      "Nulle part mentionnée",
      "Recommandée (sunna) seulement",
      "Obligatoire, mais tombe en cas d’oubli",
      "Interdite"
    ],
    correctIndex: 2,
    explain:
      "Chez les hanbalites (et certains), la basmala est tenue pour obligatoire, avec dispense en cas d’oubli."
  },
  {
    n: 8,
    q: "Selon la majorité (hanafites/malikites/shafi‘ites), combien de lavages valident le membre au minimum ?",
    options: ["Deux", "Un", "Quatre", "Trois"],
    correctIndex: 1,
    explain:
      "Un seul lavage suffit pour la validité ; le triple est sunna, comme indiqué dans le seed."
  },

  // HADITH 9 — commencer par la droite
  {
    n: 9,
    q: "Le hadith 9 enseigne le « tayammun ». Dans quels types d’actes commence-t-on par la droite ?",
    options: [
      "Dans tous les actes sans exception",
      "Uniquement dans les actes de purification",
      "Dans les actes d’honneur (purification, habillement, etc.)",
      "Seulement pour mettre les chaussures"
    ],
    correctIndex: 2,
    explain:
      "Les quatre écoles : la droite est recommandée dans les actes d’honneur (purification, habillement…), la gauche pour l’inverse (ôter, sortir…)."
  },
  {
    n: 9,
    q: "Que disent les écoles lorsqu’un texte prouve la priorité de la main gauche dans un cas précis ?",
    options: [
      "On reste toujours à droite",
      "On suit l’exception : la gauche est prioritaire",
      "On choisit librement",
      "On alterne une fois droite, une fois gauche"
    ],
    correctIndex: 1,
    explain: "Les shafi‘ites, par exemple, mentionnent l’exception quand elle est textuelle."
  },
  {
    n: 9,
    q: "Quel énoncé correspond le mieux à l’esprit du hadith 9 ?",
    options: [
      "Obligation stricte de commencer par la droite",
      "L’égalité complète entre droite et gauche",
      "Recommandation (sunna/adab) d’honorer la droite",
      "Interdiction d’utiliser la main gauche"
    ],
    correctIndex: 2,
    explain: "C’est une recommandation, pas une obligation stricte ni une interdiction de la gauche."
  },

  // HADITH 10 — ghurra / tahjîl
  {
    n: 10,
    q: "Que signifie « الغُرّة والتحجيل » dans le hadith 10 ?",
    options: [
      "Des invocations après le wudû’",
      "Des marques lumineuses sur les membres lavés",
      "Des vêtements spéciaux",
      "Des ablutions sèches"
    ],
    correctIndex: 1,
    explain:
      "La communauté sera appelée avec des traces lumineuses dues au wudû’ (front/membres)."
  },
  {
    n: 10,
    q: "Selon le seed, que disent globalement les hanafites et malikites de l’extension au-delà du fard ?",
    options: [
      "Recommandée sans limites",
      "Indifférente",
      "Déconseillée (makrûh) — éviter l’excès",
      "Obligatoire"
    ],
    correctIndex: 2,
    explain:
      "Hanafites/Malikites : on se limite aux zones obligatoires, l’excès est réprouvé (ghulûw)."
  },
  {
    n: 10,
    q: "Selon le seed, que disent les shafi‘ites et hanbalites de l’extension modérée ?",
    options: [
      "Interdite",
      "Recommandée (sans excès)",
      "Toujours obligatoire",
      "Toujours nulle"
    ],
    correctIndex: 1,
    explain: "Shafi‘ites/Hanbalites : extension légère recommandée, en évitant l’exagération."
  },

  // HADITH 11 — invocation à l’entrée des latrines
  {
    n: 11,
    q: "Que dit-on à l’entrée des latrines selon le hadith 11 ?",
    options: [
      "On reste silencieux",
      "On dit : « اللهم إني أعوذ بك من الخبث والخبائث »",
      "On dit la basmala uniquement",
      "On fait du dhikr à voix haute"
    ],
    correctIndex: 1,
    explain:
      "C’est l’invocation enseignée par le Prophète ﷺ : demande de protection contre les démons mâles et femelles."
  },
  {
    n: 11,
    q: "Selon les écoles, quand prononce-t-on cette invocation ?",
    options: [
      "Après être entré et assis",
      "Avant d’entrer",
      "Pendant le besoin",
      "Uniquement en sortant"
    ],
    correctIndex: 1,
    explain:
      "Elle se dit en amont/à l’entrée. Les écoles déconseillent le dhikr à l’intérieur (sauf besoin)."
  },
  {
    n: 11,
    q: "Quel adab latéral est souvent mentionné avec cette invocation ?",
    options: [
      "Droite pour entrer, gauche pour sortir",
      "Gauche pour entrer, droite pour sortir",
      "Toujours la droite",
      "Toujours la gauche"
    ],
    correctIndex: 1,
    explain:
      "Adab connu : entrer avec le pied gauche, sortir avec le pied droit."
  },

  // HADITH 12 — Qibla en besoin naturel (désert)
  {
    n: 12,
    q: "Que prescrit le hadith 12 en plein air (désert) ?",
    options: [
      "Permis de faire face à la qibla uniquement",
      "Permis de tourner le dos à la qibla uniquement",
      "Interdit de faire face ou dos à la qibla",
      "Indifférent"
    ],
    correctIndex: 2,
    explain:
      "En plein air : ne pas faire face ni dos à la qibla pour uriner/déféquer."
  },
  {
    n: 12,
    q: "Que disent les écoles au sujet des toilettes **bâties** (intérieur) en conciliant les textes (12/13) ?",
    options: [
      "Toujours interdit",
      "Toujours obligatoire de s’orienter Est/Ouest",
      "Permis en bâti, interdit en plein air",
      "Identique en tout lieu"
    ],
    correctIndex: 2,
    explain:
      "La majorité concilie : extérieur = interdit ; intérieur (bâti) = permis."
  },
  {
    n: 12,
    q: "Que recommande-t-on **même** en bâti quand c’est possible ?",
    options: [
      "Se tourner légèrement pour éviter l’axe de la qibla",
      "Toujours faire face à la qibla",
      "Toujours lui tourner le dos",
      "Regarder vers le nord"
    ],
    correctIndex: 0,
    explain:
      "Même en cas de permission, il est meilleur de s’écarter de l’axe si c’est possible."
  },

  // HADITH 13 — preuve du bâti (Ibn ‘Umar)
  {
    n: 13,
    q: "Que rapporte Ibn ‘Umar dans le hadith 13 ?",
    options: [
      "Qu’il a vu le Prophète ﷺ en plein désert face à la qibla",
      "Qu’il a vu le Prophète ﷺ dans une maison, dos à la Ka‘ba",
      "Qu’il a vu le Prophète ﷺ interdire le besoin en ville",
      "Qu’il a entendu un compagnon décrire un wudû’ partiel"
    ],
    correctIndex: 1,
    explain:
      "Il voit le Prophète ﷺ sur deux briques, dans une maison, tourné vers le Shâm, dos à la Ka‘ba."
  },
  {
    n: 13,
    q: "Que déduisent les écoles de 12 & 13 ensemble ?",
    options: [
      "Interdit en tout lieu",
      "Toujours permis",
      "Interdit dehors, permis dedans",
      "Interdit dedans, permis dehors"
    ],
    correctIndex: 2,
    explain: "Conciliation classique : extérieur = interdit ; intérieur = permis."
  },
  {
    n: 13,
    q: "Quel adab reste préférable en intérieur quand la configuration le permet ?",
    options: [
      "Chercher l’axe exact de la qibla",
      "S’orienter vers l’est directement",
      "S’écarter de l’axe de la qibla",
      "Se tourner vers le nord"
    ],
    correctIndex: 2,
    explain:
      "Beaucoup recommandent de s’écarter de l’axe de la qibla si on peut."
  },

  // HADITH 14 — istinjâ’ à l’eau / pierres
  {
    n: 14,
    q: "Selon le hadith 14 et les avis, que peut-on utiliser pour l’istinjā’ ?",
    options: [
      "Uniquement de l’eau",
      "Uniquement des pierres",
      "Eau ou pierres, avec validité des deux",
      "Ni l’un ni l’autre"
    ],
    correctIndex: 2,
    explain:
      "Les deux sont légitimes ; l’eau est plus nettoyante, et les pierres suffisent au minimum trois passages."
  },
  {
    n: 14,
    q: "Quel est le **minimum** mentionné pour l’istinjā’ aux pierres ?",
    options: ["1", "2", "3", "4"],
    correctIndex: 2,
    explain: "Minimum trois pierres/passages."
  },
  {
    n: 14,
    q: "Quel est le meilleur des deux selon de nombreux avis ?",
    options: [
      "Pierres seules",
      "Eau seule (toujours)",
      "Combiner pierres puis eau",
      "Respirer dans un récipient avant"
    ],
    correctIndex: 2,
    explain:
      "Combiner (pierres pour enlever l’essentiel puis eau pour parfaire) est souvent indiqué comme meilleur."
  },

  // HADITH 15 — étiquette main droite / récipient
  {
    n: 15,
    q: "Selon le hadith 15, que ne faut-il pas faire avec la main droite pendant qu’on urine ?",
    options: [
      "Ouvrir la porte",
      "Tenir son sexe",
      "Se moucher",
      "Se peigner"
    ],
    correctIndex: 1,
    explain:
      "« لا يمسكنَّ أحدكم ذكره بيمينه وهو يبول » : ne pas tenir le sexe de la main droite."
  },
  {
    n: 15,
    q: "Quel est l’avis majoritaire sur l’usage de la main droite pour l’istinjā’ ?",
    options: [
      "Recommandé",
      "Obligatoire",
      "Makrûh (réprouvé) — adab",
      "Sans jugement"
    ],
    correctIndex: 2,
    explain:
      "La majorité parle de makrûh (adab) ; certains hanbalites vont jusqu’au tahrîm pour tenir de la droite en urinant."
  },
  {
    n: 15,
    q: "Que dit la fin du hadith 15 au sujet du récipient ?",
    options: [
      "Qu’il faut respirer dedans pour se rafraîchir",
      "Qu’il faut souffler dessus pour chasser la poussière",
      "Qu’il ne faut pas respirer (souffler) dans le récipient",
      "Qu’il faut en boire à gauche"
    ],
    correctIndex: 2,
    explain:
      "« ولا يتنفس في الإناء » : ne pas respirer/souffler dans le récipient."
  }
];

// -------------------------------
// Component
// -------------------------------
export function Quiz() {
  const [filterN, setFilterN] = useState("all"); // "all" | "8" | ... | "15"
  const pool = useMemo(() => {
    if (filterN === "all") return QUESTIONS;
    const num = parseInt(filterN, 10);
    return QUESTIONS.filter((q) => q.n === num);
  }, [filterN]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = pool[index];

  const onValidate = () => {
    if (selected == null) return;
    const ok = selected === current.correctIndex;
    setScore((s) => s + (ok ? 1 : 0));
    setDone(true);
  };

  const onNext = () => {
    setSelected(null);
    setDone(false);
    if (index + 1 < pool.length) {
      setIndex((i) => i + 1);
    } else {
      // fin du set
    }
  };

  const onRestart = () => {
    setIndex(0);
    setSelected(null);
    setDone(false);
    setScore(0);
  };

  const progress = pool.length ? Math.round(((index + (done ? 1 : 0)) / pool.length) * 100) : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">Umdat</Badge>
          <h2 className="text-xl font-semibold">Quiz — Hadiths 8 à 15</h2>
        </div>

        {/* Filtre par hadith */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hadith :</span>
          <Select value={filterN} onValueChange={(v) => { setFilterN(v); onRestart(); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tous les hadiths" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous (8–15)</SelectItem>
              {[8,9,10,11,12,13,14,15].map(n => (
                <SelectItem key={n} value={String(n)}>Hadith {n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question {pool.length ? index + 1 : 0} / {pool.length}</CardTitle>
          <CardDescription>
            {pool.length ? `Hadith ${current.n}` : "Aucune question dans ce filtre."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pool.length === 0 ? (
            <div className="text-sm text-muted-foreground">Ajuste le filtre ci-dessus pour commencer.</div>
          ) : (
            <>
              <div className="text-base font-medium">{current.q}</div>
              <div className="grid gap-2">
                {current.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = done && i === current.correctIndex;
                  const isWrong = done && isSelected && i !== current.correctIndex;
                  return (
                    <Button
                      key={i}
                      variant={isSelected ? "default" : "outline"}
                      disabled={done}
                      onClick={() => setSelected(i)}
                      className={`justify-start ${isCorrect ? "border-green-500" : ""} ${isWrong ? "border-red-500" : ""}`}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {!done ? (
                  <Button onClick={onValidate} disabled={selected == null}>Valider</Button>
                ) : (
                  <>
                    <Badge variant={selected === current.correctIndex ? "default" : "outline"}>
                      {selected === current.correctIndex ? "✅ Correct" : "❌ Incorrect"}
                    </Badge>
                    <Button variant="secondary" onClick={onNext}>
                      {index + 1 < pool.length ? "Question suivante" : "Terminer"}
                    </Button>
                  </>
                )}
              </div>

              {/* Explication */}
              {done && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    {current.explain}
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Progression & Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div>Progression</div>
          <div>{progress}%</div>
        </div>
        <Progress value={progress} />
        <div className="text-sm text-muted-foreground">
          Score : <span className="font-medium">{score}</span> / {pool.length}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRestart}>Recommencer ce set</Button>
        </div>
      </div>

      {/* Rappel du hadith courant (optionnel) */}
      {pool.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rappel — Hadith {current.n}</CardTitle>
            <CardDescription>Texte (ar) & traduction (fr) pour ancrage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const h = HADITHS_8_15.find((x) => x.number === current.n);
              if (!h) return <div className="text-sm text-muted-foreground">—</div>;
              return (
                <>
                  <div dir="rtl" className="rounded-md border p-3 bg-muted/30 font-serif leading-8">{h.arabic_text}</div>
                  <div className="rounded-md border p-3 bg-muted/20 text-sm text-muted-foreground">{h.french_text}</div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export default Quiz;
