// /src/data/narrators_mock.js

export const NARRATORS_MOCK = [
  {
    id: 1,
    slug: "abu-hurayra",
    name_ar: "أبو هريرة رضي الله عنه",
    name_fr: "Abû Hurayra",
    kunya: "Abû Hurayra",
    generation: "Compagnon",
    death_year_h: 59,
    region: "Médine",
    rarity: "legendary",
    short_bio:
      "Compagnon célèbre du Prophète ﷺ, connu pour avoir rapporté le plus grand nombre de hadiths authentiques. Il a consacré sa vie à la mémorisation et à la transmission.",
    key_anecdote:
      "Il disait : « Rien ne m’a empêché d’écrire les hadiths du Messager d’Allah ﷺ, si ce n’est certains compagnons qui écrivaient peu par crainte de se mélanger avec le Coran. »",
    isUnlocked: true, // 🔓 simulé : déjà débloqué
    stats: {
      learned: 3,
      total: 7,
    },
  },
  {
    id: 2,
    slug: "aisha",
    name_ar: "عائشة أم المؤمنين رضي الله عنها",
    name_fr: "‘Â’isha (Mère des croyants)",
    kunya: "Umm al-Mu’minîn",
    generation: "Compagnon",
    death_year_h: 58,
    region: "Médine",
    rarity: "legendary",
    short_bio:
      "Épouse du Prophète ﷺ et grande savante de l’islam. Référence majeure en fiqh, en hadith et en comportement du Prophète ﷺ.",
    key_anecdote:
      "Les compagnons venaient la questionner sur les détails de la vie du Prophète ﷺ et disaient : « Nous n’avons jamais vu quelqu’un plus connaisseur que ‘Â’isha. »",
    isUnlocked: true,
    stats: {
      learned: 2,
      total: 5,
    },
  },
  {
    id: 3,
    slug: "ibn-abbas",
    name_ar: "عبد الله بن عباس رضي الله عنهما",
    name_fr: "Ibn ‘Abbâs",
    kunya: "Abû al-‘Abbâs",
    generation: "Compagnon",
    death_year_h: 68,
    region: "Ta’if / La Mecque",
    rarity: "rare",
    short_bio:
      "Cousin du Prophète ﷺ, surnommé « le traducteur du Coran ». Référence en tafsîr et en compréhension des versets.",
    key_anecdote:
      "Le Prophète ﷺ a invoqué pour lui : « Ô Allah, enseigne-lui la sagesse et l’interprétation du Livre. »",
    isUnlocked: false, // 🔒 simulé : pas encore débloqué
    stats: {
      learned: 0,
      total: 4,
    },
  },
  {
    id: 4,
    slug: "anas",
    name_ar: "أنس بن مالك رضي الله عنه",
    name_fr: "Anas ibn Mâlik",
    kunya: "Abû Hamza",
    generation: "Compagnon",
    death_year_h: 93,
    region: "Basra",
    rarity: "common",
    short_bio:
      "Serviteur du Prophète ﷺ durant une dizaine d’années. Il a transmis de nombreux détails sur sa douceur et son comportement.",
    key_anecdote:
      "Il disait : « Je l’ai servi dix ans, jamais il ne m’a dit pour quelque chose que j’ai fait : ‘Pourquoi l’as-tu fait ?’ »",
    isUnlocked: false,
    stats: {
      learned: 0,
      total: 3,
    },
  },
];
