import { z } from "zod";
import type { GaleriaCategoria, GaleriaItem } from "@/lib/supabase/types";

// ============================================
// SCHEMAS ZOD
// ============================================

// --- Categorias ---
export const CategoriaSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome não pode ter mais de 100 caracteres"),
  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(100, "Slug não pode ter mais de 100 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    ),
  descricao: z
    .string()
    .max(500, "Descrição não pode ter mais de 500 caracteres")
    .optional()
    .nullable(),
  tipo: z.enum(["fotos", "videos"]),
  status: z.boolean().default(true),
  ordem: z.number().min(0).max(999).default(0),
  arquivada: z.boolean().optional().default(false),
});

export const CreateCategoriaSchema = CategoriaSchema.pick({
  nome: true,
  slug: true,
  descricao: true,
  tipo: true,
  status: true,
  ordem: true,
  arquivada: true,
});

export const UpdateCategoriaSchema = CategoriaSchema.partial().extend({
  id: z.string().uuid("ID inválido").optional(), // ID opcional no input do form, obrigatório na action
});

export const ListCategoriasSchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(["all", "fotos", "videos"]).default("all"),
  status: z.enum(["all", "ativo", "inativo"]).default("all"),
  arquivada: z.enum(["all", "true", "false"]).default("all"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
});

// --- Itens ---
export const ItemSchema = z.object({
  titulo: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título não pode ter mais de 200 caracteres"),
  descricao: z
    .string()
    .max(1000, "Descrição não pode ter mais de 1000 caracteres")
    .optional()
    .nullable(),
  categoria_id: z.string().uuid("ID de categoria inválido").nullable(),
  arquivo_url: z.string().url("URL do arquivo inválida"),
  tipo: z.enum(["foto", "video"]),
  thumbnail_url: z
    .string()
    .url("URL da thumbnail inválida")
    .optional()
    .nullable(),
  ordem: z.number().min(0).max(999).default(0),
  status: z.boolean().default(true),
  destaque: z.boolean().default(false),
});

export const CreateItemSchema = ItemSchema;

export const UpdateItemSchema = ItemSchema.partial().extend({
  id: z.string().uuid("ID inválido").optional(),
});

export const ListItensSchema = z.object({
  search: z.string().optional(),
  categoria_id: z.string().or(z.literal("all")).default("all"),
  tipo: z.enum(["all", "foto", "video"]).default("all"),
  status: z.enum(["all", "ativo", "inativo"]).default("all"),
  destaque: z.enum(["all", "true", "false"]).default("all"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
  sortBy: z.enum(["ordem", "created_at"]).default("ordem"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

export type CreateCategoriaInput = z.infer<typeof CreateCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof UpdateCategoriaSchema>;
export type CreateItemInput = z.infer<typeof CreateItemSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;

// --- Tipos de Entidade Estendidos ---

export type Categoria = GaleriaCategoria & {
  itens_count?: number;
};

// Item com join da categoria
export type Item = GaleriaItem & {
  galeria_categorias?: {
    id: string;
    nome: string;
    slug: string; // Adicionado slug, geralmente útil no front
    tipo: string;
  } | null;
};

// Alias para consistência com outros arquivos
export type ItemGaleria = Item;

// Filtros
export type TipoCategoriaFilter = "all" | "fotos" | "videos";
export type TipoItemFilter = "all" | "foto" | "video";
export type StatusFilter = "all" | "ativo" | "inativo";
export type DestaqueFilter = "all" | "true" | "false";
export type ArquivedFilter = "all" | "true" | "false";

// Respostas de API
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationData;
}

export type CategoriasListResponse = ApiResponse<Categoria[]>;
export type ItensListResponse = ApiResponse<Item[]>;

export interface GaleriaStats {
  total_categorias: number;
  total_itens: number;
  total_fotos: number;
  total_videos: number;
  itens_destaque: number;
  categorias_ativas: number;
  itens_ativos: number;
  categorias_por_tipo: {
    fotos: number;
    videos: number;
  };
}

export interface CategoriaShowcase extends GaleriaCategoria {
  itens_count: number;
  capa_url: string | null;
  tem_destaque?: boolean;
}
