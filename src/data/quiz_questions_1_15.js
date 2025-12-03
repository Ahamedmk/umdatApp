// src/data/quiz_questions_1_15.js

// n  = numéro du hadith (dans ton seed Umdat)
// q  = question
// options = propositions
// correctIndex = index de la bonne réponse
// explain = explication affichée après validation
//
// Tu pourras ensuite continuer la série (16, 17, …) en gardant la même structure.

export const QUIZ_QUESTIONS_1_15 = [
  /* ----------------- HADITH 1 : Intentions & Hijra ----------------- */
  {
    n: 1,
    q: "Selon le hadith 1, quelle est la condition pour que les actes soient acceptés auprès d’Allah ?",
    options: [
      "Qu’ils soient nombreux",
      "Qu’ils soient difficiles",
      "Qu’ils soient accompagnés d’une intention sincère",
      "Qu’ils soient vus par les gens pieux",
    ],
    correctIndex: 2,
    explain:
      "Le hadith 1 enseigne : « Les actes ne valent que par les intentions ». La valeur de l’acte dépend donc d’une intention sincère tournée vers Allah.",
  },
  {
    n: 1,
    q: "Dans le hadith 1, quel exemple est donné pour illustrer l’importance de l’intention ?",
    options: [
      "Le jeûne de Ramadan",
      "La hijra (émigration) pour Allah et Son Messager ou pour un intérêt mondain",
      "La zakât sur les biens commerciaux",
      "Le pèlerinage obligatoire",
    ],
    correctIndex: 1,
    explain:
      "Le Prophète ﷺ donne l’exemple de celui qui émigre pour Allah ou pour un intérêt mondain (mariage, dunya). La hijra a la valeur de l’intention qui la motive.",
  },
  {
    n: 1,
    q: "Que signifie « فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ امْرَأَةٍ يَنْكِحُهَا » dans le hadith 1 ?",
    options: [
      "Que la hijra n’est pas obligatoire",
      "Que la hijra est valable même sans intention",
      "Que celui qui émigre pour un intérêt mondain n’obtient que cet intérêt",
      "Que l’intention n’a pas d’impact sur la récompense",
    ],
    correctIndex: 2,
    explain:
      "Le passage signifie que celui qui émigre pour un intérêt mondain n’aura, auprès d’Allah, que ce pour quoi il a émigré. La récompense suit donc l’intention.",
  },

  /* ----------------- HADITH 2 : « Pas de salât sans purification » ----------------- */
  {
    n: 2,
    q: "Selon le hadith 2, que manque-t-il pour que la prière soit acceptée ?",
    options: [
      "La récitation à voix haute",
      "La présence à la mosquée",
      "La purification (tahâra)",
      "Le port d’un vêtement blanc",
    ],
    correctIndex: 2,
    explain:
      "Le texte indique qu’Allah n’accepte pas la prière sans purification. La tahâra est une condition de validité de la salât.",
  },
  {
    n: 2,
    q: "Que comprend la « purification » mentionnée dans le hadith 2 ?",
    options: [
      "Uniquement le ghusl",
      "Uniquement le wuḍû’",
      "Le wuḍû’, le ghusl et l’ablution sèche (tayammum) selon les cas",
      "Uniquement l’intention de se purifier",
    ],
    correctIndex: 2,
    explain:
      "La tahâra regroupe wuḍû’, ghusl et tayammum selon la situation. Le hadith en pose le principe général comme condition de salât.",
  },
  {
    n: 2,
    q: "Quelle sagesse principale les savants tirent-ils de ce hadith sur la prière ?",
    options: [
      "La prière efface toujours les impuretés physiques",
      "Les impuretés physiques n’ont aucune importance",
      "La pureté extérieure prépare le cœur à la présence avec Allah",
      "La prière n’a besoin d’aucune condition",
    ],
    correctIndex: 2,
    explain:
      "Les savants indiquent que la purification extérieure prépare la présence intérieure : on se présente devant Allah en état de propreté, corps et cœur.",
  },

  /* ----------------- HADITH 3 : Doute sur l’état de pureté ----------------- */
  {
    n: 3,
    q: "Dans le hadith 3, que doit faire celui qui doute avoir rompu ses ablutions sans certitude ?",
    options: [
      "Arrêter immédiatement sa prière",
      "Se fier au doute et refaire ses ablutions",
      "Se baser sur la certitude de la pureté et ignorer le simple doute",
      "Refaire le wuḍû’ après la prière seulement",
    ],
    correctIndex: 2,
    explain:
      "La règle extraite du hadith : on ne délaisse pas la certitude pour un simple doute. Tant que l’on n’est pas certain d’avoir rompu ses ablutions, on reste en état de pureté.",
  },
  {
    n: 3,
    q: "Quel principe juridique ce hadith établit-il ?",
    options: [
      "Le principe de l’allègement (taysîr)",
      "Le principe : « La certitude ne disparaît pas par le doute »",
      "Le principe de la sévérité dans les ablutions",
      "Le principe d’annuler la salât au moindre soupçon",
    ],
    correctIndex: 1,
    explain:
      "Les juristes résument ce hadith par : « اليقين لا يزول بالشك » : la certitude ne disparaît pas par le doute.",
  },
  {
    n: 3,
    q: "Pourquoi les savants mentionnent-ils ce hadith pour les personnes très sujettes aux waswâs (obsessions) ?",
    options: [
      "Pour les inciter à refaire toujours leurs ablutions",
      "Pour leur permettre de prier sans ablutions",
      "Pour les rassurer : ils doivent s’en tenir à la certitude et ignorer les doutes répétés",
      "Pour leur interdire de faire plus d’une prière par jour",
    ],
    correctIndex: 2,
    explain:
      "Les waswâs sont combattus en s’attachant à la certitude : on n’annule ni wuḍû’ ni salât sur la base d’un doute répété non confirmé.",
  },

  /* ----------------- HADITH 4 : Acceptation de la prière après ḥadath ----------------- */
  {
    n: 4,
    q: "Que signifie l’expression « حتى يتوضأ » dans le hadith 4 ?",
    options: [
      "Jusqu’à ce qu’il donne une aumône",
      "Jusqu’à ce qu’il prenne un ghusl",
      "Jusqu’à ce qu’il refasse correctement ses ablutions",
      "Jusqu’à ce qu’il change de vêtements",
    ],
    correctIndex: 2,
    explain:
      "Le hadith indique qu’Allah n’accepte pas la prière de celui qui a rompu ses ablutions jusqu’à ce qu’il refasse le wuḍû’ de manière correcte.",
  },
  {
    n: 4,
    q: "Quelle est la conséquence juridique si une personne réalise qu’elle a prié sans wuḍû’ ?",
    options: [
      "Sa prière reste valide",
      "Elle doit simplement demander pardon sans répéter la prière",
      "Elle doit refaire la prière concernée après avoir refait ses ablutions",
      "Elle doit refaire toutes ses prières de la semaine",
    ],
    correctIndex: 2,
    explain:
      "Les savants déduisent qu’une prière accomplie sans wuḍû’ n’est pas valide, et doit être rattrapée après la purification.",
  },
  {
    n: 4,
    q: "Que nous rappelle ce hadith sur la place du wuḍû’ dans la vie du musulman ?",
    options: [
      "Qu’il est uniquement recommandé",
      "Qu’il est une simple tradition culturelle",
      "Qu’il est une condition indispensable pour la salât",
      "Qu’il n’a de valeur que le vendredi",
    ],
    correctIndex: 2,
    explain:
      "Le wuḍû’ n’est pas un détail secondaire : il est une condition de validité de la prière, pilier de la religion.",
  },

  /* ----------------- HADITH 5 : Usage de l’eau et gaspillage ----------------- */
  {
    n: 5,
    q: "Dans le hadith 5, que reproche le Prophète ﷺ à celui qui utilise trop d’eau pour le wuḍû’ ?",
    options: [
      "De retarder la prière",
      "De gaspiller une bénédiction d’Allah",
      "De ne pas dire la basmala",
      "De prier seul",
    ],
    correctIndex: 1,
    explain:
      "Les savants mentionnent que même au bord d’un fleuve, le gaspillage d’eau est blâmable. Le hadith souligne l’équilibre : laver correctement sans excès.",
  },
  {
    n: 5,
    q: "Quel principe général ce hadith illustre-t-il concernant les ressources ?",
    options: [
      "On peut gaspiller tant que c’est pour l’adoration",
      "L’islam n’a aucune règle sur la consommation",
      "Le gaspillage est blâmé même dans l’adoration",
      "Il faut utiliser le plus d’eau possible pour chaque ablution",
    ],
    correctIndex: 2,
    explain:
      "Ce hadith est souvent cité pour montrer que le gaspillage (isrâf) est blâmé, même dans les actes d’adoration comme le wuḍû’.",
  },
  {
    n: 5,
    q: "Que recherchent les savants en se limitant au minimum prophétique dans le wuḍû’ ?",
    options: [
      "Rendre l’adoration difficile",
      "Économiser l’eau tout en suivant la sunna",
      "Éviter de prier à la mosquée",
      "Supprimer la sunna",
    ],
    correctIndex: 1,
    explain:
      "Se limiter au wuḍû’ du Prophète ﷺ permet d’éviter le gaspillage tout en respectant parfaitement la sunna.",
  },

  /* ----------------- HADITH 6 : Le chien qui lappe dans le récipient ----------------- */
  {
    n: 6,
    q: "Selon le hadith 6, que doit-on faire si un chien lappe dans le récipient de l’un d’entre vous ?",
    options: [
      "Le rincer une seule fois",
      "Le jeter sans le laver",
      "Le laver sept fois, dont une avec de la terre ou un élément similaire",
      "Le laisser sécher au soleil uniquement",
    ],
    correctIndex: 2,
    explain:
      "Le hadith indique explicitement le lavage sept fois, l’une des lavages étant avec de la terre (ou ce qui en tient lieu).",
  },
  {
    n: 6,
    q: "Que déduisent la majorité des savants de ce hadith concernant la salive du chien ?",
    options: [
      "Qu’elle est pure",
      "Qu’elle est douteuse mais tolérée",
      "Qu’elle est impure et nécessite ce lavage spécifique",
      "Qu’elle n’a aucune règle particulière",
    ],
    correctIndex: 2,
    explain:
      "La plupart des juristes considèrent la salive du chien comme impure, d’où l’obligation de ce lavage particulier en cas de contact avec un récipient.",
  },
  {
    n: 6,
    q: "Pourquoi certains savants autorisent-ils aujourd’hui l’usage de savon ou de détergent à la place de la terre ?",
    options: [
      "Parce que le hadith n’est plus applicable",
      "Parce qu’ils considèrent le chien comme pur",
      "Parce qu’ils voient dans la terre un agent nettoyant, analogiquement remplacé par des produits détergents efficaces",
      "Parce qu’ils veulent faciliter sans preuve",
    ],
    correctIndex: 2,
    explain:
      "En se basant sur la sagesse de la terre comme agent purifiant, certains savants permettent des produits détergents qui jouent le même rôle de nettoyage renforcé.",
  },

  /* ----------------- HADITH 7 : Deux rakaʿât après un wuḍû’ parfait ----------------- */
  {
    n: 7,
    q: "Que promet le hadith 7 à celui qui fait un wuḍû’ parfait puis prie deux rakaʿât avec concentration ?",
    options: [
      "Une récompense limitée au wuḍû’",
      "Le pardon de ses péchés passés",
      "Une obligation de jeûner trois jours",
      "L’interdiction de refaire ce geste",
    ],
    correctIndex: 1,
    explain:
      "Le hadith mentionne que celui qui accomplit un wuḍû’ parfait puis prie deux rakaʿât sans distraction se voit pardonner ses péchés passés, par la grâce d’Allah.",
  },
  {
    n: 7,
    q: "Quel est l’objectif principal de ces deux rakaʿât après le wuḍû’ ?",
    options: [
      "Montrer sa force physique",
      "Réciter le plus de sourates possibles",
      "Remercier Allah pour la grâce de la purification",
      "Remplacer les prières obligatoires",
    ],
    correctIndex: 2,
    explain:
      "Ces deux rakaʿât sont une manière de shukr (remerciement) pour la purification et un moyen de se rapprocher d’Allah après s’être purifié.",
  },
  {
    n: 7,
    q: "Quelle attention intérieure est demandée dans ce hadith pour ces deux rakaʿât ?",
    options: [
      "Uniquement la rapidité",
      "La concentration et l’absence de distraction volontaire",
      "La longueur excessive de la récitation",
      "L’usage de voix très forte",
    ],
    correctIndex: 1,
    explain:
      "Le hadith insiste sur le fait de prier ces deux rakaʿât en étant pleinement présent, sans se laisser aller aux pensées parasites.",
  },

  /* ----------------- HADITHS 8–15 : repris de ton fichier existant ----------------- */

  {
    n: 8,
    q: "Dans le hadith 8, quel geste est explicitement décrit après avoir lavé le visage ?",
    options: [
      "Essuyage de la tête (avant/arrière)",
      "Lavage des avant-bras sans mention des coudes",
      "Passage d'eau sur les oreilles sans essuyage de la tête",
      "Lavage des pieds avant le visage",
    ],
    correctIndex: 0,
    explain:
      "La description authentique mentionne le passage humide sur la tête en allers/retours (« أقبل وأدبر »).",
  },
  {
    n: 8,
    q: "Selon le seed (avis hanbalites), quel est le statut de la basmala au wudû' ?",
    options: [
      "Nulle part mentionnée",
      "Recommandée (sunna) seulement",
      "Obligatoire, mais tombe en cas d'oubli",
      "Interdite",
    ],
    correctIndex: 2,
    explain:
      "Chez les hanbalites, la basmala est tenue pour obligatoire avec dispense en cas d'oubli.",
  },
  {
    n: 8,
    q: "Selon la majorité (hanafites/malikites/shafiʿites), combien de lavages valident le membre au minimum ?",
    options: ["Deux", "Un", "Quatre", "Trois"],
    correctIndex: 1,
    explain:
      "Un seul lavage suffit pour la validité ; le triple est recommandé (sunna) et non obligatoire.",
  },

  {
    n: 9,
    q: "Le hadith 9 enseigne le « tayammun ». Dans quels types d'actes commence-t-on par la droite ?",
    options: [
      "Dans tous les actes sans exception",
      "Uniquement purification",
      "Actes d'honneur (purification, habillement, etc.)",
      "Seulement pour les chaussures",
    ],
    correctIndex: 2,
    explain:
      "La droite est recommandée dans les actes d'honneur ; la gauche dans les actes contraires (toilette, etc.).",
  },
  {
    n: 9,
    q: "Que disent les écoles lorsqu'un texte prouve la priorité de la gauche dans un cas précis ?",
    options: ["Toujours droite", "On suit l'exception (gauche prioritaire)", "Libre", "On alterne"],
    correctIndex: 1,
    explain:
      "Lorsqu'un texte authentique mentionne la gauche pour un cas précis (comme entrer aux toilettes), on suit cette exception.",
  },
  {
    n: 9,
    q: "Pourquoi les savants recommandent-ils de commencer par la droite dans le wuḍû’ et l’habillement ?",
    options: [
      "Pour se distinguer des autres religions",
      "Parce que c’est plus pratique",
      "Parce que cela fait partie des marques d’honneur et de noblesse",
      "Sans aucune sagesse particulière",
    ],
    correctIndex: 2,
    explain:
      "La droite est associée aux choses nobles : wuḍû’, vêtement, etc. C’est une façon d’honorer l’acte en imitant la pratique du Prophète ﷺ.",
  },

  {
    n: 10,
    q: "Que signifie « الغُرَّةُ وَالتَّحْجِيل » dans le hadith 10 ?",
    options: [
      "Invocations après le wudû'",
      "Marques lumineuses sur les membres lavés",
      "Vêtements spéciaux",
      "Ablutions sèches",
    ],
    correctIndex: 1,
    explain:
      "« الغُرَّةُ وَالتَّحْجِيل » renvoie aux traces lumineuses que le croyant aura au Jour dernier sur les membres lavés par le wudû'.",
  },
  {
    n: 10,
    q: "D’où viennent ces marques lumineuses mentionnées dans le hadith 10 ?",
    options: [
      "Du simple fait d’être musulman",
      "De la prière sans wuḍû’",
      "Des membres lavés par le wuḍû’ répété et soigné",
      "Du ghusl du vendredi uniquement",
    ],
    correctIndex: 2,
    explain:
      "Les marques de lumière sont liées aux membres purifiés régulièrement par le wuḍû’ et aux efforts constants dans cette adoration.",
  },
  {
    n: 10,
    q: "Quelle attitude le hadith 10 encourage-t-il chez le croyant vis-à-vis du wuḍû’ ?",
    options: [
      "Le négliger car il suffit d’un seul wuḍû’ dans la vie",
      "Le faire uniquement en cas d’obligation absolue",
      "Multiplier le wuḍû’ et l’accomplir avec soin pour augmenter sa lumière au Jour dernier",
      "Abandonner toute sunna dans le wuḍû’",
    ],
    correctIndex: 2,
    explain:
      "Ce hadith pousse à aimer le wuḍû’ et à l’accomplir avec soin, car il sera une source de lumière le Jour du Jugement.",
  },

  {
    n: 11,
    q: "Que dit-on à l'entrée des latrines (hadith 11) ?",
    options: [
      "On reste silencieux",
      "اللهم إني أعوذ بك من الخبث والخبائث",
      "Uniquement la basmala",
      "On fait du dhikr à voix haute",
    ],
    correctIndex: 1,
    explain:
      "Le Prophète ﷺ enseignait de dire : « اللهم إني أعوذ بك من الخبث والخبائث » avant d’entrer aux toilettes.",
  },
  {
    n: 11,
    q: "Pourquoi cette invocation est-elle dite avant d’entrer aux toilettes ?",
    options: [
      "Pour demander plus de rizq (subsistance)",
      "Pour appeler les anges",
      "Pour demander protection contre les impuretés et les djinns nuisibles",
      "Pour annoncer sa présence aux voisins",
    ],
    correctIndex: 2,
    explain:
      "Le hadith mentionne la protection contre le mal (al-khubth wal-khabâ’ith), souvent expliqué comme les djinns nuisibles et les impuretés.",
  },
  {
    n: 11,
    q: "Quelle attitude les savants recommandent-ils concernant la parole à l’intérieur des toilettes ?",
    options: [
      "Parler beaucoup de choses de la dunya",
      "Faire du dhikr à voix haute",
      "Limiter la parole au strict nécessaire",
      "Réciter le Coran généreusement",
    ],
    correctIndex: 2,
    explain:
      "En se basant sur plusieurs textes, ils recommandent de limiter la parole dans ce lieu, sauf nécessité, par respect pour le dhikr.",
  },

  {
    n: 12,
    q: "Que prescrit le hadith 12 quand on fait ses besoins en plein air (désert) ?",
    options: [
      "Face à la qibla uniquement",
      "Dos à la qibla uniquement",
      "Ni face ni dos à la qibla",
      "C'est indifférent",
    ],
    correctIndex: 2,
    explain:
      "En plein air, on ne doit ni faire face ni tourner le dos à la qibla lorsqu'on fait ses besoins.",
  },
  {
    n: 12,
    q: "Quel respect particulier de la qibla ce hadith met-il en évidence ?",
    options: [
      "Qu’elle ne concerne que la prière",
      "Qu’elle peut être ignorée dans les lieux publics",
      "Que même en dehors de la prière, on évite de lui tourner le dos ou le visage dans certaines situations",
      "Qu’elle n’a aucune valeur dans le désert",
    ],
    correctIndex: 2,
    explain:
      "La qibla reste un symbole sacré : même en dehors de la salât, on la respecte dans certains contextes comme les besoins naturels en plein air.",
  },
  {
    n: 12,
    q: "Pourquoi les savants distinguent-ils entre plein air et toilettes construites à partir de ce hadith ?",
    options: [
      "Parce qu’ils n’acceptent pas le hadith",
      "Parce que la direction est impossible à identifier",
      "Parce que d’autres textes montrent une différence de règle entre l’extérieur et l’intérieur",
      "Parce qu’ils veulent faciliter sans preuve",
    ],
    correctIndex: 2,
    explain:
      "En combinant ce hadith avec d’autres, les savants ont établi que l’interdiction est plus stricte en plein air, et plus allégée dans les toilettes construites.",
  },

  {
    n: 13,
    q: "Que rapporte Ibn ʿUmar (hadith 13) ?",
    options: [
      "Le Prophète ﷺ en plein désert, face à la qibla",
      "Le Prophète ﷺ dans une maison, dos à la Kaʿba",
      "Interdiction en ville seulement",
      "Description d'un wudû' partiel",
    ],
    correctIndex: 1,
    explain:
      "Ibn ʿUmar rapporte que le Prophète ﷺ, dans une maison à Médine, faisait ses besoins tourné vers le Shâm, dos à la Kaʿba.",
  },
  {
    n: 13,
    q: "Que déduisent certains savants de ce hadith concernant les toilettes construites ?",
    options: [
      "Que la qibla n’a aucune importance",
      "Qu’il est permis de faire face ou dos à la qibla à l’intérieur, en raison des murs qui séparent",
      "Que la règle du désert est la même qu’en intérieur",
      "Qu’il faut détruire les toilettes orientées vers la qibla",
    ],
    correctIndex: 1,
    explain:
      "Beaucoup de savants permettent une certaine latitude en intérieur, car les murs constituent une séparation différente de la situation en plein air.",
  },
  {
    n: 13,
    q: "Pourquoi certains savants restent malgré tout prudents sur l’orientation des toilettes ?",
    options: [
      "Parce qu’ils rejettent tous les hadiths sur le sujet",
      "Parce qu’ils ne connaissent pas la direction de la qibla",
      "Par respect renforcé pour la qibla, en évitant quand c’est possible de lui faire face ou dos",
      "Parce qu’ils pensent que cela annule la foi",
    ],
    correctIndex: 2,
    explain:
      "Même en cas de permission technique, certains recommandent d’éviter de faire face ou dos à la qibla par respect accru pour ce symbole sacré.",
  },

  {
    n: 14,
    q: "Selon le hadith 14, que peut-on utiliser pour l'istinjāʾ ?",
    options: [
      "Uniquement l'eau",
      "Uniquement les pierres",
      "L'eau ou les pierres (tout est valide)",
      "Ni l'un ni l'autre",
    ],
    correctIndex: 2,
    explain:
      "Les textes montrent la légitimité de l'eau et des pierres ; avec les pierres, on recommande au minimum trois passages.",
  },
  {
    n: 14,
    q: "Quel est le minimum recommandé pour l’istinjāʾ avec des pierres ou papiers assimilés ?",
    options: ["Un passage", "Deux passages", "Trois passages", "Sept passages"],
    correctIndex: 2,
    explain:
      "La sunna indique un minimum de trois passages avec les pierres (ou ce qui en tient lieu) pour bien nettoyer.",
  },
  {
    n: 14,
    q: "Pourquoi les savants considèrent-ils que l’eau reste la meilleure option, même si les pierres suffisent ?",
    options: [
      "Parce que les pierres sont interdites",
      "Parce que l’eau nettoie mieux et enlève à la fois la trace et la substance de l’impureté",
      "Parce que l’eau est obligatoire en toutes circonstances",
      "Parce que les hadiths ne parlent jamais de pierres",
    ],
    correctIndex: 1,
    explain:
      "L’eau enlève la substance et la trace de l’impureté, c’est donc le plus complet, même si les pierres rendent l’endroit rituellement pur pour la prière.",
  },

  {
    n: 15,
    q: "Selon le hadith 15, que ne faut-il pas faire avec la main droite pendant qu'on urine ?",
    options: ["Ouvrir la porte", "Tenir son sexe", "Se moucher", "Se peigner"],
    correctIndex: 1,
    explain:
      "Le Prophète ﷺ a dit : « لا يُمْسِكَنَّ أَحَدُكُمْ ذَكَرَهُ بِيَمِينِهِ وَهُوَ يَبُولُ » : ne tenez pas votre sexe de la main droite en urinant.",
  },
  {
    n: 15,
    q: "Quelle sagesse les savants mentionnent-ils derrière l’interdiction d’utiliser la main droite dans ce contexte ?",
    options: [
      "Purement culturelle",
      "Préserver l’honneur de la main droite, utilisée pour la nourriture et les actes nobles",
      "Éviter de mouiller la main droite",
      "Obliger à utiliser les deux mains",
    ],
    correctIndex: 1,
    explain:
      "La main droite est réservée aux actes d’honneur (manger, serrer la main, etc.), on évite donc de l’impliquer dans ce qui est lié aux impuretés.",
  },
  {
    n: 15,
    q: "Comment ce hadith complète-t-il l’enseignement général sur droite/gauche dans la sunna ?",
    options: [
      "Il annule tous les autres hadiths sur le sujet",
      "Il montre que la droite est toujours interdite",
      "Il illustre que la droite est pour ce qui est noble, la gauche pour ce qui est inférieur ou lié aux impuretés",
      "Il prouve que les deux mains sont identiques en tout",
    ],
    correctIndex: 2,
    explain:
      "En combinant les textes, on voit un schéma : droite pour l’honneur (manger, serrer la main, wuḍû’), gauche pour ce qui touche aux impuretés ou à leur nettoyage.",
  },
    /* ----------------- HADITH 16 : Les deux tombes & la négligence ----------------- */
  {
    n: 16,
    q: "Selon le hadith 16, pour quelles raisons les deux personnes dans les tombes étaient-elles punies ?",
    options: [
      "Pour avoir délaissé le jeûne de Ramadan et la zakât",
      "Pour avoir mal parlé du Prophète ﷺ et abandonné la prière",
      "Pour ne pas s’être protégées correctement des impuretés d’urine et pour avoir colporté les paroles (namîma)",
      "Pour avoir mangé de la nourriture illicite et volé les biens des gens",
    ],
    correctIndex: 2,
    explain:
      "Le Prophète ﷺ a expliqué que l’un ne se préservait pas de l’urine (négligence dans la purification) et que l’autre colportait les paroles entre les gens (namîma). Deux fautes parfois jugées “petites”, mais lourdes auprès d’Allah.",
  },
  {
    n: 16,
    q: "Que signifie la parole du Prophète ﷺ dans ce hadith : « وما يعذبان في كبير » (ils ne sont pas punis pour quelque chose de grand) ?",
    options: [
      "Que leurs actes ne sont en réalité pas des péchés",
      "Que ce sont des péchés graves, mais jugés “petits” dans leurs propres yeux",
      "Que la punition du tombeau n’existe pas",
      "Que ces fautes ne concernent que les anciens peuples",
    ],
    correctIndex: 1,
    explain:
      "Les savants expliquent que la phrase signifie : ce n’était pas “grand” à leurs yeux, ils le prenaient à la légère. En réalité, se négliger face à l’urine et colporter les paroles sont des péchés graves.",
  },
  {
    n: 16,
    q: "Quelle leçon principale les savants tirent-ils de la mention de l’urine dans ce hadith ?",
    options: [
      "Que seule l’impureté du sang est grave",
      "Que les impuretés ne concernent que les vêtements et pas le corps",
      "Qu’il faut être très attentif à se protéger des éclaboussures d’urine et à bien nettoyer avant la prière",
      "Qu’il n’y a pas de lien entre pureté et validité de la prière",
    ],
    correctIndex: 2,
    explain:
      "Ce hadith montre l’importance de se protéger des impuretés d’urine (en particulier pour les hommes) et de bien se nettoyer (istinjâ’) avant la prière. Négliger cela peut entraîner un châtiment et invalider la salât.",
  },
  {
    n: 16,
    q: "Quel péché de la langue est mentionné dans ce hadith comme cause de châtiment dans la tombe ?",
    options: [
      "Le mensonge dans le commerce uniquement",
      "Le fait de jurer par Allah",
      "La namîma : colporter les paroles pour semer la discorde",
      "Le simple fait de parler beaucoup",
    ],
    correctIndex: 2,
    explain:
      "La namîma consiste à rapporter les propos d’un groupe à un autre pour briser les liens entre les gens. C’est un grand péché, cité ici comme cause de châtiment dans la tombe.",
  },
  {
    n: 16,
    q: "Pourquoi le Prophète ﷺ a-t-il planté une branche verte sur chacune des deux tombes, selon l’explication donnée par lui-même ?",
    options: [
      "Pour marquer les tombes de manière décorative",
      "Pour enseigner un rite obligatoire pour toutes les tombes",
      "Parce qu’il espérait qu’aussi longtemps qu’elles resteraient fraîches, la punition serait allégée",
      "Pour empêcher les gens de s’approcher de la tombe",
    ],
    correctIndex: 2,
    explain:
      "Le Prophète ﷺ a dit qu’il espérait que le châtiment soit allégé tant que les branches resteraient fraîches. Les savants en déduisent la miséricorde du Prophète ﷺ et l’importance d’intercéder par les bonnes œuvres et les invocations pour les morts.",
  },

];

/**
 * Petite fonction utilitaire si tu veux filtrer facilement
 * les questions d’un hadith particulier dans tes pages.
 */
// export function getQuestionsByHadith(number) {
//   return QUIZ_QUESTIONS_1_15.filter((q) => q.n === number);
// }
