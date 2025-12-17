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
// /src/lib/hadithProgress.j

// ... computeNextReview reste tel quel

export async function saveReviewResult(userId, hadithNumber, quality) {
  console.log("DEBUG saveReviewResult input", {
    userId,
    hadithNumber,
    quality,
  });

  const today = new Date();
  const todayISODate = today.toISOString().slice(0, 10);

  // 1️⃣ On récupère la progression existante pour ce hadith
  const { data: existing, error: fetchError } = await supabase
    .from("user_hadith_progress")
    .select(
      "hadith_number, ease_factor, interval_days, repetitions, next_review_date, last_result, status"
    )
    .eq("user_id", userId)
    .eq("hadith_number", hadithNumber)
    .maybeSingle();

  if (fetchError) {
    console.error("Erreur fetch progression :", fetchError);
    throw fetchError;
  }

  const base = existing || {
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    status: "learning",
  };

  // 2️⃣ On calcule le prochain intervalle avec SM-2 simplifié
  const next = computeNextReview({
    quality,
    ease_factor: base.ease_factor,
    interval_days: base.interval_days,
    repetitions: base.repetitions,
  });

  // 3️⃣ On prépare le payload pour user_hadith_progress
  const payload = {
    user_id: userId,
    hadith_number: hadithNumber,
    ease_factor: next.ease_factor,
    interval_days: next.interval_days,
    repetitions: next.repetitions,
    last_result: quality,
    last_review_at: today.toISOString(),
    next_review_date: next.next_review_date || todayISODate,
    status: next.repetitions >= 3 ? "learned" : "learning",
  };

  console.log("DEBUG saveReviewResult payload", payload);

  // 4️⃣ Upsert de la progression principale
  const { error: upsertError } = await supabase
    .from("user_hadith_progress")
    .upsert(payload, { onConflict: "user_id,hadith_number" });

  if (upsertError) {
    console.error("Erreur upsert user_hadith_progress :", upsertError);
    throw upsertError;
  }

  // 5️⃣ 📌 Enregistrement dans l'historique (review_events)
  const { error: historyError } = await supabase.from("review_events").insert({
    user_id: userId,
    hadith_number: hadithNumber,
    quality,
    event_type: "review",
    // created_at est rempli automatiquement par default now()
  });

  if (historyError) {
    console.error("Erreur insertion review_events :", historyError);
    // on NE throw PAS ici pour ne pas casser le flux de l’appli
  }
}



// 🔎 Récupération de l'historique des révisions pour un utilisateur
export async function getReviewHistory(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("review_events")
    .select("id, hadith_number, quality, event_type, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur récupération historique:", error);
    throw error;
  }

  return data ?? [];
}

export async function getDueCount(userId) {
  if (!userId) return 0;

  const todayISO = new Date().toISOString().slice(0, 10);

  // On veut tous les hadiths dont la prochaine révision est aujourd'hui ou avant
  const { count, error } = await supabase
    .from("user_hadith_progress")
    .select("hadith_number", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("next_review_date", todayISO);

  if (error) {
    console.error("Erreur getDueCount:", error);
    return 0;
  }

  return count ?? 0;
}





