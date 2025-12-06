// /src/pages/NarratorBio.jsx

import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NARRATORS_MOCK } from "@/data/narrators_mock";
import { BookOpen, Clock, ArrowLeft, Sparkles, MapPin, Calendar, Info } from "lucide-react";

export function NarratorBio() {
  const { slug } = useParams();

  const narrator = NARRATORS_MOCK.find((n) => n.slug === slug);

  if (!narrator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-6 text-center space-y-3">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Narrateur introuvable
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ce rapporteur n&apos;est pas encore disponible dans la base.
            </p>
            <Button asChild className="mt-2">
              <Link to="/narrators">Retour à la collection</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bio = narrator.bio || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 dark:from-slate-950 dark:via-emerald-950 dark:to-teal-900 px-4 sm:px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Bouton retour */}
        <Button
          asChild
          variant="ghost"
          className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2"
        >
          <Link to="/narrators">
            <ArrowLeft className="h-4 w-4" />
            Retour à la collection
          </Link>
        </Button>

        {/* Header */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/40">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar simple (tu peux mettre l'image si tu veux) */}
              <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {narrator.name_fr
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl flex flex-wrap items-center gap-2">
                  <span>{narrator.name_fr}</span>
                  {narrator.kunya && (
                    <Badge variant="outline" className="text-xs">
                      {narrator.kunya}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription dir="rtl" className="mt-1 text-base">
                  {narrator.name_ar}
                </CardDescription>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {narrator.generation && (
                    <Badge variant="outline">{narrator.generation}</Badge>
                  )}
                  {narrator.region && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {narrator.region}
                    </Badge>
                  )}
                  {narrator.hadith_count && (
                    <Badge className="flex items-center gap-1 bg-slate-900 text-white">
                      <BookOpen className="h-3 w-3" />
                      {narrator.hadith_count} hadiths rapportés
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <Clock className="h-4 w-4" />
                <span>≈ 3 minutes de lecture</span>
              </div>
              <Badge className="mt-1 bg-emerald-600 text-white flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Chaîne de transmission
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Contenu bio */}
        <Card className="shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="space-y-6 pt-6 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {/* Ligne dates */}
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>Naissance (approx.)</span>
                </div>
                <p className="font-semibold">
                  {bio.approx_birth_year_h
                    ? `${bio.approx_birth_year_h} H (approx.)`
                    : "Non précisé"}
                  {bio.birth_place ? ` – ${bio.birth_place}` : ""}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>Décès</span>
                </div>
                <p className="font-semibold">
                  {bio.death_year_h
                    ? `${bio.death_year_h} H`
                    : narrator.death_year_h
                    ? `${narrator.death_year_h} H`
                    : "Non précisé"}
                  {bio.death_place ? ` – ${bio.death_place}` : ""}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Info className="h-3 w-3" />
                  <span>Âge au décès (approx.)</span>
                </div>
                <p className="font-semibold">
                  {bio.approx_age_at_death
                    ? `${bio.approx_age_at_death} ans (env.)`
                    : "Non précisé"}
                </p>
              </div>
            </div>

            {/* Entrée en Islam / relation */}
            {bio.conversion_story && (
              <section className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Son entrée en Islam
                </h2>
                <p>{bio.conversion_story}</p>
              </section>
            )}

            {/* Rôles clés */}
            {bio.key_roles && bio.key_roles.length > 0 && (
              <section className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Rôle dans la communauté
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  {bio.key_roles.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Anecdotes */}
            {bio.anecdotes && bio.anecdotes.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Anecdotes marquantes
                </h2>
                <div className="space-y-2">
                  {bio.anecdotes.map((a, idx) => (
                    <div
                      key={idx}
                      className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/70 dark:border-emerald-800/70 rounded-lg p-3 text-[13px]"
                    >
                      {a}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sources */}
            {bio.sources && bio.sources.length > 0 && (
              <section className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <h2 className="font-semibold text-slate-700 dark:text-slate-200">
                  Sources classiques
                </h2>
                <ul className="list-disc pl-5 space-y-0.5">
                  {bio.sources.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NarratorBio;
