import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, RotateCcw, Brain, Scale, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/umdat-memorize-logo.png";

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dueCount, setDueCount] = useState(null);
  const [loadingDue, setLoadingDue] = useState(true);

  /* --------------------------------------------------
   * 🎨 Synchronisation du thème
   * -------------------------------------------------- */
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const enable = pref ? pref === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  /* --------------------------------------------------
   * 🔔 Demande douce de permission de notification
   * (une seule fois, non intrusive)
   * -------------------------------------------------- */
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      const timer = setTimeout(() => {
        Notification.requestPermission();
      }, 3000); // 3s après l'ouverture

      return () => clearTimeout(timer);
    }
  }, []);

  /* --------------------------------------------------
   * 🧠 Helper : doit-on notifier ce matin ?
   * -------------------------------------------------- */
  function shouldNotifyThisMorning() {
    const now = new Date();
    const hour = now.getHours();

    // plage douce : 7h → 9h
    if (hour < 7 || hour > 9) return false;

    const today = now.toISOString().slice(0, 10);
    const lastSent = localStorage.getItem("morning_notif_sent");

    return lastSent !== today;
  }

  /* --------------------------------------------------
   * 🔴 Chargement des révisions du jour
   * + notification douce (version 1)
   * -------------------------------------------------- */
  useEffect(() => {
    async function loadDueCount() {
      if (!user?.id) {
        setDueCount(0);
        setLoadingDue(false);
        return;
      }

      setLoadingDue(true);
      const today = new Date().toISOString().slice(0, 10);

      const { count, error } = await supabase
        .from("user_hadith_progress")
        .select("hadith_number", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("next_review_date", today);

      const safeCount = error ? 0 : count ?? 0;
      setDueCount(safeCount);
      setLoadingDue(false);

      /* 🔔 Notification douce du matin */
      if (
        safeCount > 0 &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        shouldNotifyThisMorning()
      ) {
        new Notification("📘 Révisions du jour", {
          body: `Tu as ${safeCount} hadith${safeCount > 1 ? "s" : ""} à réviser aujourd’hui.\nPrends 10 minutes maintenant.`,
          icon: "/pwa-192x192.png",
        });

        localStorage.setItem(
          "morning_notif_sent",
          today
        );
      }
    }

    loadDueCount();
  }, [user?.id]);

  /* --------------------------------------------------
   * 🎯 Cartes de navigation
   * -------------------------------------------------- */
  const features = [
    {
      icon: BookOpen,
      title: "Apprendre",
      description: "Texte arabe, audio, et opinions détaillées des savants",
      href: "/learn",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: RotateCcw,
      title: "Réviser",
      description: "Système de révision espacée intelligent (SM-2)",
      href: "/review",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: Brain,
      title: "Quiz",
      description: "Teste et renforce ta compréhension",
      href: "/quiz",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: Scale,
      title: "Comparer",
      description: "Analyse comparative des 4 écoles juridiques",
      href: "/compare",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50
                    dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6 transition-colors">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* 🔴 Bloc Révisions du jour (PRIORITAIRE) */}
        {!loadingDue && (
          <div
            className={`rounded-2xl p-6 shadow-xl text-white
              ${dueCount > 0
                ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                : "bg-gradient-to-br from-emerald-500 to-teal-600"}`}
          >
            {dueCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Révisions du jour</h2>
                </div>

                <p className="text-white/90">
                  Tu as{" "}
                  <span className="font-bold text-white">
                    {dueCount} hadith{dueCount > 1 ? "s" : ""}
                  </span>{" "}
                  à réviser aujourd’hui.
                </p>

                <button
                  onClick={() => navigate("/review")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-indigo-700
                             font-semibold hover:bg-white/90 transition"
                >
                  Commencer la révision
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Révisions terminées</h2>
                </div>
                <p className="text-white/90">
                  Toutes tes révisions du jour sont terminées ✅
                </p>
                <p className="text-sm text-white/80">
                  Reviens demain in châ Allah pour continuer.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full">
            <span className="text-white text-sm font-semibold">عمدة الأحكام</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
            Umdat al-Ahkam
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Apprends et mémorise les hadiths en arabe et français, compare les avis
            des 4 écoles, et progresse avec un système de répétition espacée.
          </p>
        </header>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(feature.href)}
                className="group relative w-full text-left bg-white dark:bg-slate-900 rounded-2xl p-6
                           shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200
                           dark:border-slate-700 overflow-hidden"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.gradient}
                              opacity-0 group-hover:opacity-5 transition-opacity`}
                />

                <div className="relative z-10">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>

                  <div className="mt-4 flex items-center text-sm font-semibold text-slate-400
                                  group-hover:text-slate-700 dark:group-hover:text-slate-200">
                    <span>Commencer</span>
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                500+
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Hadiths</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                4
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Écoles</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Gratuit</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
