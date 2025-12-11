import type { Database } from "./types";

// ==================== TIPOS PRINCIPAIS ====================
export type NotificationType =
  Database["public"]["Tables"]["notifications"]["Row"]["type"];
export type NotificationStatus =
  Database["public"]["Tables"]["notifications"]["Row"]["is_read"];
export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];

export type ProfileRole =
  Database["public"]["Tables"]["profiles"]["Row"]["role"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type NoticiaStatus =
  Database["public"]["Tables"]["noticias"]["Row"]["status"];
export type NoticiaRow = Database["public"]["Tables"]["noticias"]["Row"];
export type NoticiaInsert = Database["public"]["Tables"]["noticias"]["Insert"];
export type NoticiaUpdate = Database["public"]["Tables"]["noticias"]["Update"];

export type GaleriaCategoriaTipo =
  Database["public"]["Tables"]["galeria_categorias"]["Row"]["tipo"];
export type GaleriaCategoriaRow =
  Database["public"]["Tables"]["galeria_categorias"]["Row"];
export type GaleriaItemTipo =
  Database["public"]["Tables"]["galeria_itens"]["Row"]["tipo"];
export type GaleriaItemRow =
  Database["public"]["Tables"]["galeria_itens"]["Row"];

// ==================== TIPOS JSON ====================
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

// Função para converter Record para JsonValue
export function toJsonValue(data?: Record<string, unknown>): JsonValue | null {
  if (!data) return null;

  const convert = (obj: unknown): JsonValue => {
    if (obj === null || obj === undefined) return null;
    if (
      typeof obj === "string" ||
      typeof obj === "number" ||
      typeof obj === "boolean"
    ) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(convert);
    }
    if (typeof obj === "object") {
      const result: { [key: string]: JsonValue } = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = convert(value);
      }
      return result;
    }
    return String(obj);
  };

  return convert(data);
}

// ==================== INTERFACES PARA FRONTEND ====================
export interface UserProfile {
  id: string;
  matricula: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  graduacao?: string;
  validade_certificacao?: string;
  tipo_sanguineo?: string;
  status: boolean;
  role: "admin" | "agent";
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface GaleriaCategoria {
  id: string;
  nome: string;
  descricao?: string;
  slug: string;
  tipo: GaleriaCategoriaTipo;
  ordem: number;
  status: boolean;
  arquivada?: boolean;
  created_at: string;
  updated_at?: string;
  itens_count?: number;
}

export interface GaleriaItem {
  id: string;
  titulo: string;
  descricao?: string;
  categoria_id?: string | null;
  categoria?: GaleriaCategoria;
  tipo: GaleriaItemTipo;
  arquivo_url: string;
  thumbnail_url?: string;
  ordem: number;
  autor_id?: string;
  status: boolean;
  destaque: boolean;
  created_at: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  resumo: string;
  imagem: string | null;
  categoria: string;
  autor_id: string;
  destaque: boolean;
  data_publicacao: string;
  status: NoticiaStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  expires_at?: Date;
}

// ==================== PAGINAÇÃO ====================
export interface PaginatedResult<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ==================== FORMULÁRIOS ====================
export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data?: unknown;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// ==================== UTILITÁRIOS ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

// ==================== VALIDAÇÃO ====================
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ==================== EVENTOS REALTIME ====================
export interface RealtimeEvent<T = unknown> {
  type: "INSERT" | "UPDATE" | "DELETE";
  schema: string;
  table: string;
  data: T;
  timestamp: string;
}
