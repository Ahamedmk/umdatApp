// /src/lib/hadithProgress.js
import { supabase } from "./supabase";

const MIN_GAP_DAYS_FOR_MASTERY_WIN = 5;
const MASTERY_WINS_REQUIRED = 3;

function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
}
function addDaysISO(baseISO, days) {
  const d = new Date(baseISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + Number(days || 0));
  return toISODate(d);
}
function daysBetweenISO(aISO, bISO) {
  const a = new Date(aISO + "T00:00:00Z");
  const b = new Date(bISO + "T00:00:00Z");
  return Math.floor((b - a) / 86400000);
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Ton mapping de statut (hors mastered)
 * - 0..3 => learning
 * - 4..5 => learned
 */
export function computeStatusFromQuality(quality) {
  const q = Number(quality);
  if (Number.isNaN(q)) return "learning";
  return q >= 4 ? "learned" : "learning";
}

// Scheduling learned/learning
function scheduleForQualityLearned(q) {
  if (q <= 2) return 1; // demain
  if (q === 3) return 2;
  if (q === 4) return 3;
  return 4; // 5
}

// Scheduling mastered (adaptatif)
function scheduleForQualityMastered(currentIntervalDays, q) {
  const base = Math.max(3, Number(currentIntervalDays || 10));
  if (q === 5) return Math.round(base * 2);
  if (q === 4) return Math.round(base * 1.5);
  if (q === 3) return base;
  if (q === 2) return 3; // tolérance
  return 1; // 0-1 => demain
}

/**
 * ⚠️ On garde computeNextReview si tu l’utilises ailleurs,
 * mais Review.jsx appelle saveReviewResult() => c’est là la source de vérité.
 */
export function computeNextReview(existing = {}, quality) {
  const q = Number(quality);

  const prevEase = existing.ease_factor ?? 2.5;
  let ease_factor = prevEase + (q >= 4 ? 0.1 : -0.2);
  if (ease_factor < 1.3) ease_factor = 1.3;

  let repetitions = (existing.repetitions ?? 0) + 1;
  let interval_days = existing.interval_days ?? 0;

  if (q < 3) {
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

  return { ease_factor, interval_days, repetitions, next_review_date, status };
}

/**
 * ✅ LOGIQUE HYBRIDE + MASTERED
 * - last_result reste un INTEGER (0–5), conforme à ta DB
 */
export async function saveReviewResult(userId, hadithNumber, quality) {
  const q = Number(quality);
  if (!userId || !hadithNumber || Number.isNaN(q)) return;

  const todayISO = toISODate(new Date());
  const nowISO = new Date().toISOString();

  // 1) Charger l’existant
  const { data: existing, error: fetchError } = await supabase
    .from("user_hadith_progress")
    .select(
      [
        "hadith_number",
        "status",
        "interval_days",
        "ease_factor",
        "repetitions",
        "next_review_date",
        "last_result",
        "consecutive_failures",
        "mastery_wins",
        "last_mastery_win_date",
      ].join(",")
    )
    .eq("user_id", userId)
    .eq("hadith_number", hadithNumber)
    .maybeSingle();

  if (fetchError) {
    console.error("Erreur fetch progression:", fetchError);
    throw fetchError;
  }

  const base = existing || {
    status: "learning",
    interval_days: 0,
    ease_factor: 2.5,
    repetitions: 0,
    consecutive_failures: 0,
    mastery_wins: 0,
    last_mastery_win_date: null,
  };

  const passed = q >= 3;
  const goodForMastery = q >= 4;

  let nextStatus = base.status || "learning";
  let nextIntervalDays = Number(base.interval_days || 0);
  let nextReviewDate = todayISO;

  let consecutiveFailures = Number(base.consecutive_failures || 0);
  let masteryWins = Number(base.mastery_wins || 0);
  let lastMasteryWinDate = base.last_mastery_win_date || null;

  // 2) Appliquer la logique
  if (nextStatus === "mastered") {
    if (!passed) {
      consecutiveFailures += 1;

      // fail => demain
      nextIntervalDays = 1;
      nextReviewDate = addDaysISO(todayISO, 1);

      // 2 fails consécutifs => downgrade doux
      if (consecutiveFailures >= 2) {
        nextStatus = "learned";
        consecutiveFailures = 0;

        nextIntervalDays = 3;
        nextReviewDate = addDaysISO(todayISO, 3);

        // garde un peu d'avance
        masteryWins = Math.max(2, masteryWins);
      }
    } else {
      consecutiveFailures = 0;
      const d = scheduleForQualityMastered(base.interval_days, q);
      nextIntervalDays = d;
      nextReviewDate = addDaysISO(todayISO, d);
    }
  } else {
    // learning/learned/new
    if (!passed) {
      consecutiveFailures += 1;

      // demain
      nextIntervalDays = 1;
      nextReviewDate = addDaysISO(todayISO, 1);

      // si déjà learned, on le laisse learned (appris mais fragile)
      if (nextStatus !== "learned") nextStatus = "learning";
    } else {
      consecutiveFailures = 0;

      // statut de base (hors mastered)
      if (nextStatus !== "learned") {
        nextStatus = computeStatusFromQuality(q); // learning ou learned
      }

      const d = scheduleForQualityLearned(q);
      nextIntervalDays = d;
      nextReviewDate = addDaysISO(todayISO, d);

      // progression vers mastered: 3 wins >=4 espacées de 5j
      if (nextStatus === "learned" && goodForMastery) {
        if (!lastMasteryWinDate) {
          masteryWins = 1;
          lastMasteryWinDate = todayISO;
        } else {
          const gap = daysBetweenISO(lastMasteryWinDate, todayISO);
          if (gap >= MIN_GAP_DAYS_FOR_MASTERY_WIN) {
            masteryWins = clamp(masteryWins + 1, 0, MASTERY_WINS_REQUIRED);
            lastMasteryWinDate = todayISO;
          }
        }

        if (masteryWins >= MASTERY_WINS_REQUIRED) {
          nextStatus = "mastered";
          nextIntervalDays = Math.max(10, nextIntervalDays);
          nextReviewDate = addDaysISO(todayISO, nextIntervalDays);
        }
      }
    }
  }

  // 3) Payload (cohérent avec tes colonnes)
  const payload = {
    user_id: userId,
    hadith_number: hadithNumber,

    status: nextStatus,
    interval_days: nextIntervalDays,
    next_review_date: nextReviewDate,

    // ✅ ta DB attend un integer
    last_result: q,

    last_review_at: nowISO,
    last_review_date: todayISO, // tu as cette colonne

    consecutive_failures: consecutiveFailures,
    mastery_wins: masteryWins,
    last_mastery_win_date: lastMasteryWinDate,
  };

  console.log("DEBUG saveReviewResult payload", payload);

  // 4) Upsert
  const { error: upsertError } = await supabase
    .from("user_hadith_progress")
    .upsert(payload, { onConflict: "user_id,hadith_number" });

  if (upsertError) {
    console.error("Erreur upsert user_hadith_progress:", upsertError);
    throw upsertError;
  }

  // 5) Historique (si ta table existe)
  // On garde ton insert, mais on ajoute result si tu l’as.
  const { error: historyError } = await supabase.from("review_events").insert({
    user_id: userId,
    hadith_number: hadithNumber,
    quality: q,
    event_type: "review",
    // created_at auto
  });

  if (historyError) {
    console.error("Erreur insertion review_events:", historyError);
    // on ne throw pas
  }

  return payload;
}

// 🔎 Récupération historique
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
