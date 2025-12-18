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
  /* ----------------- HADITH 17 : « Le siwâk à chaque prière » ----------------- */

{
  n: 17,
  q: "Selon le hadith 17, pourquoi le Prophète ﷺ n’a-t-il pas ordonné l’usage obligatoire du siwâk ?",
  options: [
    "Parce que le siwâk était rare à Médine",
    "Parce qu’il craignait que cela soit une difficulté pour sa communauté",
    "Parce que le siwâk était réservé au Ramadan",
    "Parce que le siwâk annule la prière",
  ],
  correctIndex: 1,
  explain:
    "Le Prophète ﷺ dit : « Lowlâ an ashuqqa ‘alâ ummatî… » : il n’a pas rendu le siwâk obligatoire par miséricorde, pour ne pas imposer une difficulté.",
},

{
  n: 17,
  q: "Quel moment est explicitement mentionné dans le hadith comme étant particulièrement recommandé pour le siwâk ?",
  options: [
    "Avant de dormir",
    "Après avoir mangé",
    "À chaque prière",
    "Pendant le voyage",
  ],
  correctIndex: 2,
  explain:
    "Le hadith mentionne clairement : « … à chaque prière ». C’est le moment le plus souligné ici.",
},

{
  n: 17,
  q: "Quel statut juridique du siwâk est indiqué dans le commentaire fourni dans le document ?",
  options: [
    "Obligatoire pour chaque prière",
    "Déconseillé sauf en Ramadan",
    "Sunna fortement recommandée selon la majorité",
    "Interdit avant la salât",
  ],
  correctIndex: 2,
  explain:
    "Le texte précise : « سنة مؤكدة عند الجمهور » — une sunna fortement recommandée selon la majorité des savants.",
},

{
  n: 17,
  q: "Le commentaire indique cinq moments où le siwâk est particulièrement recommandé. Lequel parmi ces choix en fait partie ?",
  options: [
    "Avant de rompre le jeûne",
    "Lors de la lecture du Coran",
    "Après chaque repas sucré",
    "Avant l’adhan",
  ],
  correctIndex: 1,
  explain:
    "An-Nawawî mentionne parmi les cinq moments : lors de la lecture du Coran, en plus de la prière, des ablutions, du réveil et du changement d’odeur de la bouche.",
},

{
  n: 17,
  q: "Quelle sagesse spirituelle les savants tirent de ce hadith ?",
  options: [
    "Le Prophète ﷺ voulait imposer plus d’efforts pour augmenter les mérites",
    "Le siwâk n’a aucune valeur religieuse",
    "Le hadith montre la miséricorde et la douceur du Prophète envers sa communauté",
    "L’hygiène buccale n’a aucun lien avec la spiritualité",
  ],
  correctIndex: 2,
  explain:
    "An-Nawawî indique que ce texte montre le souci du Prophète ﷺ de ne pas rendre les choses difficiles, illustrant sa douceur et sa miséricorde.",
},
/* ----------------- HADITH 18 : « Le Prophète ﷺ se levait la nuit et utilisait le siwâk » ----------------- */

{
  n: 18,
  q: "Selon le hadith 18, que faisait le Prophète ﷺ lorsqu’il se levait durant la nuit ?",
  options: [
    "Il buvait de l’eau",
    "Il récitait immédiatement le Coran à voix haute",
    "Il frottait sa bouche avec le siwâk",
    "Il parlait avec ses compagnons"
  ],
  correctIndex: 2,
  explain:
    "Le texte dit : « يَشُوصُ فَاهُ بِالسِّوَاكِ » : il frottait sa bouche avec le siwâk lorsqu’il se levait la nuit."
},

{
  n: 18,
  q: "D’après le commentaire cité, quelle est la sagesse principale de l’usage du siwâk au réveil ?",
  options: [
    "Remplacer complètement les ablutions",
    "Donner plus de force au corps",
    "Enlever la mauvaise odeur causée par le sommeil",
    "Obtenir la récompense du jeûne"
  ],
  correctIndex: 2,
  explain:
    "Ibn Daqīق العيد explique que le sommeil provoque un changement de l’odeur de la bouche, et que le siwâk sert à la nettoyer."
},

{
  n: 18,
  q: "Quel statut juridique est indiqué dans le document pour le siwâk en se levant du sommeil ?",
  options: [
    "Obligatoire",
    "Recommandé (mustahabb)",
    "Interdit",
    "Makrûh (déconseillé)"
  ],
  correctIndex: 1,
  explain:
    "Le commentaire dit : « فيه استحباب السواك عند القيام من النوم » : il montre la recommandation (istihbâb) du siwâk au réveil."
},

{
  n: 18,
  q: "L’expression « إذا قام من الليل » peut être comprise de deux façons. Laquelle de ces propositions en fait partie ?",
  options: [
    "Se lever la nuit pour manger",
    "Se lever la nuit pour la prière",
    "Se lever la nuit pour voyager",
    "Se lever la nuit pour discuter"
  ],
  correctIndex: 1,
  explain:
    "Le commentaire précise qu’on peut comprendre « إذا قام من الليل » comme « lorsqu’il se levait pour la prière nocturne », ce qui rejoint le sens du hadith précédent sur le siwâk et la prière."
},

{
  n: 18,
  q: "Quelle leçon spirituelle générale peut-on tirer de ce hadith ?",
  options: [
    "La nuit est un moment où l’hygiène n’a pas d’importance",
    "Se lever pour adorer Allah en état de propreté est recommandé",
    "Le siwâk suffit sans aucune autre purification",
    "Il est interdit de dormir sans siwâk"
  ],
  correctIndex: 1,
  explain:
    "Le Prophète ﷺ se levait la nuit pour l’adoration en commençant par purifier sa bouche, montrant l’importance de la propreté avant de se tenir devant Allah."
},

/* ----------------- HADITH 19 : « Le siwāk dans les derniers instants du Prophète ﷺ » ----------------- */

{
  n: 19,
  q: "Que faisait ʿAbd ar-Raḥmān ibn Abī Bakr en entrant auprès du Prophète ﷺ ?",
  options: [
    "Il récitait le Coran",
    "Il utilisait un siwāk",
    "Il apportait de l’eau",
    "Il appelait les compagnons"
  ],
  correctIndex: 1,
  explain:
    "Le hadith précise : « ومع عبد الرحمن سواك رطب يستن به » — il avait un siwāk humide et se nettoyait avec."
},

{
  n: 19,
  q: "Comment ʿĀʾisha a-t-elle préparé le siwāk pour le Prophète ﷺ ?",
  options: [
    "Elle l’a taillé au couteau",
    "Elle l’a lavé longuement",
    "Elle l’a mordillé et assoupli",
    "Elle l’a cassé en deux"
  ],
  correctIndex: 2,
  explain:
    "Elle dit : « فقضمته فطيّبته » — je l’ai mordillé afin de l’assouplir et de le préparer."
},

{
  n: 19,
  q: "Quelle indication ce hadith donne-t-il concernant l’usage du siwāk ?",
  options: [
    "Il doit être obligatoirement sec",
    "Il n’est pas permis d’utiliser le siwāk de quelqu’un d’autre",
    "Il est permis d’utiliser le siwāk de quelqu’un d’autre après l’avoir préparé",
    "Il est interdit de mâcher l’extrémité du siwāk"
  ],
  correctIndex: 2,
  explain:
    "Les commentaires indiquent : « الاستياك بسواك الغير » — la possibilité d’utiliser le siwāk d’un autre lorsqu’il est préparé."
},

{
  n: 19,
  q: "Que disait ʿĀʾisha à propos de la mort du Prophète ﷺ ?",
  options: [
    "Qu’il est mort dans la mosquée",
    "Qu’il est mort entre ses bras",
    "Qu’il est mort seul",
    "Qu’il est mort pendant un voyage"
  ],
  correctIndex: 1,
  explain:
    "Elle dit : « مات بين حاقنتي وذاقنتي » — il est mort entre ma poitrine et mon menton."
},

{
  n: 19,
  q: "Quel enseignement spirituel ressort de ce hadith ?",
  options: [
    "Le croyant doit éviter l’usage du siwāk en présence des gens",
    "Le Prophète ﷺ n’accordait pas d’importance à la propreté",
    "Même dans ses derniers instants, le Prophète ﷺ aimait la pureté et la propreté",
    "Le siwāk remplace toutes les ablutions"
  ],
  correctIndex: 2,
  explain:
    "Le Prophète ﷺ a demandé le siwāk dans ses derniers instants, montrant son amour constant pour la purification."
},
/* ----------------- HADITH 20 : « Le siwāk sur la langue » ----------------- */

{
  n: 20,
  q: "Dans quelle situation Abū Mūsā trouva-t-il le Prophète ﷺ ?",
  options: [
    "En train de prier",
    "En train de rompre le jeûne",
    "En train d'utiliser un siwāk humide",
    "En train de parler avec les compagnons"
  ],
  correctIndex: 2,
  explain:
    "Le hadith dit : « وهو يستاك بسواك رطب » — il utilisait un siwāk humide."
},

{
  n: 20,
  q: "Où se trouvait l’extrémité du siwāk lorsque le Prophète ﷺ l’utilisait ?",
  options: [
    "Sur ses dents uniquement",
    "Sur ses gencives",
    "Sur sa langue",
    "Sur l'intérieur de sa joue"
  ],
  correctIndex: 2,
  explain:
    "Le texte précise explicitement : « وطرف السواك على لسانه » — l’extrémité du siwāk était sur sa langue."
},

{
  n: 20,
  q: "Quelle expression le Prophète ﷺ prononçait-il pendant l’usage du siwāk ?",
  options: [
    "Ah… Ah…",
    "Aʿ… Aʿ…",
    "Oh… Oh…",
    "Uh… Uh…"
  ],
  correctIndex: 1,
  explain:
    "Le hadith rapporte : « وهو يقول: أع، أع » — une expression indiquant un réflexe de haut-le-cœur."
},

{
  n: 20,
  q: "Quelle règle le commentaire tire-t-il de ce hadith ?",
  options: [
    "Il est interdit de passer le siwāk sur la langue",
    "Le siwāk ne doit être utilisé qu'à sec",
    "Le siwāk peut être utilisé sur la langue, et c’est recommandé",
    "Le siwāk remplace toutes les ablutions"
  ],
  correctIndex: 2,
  explain:
    "Ibn Daqīق العيد explique : « الاستياك على اللسان » — le siwāk sur la langue est établi et efficace pour enlever les mauvaises odeurs."
},

{
  n: 20,
  q: "Comment les fuqahā’ recommandent-ils l’utilisation du siwāk selon le commentaire ?",
  options: [
    "Horizontalement pour la langue et verticalement pour les dents",
    "Verticalement pour les dents et horizontalement pour la langue",
    "Horizontalement pour les dents et verticalement pour la langue",
    "Toujours de manière circulaire"
  ],
  correctIndex: 2,
  explain:
    "Il est dit : « يستحب الاستياك عرضًا في الأسنان، وأما في اللسان فطولًا » — horizontal pour les dents, vertical pour la langue."
},

  {
    n: 21,
    q: "Pourquoi le Prophète ﷺ a-t-il dit à al-Mughīra : « دَعْهُمَا » (Laisse-les) ?",
    options: [
      "Parce qu'il était fatigué",
      "Parce qu'il les avait enfilés en état de pureté",
      "Parce qu'il allait les retirer lui-même",
      "Parce qu'ils étaient mouillés"
    ],
    correctIndex: 1,
    explain:
      "Le Prophète ﷺ a dit : « فَإِنِّي أَدْخَلْتُهُمَا طَاهِرَتَيْنِ » — il les avait enfilés en état de pureté."
  },

  {
    n: 21,
    q: "Quelle action le Prophète ﷺ effectua après avoir dit : « Laisse-les » ?",
    options: [
      "Il retira les khouffayn",
      "Il lava ses pieds",
      "Il essuya sur les khouffayn",
      "Il refit complètement les ablutions"
    ],
    correctIndex: 2,
    explain: "Le texte dit : « فَمَسَحَ عَلَيْهِمَا » — puis il essuya dessus."
  },

  {
    n: 21,
    q: "Dans quelle situation ce hadith a-t-il été rapporté ?",
    options: [
      "Pendant une bataille",
      "Pendant un voyage",
      "Pendant le pèlerinage",
      "Dans la mosquée de Médine"
    ],
    correctIndex: 1,
    explain: "Al-Mughīra dit : « كُنْتُ مَعَ النَّبِيِّ ﷺ فِي سَفَرٍ »."
  },

  {
    n: 21,
    q: "Quelle condition essentielle ce hadith établit-il pour pouvoir essuyer sur les khouffayn ?",
    options: [
      "Que les khouffayn soient noirs",
      "Qu’ils soient en cuir uniquement",
      "Qu’ils aient été enfilés en état de pureté",
      "Qu’on soit obligatoirement en voyage"
    ],
    correctIndex: 2,
    explain:
      "Condition fondamentale : « أَدْخَلْتُهُمَا طَاهِرَتَيْنِ » — les enfilés en état de pureté."
  },

  {
    n: 21,
    q: "Quelle école juridique considère le masḥ sur les khouffayn comme recommandé (sunnah) ?",
    options: [
      "Les Malikites",
      "Les Hanafites",
      "Les Hanbalites",
      "Les Muʿtazilites"
    ],
    correctIndex: 2,
    explain:
      "Les Hanbalites (الحنابلة) considèrent le masḥ comme une sunnah confirmée."
  },

  {
    n: 21,
    q: "Quelle est la durée maximale du masḥ pour un voyageur selon la majorité des savants ?",
    options: [
      "12 heures",
      "24 heures",
      "48 heures",
      "72 heures"
    ],
    correctIndex: 3,
    explain:
      "La majorité permet au voyageur 3 jours et 3 nuits (72 h)."
  },

  {
    n: 21,
    q: "Que montre ce hadith à propos de la facilité (taysīr) dans la religion ?",
    options: [
      "Qu'il faut toujours enlever ses chaussures",
      "Que le islam impose la difficulté pour purifier le corps",
      "Qu’Allah a facilité les actes en permettant l’essuyage",
      "Que le voyage annule les règles d’ablution"
    ],
    correctIndex: 2,
    explain:
      "Le masḥ est une concession (رخصة) facilitée par la sharia, surtout en voyage."
  },

  {
    n: 21,
    q: "Quel est le rapporteur (sahābī) de ce hadith ?",
    options: [
      "Abū Hurayra",
      "ʿUmar ibn al-Khaṭṭāb",
      "al-Mughīra ibn Shuʿba",
      "ʿAbdullāh ibn Masʿūd"
    ],
    correctIndex: 2,
    explain:
      "Le hadith est rapporté par al-Mughīra ibn Shuʿba رضي الله عنه."
  },

  {
    n: 21,
    q: "Que signifie le terme « الخُفَّيْنِ » dans le hadith ?",
    options: [
      "Les sandales ouvertes",
      "Les chaussons en cuir couvrant les chevilles",
      "Les chaussettes fines",
      "Les bottes de voyage"
    ],
    correctIndex: 1,
    explain:
      "Al-khouffayn désigne deux chaussons en cuir couvrant les chevilles."
  },

  {
    n: 21,
    q: "Quel est le jugement (ḥukm) général du masḥ selon le Prophète ﷺ et la majorité ?",
    options: [
      "Interdit sauf en cas de nécessité extrême",
      "Non légiféré",
      "Permis et légiféré sous conditions",
      "Obligatoire dans le voyage"
    ],
    correctIndex: 2,
    explain:
      "La majorité (jumhūr) considère le masḥ comme permis et établi par de nombreux hadiths."
  },

  {
    n: 21,
    q: "Explique brièvement la condition essentielle qui permet de faire le masḥ sur les khouffayn selon ce hadith.",
    answer:
      "La condition principale est de les avoir enfilés en état de pureté : « أَدْخَلْتُهُمَا طَاهِرَتَيْنِ ».",
    explain:
      "Sans cette condition, le masḥ ne serait pas valable selon le hadith et les savants."
  },

  {
    n: 21,
    q: "Pourquoi ce hadith est-il particulièrement important pour les voyageurs ?",
    answer:
      "Parce qu’il montre la facilité accordée par la sharia en voyage : essuyer plutôt que laver les pieds.",
    explain:
      "Le masḥ évite la gêne du déchaussement et permet de conserver la pureté plus facilement."
  },

  {
    n: 22,
    q: "Quel acte le Prophète ﷺ a-t-il accompli avant de faire ses ablutions dans ce hadith ?",
    options: [
      "Il a prié",
      "Il a mangé",
      "Il a uriné",
      "Il a dormi"
    ],
    correctIndex: 2,
    explain:
      "Hudhayfa dit : « فَبَالَ ثُمَّ تَوَضَّأَ » — il urina puis fit ses ablutions."
  },

  {
    n: 22,
    q: "Que fit le Prophète ﷺ après avoir réalisé son wudu ?",
    options: [
      "Il retira ses khouffayn",
      "Il lava ses pieds",
      "Il essuya sur ses khouffayn",
      "Il refit le wudu"
    ],
    correctIndex: 2,
    explain:
      "Le hadith conclut : « وَمَسَحَ عَلَى خُفَّيْهِ » — il passa la main sur ses khouffayn."
  },

  {
    n: 22,
    q: "Quel compagnon rapporte ce hadith ?",
    options: [
      "Abû Hurayra",
      "Hudhayfa ibn al-Yamân",
      "Abdullah ibn Masʿûd",
      "Anas ibn Mâlik"
    ],
    correctIndex: 1,
    explain:
      "Le narrateur mentionné est : حذيفة بن اليمان رضي الله عنه."
  },

  {
    n: 22,
    q: "Ce hadith prouve principalement :",
    options: [
      "L’interdiction d'essuyer sur les khouffayn",
      "La permission d'essuyer sur les khouffayn",
      "L’obligation de retirer les chaussures avant le wudu",
      "La nullité du wudu après avoir uriné"
    ],
    correctIndex: 1,
    explain:
      "Le Prophète ﷺ a essuyé sur ses khouffayn, ce qui prouve la permission du masḥ."
  },

  {
    n: 22,
    q: "Selon le consensus rapporté dans le texte, qui autorise le masḥ sur les khouffayn ?",
    options: [
      "Uniquement Abû Hanîfa",
      "Tous les imams reconnus (ijmâʿ)",
      "Uniquement les shaféites",
      "Uniquement les savants du hadith"
    ],
    correctIndex: 1,
    explain:
      "An-Nawawî dit : « أجمع من يُعتدّ به على جواز المسح على الخفين »."
  },

  {
    n: 22,
    q: "Quelle durée le jumhūr (majorité) donne-t-il pour le masḥ du voyageur ?",
    options: [
      "Un jour et une nuit",
      "Deux jours",
      "Trois jours et trois nuits",
      "Sept jours"
    ],
    correctIndex: 2,
    explain:
      "La majorité : « للمسافر ثلاثة أيام بلياليها »."
  },

  {
    n: 22,
    q: "Quelle condition est indispensable pour que le masḥ soit valide ?",
    options: [
      "Porter des khouffayn noirs",
      "Enfiler les khouffayn sur une purification complète",
      "Être obligatoirement en voyage",
      "Porter un turban"
    ],
    correctIndex: 1,
    explain:
      "Condition fondamentale : les enfiler sur une « طهارة كاملة »."
  },

  {
    n: 22,
    q: "Quelle école n’accepte PAS l’essuyage sur les chaussettes fines (جورب رقيق) ?",
    options: [
      "Les Hanafites",
      "Les Malikites",
      "Les Hanbalites",
      "Les Shaféites"
    ],
    correctIndex: 1,
    explain:
      "Dans le texte : « لا يجوز عند مالك المسح على الجورب الرقيق »."
  },

  {
    n: 22,
    q: "Selon les shaféites et hanbalites, la chaussette doit être :",
    options: [
      "Froide",
      "Colorée",
      "Épaisse et permettant de marcher",
      "Mince et transparente"
    ],
    correctIndex: 2,
    explain:
      "Le texte dit : « يشترط أن يكون الجورب ثخينًا مُمَكِّنًا للمشي عليه »."
  },

  {
    n: 22,
    q: "Quel est l’intérêt principal de la règle du masḥ ?",
    options: [
      "Rendre le wudu plus difficile",
      "Faciliter la vie du croyant",
      "Supprimer le lavage des pieds définitivement",
      "Annuler les ablutions"
    ],
    correctIndex: 1,
    explain:
      "C’est une facilité légiférée (رخصة) pour éviter la gêne et la difficulté."
  },

  /* --- QUESTION OUVERTE 1 --- */
  {
    n: 22,
    q: "Explique en quelques mots pourquoi ce hadith est une preuve forte pour la légalité de l'essuyage sur les khouffayn.",
    answer:
      "Parce que le Prophète ﷺ l’a fait lui-même après le wudu, et l’action prophétique établit la Sunna.",
    explain:
      "Le hadith montre une pratique directe du Prophète ﷺ, ce qui constitue une preuve juridique solide."
  },

  {
    n: 22,
    q: "Quelle est la durée maximale du masḥ pour un résident et un voyageur ?",
    answer:
      "Résident : un jour et une nuit. Voyageur : trois jours et trois nuits.",
    explain:
      "C’est l’avis du jumhūr, clairement mentionné dans le texte explicatif."
  },

  {
    n: 22,
    q: "Pourquoi la chaussette doit-elle être épaisse selon plusieurs écoles ?",
    answer:
      "Parce qu’elle doit permettre de marcher avec et tenir le pied comme un vêtement solide.",
    explain:
      "La condition de solidité vise à assimiler la chaussette au khouff traditionnel."
  },

  /* ------------------------------------------------------
   HADITH 23 – QUIZ COMPLET
   ------------------------------------------------------ */
  /* --- QCM 1 --- */
  {
    n: 23,
    q: "Quel compagnon rapporte le hadith concernant le madhī ?",
    options: [
      "ʿAbd Allāh ibn Masʿūd",
      "ʿAlī ibn Abī Ṭālib",
      "Abū Hurayra",
      "Hudhayfa ibn al-Yamān"
    ],
    correctIndex: 1,
    explain:
      "Le hadith est rapporté par ʿAlī ibn Abī Ṭālib رضي الله عنه."
  },

  /* --- QCM 2 --- */
  {
    n: 23,
    q: "Pourquoi ʿAlī رضي الله عنه n’a-t-il pas interrogé directement le Prophète ﷺ ?",
    options: [
      "Par peur de se tromper",
      "Par manque de temps",
      "Par pudeur en raison de sa fille",
      "Parce qu’il était en voyage"
    ],
    correctIndex: 2,
    explain:
      "Il dit : « فاستحييت أن أسأل رسول الله ﷺ لمكان ابنته » — par pudeur à cause de sa fille."
  },

  /* --- QCM 3 --- */
  {
    n: 23,
    q: "Qui ʿAlī رضي الله عنه a-t-il chargé de poser la question au Prophète ﷺ ?",
    options: [
      "Abū Ayyūb al-Anṣārī",
      "al-Miqdād ibn al-Aswad",
      "ʿAmmār ibn Yāsir",
      "Zayd ibn Thābit"
    ],
    correctIndex: 1,
    explain:
      "Il demanda à al-Miqdād ibn al-Aswad رضي الله عنه de questionner le Prophète ﷺ."
  },

  /* --- QCM 4 --- */
  {
    n: 23,
    q: "Que doit faire celui chez qui sort du madhī selon le hadith ?",
    options: [
      "Faire le ghusl complet",
      "Laver ses vêtements seulement",
      "Laver son sexe et faire le wudūʾ",
      "Refaire uniquement la prière"
    ],
    correctIndex: 2,
    explain:
      "Le Prophète ﷺ a dit : « يَغْسِلُ ذَكَرَهُ وَيَتَوَضَّأُ »."
  },

  /* --- QCM 5 --- */
  {
    n: 23,
    q: "Quel est le jugement du madhī selon les quatre écoles ?",
    options: [
      "Il est pur",
      "Il est impur (najis)",
      "Il est douteux",
      "Il est assimilé au maniّ"
    ],
    correctIndex: 1,
    explain:
      "Les quatre écoles s’accordent sur la نجاسة (impureté) du madhī."
  },

  /* --- QCM 6 --- */
  {
    n: 23,
    q: "Le madhī impose-t-il le ghusl (grande ablution) ?",
    options: [
      "Oui, selon toutes les écoles",
      "Oui, selon les malikites",
      "Non, selon les quatre écoles",
      "Seulement chez les hanafites"
    ],
    correctIndex: 2,
    explain:
      "Consensus des quatre écoles : le madhī n’impose pas le ghusl."
  },

  /* --- QCM 7 --- */
  {
    n: 23,
    q: "Selon la majorité des savants (jumhūr), que faut-il laver lorsque le madhī sort ?",
    options: [
      "Tout le corps",
      "Tout le sexe",
      "Uniquement l’endroit touché",
      "Seulement les vêtements"
    ],
    correctIndex: 2,
    explain:
      "Le jumhūr considère qu’il suffit de laver l’endroit touché par le madhī."
  },

  /* --- QCM 8 --- */
  {
    n: 23,
    q: "Quelle école impose le lavage complet du sexe en cas de madhī ?",
    options: [
      "Ḥanafite",
      "Shāfiʿite",
      "Ḥanbalite",
      "Mālikite"
    ],
    correctIndex: 3,
    explain:
      "Chez les malikites, l’avis retenu est le lavage complet du sexe."
  },

  /* --- QCM 9 --- */
  {
    n: 23,
    q: "Le madhī annule-t-il les ablutions (wudūʾ) ?",
    options: [
      "Non, jamais",
      "Oui, selon consensus",
      "Seulement en grande quantité",
      "Uniquement chez les shaféites"
    ],
    correctIndex: 1,
    explain:
      "Les quatre écoles s’accordent sur le fait que le madhī annule le wudūʾ."
  },

  /* --- QCM 10 --- */
  {
    n: 23,
    q: "Que montre le comportement de ʿAlī رضي الله عنه dans ce hadith ?",
    options: [
      "La crainte du jugement",
      "La négligence",
      "La pudeur et le respect",
      "Le refus de poser des questions"
    ],
    correctIndex: 2,
    explain:
      "Le hadith illustre la grande pudeur (الحياء) de ʿAlī رضي الله عنه."
  },

  /* --- QUESTION OUVERTE 1 --- */
  {
    n: 23,
    q: "Quelle est la différence principale entre le madhī et le maniّ ?",
    answer:
      "Le madhī est un liquide fin qui sort lors de l’excitation sans éjaculation et n’impose que le wudūʾ, tandis que le maniّ sort avec plaisir et impose le ghusl.",
    explain:
      "Cette distinction est essentielle en fiqh de la purification."
  },

  /* --- QUESTION OUVERTE 2 --- */
  {
    n: 23,
    q: "Pourquoi ce hadith est-il important dans le chapitre de la ṭahāra ?",
    answer:
      "Parce qu’il clarifie le jugement du madhī, son impureté, et ce qu’il impose comme purification.",
    explain:
      "Il évite la confusion entre madhī et maniّ et facilite la pratique correcte."
  },

  /* --- QUESTION OUVERTE 3 --- */
  {
    n: 23,
    q: "Quelle leçon morale peut-on tirer de l’attitude de ʿAlī رضي الله عنه ?",
    answer:
      "La pudeur n’empêche pas d’apprendre sa religion ; on peut poser ses questions par des moyens respectueux.",
    explain:
      "ʿAlī a délégué la question tout en cherchant la vérité religieuse."
  },

  /* ------------------------------------------------------
   HADITH 24 – QUIZ COMPLET
   ------------------------------------------------------ */
  /* --- QCM 1 --- */
  {
    n: 24,
    q: "Quel est le sujet principal du hadith 24 ?",
    options: [
      "La manière correcte de faire le wudūʾ",
      "Les causes certaines d’annulation du wudūʾ",
      "Le doute concernant l’annulation des ablutions",
      "Les conditions de validité de la prière"
    ],
    correctIndex: 2,
    explain:
      "Le hadith traite du doute (الشك) concernant la sortie d’un événement annulant le wudūʾ."
  },

  /* --- QCM 2 --- */
  {
    n: 24,
    q: "Qui est le compagnon à propos duquel ce hadith est rapporté ?",
    options: [
      "ʿAbd Allāh ibn ʿUmar",
      "ʿAbd Allāh ibn Zayd ibn ʿĀṣim",
      "Abū Hurayra",
      "Anas ibn Mālik"
    ],
    correctIndex: 1,
    explain:
      "Le hadith est rapporté par ʿAbd Allāh ibn Zayd ibn ʿĀṣim al-Māzinī رضي الله عنه."
  },

  /* --- QCM 3 --- */
  {
    n: 24,
    q: "Que ressentait l’homme pendant la prière selon le hadith ?",
    options: [
      "Une douleur",
      "Une fatigue intense",
      "L’impression qu’il avait annulé ses ablutions",
      "Une distraction extérieure"
    ],
    correctIndex: 2,
    explain:
      "Le texte dit : « يُخَيَّلُ إِلَيْهِ أَنَّهُ يَجِدُ الشَّيْءَ فِي الصَّلَاةِ »."
  },

  /* --- QCM 4 --- */
  {
    n: 24,
    q: "Quelle est la réponse du Prophète ﷺ face à ce doute ?",
    options: [
      "Qu’il refasse immédiatement ses ablutions",
      "Qu’il interrompe la prière par précaution",
      "Qu’il ne quitte pas la prière sans certitude",
      "Qu’il demande l’avis d’un savant"
    ],
    correctIndex: 2,
    explain:
      "Le Prophète ﷺ a dit : « لا ينصرف حتى يسمع صوتًا أو يجد ريحًا »."
  },

  /* --- QCM 5 --- */
  {
    n: 24,
    q: "Quelle preuve rend l’annulation du wudūʾ certaine selon le hadith ?",
    options: [
      "Une simple sensation",
      "Une pensée insistante",
      "Entendre un son ou sentir une odeur",
      "Le doute prolongé"
    ],
    correctIndex: 2,
    explain:
      "Le hadith exige une preuve sensorielle claire : son ou odeur."
  },

  /* --- QCM 6 --- */
  {
    n: 24,
    q: "Quelle grande règle juridique (qāʿida fiqhiyya) découle de ce hadith ?",
    options: [
      "La difficulté appelle la facilité",
      "Le préjudice doit être écarté",
      "La certitude ne disparaît pas par le doute",
      "Les actes valent par leurs intentions"
    ],
    correctIndex: 2,
    explain:
      "Cette règle est formulée ainsi : « اليقين لا يزول بالشك »."
  },

  /* --- QCM 7 --- */
  {
    n: 24,
    q: "Quel est l’avis de la majorité des savants concernant le doute après le wudūʾ ?",
    options: [
      "Le wudūʾ est annulé",
      "Le wudūʾ est valide tant qu’il n’y a pas certitude",
      "Il faut toujours refaire le wudūʾ",
      "La prière est invalide"
    ],
    correctIndex: 1,
    explain:
      "Le jumhūr affirme que le doute n’annule pas la purification."
  },

  /* --- QCM 8 --- */
  {
    n: 24,
    q: "Pourquoi ce hadith est-il important contre les waswās (obsessions) ?",
    options: [
      "Il impose plus de précautions",
      "Il oblige à répéter la prière",
      "Il empêche de céder aux doutes infondés",
      "Il annule les sensations corporelles"
    ],
    correctIndex: 2,
    explain:
      "Le hadith ferme la porte aux doutes répétitifs et injustifiés."
  },

  /* --- QCM 9 --- */
  {
    n: 24,
    q: "Que doit faire une personne qui doute souvent pendant la prière ?",
    options: [
      "Quitter la prière à chaque doute",
      "Ignorer le doute et continuer",
      "Refaire le wudūʾ systématiquement",
      "S’asseoir et attendre"
    ],
    correctIndex: 1,
    explain:
      "La Sunna ordonne de rester sur la certitude et d’ignorer le doute."
  },

  /* --- QCM 10 --- */
  {
    n: 24,
    q: "Ce hadith montre surtout que la religion islamique est :",
    options: [
      "Rigide",
      "Complexe",
      "Basée sur la facilité et la sagesse",
      "Difficile à appliquer"
    ],
    correctIndex: 2,
    explain:
      "La règle protège le croyant contre la gêne et l’excès de scrupules."
  },

  /* --- QUESTION OUVERTE 1 --- */
  {
    n: 24,
    q: "Explique en une phrase la règle « اليقين لا يزول بالشك ».",
    answer:
      "Une chose établie avec certitude ne peut être annulée par un simple doute.",
    explain:
      "C’est l’un des fondements majeurs du fiqh."
  },

  /* --- QUESTION OUVERTE 2 --- */
  {
    n: 24,
    q: "Pourquoi le Prophète ﷺ a-t-il exigé un son ou une odeur ?",
    answer:
      "Parce qu’il faut une preuve claire et certaine pour annuler les ablutions.",
    explain:
      "Les sensations vagues ne sont pas juridiquement fiables."
  },

  /* --- QUESTION OUVERTE 3 --- */
  {
    n: 24,
    q: "Quelle leçon spirituelle peut-on tirer de ce hadith ?",
    answer:
      "L’islam combat l’excès de doute et invite à la tranquillité du cœur.",
    explain:
      "La religion vise la sérénité, pas l’angoisse."
  },
 /* ------------------------------------------------------
   HADITH 25 – QUIZ COMPLET
   ------------------------------------------------------ */
  /* --- QCM 1 --- */
  {
    n: 25,
    q: "Qui rapporte le hadith concernant l’urine du nourrisson ?",
    options: [
      "ʿĀʾisha bint Abī Bakr",
      "Umm Salama",
      "Umm Qays bint Miḥṣan al-Asadiyya",
      "Fāṭima bint Qays"
    ],
    correctIndex: 2,
    explain:
      "Le hadith est rapporté par Umm Qays bint Miḥṣan al-Asadiyya رضي الله عنها."
  },

  /* --- QCM 2 --- */
  {
    n: 25,
    q: "Quel était l’âge de l’enfant mentionné dans le hadith ?",
    options: [
      "Il était pubère",
      "Il marchait déjà",
      "Il était sevré",
      "Il était encore nourrisson"
    ],
    correctIndex: 3,
    explain:
      "Le texte précise : « بابن لها صغير لم يأكل الطعام » — un petit enfant qui ne mangeait pas encore."
  },

  /* --- QCM 3 --- */
  {
    n: 25,
    q: "Où l’enfant a-t-il uriné ?",
    options: [
      "Sur le sol de la mosquée",
      "Sur un vêtement",
      "Sur les genoux du Prophète ﷺ",
      "Dans un récipient"
    ],
    correctIndex: 2,
    explain:
      "Le hadith dit : « فبال على ثوبه » — il urina sur son vêtement."
  },

  /* --- QCM 4 --- */
  {
    n: 25,
    q: "Quelle a été la réaction du Prophète ﷺ ?",
    options: [
      "Il lava le vêtement complètement",
      "Il changea de vêtement",
      "Il versa de l’eau et n’a pas lavé",
      "Il ordonna de jeter le vêtement"
    ],
    correctIndex: 2,
    explain:
      "Le texte est explicite : « فدعا بماء فنضحه ولم يغسله »."
  },

  /* --- QCM 5 --- */
  {
    n: 25,
    q: "Sur quoi les savants sont-ils unanimes concernant l’urine du nourrisson ?",
    options: [
      "Elle est pure",
      "Elle est douteuse",
      "Elle est impure",
      "Elle n’annule pas la prière"
    ],
    correctIndex: 2,
    explain:
      "Le document indique : « اتفق الفقهاء على نجاسة بول الصبي »."
  },

  /* --- QCM 6 --- */
  {
    n: 25,
    q: "Quelle divergence existe entre les savants ?",
    options: [
      "Sur l’impureté de l’urine",
      "Sur la validité du hadith",
      "Sur la manière de purifier",
      "Sur l’âge de l’enfant"
    ],
    correctIndex: 2,
    explain:
      "Ils divergent sur la manière de purifier : lavage ou simple aspersion."
  },

  /* --- QCM 7 --- */
  {
    n: 25,
    q: "Quel est l’avis correct et مشهور selon le commentaire cité (an-Nawawī) ?",
    options: [
      "Il faut laver comme toute autre impureté",
      "Il suffit d’asperger l’urine du nourrisson",
      "Aucune purification n’est requise",
      "Cela dépend de la quantité"
    ],
    correctIndex: 1,
    explain:
      "An-Nawawī indique que l’avis correct et مشهور est l’aspersion (النضح)."
  },

  /* --- QCM 8 --- */
  {
    n: 25,
    q: "À quelle condition l’aspersion suffit-elle ?",
    options: [
      "Si l’enfant est une fille",
      "Si l’enfant est sevré",
      "Tant que l’enfant ne mange pas de nourriture",
      "Uniquement en voyage"
    ],
    correctIndex: 2,
    explain:
      "Le texte précise que cela vaut tant que l’enfant est exclusivement allaité."
  },

  /* --- QCM 9 --- */
  {
    n: 25,
    q: "Que faut-il faire si l’enfant commence à manger de la nourriture ?",
    options: [
      "Continuer l’aspersion",
      "Ne rien faire",
      "Laver comme toute autre impureté",
      "Changer de vêtement"
    ],
    correctIndex: 2,
    explain:
      "Le commentaire dit : « إذا أكل الطعام… فإنه يجب الغسل بلا خلاف »."
  },

  /* --- QCM 10 --- */
  {
    n: 25,
    q: "Quelle sagesse peut être comprise derrière cette facilité ?",
    options: [
      "L’annulation de la purification",
      "La difficulté imposée aux parents",
      "La facilitation face à une situation fréquente",
      "La suppression des règles de pureté"
    ],
    correctIndex: 2,
    explain:
      "La Sharīʿa facilite ce qui est fréquent et difficile à éviter."
  },

  /* --- QUESTION OUVERTE 1 --- */
  {
    n: 25,
    q: "Quelle est la différence entre النضح (aspersion) et الغسل (lavage) ?",
    answer:
      "Le lavage implique l’écoulement de l’eau, tandis que l’aspersion consiste à verser de l’eau sans frotter ni faire couler abondamment.",
    explain:
      "Le hadith précise que le Prophète ﷺ a aspergé sans laver."
  },

  /* --- QUESTION OUVERTE 2 --- */
  {
    n: 25,
    q: "Pourquoi l’urine du nourrisson allaité bénéficie-t-elle d’un allègement ?",
    answer:
      "Parce qu’elle est très fréquente, difficile à éviter, et que l’enfant ne consomme que du lait.",
    explain:
      "C’est une manifestation de la facilité voulue par la Sharīʿa."
  },

  /* --- QUESTION OUVERTE 3 --- */
  {
    n: 25,
    q: "Quelle règle de fiqh peut-on tirer de ce hadith ?",
    answer:
      "La difficulté entraîne la facilité (المشقة تجلب التيسير).",
    explain:
      "Ce hadith est une application concrète de cette règle."
  },

  /* ----------------- HADITH 26 : بول الجارية ----------------- */
{
  n: 26,
  q: "Qui rapporte le hadith 26 concernant l’urine du nourrisson féminin ?",
  options: [
    "ʿAbd Allāh ibn ʿUmar",
    "Anas ibn Mālik",
    "ʿĀʾisha Umm al-Muʾminīn",
    "Abū Hurayra"
  ],
  correctIndex: 2,
  explain:
    "Le hadith est rapporté par ʿĀʾisha, la Mère des croyants (رضي الله عنها)."
},

{
  n: 26,
  q: "Qui fut amené au Prophète ﷺ dans ce hadith ?",
  options: [
    "Un garçon nourrisson",
    "Une fillette nourrisson",
    "Un enfant sevré",
    "Un adulte malade"
  ],
  correctIndex: 1,
  explain:
    "Le texte dit explicitement : « أُتِيَ بِصَبِيَّةٍ » — une petite fille."
},

{
  n: 26,
  q: "Que fit la fillette sur le vêtement du Prophète ﷺ ?",
  options: [
    "Elle vomit",
    "Elle renversa de l’eau",
    "Elle urina",
    "Elle pleura"
  ],
  correctIndex: 2,
  explain:
    "Le hadith précise : « فَبَالَتْ عَلَى ثَوْبِهِ » — elle urina sur son vêtement."
},

{
  n: 26,
  q: "Quelle action le Prophète ﷺ entreprit-il immédiatement après ?",
  options: [
    "Il lava entièrement le vêtement",
    "Il changea de vêtement",
    "Il versa de l’eau sur l’urine",
    "Il frotta le vêtement avec un tissu"
  ],
  correctIndex: 2,
  explain:
    "Le hadith dit : « فَدَعَا بِمَاءٍ فَأَتْبَعَهُ بَوْلَهَا »."
},

{
  n: 26,
  q: "Que signifie l’expression « فَأَتْبَعَهُ بَوْلَهَا » ?",
  options: [
    "Il aspergea légèrement",
    "Il versa de l’eau jusqu’à recouvrir l’urine",
    "Il essuya sans eau",
    "Il laissa sécher"
  ],
  correctIndex: 1,
  explain:
    "Cela signifie que l’eau a suivi et recouvert l’urine, ce qui correspond à un lavage sans frottement."
},

{
  n: 26,
  q: "Le Prophète ﷺ a-t-il frotté ou essoré le vêtement ?",
  options: [
    "Oui, fortement",
    "Oui, légèrement",
    "Non",
    "Le hadith ne le précise pas"
  ],
  correctIndex: 2,
  explain:
    "Le texte dit clairement : « وَلَمْ يَغْسِلْهُ » — il ne l’a pas frotté/lavé au sens du frottement."
},

{
  n: 26,
  q: "Quel est le statut juridique de l’urine du nourrisson féminin ?",
  options: [
    "Pure",
    "Tolérée",
    "Impure (najasa)",
    "Douteuse"
  ],
  correctIndex: 2,
  explain:
    "Les savants sont unanimes sur la نجاسة بول الجارية — l’impureté de son urine."
},

{
  n: 26,
  q: "Quelle est la méthode de purification requise pour l’urine de la fillette ?",
  options: [
    "Essuyage sec",
    "Aspersion légère (نضح)",
    "Lavage à l’eau (غسل)",
    "Aucune purification"
  ],
  correctIndex: 2,
  explain:
    "Contrairement au garçon nourrisson, l’urine de la fille nécessite un lavage."
},

{
  n: 26,
  q: "Pourquoi ce hadith est-il étudié avec le hadith 25 ?",
  options: [
    "Ils ont le même rapporteur",
    "Ils parlent tous deux de prière",
    "Ils comparent garçon et fille",
    "Ils sont faibles isolément"
  ],
  correctIndex: 2,
  explain:
    "Les deux hadiths montrent la distinction juridique entre بول الصبي et بول الجارية."
},

{
  n: 26,
  q: "Quelle école distingue explicitement entre urine du garçon et de la fille ?",
  options: [
    "Ḥanafite uniquement",
    "Shaféite et Hanbalite",
    "Mālikite uniquement",
    "Aucune"
  ],
  correctIndex: 1,
  explain:
    "Les shaféites et hanbalites appliquent clairement la distinction fondée sur les hadiths."
},

{
  n: 26,
  q: "Quelle est la sagesse principale tirée de ce hadith ?",
  options: [
    "Toute impureté se traite de la même manière",
    "La Sunna détaille précisément les règles",
    "Le sexe de l’enfant est sans importance",
    "Le lavage n’est jamais obligatoire"
  ],
  correctIndex: 1,
  explain:
    "La Sunna distingue avec précision et sagesse selon les situations."
},

/* ----------------- HADITH 27 : بول الأعرابي في المسجد ----------------- */
{
  n: 27,
  q: "Qui rapporte le hadith du bédouin qui urina dans la mosquée ?",
  options: [
    "ʿAbd Allāh ibn ʿUmar",
    "Anas ibn Mālik",
    "Abū Hurayra",
    "ʿĀʾisha"
  ],
  correctIndex: 1,
  explain:
    "Le hadith est rapporté par Anas ibn Mālik رضي الله عنه."
},

{
  n: 27,
  q: "Quel acte le bédouin accomplit-il dans la mosquée ?",
  options: [
    "Il mangea",
    "Il dormit",
    "Il urina",
    "Il parla fort"
  ],
  correctIndex: 2,
  explain:
    "Le texte dit explicitement : « فَبَالَ فِي طَائِفَةِ الْمَسْجِدِ »."
},

{
  n: 27,
  q: "Quelle fut la réaction immédiate des compagnons ?",
  options: [
    "Ils quittèrent la mosquée",
    "Ils l’ignorèrent",
    "Ils le réprimandèrent",
    "Ils appelèrent le Prophète ﷺ"
  ],
  correctIndex: 2,
  explain:
    "Le hadith mentionne : « فَزَجَرَهُ النَّاسُ » — ils le réprimandèrent."
},

{
  n: 27,
  q: "Quelle fut l’attitude du Prophète ﷺ face à leur réaction ?",
  options: [
    "Il approuva leur réprimande",
    "Il resta silencieux",
    "Il les empêcha",
    "Il quitta la mosquée"
  ],
  correctIndex: 2,
  explain:
    "Le Prophète ﷺ les empêcha : « فَنَهَاهُمُ النَّبِيُّ ﷺ »."
},

{
  n: 27,
  q: "Pourquoi le Prophète ﷺ empêcha-t-il les gens d’interrompre le bédouin ?",
  options: [
    "Par indulgence excessive",
    "Pour éviter une plus grande souillure",
    "Parce que l’urine n’est pas impure",
    "Parce que la mosquée n’était pas importante"
  ],
  correctIndex: 1,
  explain:
    "L’interrompre aurait dispersé l’urine et causé un préjudice plus grand."
},

{
  n: 27,
  q: "Que fit le Prophète ﷺ une fois que le bédouin eut terminé ?",
  options: [
    "Il ordonna de laver tout le sol",
    "Il fit creuser la terre",
    "Il fit verser un seau d’eau",
    "Il ferma la mosquée"
  ],
  correctIndex: 2,
  explain:
    "Le hadith dit : « أَمَرَ بِذَنُوبٍ مِنْ مَاءٍ فَأُهْرِيقَ عَلَيْهِ »."
},

{
  n: 27,
  q: "Que signifie le mot « ذَنُوب » dans le hadith ?",
  options: [
    "Une petite coupe",
    "Un chiffon",
    "Un grand seau",
    "Une pierre"
  ],
  correctIndex: 2,
  explain:
    "« ذَنُوب » désigne un grand seau d’eau."
},

{
  n: 27,
  q: "Quelle règle juridique principale est tirée de ce hadith ?",
  options: [
    "L’urine humaine est pure",
    "La mosquée peut être souillée",
    "L’urine humaine est impure et se purifie à l’eau",
    "Il faut toujours creuser la terre"
  ],
  correctIndex: 2,
  explain:
    "Il y a consensus sur la نجاسة بول الإنسان et sa purification par l’eau."
},

{
  n: 27,
  q: "Quelle méthode de purification est suffisante pour l’urine sur le sol ?",
  options: [
    "Essuyer avec un tissu",
    "Verser de l’eau jusqu’à disparition",
    "Laisser sécher uniquement",
    "Brûler la zone"
  ],
  correctIndex: 1,
  explain:
    "Verser de l’eau suffit sans creuser ni frotter."
},

{
  n: 27,
  q: "Ce hadith montre principalement quelle qualité du Prophète ﷺ ?",
  options: [
    "La sévérité",
    "La dureté",
    "La sagesse et la douceur",
    "L’indifférence"
  ],
  correctIndex: 2,
  explain:
    "Le Prophète ﷺ a allié pédagogie, sagesse et prévention du préjudice."
},

{
  n: 27,
  q: "Quelle leçon éducative générale est tirée de ce hadith ?",
  options: [
    "Punir immédiatement toute erreur",
    "Humilier l’ignorant",
    "Enseigner avec douceur et discernement",
    "Fermer les mosquées aux étrangers"
  ],
  correctIndex: 2,
  explain:
    "Le hadith est une base dans la pédagogie et la gestion des erreurs."
},

/* ----------------- HADITH 28 : سُنَنُ الفِطْرَة ----------------- */
{
  n: 28,
  q: "Qui rapporte le hadith des « cinq pratiques de la fitra » ?",
  options: [
    "Anas ibn Mālik",
    "ʿAbd Allāh ibn ʿUmar",
    "Abū Hurayra",
    "ʿĀʾisha"
  ],
  correctIndex: 2,
  explain:
    "Le hadith est rapporté par Abū Hurayra رضي الله عنه."
},

{
  n: 28,
  q: "Combien de pratiques de la fitra sont mentionnées dans ce hadith ?",
  options: [
    "Trois",
    "Quatre",
    "Cinq",
    "Dix"
  ],
  correctIndex: 2,
  explain:
    "Le Prophète ﷺ dit explicitement : « الفِطْرَةُ خَمْسٌ »."
},

{
  n: 28,
  q: "Laquelle des pratiques suivantes fait partie des cinq de la fitra ?",
  options: [
    "Le siwāk",
    "La circoncision",
    "Le lavage du vendredi",
    "La prière nocturne"
  ],
  correctIndex: 1,
  explain:
    "La circoncision (الخِتَان) est citée explicitement dans le hadith."
},

{
  n: 28,
  q: "Que signifie « الِاسْتِحْدَاد » dans le hadith ?",
  options: [
    "Se laver avec de l’eau",
    "Raser les cheveux",
    "Raser les poils pubiens",
    "Couper la moustache"
  ],
  correctIndex: 2,
  explain:
    "L’istihdād désigne le rasage des poils pubiens."
},

{
  n: 28,
  q: "Quelle pratique concerne spécifiquement la moustache ?",
  options: [
    "نتف الإبط",
    "تقليم الأظفار",
    "قص الشارب",
    "الختان"
  ],
  correctIndex: 2,
  explain:
    "« قص الشارب » signifie raccourcir la moustache."
},

{
  n: 28,
  q: "Quelle est la sagesse principale derrière les pratiques de la fitra ?",
  options: [
    "La difficulté et l’épreuve",
    "La conformité à la nature saine et la propreté",
    "La distinction sociale",
    "L’ascétisme excessif"
  ],
  correctIndex: 1,
  explain:
    "Les pratiques de la fitra sont conformes à la nature humaine et à la propreté."
},

{
  n: 28,
  q: "Quelle est la règle majoritaire concernant la circoncision chez l’homme ?",
  options: [
    "Elle est simplement permise",
    "Elle est déconseillée",
    "Elle est recommandée uniquement",
    "Elle est obligatoire"
  ],
  correctIndex: 3,
  explain:
    "La majorité des savants considèrent la circoncision obligatoire pour l’homme."
},

{
  n: 28,
  q: "Que signifie « نتف الإبط » ?",
  options: [
    "Couper les poils des jambes",
    "Raser la barbe",
    "Arracher les poils des aisselles",
    "Laver les aisselles"
  ],
  correctIndex: 2,
  explain:
    "« نتف الإبط » signifie l’épilation (arracher) des poils des aisselles."
},

{
  n: 28,
  q: "Quelle pratique vise principalement à empêcher l’accumulation d’impuretés ?",
  options: [
    "La taille de la moustache",
    "La coupe des ongles",
    "L’épilation des aisselles",
    "Toutes les réponses"
  ],
  correctIndex: 3,
  explain:
    "Toutes les pratiques contribuent à la propreté et à l’hygiène."
},

{
  n: 28,
  q: "Ces pratiques de la fitra sont-elles limitées à un contexte culturel particulier ?",
  options: [
    "Oui, uniquement aux Arabes",
    "Oui, uniquement aux bédouins",
    "Non, elles sont universelles",
    "Uniquement aux savants"
  ],
  correctIndex: 2,
  explain:
    "La fitra est universelle et conforme à la nature humaine."
},

{
  n: 28,
  q: "Dans quelle catégorie juridique entrent la majorité des pratiques de la fitra ?",
  options: [
    "Obligations",
    "Interdictions",
    "Sunan confirmées",
    "Actes déconseillés"
  ],
  correctIndex: 2,
  explain:
    "Elles sont considérées comme des sunan mu’akkada, sauf la circoncision selon divergence."
},

{
  n: 28,
  q: "Quelle leçon globale ce hadith enseigne-t-il ?",
  options: [
    "La séparation du corps et de la religion",
    "Le mépris de l’hygiène",
    "L’importance de la propreté physique et spirituelle",
    "L’isolement social"
  ],
  correctIndex: 2,
  explain:
    "L’islam relie la pureté du corps à la foi et à la spiritualité."
}
















];

/**
 * Petite fonction utilitaire si tu veux filtrer facilement
 * les questions d’un hadith particulier dans tes pages.
 */
// export function getQuestionsByHadith(number) {
//   return QUIZ_QUESTIONS_1_15.filter((q) => q.n === number);
// }
