// Exportamos apenas os tipos do arquivo types.ts para evitar duplicação
export * from "./get";

// Re-exportamos as funções do get.ts
export {
  getNews,
  getHomeNews,
  getNewsBySlug,
  getNewsByCategory,
  getLatestNews,
  getNewsStats,
} from "./get";

// Exportamos os tipos das funções
export type {
  GetNewsOptions,
  NewsResponse,
  NewsDetailResponse,
  NewsStatsResponse,
} from "./get";
