// /src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

import { ProfileGuest } from "./ProfileGuest";
import { ProfileDashboard } from "./ProfileDashboard";

export function Profile() {
  const { user, signIn, signOut } = useAuth();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Thème (comme avant)
  useEffect(() => {
    const pref = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const enable = pref ? pref === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", enable);
  }, []);

  // Charger ou créer les stats pour ce user
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoadingStats(true);

      try {
        const { data, error } = await supabase
          .from("user_hadith_stats")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          // Cas typique : aucune ligne trouvée
          if (error.code === "PGRST116" || error.details?.includes("0 rows")) {
            // On crée une ligne par défaut pour ce user
            const { data: inserted, error: insertError } = await supabase
              .from("user_hadith_stats")
              .insert({
                user_id: user.id,
                learned: 0,
                learning: 0,
                total: 8,
                streak: 0,
              })
              .select()
              .single();

            if (insertError) {
              console.error("Erreur insert stats:", insertError);
            } else {
              setStats(inserted);
            }
          } else {
            console.error("Erreur fetch stats:", error);
          }
        } else {
          setStats(data);
        }
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  // Écran invité (non connecté)
  if (!user) {
    return <ProfileGuest onSignIn={signIn} />;
  }

  // Si stats encore en chargement
  if (loadingStats || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
        <div className="text-slate-600 dark:text-slate-300 text-sm">
          Chargement de ta progression…
        </div>
      </div>
    );
  }

  return (
    <ProfileDashboard
      user={user}
      stats={stats}
      onSignOut={signOut}
    />
  );
}

export default Profile;
