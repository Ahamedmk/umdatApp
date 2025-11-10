// /src/pages/Learn.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HADITHS_8_15 } from '../data/seed_hadiths_8_15';

export function Learn() {
  const [items, setItems] = useState([]);
  useEffect(() => { setItems(HADITHS_8_15); }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold">Apprendre (8 → 15)</h2>
          <p className="text-sm text-muted-foreground">Clique sur un hadith pour ouvrir la fiche détaillée.</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((h) => (
          <Card key={h.number} className="hover:bg-muted/30 transition">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Hadith {h.number}</CardTitle>
                <Button asChild size="sm" variant="secondary"><a href={`/hadith?n=${h.number}`}>Ouvrir</a></Button>
              </div>
              <CardDescription>{h.source || 'Source PDF'}</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="py-3">
              <div dir="rtl" className="line-clamp-2 font-serif">{h.arabic_text}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}