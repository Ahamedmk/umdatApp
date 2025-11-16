// /src/lib/hadithProgress.js
import { supabase } from "./supabase";

/**
 * Sauvegarde le résultat d'une révision pour un hadith donné.
 * - userId : id de l'utilisateur (auth.users.id)
 * - hadithNumber : numéro du hadith (8, 9, 10...)
 * - quality : note 0–5
 * - spacedData : { ease, interval_days, repetitions, next_review_date }
 */
export async function saveReviewResult(userId, hadithNumber, quality, spacedData = {}) {
  if (!userId) {
    console.warn("saveReviewResult : userId manquant → aucune sauvegarde");
    return;
  }

  if (!hadithNumber) {
    console.warn("saveReviewResult : hadithNumber manquant → aucune sauvegarde");
    return;
  }

  const payload = {
    user_id: userId,
    hadith_number: hadithNumber,
    // ❌ on ne touche pas au status pour l'instant, Supabase mettra la valeur par défaut
    // status: quality >= 4 ? "learning" : "review",

    ease_factor: spacedData.ease ?? spacedData.ease_factor ?? 2.5,
    interval_days: spacedData.interval_days ?? 0,
    repetitions: spacedData.repetitions ?? 0,
    next_review_date:
      spacedData.next_review_date ?? new Date().toISOString().slice(0, 10),
    last_result: quality,
  };

  console.log("saveReviewResult payload →", payload);

  const { error } = await supabase
    .from("user_hadith_progress")
    .upsert(payload, { onConflict: "user_id,hadith_number" });

  if (error) {
    console.error(
      "Erreur saveReviewResult :",
      error.message,
      error.details,
      error.hint
    );
  }
}
