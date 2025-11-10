// /src/pages/Review.jsx
import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HADITHS_8_15 } from '../data/seed_hadiths_8_15';
import { nextReview } from '../lib/spaced';

export function Review() {
  const [idx, setIdx] = useState(0);
  const hadiths = useMemo(()=>HADITHS_8_15, []);
  const h = hadiths[idx];
  const [showFr, setShowFr] = useState(false);

  const answer = (quality) => {
    const current = { ease: 2.5, interval_days: 0, repetitions: 0 };
    const res = nextReview(current, quality);
    console.log('Spaced result:', res);
    setIdx(i => (i+1) % hadiths.length);
    setShowFr(false);
  };

  if (!h) return null;

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Révision espacée</CardTitle>
          <CardDescription>Récite en arabe, puis révèle la traduction et évalue-toi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div dir="rtl" className="text-2xl leading-[2.2rem] font-serif">{h.arabic_text}</div>
          {!showFr && (
            <Button size="sm" onClick={()=>setShowFr(true)}>Afficher la traduction</Button>
          )}
          {showFr && <p className="text-muted-foreground">{h.french_text}</p>}
          <div className="flex flex-wrap gap-2">
            {[0,1,2,3,4,5].map(q => (
              <Button key={q} variant={q>=4? 'default':'outline'} onClick={()=>answer(q)}>{q}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={()=>setIdx(i=> (i-1+hadiths.length)%hadiths.length)}>Précédent</Button>
        <Button variant="outline" onClick={()=>setIdx(i=> (i+1)%hadiths.length)}>Suivant</Button>
      </div>
    </section>
  );
}
