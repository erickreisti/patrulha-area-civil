// src/app/actions/gallery/index.ts

// Re-exportar tudo de forma organizada

// Shared functions
export {
  verifyAdminSession,
  logActivity,
  toJson,
  generateSlug,
  validateSlug,
} from "./shared";

// Types - Re-exportar todos os tipos
export type {
  // Input types
  CreateCategoriaInput,
  UpdateCategoriaInput,
  CreateItemInput,
  UpdateItemInput,

  // Entity types
  Categoria,
  Item,
  ItemGaleria, // Agora existe em ./types

  // Filter types - Agora existem em ./types
  TipoCategoriaFilter,
  TipoItemFilter,
  StatusFilter,
  DestaqueFilter,
  ArquivedFilter,

  // Response types
  PaginationData,
  ApiResponse,
  CategoriasListResponse,
  ItensListResponse,
  GaleriaStats,
} from "./types";

// Categorias
export {
  createCategoria,
  getCategoriaById, // Agora existe em ./categorias
  updateCategoria,
  deleteCategoria,
  getCategoriasAdmin,
  toggleCategoriaStatus,
  getCategoriaPorSlug,
  generateAvailableSlug,
} from "./categorias";

// Itens
export {
  createItem,
  getItemById, // Agora existe em ./itens
  updateItem,
  deleteItem,
  getItensAdmin,
  toggleItemStatus,
  toggleItemDestaque,
  getItensPorCategoria, // Agora existe em ./itens
} from "./itens";

// Stats
export { getGaleriaStats } from "./stats";

// Schemas
export {
  CategoriaSchema,
  CreateCategoriaSchema,
  UpdateCategoriaSchema,
  ItemSchema,
  CreateItemSchema,
  UpdateItemSchema,
  ListCategoriasSchema,
  ListItensSchema,
} from "./types";
