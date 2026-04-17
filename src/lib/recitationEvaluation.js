const RECITATION_BANDS = [
  { min: 85, max: 100, quality: 5, title: "Parfait", helper: "Validation parfaite a partir de 85%." },
  { min: 75, max: 84, quality: 4, title: "Fluide", helper: "Bonne recitation, encore quelques ajustements." },
  { min: 65, max: 74, quality: 3, title: "Hesitations", helper: "Le hadith revient, mais avec effort." },
  { min: 45, max: 64, quality: 2, title: "Apres regard", helper: "Tu dois encore t'appuyer sur le texte." },
  { min: 25, max: 44, quality: 1, title: "Tres difficile", helper: "Recitation encore instable." },
  { min: 0, max: 24, quality: 0, title: "Trou noir", helper: "Le hadith n'est pas encore retenu." },
];

const ARABIC_DIACRITICS_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const ARABIC_PUNCTUATION_REGEX = /[^\u0621-\u063A\u0641-\u064A\u0660-\u0669\u06F0-\u06F9\s]/g;

export function qualityFromRecitationPercent(percent) {
  return RECITATION_BANDS.find(band => percent >= band.min)?.quality ?? 0;
}

export function getRecitationBand(quality) {
  return RECITATION_BANDS.find(band => band.quality === quality) || RECITATION_BANDS[RECITATION_BANDS.length - 1];
}

export function normalizeArabicText(text = "") {
  return text
    .normalize("NFKC")
    .replace(ARABIC_DIACRITICS_REGEX, "")
    .replace(/[ـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/[ى]/g, "ي")
    .replace(/[ة]/g, "ه")
    .replace(/[ء]/g, "")
    .replace(ARABIC_PUNCTUATION_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeArabicText(text = "") {
  const normalized = normalizeArabicText(text);
  return normalized ? normalized.split(" ") : [];
}

function buildLcsMatrix(expectedTokens, spokenTokens) {
  const matrix = Array.from({ length: expectedTokens.length + 1 }, () =>
    Array(spokenTokens.length + 1).fill(0)
  );

  for (let i = 1; i <= expectedTokens.length; i += 1) {
    for (let j = 1; j <= spokenTokens.length; j += 1) {
      if (expectedTokens[i - 1] === spokenTokens[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  return matrix;
}

function diffArabicTokens(expectedTokens, spokenTokens) {
  const matrix = buildLcsMatrix(expectedTokens, spokenTokens);
  const matchedWords = [];
  const missedWords = [];
  const extraWords = [];
  let i = expectedTokens.length;
  let j = spokenTokens.length;

  while (i > 0 && j > 0) {
    if (expectedTokens[i - 1] === spokenTokens[j - 1]) {
      matchedWords.unshift(expectedTokens[i - 1]);
      i -= 1;
      j -= 1;
    } else if (matrix[i - 1][j] >= matrix[i][j - 1]) {
      missedWords.unshift(expectedTokens[i - 1]);
      i -= 1;
    } else {
      extraWords.unshift(spokenTokens[j - 1]);
      j -= 1;
    }
  }

  while (i > 0) {
    missedWords.unshift(expectedTokens[i - 1]);
    i -= 1;
  }

  while (j > 0) {
    extraWords.unshift(spokenTokens[j - 1]);
    j -= 1;
  }

  return { matchedWords, missedWords, extraWords };
}

export function evaluateRecitation(expectedText = "", spokenText = "") {
  const normalizedExpected = normalizeArabicText(expectedText);
  const normalizedSpoken = normalizeArabicText(spokenText);
  const expectedTokens = tokenizeArabicText(expectedText);
  const spokenTokens = tokenizeArabicText(spokenText);
  const { matchedWords, missedWords, extraWords } = diffArabicTokens(expectedTokens, spokenTokens);
  const percent = expectedTokens.length
    ? Math.round((matchedWords.length / expectedTokens.length) * 100)
    : 0;
  const quality = qualityFromRecitationPercent(percent);

  return {
    percent,
    quality,
    matchedWords,
    missedWords,
    extraWords,
    normalizedExpected,
    normalizedSpoken,
  };
}

export { RECITATION_BANDS };
