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
  Flame,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

/* -------------------- Helpers UI -------------------- */

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
  if (q === 5) {
    return "bg-emerald-500/10 text-emerald-700 border border-emerald-200 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (q === 4) {
    return "bg-green-500/10 text-green-700 border border-green-200 dark:text-green-300 dark:border-green-800";
  }
  if (q === 3) {
    return "bg-amber-500/10 text-amber-700 border border-amber-200 dark:text-amber-300 dark:border-amber-800";
  }
  if (q === 2 || q === 1) {
    return "bg-red-500/10 text-red-700 border border-red-200 dark:text-red-300 dark:border-red-800";
  }
  return "bg-slate-500/10 text-slate-700 border border-slate-200 dark:text-slate-300 dark:border-slate-700";
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

function getAvgColor(avg) {
  if (avg >= 4) return "text-emerald-600 dark:text-emerald-400";
  if (avg >= 3) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function computeCurrentStreak(dateKeysDesc) {
  if (!dateKeysDesc.length) return 0;

  const dateSet = new Set(dateKeysDesc);
  let streak = 0;

  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);

    if (dateSet.has(iso)) {
      streak += 1;
    } else {
      if (i === 0) continue;
      break;
    }
  }

  return streak;
}

function SummaryCard({ icon: Icon, label, value, valueClassName = "" }) {
  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-sm">
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700">
            <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`text-xl font-bold ${valueClassName}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------------------- Chargement des événements -------------------- */
  useEffect(() => {
    if (!user?.id) {
      setEvents([]);
      setLoading(false);
      return;
    }

    async function loadHistory() {
      setLoading(true);

      const since = new Date();
      since.setDate(since.getDate() - 13);
      const sinceISO = since.toISOString();

      const { data, error } = await supabase
        .from("review_events")
        .select("hadith_number, quality, event_type, created_at")
        .eq("user_id", user.id)
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false });

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

  /* -------------------- Groupement par date -------------------- */
  const groupedByDate = useMemo(() => {
    const groups = {};
    for (const ev of events) {
      const key = new Date(ev.created_at).toISOString().slice(0, 10);
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    }

    return Object.entries(groups)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([dateKey, evts]) => ({
        dateKey,
        events: evts,
      }));
  }, [events]);

  /* -------------------- Résumé -------------------- */
  const summary = useMemo(() => {
    if (events.length === 0) {
      return {
        total: 0,
        avg: 0,
        unique: 0,
        streak: 0,
        topDay: null,
        topDayCount: 0,
      };
    }

    const total = events.length;
    const avgRaw = events.reduce((sum, e) => sum + (Number(e.quality) || 0), 0) / total;
    const avg = Number(avgRaw.toFixed(1));
    const unique = new Set(events.map((e) => e.hadith_number)).size;

    const countsByDay = {};
    for (const ev of events) {
      const key = new Date(ev.created_at).toISOString().slice(0, 10);
      countsByDay[key] = (countsByDay[key] || 0) + 1;
    }

    const sortedDays = Object.keys(countsByDay).sort((a, b) => (a < b ? 1 : -1));
    const streak = computeCurrentStreak(sortedDays);

    let topDay = null;
    let topDayCount = 0;
    for (const [day, count] of Object.entries(countsByDay)) {
      if (count > topDayCount) {
        topDay = day;
        topDayCount = count;
      }
    }

    return {
      total,
      avg,
      unique,
      streak,
      topDay,
      topDayCount,
    };
  }, [events]);

  /* -------------------- Pas connecté -------------------- */
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
                Vue des 14 derniers jours pour garder une timeline claire et utile.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs">
                {events.length} évènement{events.length > 1 ? "s" : ""} sur 14 jours
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
                Aucune révision enregistrée sur les 14 derniers jours.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Dès que tu commenceras à réviser tes hadiths, chaque session apparaîtra ici
                sous forme de timeline. C’est ton journal de progression récent.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Résumé */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <SummaryCard
              icon={RotateCcw}
              label="Révisions"
              value={summary.total}
            />

            <SummaryCard
              icon={TrendingUp}
              label="Moyenne"
              value={`${summary.avg}/5`}
              valueClassName={getAvgColor(summary.avg)}
            />

            <SummaryCard
              icon={BookOpenCheck}
              label="Hadiths travaillés"
              value={summary.unique}
            />

            <SummaryCard
              icon={Flame}
              label="Série active"
              value={`${summary.streak} jour${summary.streak > 1 ? "s" : ""}`}
              valueClassName={summary.streak > 0 ? "text-orange-600 dark:text-orange-400" : ""}
            />
          </div>
        )}

        {/* Jour le plus actif */}
        {!loading && events.length > 0 && summary.topDay && (
          <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-sm">
            <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Jour le plus actif
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(summary.topDay)}
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="w-fit">
                {summary.topDayCount} révision{summary.topDayCount > 1 ? "s" : ""}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {!loading && events.length > 0 && (
          <div className="relative pl-4 sm:pl-6">
            <div className="absolute left-1 sm:left-2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400/60 via-slate-300 to-transparent dark:from-blue-500/60 dark:via-slate-700" />

            <div className="space-y-6">
              {groupedByDate.map(({ dateKey, events: group }) => (
                <div key={dateKey} className="relative">
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
                          <div className="flex items-center gap-2 flex-wrap">
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
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              {eventTypeIcon(ev.event_type, "h-4 w-4 text-blue-500")}
                              <span className="font-medium">
                                {eventTypeLabel(ev.event_type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <BookOpenCheck className="h-3 w-3" />
                              <span>
                                Session enregistrée automatiquement pour suivre ta progression.
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