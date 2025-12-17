export async function setHadithDueBadge(count) {
  try {
    if (!("setAppBadge" in navigator)) return; // pas supporté -> on ignore

    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge?.();
    }
  } catch {
    // on ignore (permissions / support partiel)
  }
}
