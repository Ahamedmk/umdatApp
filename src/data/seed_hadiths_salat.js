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
    opinions: data.opinions === undefined ? {} : data.opinions,
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

  salatHadith({
    number: 49,
    title: "Les horaires des prières et leur moment d’accomplissement",
    arabic_text:
      "عَنْ جَابِرِ بْنِ عَبْدِ اللَّهِ رَضِيَ اللَّهُ عَنْهُ قَالَ: «كَانَ النَّبِيُّ ﷺ يُصَلِّي الظُّهْرَ بِالْهَاجِرَةِ، وَالْعَصْرَ وَالشَّمْسُ نَقِيَّةٌ، وَالْمَغْرِبَ إِذَا وَجَبَتْ، وَالْعِشَاءَ أَحْيَانًا وَأَحْيَانًا، إِذَا رَآهُمُ اجْتَمَعُوا عَجَّلَ، وَإِذَا رَآهُمْ أَبْطَؤُوا أَخَّرَ، وَالصُّبْحَ كَانَ يُصَلِّيهَا بِغَلَسٍ».",
    french_text:
      "Jâbir ibn ‘Abd Allâh (ra) rapporte : « Le Prophète ﷺ accomplissait le ẓuhr pendant la chaleur, le ‘aṣr alors que le soleil était encore clair, le maghrib dès le coucher du soleil, et le ‘ishâ’ tantôt tôt tantôt tard : s’il voyait les gens réunis il avançait la prière, sinon il la retardait. Quant au fajr, il le priait dans l’obscurité de l’aube. »",
    source: "Al-Bukhârî & Muslim (cf. PDF)",
    tags: ["salat", "horaires", "fajr", "isha", "asr", "maghrib"],
    opinions: {
      Hanafi: {
        ar: "قال أبو حنيفة: تأخير الفجر إلى الإسفار أفضل، وتأخير العصر ما لم تتغير الشمس.",
        fr: "Les hanafites préfèrent retarder le fajr jusqu’à l’apparition de la lumière et retarder le ‘aṣr tant que le soleil reste clair."
      },
      Maliki: {
        ar: "قال مالك: تعجيل أكثر الصلوات في أول وقتها، ويستحب تأخير العشاء أحيانًا.",
        fr: "Les malikites privilégient le début du temps pour les prières, avec recommandation de retarder parfois le ‘ishâ’."
      },
      Shafi: {
        ar: "قال الشافعي: أول الوقت أفضل في عامة الصلوات، مع جواز التأخير للمصلحة.",
        fr: "Les shafi‘ites considèrent que le début du temps est préférable, tout en autorisant le retard pour un intérêt."
      },
      Hanbali: {
        ar: "قال أحمد: تعجيل الصلوات أفضل إلا العشاء، فيستحب تأخيرها إذا لم يشق.",
        fr: "Les hanbalites préfèrent avancer les prières sauf le ‘ishâ’ qu’il est recommandé de retarder si cela n’est pas difficile."
      }
    },
    audio_url: null,
  }),
    salatHadith({
    number: 50,
    title: "Les temps des prières obligatoires et la récitation du fajr",
    arabic_text:
      "عَنْ أَبِي الْمِنْهَالِ سَيَّارِ بْنِ سَلَامَةَ رَحِمَهُ اللَّهُ قَالَ: دَخَلْتُ أَنَا وَأَبِي عَلَى أَبِي بَرْزَةَ الْأَسْلَمِيِّ، فَقَالَ لَهُ أَبِي: حَدِّثْنَا كَيْفَ كَانَ النَّبِيُّ ﷺ يُصَلِّي الْمَكْتُوبَةَ؟ فَقَالَ: كَانَ يُصَلِّي الْهَجِيرَ - وَهِيَ الَّتِي تَدْعُونَهَا الْأُولَى - حِينَ تَدْحَضُ الشَّمْسُ، وَيُصَلِّي الْعَصْرَ، ثُمَّ يَرْجِعُ أَحَدُنَا إِلَى رَحْلِهِ فِي أَقْصَى الْمَدِينَةِ، وَالشَّمْسُ حَيَّةٌ، وَنَسِيتُ مَا قَالَ فِي الْمَغْرِبِ. وَكَانَ يَسْتَحِبُّ أَنْ يُؤَخِّرَ مِنَ الْعِشَاءِ الَّتِي تَدْعُونَهَا الْعَتَمَةَ، وَكَانَ يَكْرَهُ النَّوْمَ قَبْلَهَا وَالْحَدِيثَ بَعْدَهَا، وَكَانَ يَنْفَتِلُ مِنْ صَلَاةِ الْغَدَاةِ حِينَ يَعْرِفُ الرَّجُلُ جَلِيسَهُ، وَكَانَ يَقْرَأُ فِيهَا بِالسِّتِّينَ إِلَى الْمِائَةِ.",
    french_text:
      "Abū al-Minhāl Siyyār ibn Salāmah rapporte : « Mon père et moi entrâmes auprès d’Abū Barzah al-Aslamī. Mon père lui dit : “Parle-nous de la manière dont le Prophète ﷺ accomplissait les prières obligatoires.” Il répondit : “Il priait al-hajīr — celle que vous appelez la première — lorsque le soleil déclinait. Il priait le ‘aṣr, puis l’un d’entre nous retournait jusqu’à sa demeure à l’extrémité de Médine alors que le soleil était encore vivant (haut et lumineux). J’ai oublié ce qu’il a dit au sujet du maghrib. Il aimait retarder le ‘ishā’, celle que vous appelez al-‘atamah. Il détestait dormir avant elle et parler après elle. Et il terminait la prière du matin au moment où l’homme pouvait reconnaître son voisin assis à côté de lui, et il y récitait de soixante à cent versets.”",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 50)",
    tags: ["salat", "horaires", "fajr", "isha", "asr", "qira'a"],
    opinions: {
      Hanafi: {
        ar: null,
        fr: "Aucun avis hanafite explicite n’est mentionné dans le document fourni pour ce hadith."
      },
      Maliki: {
        ar: null,
        fr: "Aucun avis malikite explicite n’est mentionné dans le document fourni pour ce hadith."
      },
      Shafi: {
        ar: null,
        fr: "Aucun avis shaféite explicite n’est mentionné dans le document fourni pour ce hadith."
      },
      Hanbali: {
        ar: null,
        fr: "Aucun avis hanbalite explicite n’est mentionné dans le document fourni pour ce hadith."
      }
    },
    audio_url: null,
  }),
    salatHadith({
    number: 51,
    title: "La prière médiane (ṣalāt al-wusṭā) et le retard du ʿaṣr",
    arabic_text:
      "عَنْ عَلِيٍّ رَضِيَ اللَّهُ عَنْهُ أَنَّ النَّبِيَّ ﷺ قَالَ يَوْمَ الْخَنْدَقِ: «مَلَأَ اللَّهُ قُبُورَهُمْ وَبُيُوتَهُمْ نَارًا، شَغَلُونَا عَنِ الصَّلَاةِ الْوُسْطَى حَتَّى غَابَتِ الشَّمْسُ».",
    french_text:
      "ʿAlī (ra) rapporte que le Prophète ﷺ dit le jour de la bataille du Fossé : « Qu’Allah remplisse leurs tombes et leurs maisons de feu ! Ils nous ont détournés de la prière médiane jusqu’à ce que le soleil se couche. »",
    source: "Muslim — ʿUmdat al-Aḥkām (Hadith 51)",
    tags: ["salat", "asr", "salat-wusta", "khandaq"],

    opinions: {
      Hanafi: {
        ar: "قال أبو حنيفة: الصلاة الوسطى هي صلاة العصر.",
        fr: "Les hanafites considèrent que la prière médiane est la prière du ‘aṣr."
      },
      Maliki: {
        ar: "قال مالك: الصلاة الوسطى هي صلاة العصر.",
        fr: "Les malikites considèrent également que la prière médiane est le ‘aṣr."
      },
      Shafi: {
        ar: "قال الشافعي: أرجح الأقوال أن الصلاة الوسطى هي العصر.",
        fr: "Les shafi‘ites privilégient l’avis selon lequel la prière médiane est le ‘aṣr."
      },
      Hanbali: {
        ar: "قال أحمد: الصلاة الوسطى هي صلاة العصر بلا خلاف معتبر.",
        fr: "Les hanbalites affirment clairement que la prière médiane est le ‘aṣr."
      }
    },

    audio_url: null,
  }),
    salatHadith({
    number: 52,
    title: "Gravité de retarder la prière du ʿaṣr",
    arabic_text:
      "وَعَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ قَالَ: حَبَسَ الْمُشْرِكُونَ رَسُولَ اللَّهِ ﷺ عَنِ الصَّلَاةِ الْعَصْرِ حَتَّى احْمَرَّتِ الشَّمْسُ أَوِ اصْفَرَّتْ، فَقَالَ رَسُولُ اللَّهِ ﷺ: «شَغَلُونَا عَنِ الصَّلَاةِ الْوُسْطَى صَلَاةِ الْعَصْرِ، مَلَأَ اللَّهُ أَجْوَافَهُمْ وَقُبُورَهُمْ نَارًا».",
    french_text:
      "ʿAbd Allāh ibn Masʿūd (ra) rapporte : « Les polythéistes ont retenu le Prophète ﷺ de la prière du ‘aṣr jusqu’à ce que le soleil devienne rouge ou jaune. Alors le Prophète ﷺ dit : “Ils nous ont occupés de la prière médiane, la prière du ‘aṣr. Qu’Allah remplisse leurs ventres et leurs tombes de feu.” »",
    source: "Muslim — ʿUmdat al-Aḥkām (Hadith 52)",
    tags: ["salat", "asr", "salat-wusta", "retard"],

    opinions: {
      Hanafi: {
        ar: "قال أبو حنيفة: يحرم تأخير العصر إلى اصفرار الشمس بلا عذر.",
        fr: "Les hanafites interdisent de retarder le ‘aṣr jusqu’au jaunissement du soleil sans excuse."
      },
      Maliki: {
        ar: "قال مالك: يجب أداء العصر في وقته ويحرم تأخيره بلا عذر.",
        fr: "Les malikites considèrent obligatoire d’accomplir le ‘aṣr dans son temps et interdisent de le retarder sans excuse."
      },
      Shafi: {
        ar: "قال الشافعي: تأخير العصر إلى ما قبل الغروب مكروه شديد.",
        fr: "Les shafi‘ites considèrent que retarder le ‘aṣr jusqu’avant le coucher est fortement déconseillé."
      },
      Hanbali: {
        ar: "قال أحمد: تأخير العصر إلى اصفرار الشمس مكروه تحريما.",
        fr: "Les hanbalites jugent ce retard comme répréhensible au niveau proche de l’interdit."
      }
    },

    audio_url: null,
  }),
  salatHadith({
    number: 53,
    title: "Le mérite de retarder la prière du ʿishāʾ sans difficulté",
    arabic_text:
      "عَنْ عَبْدِ اللَّهِ بْنِ عَبَّاسٍ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: «أَعْتَمَ النَّبِيُّ ﷺ بِالْعِشَاءِ، فَخَرَجَ عُمَرُ، فَقَالَ: الصَّلَاةَ يَا رَسُولَ اللَّهِ، رَقَدَ النِّسَاءُ وَالصِّبْيَانُ. فَخَرَجَ النَّبِيُّ ﷺ - وَرَأْسُهُ يَقْطُرُ مَاءً - يَقُولُ: لَوْلَا أَنْ أَشُقَّ عَلَى أُمَّتِي - أَوْ عَلَى النَّاسِ - لَأَمَرْتُهُمْ بِالصَّلَاةِ هَذِهِ السَّاعَةَ».",
    french_text:
      "ʿAbd Allāh ibn ʿAbbās (ra) rapporte : « Le Prophète ﷺ retarda la prière du ʿishāʾ jusqu’à une heure avancée de la nuit. ʿUmar sortit alors et dit : “La prière, ô Messager d’Allah ! Les femmes et les enfants se sont endormis.” Le Prophète ﷺ sortit alors, la tête ruisselante d’eau, en disant : “Si je ne craignais pas d’imposer une difficulté à ma communauté - ou aux gens -, je leur ordonnerais d’accomplir cette prière à cette heure-ci.” »",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 53)",
    tags: ["salat", "isha", "atamah", "retard", "mashaqqa"],
    opinions: null,

    notes_from_file: {
      meaning:
        "L’image explique que l’expression « أَعْتَمَ النَّبِيُّ ﷺ بِالْعِشَاءِ » signifie que le Prophète ﷺ retarda la prière du ʿishāʾ jusqu’à ce que l’obscurité de la nuit soit bien installée.",
      ruling_inference:
        "Ibn Daqīq al-ʿĪd indique que le hadith prouve la préférence de retarder le ʿishāʾ. La preuve est la parole du Prophète ﷺ : « Si je ne craignais pas d’imposer une difficulté à ma communauté... », qui montre que le retard aurait été demandé sans la gêne causée aux fidèles.",
      wording:
        "L’image précise que le nom « al-ʿatamah » concerne le ʿishāʾ après la disparition du crépuscule. Il ne convient donc pas d’utiliser « أَعْتَمَ » pour le tout début de son temps, et il est préférable de ne pas remplacer habituellement le nom ʿishāʾ par al-ʿatamah."
    },

    audio_url: null,
  }),
  salatHadith({
    number: 54,
    narratorId: 2,
    title: "Commencer par le repas lorsque la prière est établie",
    arabic_text:
      "عَنْ عَائِشَةَ رَضِيَ اللَّهُ عَنْهَا أَنَّ النَّبِيَّ ﷺ قَالَ: «إِذَا أُقِيمَتِ الصَّلَاةُ، وَحَضَرَ الْعَشَاءُ، فَابْدَءُوا بِالْعَشَاءِ». وَعَنِ ابْنِ عُمَرَ نَحْوُهُ.",
    french_text:
      "ʿĀʾisha (ra) rapporte que le Prophète ﷺ a dit : « Lorsque la prière est établie et que le repas est servi, commencez par le repas. » Un récit semblable est rapporté d’Ibn ʿUmar.",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 54)",
    tags: ["salat", "khushu", "repas", "iqama"],
    opinions: null,
    notes_from_file: {
      khushu:
        "Le PDF explique, d’après Ibn Baṭṭāl, que l’ordre de commencer par le repas vise la recommandation lorsque l’esprit risque d’être occupé par la nourriture, ce qui diminue le recueillement et peut entraîner distraction ou omission.",
      rule:
        "Le but est que le priant soit libéré des préoccupations du monde afin de se consacrer pleinement à l’entretien avec son Seigneur."
    },
    audio_url: null,
  }),
  salatHadith({
    number: 55,
    narratorId: 2,
    title: "Ne pas prier en présence du repas ni en retenant les deux besoins",
    arabic_text:
      "وَلِمُسْلِمٍ عَنْ عَائِشَةَ رَضِيَ اللَّهُ عَنْهَا قَالَتْ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «لَا صَلَاةَ بِحَضْرَةِ طَعَامٍ، وَلَا وَهُوَ يُدَافِعُهُ الْأَخْبَثَانِ».",
    french_text:
      "Dans une version de Muslim, ʿĀʾisha (ra) dit : J’ai entendu le Messager d’Allah ﷺ dire : « Il n’y a pas de prière en présence d’un repas, ni lorsque l’on repousse les deux besoins naturels. »",
    source: "Muslim — ʿUmdat al-Aḥkām (Hadith 55)",
    tags: ["salat", "khushu", "repas", "besoins-naturels"],
    opinions: null,
    notes_from_file: {
      validity:
        "Le PDF rapporte d’Ibn ʿAbd al-Barr qu’il y a consensus : si quelqu’un prie en présence du repas ou en se retenant, mais accomplit complètement les obligations de la prière, sa prière est valable.",
      disliked:
        "Le texte indique cependant que commencer la prière dans cet état est réprouvé, car le cœur risque d’être distrait et de ne pas établir la prière comme il se doit."
    },
    audio_url: null,
  }),
  salatHadith({
    number: 56,
    title: "L’interdiction de prier après le ṣubḥ et après le ʿaṣr",
    arabic_text:
      "عَنْ عَبْدِ اللَّهِ بْنِ عَبَّاسٍ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: «شَهِدَ عِنْدِي رِجَالٌ مَرْضِيُّونَ، وَأَرْضَاهُمْ عِنْدِي عُمَرُ، أَنَّ النَّبِيَّ ﷺ نَهَى عَنِ الصَّلَاةِ بَعْدَ الصُّبْحِ حَتَّى تَطْلُعَ الشَّمْسُ، وَبَعْدَ الْعَصْرِ حَتَّى تَغْرُبَ».",
    french_text:
      "ʿAbd Allāh ibn ʿAbbās (ra) rapporte : « Des hommes dignes d’agrément ont témoigné auprès de moi, et le plus digne d’agrément parmi eux à mes yeux était ʿUmar : le Prophète ﷺ a interdit la prière après le ṣubḥ jusqu’au lever du soleil, et après le ʿaṣr jusqu’au coucher du soleil. »",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 56)",
    tags: ["salat", "temps-interdits", "subh", "asr", "nawafil"],
    opinions: {
      Hanafi: {
        ar: "النهي عند الحنفية للكراهية التحريمية في هذه الأوقات.",
        fr: "Le PDF indique que, chez les hanafites, l’interdiction des prières surérogatoires dans ces temps relève de la réprobation prohibitive."
      },
      Maliki: {
        ar: "النهي للكراهية بعد الصبح والعصر، وللحرمة عند طلوع الشمس وغروبها وعند الاستواء عند مالك.",
        fr: "Le PDF rapporte que, chez Mālik, l’interdiction est une réprobation après ṣubḥ et ʿaṣr, et une interdiction lors du lever, du zénith et du coucher du soleil."
      },
      Shafi: {
        ar: "النهي عند الشافعية للكراهية التحريمية، وعنهم أن الكراهية تنزيهية في الوقتين الآخرين.",
        fr: "Le PDF mentionne chez les shafiʿites une réprobation prohibitive, avec un avis rapporté selon lequel elle est seulement déconseillée dans les deux temps liés à ṣubḥ et ʿaṣr."
      },
      Hanbali: {
        ar: "النهي للحرمة في جميعها عند أحمد.",
        fr: "Le PDF indique que, chez Aḥmad, l’interdiction porte sur tous ces temps."
      }
    },
    notes_from_file: {
      explanation:
        "Ibn Daqīq al-ʿĪd explique que le temps de réprobation commence après l’accomplissement effectif de ṣubḥ ou de ʿaṣr, et non simplement à l’entrée de leur temps.",
      categories:
        "Le PDF distingue les temps liés à l’acte, après ṣubḥ et après ʿaṣr, et les temps liés directement au moment solaire : lever, zénith et coucher."
    },
    audio_url: null,
  }),
  salatHadith({
    number: 57,
    title: "Pas de prière après le ṣubḥ jusqu’à l’élévation du soleil",
    arabic_text:
      "عَنْ أَبِي سَعِيدٍ الْخُدْرِيِّ رَضِيَ اللَّهُ عَنْهُ عَنْ رَسُولِ اللَّهِ ﷺ قَالَ: «لَا صَلَاةَ بَعْدَ الصُّبْحِ حَتَّى تَرْتَفِعَ الشَّمْسُ، وَلَا صَلَاةَ بَعْدَ الْعَصْرِ حَتَّى تَغِيبَ الشَّمْسُ».",
    french_text:
      "Abū Saʿīd al-Khudrī (ra) rapporte que le Messager d’Allah ﷺ a dit : « Il n’y a pas de prière après le ṣubḥ jusqu’à ce que le soleil s’élève, ni de prière après le ʿaṣr jusqu’à ce que le soleil disparaisse. »",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 57)",
    tags: ["salat", "temps-interdits", "subh", "asr", "nawafil"],
    opinions: {
      Hanafi: {
        ar: "لم يفرق أبو حنيفة بين ذوات الأسباب وغيرها لعموم النهي.",
        fr: "Le PDF indique qu’Abū Ḥanīfa ne distingue pas entre les prières ayant une cause et les autres dans ces temps, en raison de la portée générale de l’interdiction."
      },
      Maliki: {
        ar: "المشهور عن مالك عدم الفرق بين ذوات الأسباب وغيرها، وروي عنه الجواز في رواية أشهب.",
        fr: "Le PDF rapporte que l’avis connu chez Mālik ne distingue pas les prières ayant une cause, même si une version d’Ashhab rapporte une permission."
      },
      Shafi: {
        ar: "لا تكره النافلة ذات السبب بعد الصبح والعصر عند الشافعي.",
        fr: "Le PDF indique que, chez al-Shāfiʿī, les prières surérogatoires ayant une cause ne sont pas réprouvées après ṣubḥ et ʿaṣr."
      },
      Hanbali: {
        ar: "المشهور عن أحمد عدم الفرق بين ذوات الأسباب وغيرها، وروي عنه الجواز في رواية.",
        fr: "Le PDF rapporte que l’avis connu d’Aḥmad ne distingue pas les prières ayant une cause, avec une autre version permettant celles-ci."
      }
    },
    notes_from_file: {
      lighter_prohibition:
        "Le PDF conclut que l’interdiction après fajr et après ʿaṣr est plus légère que celle des trois moments solaires : lever, zénith et coucher.",
      examples:
        "Parmi les prières ayant une cause citées : salutation de la mosquée, deux unités du ṭawāf et prière de l’éclipse."
    },
    audio_url: null,
  }),
  salatHadith({
    number: 58,
    title: "Rattraper le ʿaṣr manqué avant le maghrib le jour du Fossé",
    arabic_text:
      "عَنْ جَابِرِ بْنِ عَبْدِ اللَّهِ رَضِيَ اللَّهُ عَنْهُمَا: «أَنَّ عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ جَاءَ يَوْمَ الْخَنْدَقِ بَعْدَ مَا غَرَبَتِ الشَّمْسُ، فَجَعَلَ يَسُبُّ كُفَّارَ قُرَيْشٍ، وَقَالَ: يَا رَسُولَ اللَّهِ، مَا كِدْتُ أُصَلِّي الْعَصْرَ حَتَّى كَادَتِ الشَّمْسُ تَغْرُبُ. فَقَالَ النَّبِيُّ ﷺ: وَاللَّهِ مَا صَلَّيْتُهَا. قَالَ: فَقُمْنَا إِلَى بُطْحَانَ، فَتَوَضَّأَ لِلصَّلَاةِ، وَتَوَضَّأْنَا لَهَا، فَصَلَّى الْعَصْرَ بَعْدَ مَا غَرَبَتِ الشَّمْسُ، ثُمَّ صَلَّى بَعْدَهَا الْمَغْرِبَ».",
    french_text:
      "Jābir ibn ʿAbd Allāh (ra) rapporte que ʿUmar ibn al-Khaṭṭāb (ra) arriva le jour du Fossé après le coucher du soleil, insultant les mécréants de Quraysh. Il dit : « Ô Messager d’Allah, j’ai à peine pu prier le ʿaṣr avant que le soleil ne soit presque couché. » Le Prophète ﷺ dit : « Par Allah, je ne l’ai pas priée. » Nous nous rendîmes alors à Buṭḥān ; il fit ses ablutions pour la prière et nous les fîmes aussi. Il pria le ʿaṣr après le coucher du soleil, puis pria ensuite le maghrib.",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 58)",
    tags: ["salat", "qada", "asr", "maghrib", "khandaq"],
    opinions: null,
    notes_from_file: {
      qada:
        "Le PDF place ce hadith dans le chapitre des temps où l’on interdit ou déconseille les prières surérogatoires, et il montre que la prière obligatoire manquée se rattrape même après le coucher.",
      order:
        "Le Prophète ﷺ pria d’abord le ʿaṣr manqué puis le maghrib, ce qui indique le respect de l’ordre entre prières lorsque cela est possible."
    },
    audio_url: null,
  }),
  salatHadith({
    number: 59,
    title: "La prière en groupe surpasse la prière individuelle de vingt-sept degrés",
    arabic_text:
      "عَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «صَلَاةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلَاةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً».",
    french_text:
      "ʿAbd Allāh ibn ʿUmar (ra) rapporte que le Messager d’Allah ﷺ a dit : « La prière en groupe est meilleure que la prière de l’individu seul de vingt-sept degrés. »",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 59)",
    tags: ["salat", "jamaah", "merite", "mosquee"],
    opinions: null,
    notes_from_file: {
      wording:
        "Le PDF explique que « صلاة الفذ » signifie la prière de la personne seule.",
      merit:
        "Ibn ʿAbd al-Barr rapporte que les hadiths sur le mérite de la prière en groupe sont nombreux et authentiquement établis."
    },
    audio_url: null,
  }),
  salatHadith({
    number: 60,
    title: "Les pas vers la mosquée et l’attente de la prière",
    arabic_text:
      "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «صَلَاةُ الرَّجُلِ فِي الْجَمَاعَةِ تُضَعَّفُ عَلَى صَلَاتِهِ فِي بَيْتِهِ وَفِي سُوقِهِ خَمْسًا وَعِشْرِينَ ضِعْفًا، وَذَلِكَ أَنَّهُ إِذَا تَوَضَّأَ فَأَحْسَنَ الْوُضُوءَ، ثُمَّ خَرَجَ إِلَى الْمَسْجِدِ، لَا يُخْرِجُهُ إِلَّا الصَّلَاةُ، لَمْ يَخْطُ خُطْوَةً إِلَّا رُفِعَتْ لَهُ بِهَا دَرَجَةٌ، وَحُطَّ عَنْهُ بِهَا خَطِيئَةٌ، فَإِذَا صَلَّى لَمْ تَزَلِ الْمَلَائِكَةُ تُصَلِّي عَلَيْهِ، مَا دَامَ فِي مُصَلَّاهُ: اللَّهُمَّ صَلِّ عَلَيْهِ، اللَّهُمَّ ارْحَمْهُ، وَلَا يَزَالُ فِي صَلَاةٍ مَا انْتَظَرَ الصَّلَاةَ».",
    french_text:
      "Abū Hurayra (ra) rapporte que le Messager d’Allah ﷺ a dit : « La prière de l’homme en groupe est multipliée par vingt-cinq par rapport à sa prière chez lui ou dans son marché. Cela parce que, lorsqu’il fait soigneusement ses ablutions puis sort vers la mosquée, ne sortant que pour la prière, il ne fait pas un pas sans qu’un degré ne lui soit élevé et qu’une faute ne lui soit effacée. Lorsqu’il prie, les anges ne cessent d’invoquer pour lui tant qu’il reste à son lieu de prière : “Ô Allah, prie sur lui ; ô Allah, fais-lui miséricorde.” Et il demeure en prière tant qu’il attend la prière. »",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 60)",
    tags: ["salat", "jamaah", "mosquee", "wudu", "attente"],
    opinions: null,
    notes_from_file: {
      steps:
        "Le PDF précise les lectures possibles de « خطوة » et souligne que chaque pas vers la mosquée élève un degré et efface une faute.",
      place:
        "Ibn ʿAbd al-Barr explique que « son lieu de prière » vise habituellement la mosquée de la prière en groupe ; par analogie, la femme dans sa maison ou celui qui ne peut venir à la mosquée espèrent ce mérite selon leur situation."
    },
    audio_url: null,
  }),
  salatHadith({
    number: 61,
    title: "La lourdeur du ʿishāʾ et du fajr pour les hypocrites",
    arabic_text:
      "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «إِنَّ أَثْقَلَ الصَّلَاةِ عَلَى الْمُنَافِقِينَ صَلَاةُ الْعِشَاءِ وَصَلَاةُ الْفَجْرِ، وَلَوْ يَعْلَمُونَ مَا فِيهِمَا لَأَتَوْهُمَا وَلَوْ حَبْوًا، وَلَقَدْ هَمَمْتُ أَنْ آمُرَ بِالصَّلَاةِ، فَتُقَامَ، ثُمَّ آمُرَ رَجُلًا فَيُصَلِّيَ بِالنَّاسِ، ثُمَّ أَنْطَلِقَ مَعِي بِرِجَالٍ مَعَهُمْ حُزَمٌ مِنْ حَطَبٍ، إِلَى قَوْمٍ لَا يَشْهَدُونَ الصَّلَاةَ، فَأُحَرِّقَ عَلَيْهِمْ بُيُوتَهُمْ بِالنَّارِ».",
    french_text:
      "Abū Hurayra (ra) rapporte que le Messager d’Allah ﷺ a dit : « Les prières les plus lourdes pour les hypocrites sont le ʿishāʾ et le fajr. S’ils savaient ce qu’elles contiennent comme mérite, ils y viendraient même en rampant. J’ai certes songé à ordonner que la prière soit établie, puis à désigner un homme pour diriger les gens, puis à partir avec des hommes portant des fagots de bois vers des gens qui n’assistent pas à la prière, afin de brûler leurs maisons sur eux. »",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 61)",
    tags: ["salat", "jamaah", "fajr", "isha", "hypocrisie"],
    opinions: {
      Hanafi: {
        ar: "قال كثير من الحنفية إنها واجبة، وقيل سنة مؤكدة في قوة الواجب.",
        fr: "Le PDF rapporte que beaucoup de hanafites jugent la prière en groupe obligatoire, ou une sunna fortement appuyée au rang proche du wajib."
      },
      Maliki: {
        ar: "قال المالكية: هي سنة في البلد وفي كل مسجد وفي حق كل مصل، وهذه طريقة الأكثر.",
        fr: "Le PDF indique que, chez les malikites, la prière en groupe est une sunna pour la ville, pour chaque mosquée et pour chaque priant, selon la voie de la majorité d’entre eux."
      },
      Shafi: {
        ar: "ظاهر نص الشافعي أنها فرض كفاية، وعليه جمهور المتقدمين من أصحابه.",
        fr: "Le PDF rapporte que le texte apparent d’al-Shāfiʿī en fait une obligation collective, avis suivi par la majorité des premiers shafiʿites."
      },
      Hanbali: {
        ar: "قال الحنابلة: تلزم الرجال الأحرار القادرين للصلوات الخمس وجوب عين لا شرطا.",
        fr: "Le PDF indique que les hanbalites la rendent personnellement obligatoire pour les hommes libres et capables pour les cinq prières, sans en faire une condition de validité."
      }
    },
    notes_from_file: {
      explanation:
        "Le PDF rapporte que le ʿishāʾ et le fajr sont particulièrement lourds pour les hypocrites car le premier correspond au temps du repos et le second au plaisir du sommeil.",
      threat:
        "Ibn Ḥajar explique que l’apparence du hadith soutient fortement l’obligation de la prière en groupe, car une simple sunna ne ferait pas l’objet d’une telle menace."
    },
    audio_url: null,
  }),
  salatHadith({
    number: 62,
    title: "Ne pas empêcher les femmes de se rendre aux mosquées",
    arabic_text:
      "عَنْ عَبْدِ اللَّهِ بْنِ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا، عَنِ النَّبِيِّ ﷺ قَالَ: «إِذَا اسْتَأْذَنَتْ أَحَدَكُمُ امْرَأَتُهُ إِلَى الْمَسْجِدِ، فَلَا يَمْنَعْهَا». قَالَ: فَقَالَ بِلَالُ بْنُ عَبْدِ اللَّهِ: وَاللَّهِ لَنَمْنَعُهُنَّ، قَالَ: فَأَقْبَلَ عَلَيْهِ عَبْدُ اللَّهِ فَسَبَّهُ سَبًّا سَيِّئًا، مَا سَمِعْتُهُ سَبَّهُ مِثْلَهُ قَطُّ، وَقَالَ: أُخْبِرُكَ عَنْ رَسُولِ اللَّهِ ﷺ، وَتَقُولُ: وَاللَّهِ لَنَمْنَعُهُنَّ؟». وَفِي لَفْظٍ لِمُسْلِمٍ: «لَا تَمْنَعُوا إِمَاءَ اللَّهِ مَسَاجِدَ اللَّهِ».",
    french_text:
      "ʿAbd Allāh ibn ʿUmar (ra) rapporte que le Prophète ﷺ a dit : « Lorsque l’épouse de l’un de vous demande la permission d’aller à la mosquée, qu’il ne l’en empêche pas. » Bilāl ibn ʿAbd Allāh dit alors : « Par Allah, nous les en empêcherons. » ʿAbd Allāh se tourna vers lui et le réprimanda durement, comme je ne l’avais jamais entendu le faire, puis dit : « Je t’informe d’une parole du Messager d’Allah ﷺ, et tu dis : Par Allah, nous les en empêcherons ? » Dans une version de Muslim : « N’empêchez pas les servantes d’Allah de se rendre aux mosquées d’Allah. »",
    source: "Al-Bukhârî & Muslim — ʿUmdat al-Aḥkām (Hadith 62)",
    tags: ["salat", "mosquee", "femmes", "jamaah", "permission"],
    opinions: {
      Hanafi: {
        ar: "ذهب صاحبا أبي حنيفة إلى كراهة حضور الشابة أو الكبيرة المشتهاة، وأجازوا للعجوز غير المشتهاة بإذن الزوج، وكره متأخرو الحنفية خروجها مطلقا لفساد الزمان.",
        fr: "Le PDF rapporte que les deux compagnons d’Abū Ḥanīfa déconseillent la sortie de la jeune femme ou de celle qui peut susciter le désir, permettent celle de la femme âgée avec permission, tandis que les hanafites tardifs l’ont déconseillée de façon générale à cause de la corruption du temps."
      },
      Maliki: {
        ar: "قسم المالكية النساء إلى أقسام؛ فالعجوز تخرج للمسجد ومجالس العلم، والشابة غير الفارهة تخرج للفرض والجنازة، والفارهة فالاختيار لها ألا تخرج أصلا.",
        fr: "Le PDF indique que les malikites distinguent plusieurs cas : la femme âgée peut sortir pour la mosquée et les assemblées de science, la jeune femme non attirante pour l’obligatoire et les funérailles, et il est préférable que la jeune femme attirante ne sorte pas."
      },
      Shafi: {
        ar: "ذهب الشافعية إلى أن المرأة إذا أرادت حضور المسجد، فإن كانت شابة أو كبيرة تشتهى كره لها، وإن كانت عجوزا لا تشتهى فلها الخروج بإذن الزوج.",
        fr: "Le PDF rapporte que les shafiʿites déconseillent la présence à la mosquée de la jeune femme ou de celle qui peut susciter le désir, et permettent à la femme âgée non désirée de sortir avec l’autorisation du mari."
      },
      Hanbali: {
        ar: "ذهب الحنابلة إلى أنه يباح للنساء حضور الجماعة مع الرجال.",
        fr: "Le PDF indique que les hanbalites permettent aux femmes d’assister à la prière en groupe avec les hommes."
      }
    },
    notes_from_file: {
      conditions:
        "Le PDF précise, d’après les commentaires, que la sortie doit se faire sans parfum, sans parure ostensible, sans vêtement de renommée et sans mélange avec les hommes.",
      preference:
        "Le document cite aussi la version : « N’empêchez pas vos femmes des mosquées, mais leurs maisons sont meilleures pour elles. »"
    },
    audio_url: null,
  }),
];
