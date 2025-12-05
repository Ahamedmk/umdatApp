// src/hooks/useNarratorUnlocks.js
import { useEffect, useMemo, useState } from "react";
import { NARRATORS_MOCK } from "../data/narrators_mocks";
import { HADITHS_1_15 } from "../data/seed_hadiths_1_15";

// Si tu as d'autres fichiers de hadiths, tu pourras les concaténer ici :
const ALL_HADITHS = [...HADITHS_1_15];

// Map rapide: number -> hadith
const hadithByNumber = new Map(
  ALL_HADITHS.map((h) => [h.number, h])
);

// Id des narrateurs déjà débloqués au départ (dans le MOCK)
const INITIAL_UNLOCKED_IDS = new Set(
  NARRATORS_MOCK.filter((n) => n.isUnlocked).map((n) => n.id)
);

export function useNarratorUnlocks(masteredHadithNumbers) {
  const [unlockedNarratorIds, setUnlockedNarratorIds] = useState(
    INITIAL_UNLOCKED_IDS
  );
  const [justUnlockedNarrator, setJustUnlockedNarrator] = useState(null);

  useEffect(() => {
    if (!masteredHadithNumbers || masteredHadithNumbers.length === 0) return;

    // 1. Récupérer tous les narrateurs liés aux hadiths déjà maîtrisés
    const narratorIdsFromMastered = new Set();

    masteredHadithNumbers.forEach((num) => {
      const hadith = hadithByNumber.get(num);
      if (!hadith || !hadith.narratorId) return;
      narratorIdsFromMastered.add(hadith.narratorId);
    });

    // 2. Voir s'il y a un narrateur "nouveau" par rapport à ce qu'on avait déjà
    let newNarrator = null;

    narratorIdsFromMastered.forEach((id) => {
      if (!unlockedNarratorIds.has(id) && !newNarrator) {
        newNarrator =
          NARRATORS_MOCK.find((n) => n.id === id) || null;
      }
    });

    // 3. Mettre à jour la liste des narrateurs débloqués
    setUnlockedNarratorIds((prev) => {
      const merged = new Set(prev);
      narratorIdsFromMastered.forEach((id) => merged.add(id));
      return merged;
    });

    // 4. Si un nouveau narrateur est débloqué → popup
    if (newNarrator) {
      setJustUnlockedNarrator(newNarrator);
    }
  }, [masteredHadithNumbers, unlockedNarratorIds]);

  const unlockedNarrators = useMemo(
    () =>
      NARRATORS_MOCK.filter((n) => unlockedNarratorIds.has(n.id)),
    [unlockedNarratorIds]
  );

  return {
    unlockedNarrators,
    justUnlockedNarrator,
    clearJustUnlocked: () => setJustUnlockedNarrator(null),
  };
}
