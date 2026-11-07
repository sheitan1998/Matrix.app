/** YouTube Data API category IDs keyed by the app's video category slugs. */
export const YOUTUBE_CATEGORY_IDS = {
  music: "10",
  gaming: "20",
  education: "27",
  entertainment: "24",
  sports: "17",
  news: "25",
  tech: "28",
  lifestyle: "26",
  comedy: "23",
};

/** Fallback search keywords so a category never stays empty. */
export const YOUTUBE_CATEGORY_QUERIES = {
  music: "musique",
  gaming: "gaming",
  education: "éducation documentaire",
  entertainment: "divertissement",
  sports: "sport",
  news: "actualités",
  tech: "technologie",
  comedy: "humour",
  lifestyle: "lifestyle",
};

export function youtubeCategoryId(slug) {
  return YOUTUBE_CATEGORY_IDS[slug] || null;
}