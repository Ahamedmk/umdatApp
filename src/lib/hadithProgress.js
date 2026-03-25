// /src/lib/hadithProgress.js
import { supabase } from "./supabase";

const MIN_GAP_DAYS_FOR_MASTERY_WIN = 5;
const MASTERY_WINS_REQUIRED = 3;

function toLocalISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysISO(baseISO, days) {
  const [y, m, d] = baseISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + Number(days || 0));
  return toLocalISODate(date);
}

function daysBetweenISO(aISO, bISO) {
  const [ay, am, ad] = aISO.split("-").map(Number);
  const [by, bm, bd] = bISO.split("-").map(Number);

  const a = new Date(ay, am - 1, ad);
  const b = new Date(by, bm - 1, bd);

  return Math.floor((b - a) / 86400000);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Statut de base hors mastered
 * - 0..3 => learning
 * - 4..5 => learned
 */
export function computeStatusFromQuality(quality) {
  const q = Number(quality);
  if (Number.isNaN(q)) return "learning";
  return q >= 4 ? "learned" : "learning";
}

// Intervalle pour learning/learned
function scheduleForQualityLearned(q) {
  if (q <= 2) return 1;
  if (q === 3) return 2;
  if (q === 4) return 3;
  return 4; // q === 5
}

// Intervalle pour mastered
function scheduleForQualityMastered(currentIntervalDays, q) {
  const base = Math.max(3, Number(currentIntervalDays || 10));
  if (q === 5) return Math.max(4, Math.round(base * 2));
  if (q === 4) return Math.max(3, Math.round(base * 1.5));
  if (q === 3) return base;
  if (q === 2) return 3;
  return 1;
}

/**
 * Fonction optionnelle si utilisée ailleurs
 */
export function computeNextReview(existing = {}, quality) {
  const q = Number(quality);

  const prevEase = Number(existing.ease_factor ?? 2.5);
  let ease_factor = prevEase + (q >= 4 ? 0.1 : q === 3 ? 0 : -0.2);
  ease_factor = Math.max(1.3, Math.min(ease_factor, 3.0));

  let repetitions = Number(existing.repetitions ?? 0);
  let interval_days = Number(existing.interval_days ?? 0);

  if (q < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    repetitions += 1;

    if (interval_days <= 0) {
      interval_days = 1;
    } else if (interval_days === 1) {
      interval_days = 3;
    } else {
      interval_days = Math.max(1, Math.round(interval_days * ease_factor));
    }
  }

  const todayISO = toLocalISODate(new Date());
  const next_review_date = addDaysISO(todayISO, interval_days);
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
 * ✅ Logique principale
 */
export async function saveReviewResult(userId, hadithNumber, quality) {
  const q = Number(quality);
  if (!userId || !hadithNumber || Number.isNaN(q)) return;

  const todayISO = toLocalISODate(new Date());
  const nowISO = new Date().toISOString();

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

  let easeFactor = Number(base.ease_factor || 2.5);
  let repetitions = Number(base.repetitions || 0);

  let consecutiveFailures = Number(base.consecutive_failures || 0);
  let masteryWins = Number(base.mastery_wins || 0);
  let lastMasteryWinDate = base.last_mastery_win_date || null;

  // Ajustement ease factor
  easeFactor = easeFactor + (q >= 4 ? 0.1 : q === 3 ? 0 : -0.2);
  easeFactor = clamp(easeFactor, 1.3, 3.0);

  if (nextStatus === "mastered") {
    if (!passed) {
      consecutiveFailures += 1;
      repetitions = 0;

      nextIntervalDays = 1;
      nextReviewDate = addDaysISO(todayISO, 1);

      if (consecutiveFailures >= 2) {
        nextStatus = "learned";
        consecutiveFailures = 0;

        nextIntervalDays = 3;
        nextReviewDate = addDaysISO(todayISO, 3);

        masteryWins = Math.max(2, masteryWins);
      }
    } else {
      consecutiveFailures = 0;
      repetitions += 1;

      const d = scheduleForQualityMastered(base.interval_days, q);
      nextIntervalDays = d;
      nextReviewDate = addDaysISO(todayISO, d);
    }
  } else {
    if (!passed) {
      consecutiveFailures += 1;
      repetitions = 0;

      nextIntervalDays = 1;
      nextReviewDate = addDaysISO(todayISO, 1);

      if (nextStatus !== "learned") {
        nextStatus = "learning";
      }
    } else {
      consecutiveFailures = 0;
      repetitions += 1;

      if (nextStatus !== "learned") {
        nextStatus = computeStatusFromQuality(q);
      }

      nextIntervalDays = scheduleForQualityLearned(q);

      // sécurité absolue : si q >= 4, jamais aujourd’hui
      if (q >= 4 && nextIntervalDays < 1) {
        nextIntervalDays = 1;
      }

      nextReviewDate = addDaysISO(todayISO, nextIntervalDays);

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

  const payload = {
    user_id: userId,
    hadith_number: hadithNumber,

    status: nextStatus,
    interval_days: nextIntervalDays,
    next_review_date: nextReviewDate,

    ease_factor: easeFactor,
    repetitions: repetitions,

    last_result: q,
    last_review_at: nowISO,
    last_review_date: todayISO,

    consecutive_failures: consecutiveFailures,
    mastery_wins: masteryWins,
    last_mastery_win_date: lastMasteryWinDate,
  };

  console.log("DEBUG saveReviewResult payload", payload);

  const { error: upsertError } = await supabase
    .from("user_hadith_progress")
    .upsert(payload, { onConflict: "user_id,hadith_number" });

  if (upsertError) {
    console.error("Erreur upsert user_hadith_progress:", upsertError);
    throw upsertError;
  }

  const { error: historyError } = await supabase.from("review_events").insert({
    user_id: userId,
    hadith_number: hadithNumber,
    quality: q,
    event_type: "review",
  });

  if (historyError) {
    console.error("Erreur insertion review_events:", historyError);
  }

  return payload;
}

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

  const todayISO = toLocalISODate(new Date());

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

// Helpers de lecture pour Learn.jsx / ChapterLearn.jsx

export function getProgressStatusFromRow(row) {
  if (!row) return "new";

  const status = row.status || "learning";
  const todayISO = toLocalISODate(new Date());

  if (status === "mastered") {
    return "mastered";
  }

  if (row.next_review_date && row.next_review_date <= todayISO) {
    return "review";
  }

  // Hadith déjà travaillé mais pas encore dû
  if (status === "learned") {
    return "scheduled";
  }

  if (status === "learning") {
    return "learning";
  }

  return "new";
}

export function mergeHadithsWithSupabaseProgress(hadiths, progressRows = []) {
  const progressMap = new Map(
    (progressRows || []).map((row) => [Number(row.hadith_number), row])
  );

  return hadiths.map((hadith) => {
    const row = progressMap.get(Number(hadith.number));

    return {
      ...hadith,
      progressStatus: getProgressStatusFromRow(row),
      progressRow: row || null,
      score: row?.last_result ?? null,
      next_review_date: row?.next_review_date ?? null,
      interval_days: row?.interval_days ?? null,
      repetitions: row?.repetitions ?? 0,
      mastery_wins: row?.mastery_wins ?? 0,
    };
  });
}

export async function getUserHadithProgress(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
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
        "last_review_at",
        "last_review_date",
        "consecutive_failures",
        "mastery_wins",
        "last_mastery_win_date",
      ].join(",")
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Erreur getUserHadithProgress:", error);
    throw error;
  }

  return data ?? [];
}