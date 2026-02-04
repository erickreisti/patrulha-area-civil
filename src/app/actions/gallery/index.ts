// src/app/actions/gallery/index.ts

// ==========================================
// 1. SHARED & UTILS
// ==========================================
export {
  verifyAdminSession,
  logActivity,
  toJson,
  generateSlug,
  validateSlug,
} from "./shared";

// ==========================================
// 2. TYPES & SCHEMAS
// ==========================================
export type {
  // Input types
  CreateCategoriaInput,
  UpdateCategoriaInput,
  CreateItemInput,
  UpdateItemInput,

  // Entity types
  Categoria,
  Item,
  ItemGaleria,

  // Filter types
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

// ==========================================
// 3. CATEGORIAS (Actions)
// ==========================================
export {
  // Admin / CRUD
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getCategoriasAdmin,
  getCategoriaById,
  toggleCategoriaStatus,
  generateAvailableSlug,

  // Público / Leitura
  getPublicCategorias, // ✅ Essencial para a Home/Filtros
  getCategoriaPorSlug,
} from "./categorias";

// ==========================================
// 4. ITENS / FOTOS / VÍDEOS (Actions)
// ==========================================
export {
  // Admin / CRUD
  createItem,
  updateItem,
  deleteItem,
  getItensAdmin,
  getItemById,
  toggleItemStatus,
  toggleItemDestaque,

  // Público / Leitura
  getPublicItens, // ✅ Essencial para a Galeria Pública
  getItensPorCategoria,
} from "./itens";

// ==========================================
// 5. ESTATÍSTICAS
// ==========================================
export { getGaleriaStats } from "./stats";
