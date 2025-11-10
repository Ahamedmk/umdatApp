// /src/pages/Compare.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Compare() {
  const rows = [
    { point: "Basmala au wuḍūʾ", hanafi: "Sunna confirmée", maliki: "Recommandée", shafi: "Sunna", hanbali: "Obligatoire (sauf oubli)" },
    { point: "Allonger الغرّة والتحجيل", hanafi: "Déconseillé", maliki: "Déconseillé", shafi: "Recommandé", hanbali: "Recommandé" },
    { point: "Qibla (toilettes bâties)", hanafi: "Permis", maliki: "Permis", shafi: "Permis", hanbali: "Interdit" },
  ];
  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparateur des 4 écoles</CardTitle>
          <CardDescription>Visuel clair des divergences majeures.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[60vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr>
                  <th className="text-left p-2">Point</th>
                  <th className="text-left p-2">Hanafite</th>
                  <th className="text-left p-2">Malikite</th>
                  <th className="text-left p-2">Chafi‘ite</th>
                  <th className="text-left p-2">Hanbalite</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=> (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-medium">{r.point}</td>
                    <td className="p-2">{r.hanafi}</td>
                    <td className="p-2">{r.maliki}</td>
                    <td className="p-2">{r.shafi}</td>
                    <td className="p-2">{r.hanbali}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
}