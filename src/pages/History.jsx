// /src/pages/History.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  History,
  Clock,
  BookOpenCheck,
  RotateCcw,
  Star,
  Sparkles,
} from "lucide-react";

// --- Helpers UI ---
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function qualityLabel(q) {
  switch (q) {
    case 5:
      return "Parfait";
    case 4:
      return "Facile";
    case 3:
      return "Moyen";
    case 2:
      return "Difficile";
    case 1:
      return "Très difficile";
    default:
      return "Oublié";
  }
}

function qualityBadgeClasses(q) {
  // couleurs Tailwind custom via classes inline
  if (q === 5) {
    return "bg-emerald-500/10 text-emerald-700 border border-emerald-200";
  }
  if (q === 4) {
    return "bg-green-500/10 text-green-700 border border-green-200";
  }
  if (q === 3) {
    return "bg-amber-500/10 text-amber-700 border border-amber-200";
  }
  if (q === 2 || q === 1) {
    return "bg-red-500/10 text-red-700 border border-red-200";
  }
  return "bg-slate-500/10 text-slate-700 border border-slate-200";
}

function eventTypeLabel(type) {
  if (type === "review") return "Révision";
  if (type === "learn") return "Nouvel apprentissage";
  return "Événement";
}

function eventTypeIcon(type, className = "") {
  if (type === "review") {
    return <RotateCcw className={className} />;
  }
  if (type === "learn") {
    return <BookOpenCheck className={className} />;
  }
  return <Sparkles className={className} />;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Chargement des événements ---
  useEffect(() => {
    if (!user?.id) {
      setEvents([]);
      setLoading(false);
      return;
    }

    async function loadHistory() {
      setLoading(true);
      const { data, error } = await supabase
        .from("review_events")
        .select("hadith_number, quality, event_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200); // de quoi voir large

      if (error) {
        console.error("Erreur historique :", error);
        setEvents([]);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }

    loadHistory();
  }, [user?.id]);

  // --- Groupement par date pour la timeline ---
  const groupedByDate = useMemo(() => {
    const groups = {};
    for (const ev of events) {
      const key = new Date(ev.created_at).toISOString().slice(0, 10); // YYYY-MM-DD
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    }
    // On renvoie un tableau trié par date desc
    return Object.entries(groups)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([dateKey, evts]) => ({
        dateKey,
        events: evts,
      }));
  }, [events]);

  // --- Cas "pas connecté" ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-slate-200 dark:border-slate-700 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur">
          <CardContent className="py-8 text-center space-y-3">
            <History className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-slate-800 dark:text-slate-100 font-semibold">
              Tu dois être connecté pour voir ton historique.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Connecte-toi pour suivre toutes tes révisions et voir ta progression jour après jour.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <History className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                Historique des révisions
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Visualise, jour par jour, comment tu avances dans la mémorisation.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs">
                {events.length} évènement{events.length > 1 ? "s" : ""} suivi
                {events.length > 1 ? "s" : ""}
              </span>
            </Badge>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-lg">
            <CardContent className="py-8 space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
              <Separator className="my-2" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aucun événement */}
        {!loading && events.length === 0 && (
          <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-sm">
            <CardContent className="py-10 text-center space-y-3">
              <RotateCcw className="h-10 w-10 mx-auto text-slate-400" />
              <p className="text-slate-800 dark:text-slate-100 font-semibold">
                Aucune révision enregistrée pour le moment.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Dès que tu commenceras à réviser tes hadiths, chaque session apparaîtra ici
                sous forme de timeline. C’est ton journal de progression.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {!loading && events.length > 0 && (
          <div className="relative pl-4 sm:pl-6">
            {/* Ligne verticale */}
            <div className="absolute left-1 sm:left-2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400/60 via-slate-300 to-transparent dark:from-blue-500/60 dark:via-slate-700" />

            <div className="space-y-6">
              {groupedByDate.map(({ dateKey, events: group }) => (
                <div key={dateKey} className="relative">
                  {/* Pastille de date */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-400/50 border-2 border-white dark:border-slate-900" />
                      <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-sm -z-10" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {formatDate(dateKey)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {group.map((ev, idx) => (
                      <Card
                        key={`${dateKey}-${idx}`}
                        className="ml-4 sm:ml-6 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="py-3 pb-2 flex flex-row items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="rounded-full text-xs"
                            >
                              Hadith #{ev.hadith_number}
                            </Badge>
                            <Badge
                              className={
                                "text-xs rounded-full px-2 py-0.5 " +
                                qualityBadgeClasses(ev.quality)
                              }
                            >
                              {ev.quality}/5 – {qualityLabel(ev.quality)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(ev.created_at)}</span>
                          </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="py-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              {eventTypeIcon(ev.event_type, "h-4 w-4 text-blue-500")}
                              <span className="font-medium">
                                {eventTypeLabel(ev.event_type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <BookOpenCheck className="h-3 w-3" />
                              <span>
                                Session enregistrée automatiquement pour suivre ta
                                progression.
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
