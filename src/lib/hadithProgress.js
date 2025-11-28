// /src/lib/hadithProgress.js
import { supabase } from "./supabase";

/**
 * Détermine le statut d’un hadith à partir de la qualité.
 * Retourne TOUJOURS une valeur valide de l'ENUM hadith_status.
 *
 * - 0,1,2,3  → "learning"
 * - 4,5      → "learned"
 */
export function computeStatusFromQuality(quality) {
  const q = Number(quality);

  if (Number.isNaN(q)) {
    // Sécurité : on ne renvoie jamais une chaîne vide
    return "learning";
  }

  if (q >= 4) {
    return "learned";
  }

  return "learning";
}

/**
 * Mini algorithme SM-2 pour calculer la prochaine révision.
 *
 * existing : objet venant de user_hadith_progress (facultatif)
 *   { ease_factor, interval_days, repetitions }
 *
 * Retour :
 *   { ease_factor, interval_days, repetitions, next_review_date, status }
 */
export function computeNextReview(existing = {}, quality) {
  const q = Number(quality);

  const prevEase = existing.ease_factor ?? 2.5;
  let ease_factor = prevEase + (q >= 4 ? 0.1 : -0.2);
  if (ease_factor < 1.3) ease_factor = 1.3;

  let repetitions = (existing.repetitions ?? 0) + 1;
  let interval_days = existing.interval_days ?? 0;

  if (q < 3) {
    // Échec : on “reset” un peu la courbe
    repetitions = 0;
    interval_days = 0;
  } else if (interval_days === 0) {
    interval_days = 1;
  } else if (interval_days === 1) {
    interval_days = 3;
  } else {
    interval_days = Math.round(interval_days * ease_factor);
  }

  const base = new Date();
  base.setDate(base.getDate() + Math.max(interval_days, 0));
  const next_review_date = base.toISOString().slice(0, 10);

  const status = computeStatusFromQuality(q);

  return {
    ease_factor,
    interval_days,
    repetitions,
    next_review_date,
    status,
  };
}

/**
 * Sauvegarde le résultat d’une révision dans user_hadith_progress.
 *
 * @param {string} userId         - id de l’utilisateur
 * @param {number} hadithNumber   - numéro du hadith
 * @param {number} quality        - note 0–5
 * @param {object} nextArg        - (optionnel) objet déjà calculé côté client
 *                                  { ease, ease_factor, interval_days, repetitions, next_review_date, status }
 *
 * Si nextArg n’est pas fourni, on recalcule tout ici avec computeNextReview().
 */
export async function saveReviewResult(userId, hadithNumber, quality, nextArg) {
  if (!userId || !hadithNumber) return;

  const q = Number(quality);

  // 1) On reconstruit / complète les données SM-2
  let next = nextArg || {};

  // Si l’appelant n’a pas donné next, on calcule nous-mêmes
  if (!next || Object.keys(next).length === 0) {
    next = computeNextReview({}, q);
  }

  // Accept both "ease" and "ease_factor" from caller
  const ease_factor =
    next.ease_factor ?? next.ease ?? 2.5;

  const interval_days = next.interval_days ?? 0;
  const repetitions = next.repetitions ?? 0;

  const next_review_date =
    next.next_review_date ||
    new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  // 2) Statut garanti (jamais "", jamais null)
  const status =
    next.status && typeof next.status === "string"
      ? next.status
      : computeStatusFromQuality(q);

  const payload = {
    user_id: userId,
    hadith_number: hadithNumber,
    ease_factor,
    interval_days,
    repetitions,
    last_result: q,
    last_review_at: new Date().toISOString(),
    next_review_date,
    status,
  };

  // Debug utile pour voir ce qui part vers Supabase
  console.log("DEBUG saveReviewResult input", {
    userId,
    hadithNumber,
    quality: q,
    next,
  });
  console.log("DEBUG saveReviewResult payload", payload);

  const { error } = await supabase
    .from("user_hadith_progress")
    .upsert(payload, { onConflict: "user_id,hadith_number" });

  if (error) {
    console.error("Erreur upsert user_hadith_progress :", error);
    throw error;
  }
}
