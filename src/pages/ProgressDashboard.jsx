// /src/pages/ProgressDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Flame, CheckCircle2, Clock, CalendarDays, AlertTriangle, Sparkles } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";

/**
 * ✅ IMPORTANT
 * Tu peux garder ton import actuel si tu n’as pas encore de liste globale.
 * Mais comme ton UI parle de "39 hadiths", l’idéal est d’avoir un tableau unique (ex: HADITHS_1_39).
 *
 * Options possibles (au choix selon ton projet) :
 * - import { HADITHS_1_39 as HADITHS } from "../data/seed_hadiths_1_39";
 * - import { HADITHS } from "../data/hadiths";
 * - ou garder HADITHS_1_15 pour l’instant
 */
import { HADITHS_1_15 as HADITHS } from "../data/seed_hadiths_1_15";

// Petite fonction utilitaire pour formatter une date YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * ✅ Nouveau streak :
 * Nombre de jours distincts où l'utilisateur a fait au moins 1 révision
 * (sur la fenêtre chargée).
 * On ne pénalise plus les jours "sans due".
 */
function computeStreak(dates) {
  if (!dates.length) return 0;
  const uniqueDays = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  return uniqueDays.size;
}

/**
 * ✅ Normalisation des statuts pour rester cohérent avec ton nouveau vocabulaire.
 * Avant: "learned"
 * Maintenant: "memorized"
 *
 * On convertit au runtime pour éviter de casser les anciennes rows si tu en as.
 */
function normalizeStatus(rawStatus) {
  if (!rawStatus) return "not_started";
  if (rawStatus === "learned") return "memorized";
  return rawStatus;
}

export default function ProgressDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [progressRows, setProgressRows] = useState([]);
  const [reviewDates, setReviewDates] = useState([]); // timestamps des review_events

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        // 1) Progression par hadith
        const { data: prog, error: progError } = await supabase
          .from("user_hadith_progress")
          .select("hadith_number, status, next_review_date, repetitions, interval_days, last_result, ease_factor")
          .eq("user_id", user.id);

        if (progError) throw progError;

        // 2) Events de révision (streak + graph)
        const { data: events, error: eventsError } = await supabase
          .from("review_events")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(365);

        if (eventsError) throw eventsError;

        // ✅ normalise les statuts (learned -> memorized)
        const normalized = (prog || []).map((row) => ({
          ...row,
          status: normalizeStatus(row.status),
        }));

        setProgressRows(normalized);
        setReviewDates((events || []).map((e) => e.created_at));
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        setProgressRows([]);
        setReviewDates([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Map { hadith_number: rowProgress }
  const progressMap = useMemo(() => {
    const m = {};
    for (const row of progressRows) {
      m[row.hadith_number] = row;
    }
    return m;
  }, [progressRows]);

  // ✅ Stats globales (cohérent avec "mémorisé")
  const totalHadiths = HADITHS.length;

  const memorizedCount = useMemo(
    () => progressRows.filter((p) => normalizeStatus(p.status) === "memorized").length,
    [progressRows]
  );

  const learningCount = useMemo(
    () => progressRows.filter((p) => normalizeStatus(p.status) === "learning").length,
    [progressRows]
  );

  // ✅ À réviser = items qui ont une date <= aujourd’hui
  // (peu importe "memorized" ou "learning" : si SM-2 planifie, c’est à réviser)
  const dueTodayOrLate = useMemo(() => {
    return progressRows.filter((p) => {
      if (!p.next_review_date) return false;
      return p.next_review_date <= todayStr;
    }).length;
  }, [progressRows, todayStr]);

  // Nouveau streak (jours distincts avec révision)
  const streak = useMemo(() => computeStreak(reviewDates), [reviewDates]);

  const memorizedPercent = totalHadiths ? Math.round((memorizedCount / totalHadiths) * 100) : 0;

  // ─────────────────────────────────────────────
  // Graphique (14 derniers jours)
  // ─────────────────────────────────────────────
  const reviewActivityData = useMemo(() => {
    if (!reviewDates.length) {
      // on retourne quand même 14 jours à 0 pour éviter un rendu “vide” trop sec (optionnel)
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({
          date: key,
          label: d.toLocaleDateString("fr-FR", { day: "2-digit" }),
          count: 0,
        });
      }
      return days;
    }

    const counts = {};
    reviewDates.forEach((ts) => {
      const d = new Date(ts);
      const key = d.toISOString().slice(0, 10);
      counts[key] = (counts[key] || 0) + 1;
    });

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);

      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString("fr-FR", { day: "2-digit" }),
        count: counts[key] || 0,
      });
    }

    return days;
  }, [reviewDates]);

  // Prochaines révisions (les 5 plus proches dans le futur)
  const upcomingReviews = useMemo(() => {
    return [...progressRows]
      .filter((p) => p.next_review_date && p.next_review_date >= todayStr)
      .sort((a, b) => (a.next_review_date < b.next_review_date ? -1 : 1))
      .slice(0, 5);
  }, [progressRows, todayStr]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <Card className="max-w-md w-full border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <CardContent className="py-8 text-center space-y-3">
            <BarChart3 className="h-8 w-8 mx-auto text-slate-500 mb-2" />
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Connecte-toi pour voir ton tableau de progression.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tes statistiques se calculent automatiquement à partir de tes révisions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* ✅ cohérent avec ton écran mobile (max-w-3xl) */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl leading-tight font-extrabold text-slate-900 dark:text-slate-100">
                Tableau de progression
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Visualise où tu en es dans la mémorisation des {totalHadiths} hadiths.
              </p>
            </div>
          </div>
        </div>

        <Badge className="bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
          {memorizedCount}/{totalHadiths} hadiths mémorisés
        </Badge>

        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
            <CardContent className="pt-4 pb-3 space-y-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide opacity-80">Mémorisés</span>
              </div>
              <div className="text-2xl font-bold">{memorizedCount}</div>
              <div className="text-[11px] opacity-80">
                {memorizedPercent}% des {totalHadiths} hadiths
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardContent className="pt-4 pb-3 space-y-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide opacity-80">En cours</span>
              </div>
              <div className="text-2xl font-bold">{learningCount}</div>
              <div className="text-[11px] opacity-80">Hadiths activement révisés</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
            <CardContent className="pt-4 pb-3 space-y-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide opacity-80">À réviser</span>
              </div>
              <div className="text-2xl font-bold">{dueTodayOrLate}</div>
              <div className="text-[11px] opacity-80">pour aujourd&apos;hui (ou en retard)</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-red-500 text-white border-0 shadow-lg">
            <CardContent className="pt-4 pb-3 space-y-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <Flame className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide opacity-80">Streak de révision</span>
              </div>
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-[11px] opacity-80">jour(s) où tu as révisé au moins un hadith</div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Rythme de révision (14 derniers jours)
            </CardTitle>
            <CardDescription>
              Nombre de hadiths révisés chaque jour. Idéal pour garder un œil sur ta constance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reviewActivityData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
                  <RechartsTooltip
                    formatter={(value) => [`${value} hadith(s)`, "Révisions"]}
                    labelFormatter={(_, payload) => {
                      const p = payload && payload[0];
                      return p ? formatDate(p.payload.date) : "Jour";
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* petit hint UX */}
            {reviewDates.length === 0 && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Aucune révision enregistrée récemment. Dès que tu feras des sessions, ce graphique se remplira automatiquement.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vue détaillée */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              Vue détaillée par hadith
            </CardTitle>
            <CardDescription>Statut de chaque hadith et prochaines révisions.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-1/3 animate-pulse" />
                <div className="space-y-1">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-10 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {HADITHS.map((h) => {
                  const prog = progressMap[h.number];
                  const status = normalizeStatus(prog?.status);

                  let statusLabel = "Non commencé";
                  let statusClass = "bg-slate-100 text-slate-700";

                  if (status === "learning") {
                    statusLabel = "En cours";
                    statusClass = "bg-blue-100 text-blue-700";
                  }
                  if (status === "memorized") {
                    statusLabel = "Mémorisé";
                    statusClass = "bg-emerald-100 text-emerald-700";
                  }

                  const repetitions = prog?.repetitions ?? 0;
                  const lastResult = prog?.last_result;
                  const nextDate = prog?.next_review_date;

                  return (
                    <div
                      key={h.number}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-slate-900 text-slate-50 flex items-center justify-center text-sm font-semibold">
                          #{h.number}
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {h.title || `Hadith ${h.number}`}
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Répétitions : {repetitions}
                            {lastResult != null ? <> • Dernier score : {lastResult}/5</> : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex md:block items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>Prochaine révision : {formatDate(nextDate)}</span>
                          </div>
                        </div>

                        <Badge className={`${statusClass} text-xs font-medium`}>{statusLabel}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prochaines révisions */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Prochaines révisions à venir
            </CardTitle>
            <CardDescription>Les 5 prochains hadiths qui arrivent dans ta file de révision.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {upcomingReviews.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aucune révision planifiée pour les prochains jours. Continue d&apos;apprendre de nouveaux hadiths ou
                reviens demain in shâ Allah.
              </p>
            ) : (
              upcomingReviews.map((p) => (
                <div
                  key={p.hadith_number}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-blue-600 text-white text-xs flex items-center justify-center">
                      #{p.hadith_number}
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-200">
                      <div className="font-medium">Hadith {p.hadith_number}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Interval : {p.interval_days} jour(s) • Répétitions : {p.repetitions}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 text-right">
                    <div className="font-medium">{formatDate(p.next_review_date)}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Prochaine session</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
