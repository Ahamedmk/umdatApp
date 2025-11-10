// quality: 0..5 (0 = échec total, 5 = parfait)
// Retourne nouvel état { ease, interval_days, repetitions, next_review_date }
export function nextReview({ ease=2.5, interval_days=0, repetitions=0 }, quality) {
  let newEase = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  let newReps = quality < 3 ? 0 : repetitions + 1;
  let newInterval = 1;
  if (newReps === 0) newInterval = 1;      // re-apprentissage
  else if (newReps === 1) newInterval = 1; // J+1
  else if (newReps === 2) newInterval = 3; // J+3
  else newInterval = Math.round(interval_days * newEase);

  const next = new Date();
  next.setDate(next.getDate() + newInterval);

  return { ease: newEase, interval_days: newInterval, repetitions: newReps, next_review_date: next.toISOString().slice(0,10) };
}
