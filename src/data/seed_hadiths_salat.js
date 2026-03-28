// /src/data/seed_hadiths_salat.js

const SALAT_META = {
  chapterId: "salat",
  chapterSlug: "salat",
  chapterTitle: "Kitāb aṣ-Ṣalāh",
  chapterTitleAr: "كتاب الصلاة",
  chapterOrder: 2,
};

function salatHadith(data) {
  return {
    id: data.number, // identifiant global, pratique tant que tes ids suivent la numérotation
    number: data.number, // numéro global affiché
    hadithOrder: data.number, // ordre dans le chapitre ṣalāh
    ...SALAT_META,
    narratorId: data.narratorId ?? null,
    siraBlockId: data.siraBlockId ?? null,
    chapter: "salat", // gardé pour compatibilité avec ton ancien code
    arabic_text: data.arabic_text,
    french_text: data.french_text,
    source: data.source ?? null,
    tags: data.tags ?? [],
    opinions: data.opinions ?? {},
    audio_url: data.audio_url ?? null,
    title: data.title ?? `Hadith ${data.number}`,
    notes_from_file: data.notes_from_file ?? {},
  };
}

export const HADITHS_SALAT = [
  /*********************** HADITH 47 ************************/
  salatHadith({
    number: 47,
    narratorId: null,
    siraBlockId: "prayer-structure",
    title: "La prière accomplie à son temps est l’œuvre la plus aimée d’Allah",
    arabic_text:
      "عَنْ أَبِي عَمْرٍو الشَّيْبَانِيِّ - وَاسْمُهُ سَعْدُ بْنُ إِيَاسٍ - قَالَ: حَدَّثَنِي صَاحِبُ هَذِهِ الدَّارِ - وَأَشَارَ بِيَدِهِ إِلَى دَارِ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رَضِيَ اللَّهُ عَنْهُ - قَالَ: سَأَلْتُ النَّبِيَّ ﷺ: «أَيُّ الأَعْمَالِ أَحَبُّ إِلَى اللَّهِ؟» قَالَ: «الصَّلَاةُ عَلَى وَقْتِهَا». قُلْتُ: ثُمَّ أَيٌّ؟ قَالَ: «بِرُّ الْوَالِدَيْنِ». قُلْتُ: ثُمَّ أَيٌّ؟ قَالَ: «الْجِهَادُ فِي سَبِيلِ اللَّهِ». قَالَ: حَدَّثَنِي بِهِنَّ رَسُولُ اللَّهِ ﷺ، وَلَوِ اسْتَزَدْتُهُ لَزَادَنِي.",
    french_text:
      "Abū ʿAmr al-Shaybānī — dont le nom est Saʿd ibn Iyās — rapporte : « Le maître de cette maison — en désignant de sa main la maison de ʿAbd Allāh ibn Masʿūd (ra) — m’a raconté : J’ai demandé au Prophète ﷺ : “Quelles sont les œuvres les plus aimées d’Allah ?” Il répondit : “La prière accomplie à son temps.” Je demandai : “Puis quoi encore ?” Il répondit : “La bonté envers les deux parents.” Je demandai : “Puis quoi encore ?” Il répondit : “Le combat dans le sentier d’Allah.” Il me rapporta cela du Messager d’Allah ﷺ, et si je lui en avais demandé davantage, il m’en aurait ajouté. »",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 47)",
    tags: ["salat", "waqt", "birr-al-walidayn", "jihad", "aamal"],

    opinions: {
      Hanafi: {
        ar: null,
        fr: "Aucun avis hanafite explicite n’est indiqué dans le fichier fourni pour ce hadith."
      },

      Maliki: {
        ar: null,
        fr: "Aucun avis malikite explicite n’est indiqué dans le fichier fourni pour ce hadith."
      },

      Shafi: {
        ar: null,
        fr: "Aucun avis shaféite explicite n’est indiqué dans le fichier fourni pour ce hadith."
      },

      Hanbali: {
        ar: null,
        fr: "Aucun avis hanbalite explicite n’est indiqué dans le fichier fourni pour ce hadith."
      }
    },

    notes_from_file: {
      prayer_time:
        "Le fichier explique que l’expression « الصلاة على وقتها » vise l’accomplissement de la prière dans son temps, en particulier au début du temps, et non après sa sortie.",
      birr_parents:
        "Le fichier souligne la grandeur du birr al-wālidayn et son rang très élevé dans la religion.",
      jihad:
        "Le fichier explique que le jihād fī sabīlillāh possède une immense valeur car il est un moyen de défendre la religion, de manifester l’islam et d’en porter les charges."
    },

    audio_url: null
  }),

  salatHadith({
  number: 48,
  narratorId: 2, // à ajuster si tu connais l'id exact de Aïcha dans ton fichier narrators
  siraBlockId: "madinah-life",
  title: "La prière du fajr dans l’obscurité de l’aube",
  arabic_text:
    "عَنْ عَائِشَةَ رَضِيَ اللَّهُ عَنْهَا قَالَتْ: «لَقَدْ كَانَ رَسُولُ اللَّهِ ﷺ يُصَلِّي الْفَجْرَ، فَيَشْهَدُ مَعَهُ نِسَاءٌ مِنَ الْمُؤْمِنَاتِ مُتَلَفِّعَاتٍ بِمُرُوطِهِنَّ، ثُمَّ يَرْجِعْنَ إِلَى بُيُوتِهِنَّ، مَا يَعْرِفُهُنَّ أَحَدٌ، مِنَ الْغَلَسِ».",
  french_text:
    "ʿÂʾisha (ra) a dit : « Le Messager d’Allah ﷺ accomplissait la prière du fajr, et des femmes croyantes assistaient à la prière avec lui, enveloppées dans leurs manteaux. Puis elles retournaient vers leurs maisons sans être reconnues par personne, à cause de l’obscurité de l’aube. »",
  source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkâm (Hadith 48)",
  tags: ["fajr", "salat", "waqt", "ghalas", "femmes"],

  opinions: {
    Hanafi: {
      ar:
        "ذَهَبَ أَبُو حَنِيفَةَ إِلَى أَنَّ الْإِسْفَارَ بِصَلَاةِ الْفَجْرِ أَفْضَلُ.",
      fr:
        "Le document indique qu’Abû Ḥanîfa considère que l’isfâr, c’est-à-dire retarder davantage jusqu’à la clarté, est préférable pour la prière du fajr."
    },

    Maliki: {
      ar: null,
      fr:
        "Aucun avis malikite explicite et indépendant n’est clairement formulé dans l’extrait fourni pour ce hadith."
    },

    Shafi: {
      ar: null,
      fr:
        "Aucun avis shaféite explicite n’est mentionné dans l’extrait fourni pour ce hadith."
    },

    Hanbali: {
      ar: null,
      fr:
        "Aucun avis hanbalite explicite n’est mentionné dans l’extrait fourni pour ce hadith."
    },

    Majority: {
      ar:
        "وَالْحَدِيثُ يَدُلُّ عَلَى أَفْضَلِيَّةِ التَّغْلِيسِ بِصَلَاةِ الْفَجْرِ، وَهُوَ قَوْلُ الْجُمْهُورِ.",
      fr:
        "Le document précise que ce hadith indique la supériorité du taghlîs dans la prière du fajr, c’est-à-dire l’accomplir au début de son temps alors qu’il fait encore sombre, et que c’est l’avis de la majorité."
    }
  },

  audio_url: null
}),
];