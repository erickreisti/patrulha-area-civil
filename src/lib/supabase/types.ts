// src/lib/supabase/types.ts - VERSÃO COMPLETA CORRIGIDA
import { UserRole, Json } from "@/lib/types/shared";
import { User as SupabaseUser } from "@supabase/supabase-js";
export type { Json };

/**
 * Tipos do banco de dados Supabase
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          matricula: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          graduacao: string | null;
          validade_certificacao: string | null;
          tipo_sanguineo: string | null;
          status: boolean;
          role: UserRole;
          created_at: string;
          updated_at: string;
          uf: string | null;
          data_nascimento: string | null;
          telefone: string | null;
          admin_secret_hash: string | null;
          admin_secret_salt: string | null;
          admin_2fa_enabled: boolean;
          admin_last_auth: string | null;
        };
        Insert: {
          id?: string;
          matricula: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          status?: boolean;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
          uf?: string | null;
          data_nascimento?: string | null;
          telefone?: string | null;
          admin_secret_hash?: string | null;
          admin_secret_salt?: string | null;
          admin_2fa_enabled?: boolean;
          admin_last_auth?: string | null;
        };
        Update: {
          id?: string;
          matricula?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          status?: boolean;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
          uf?: string | null;
          data_nascimento?: string | null;
          telefone?: string | null;
          admin_secret_hash?: string | null;
          admin_secret_salt?: string | null;
          admin_2fa_enabled?: boolean;
          admin_last_auth?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type:
            | "system"
            | "user_created"
            | "news_published"
            | "gallery_upload"
            | "warning"
            | "info";
          title: string;
          message: string;
          action_url: string | null;
          is_read: boolean;
          metadata: Json | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type:
            | "system"
            | "user_created"
            | "news_published"
            | "gallery_upload"
            | "warning"
            | "info";
          title: string;
          message: string;
          action_url?: string | null;
          is_read?: boolean;
          metadata?: Json | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?:
            | "system"
            | "user_created"
            | "news_published"
            | "gallery_upload"
            | "warning"
            | "info";
          title?: string;
          message?: string;
          action_url?: string | null;
          is_read?: boolean;
          metadata?: Json | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      system_activities: {
        Row: {
          id: string;
          user_id: string | null;
          action_type: string;
          description: string;
          resource_type: string | null;
          resource_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action_type: string;
          description: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action_type?: string;
          description?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "system_activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      noticias: {
        Row: {
          id: string;
          titulo: string;
          slug: string;
          conteudo: string;
          resumo: string | null;
          media_url: string | null; // ✅ CORRIGIDO: de "imagem" para "media_url"
          categoria: string | null;
          autor_id: string | null;
          destaque: boolean;
          data_publicacao: string;
          status: "rascunho" | "publicado" | "arquivado";
          created_at: string;
          updated_at: string;
          views: number;
          video_url: string | null; // ✅ ADICIONADO: campo específico para vídeo
          thumbnail_url: string | null; // ✅ ADICIONADO: thumbnail para vídeo
          tipo_media: "imagem" | "video"; // ✅ ADICIONADO: tipo da mídia
          duracao_video: number | null; // ✅ ADICIONADO: duração em segundos
        };
        Insert: {
          id?: string;
          titulo: string;
          slug: string;
          conteudo: string;
          resumo?: string | null;
          media_url?: string | null;
          categoria?: string | null;
          autor_id?: string | null;
          destaque?: boolean;
          data_publicacao?: string;
          status?: "rascunho" | "publicado" | "arquivado";
          created_at?: string;
          updated_at?: string;
          views?: number;
          video_url?: string | null;
          thumbnail_url?: string | null;
          tipo_media?: "imagem" | "video";
          duracao_video?: number | null;
        };
        Update: {
          id?: string;
          titulo?: string;
          slug?: string;
          conteudo?: string;
          resumo?: string | null;
          media_url?: string | null;
          categoria?: string | null;
          autor_id?: string | null;
          destaque?: boolean;
          data_publicacao?: string;
          status?: "rascunho" | "publicado" | "arquivado";
          created_at?: string;
          updated_at?: string;
          views?: number;
          video_url?: string | null;
          thumbnail_url?: string | null;
          tipo_media?: "imagem" | "video";
          duracao_video?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "noticias_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      galeria_categorias: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          descricao: string | null;
          tipo: "fotos" | "videos";
          ordem: number;
          status: boolean;
          created_at: string;
          updated_at: string;
          arquivada: boolean;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          descricao?: string | null;
          tipo?: "fotos" | "videos";
          ordem?: number;
          status?: boolean;
          created_at?: string;
          updated_at?: string;
          arquivada?: boolean;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          descricao?: string | null;
          tipo?: "fotos" | "videos";
          ordem?: number;
          status?: boolean;
          created_at?: string;
          updated_at?: string;
          arquivada?: boolean;
        };
        Relationships: [];
      };

      galeria_itens: {
        Row: {
          id: string;
          categoria_id: string | null;
          titulo: string;
          descricao: string | null;
          arquivo_url: string;
          tipo: "foto" | "video";
          thumbnail_url: string | null;
          ordem: number;
          autor_id: string | null;
          status: boolean;
          created_at: string;
          destaque: boolean;
          views: number;
        };
        Insert: {
          id?: string;
          categoria_id?: string | null;
          titulo: string;
          descricao?: string | null;
          arquivo_url: string;
          tipo?: "foto" | "video";
          thumbnail_url?: string | null;
          ordem?: number;
          autor_id?: string | null;
          status?: boolean;
          created_at?: string;
          destaque?: boolean;
          views?: number;
        };
        Update: {
          id?: string;
          categoria_id?: string | null;
          titulo?: string;
          descricao?: string | null;
          arquivo_url?: string;
          tipo?: "foto" | "video";
          thumbnail_url?: string | null;
          ordem?: number;
          autor_id?: string | null;
          status?: boolean;
          created_at?: string;
          destaque?: boolean;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "galeria_itens_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "galeria_categorias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "galeria_itens_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      profiles_history: {
        Row: {
          history_id: string;
          profile_id: string;
          matricula: string;
          email: string;
          full_name: string | null;
          uf: string | null;
          avatar_url: string | null;
          graduacao: string | null;
          validade_certificacao: string | null;
          tipo_sanguineo: string | null;
          data_nascimento: string | null;
          telefone: string | null;
          status: boolean | null;
          role: string | null;
          action_type: string;
          changed_at: string;
          changed_by: string | null;
          old_data: Json | null;
          new_data: Json | null;
        };
        Insert: {
          history_id?: string;
          profile_id: string;
          matricula: string;
          email: string;
          full_name?: string | null;
          uf?: string | null;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          data_nascimento?: string | null;
          telefone?: string | null;
          status?: boolean | null;
          role?: string | null;
          action_type: string;
          changed_at?: string;
          changed_by?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
        };
        Update: {
          history_id?: string;
          profile_id?: string;
          matricula?: string;
          email?: string;
          full_name?: string | null;
          uf?: string | null;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          data_nascimento?: string | null;
          telefone?: string | null;
          status?: boolean | null;
          role?: string | null;
          action_type?: string;
          changed_at?: string;
          changed_by?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_history_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ==================== TIPOS BASE DO BANCO ====================

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];

export type SystemActivity =
  Database["public"]["Tables"]["system_activities"]["Row"];
export type SystemActivityInsert =
  Database["public"]["Tables"]["system_activities"]["Insert"];
export type SystemActivityUpdate =
  Database["public"]["Tables"]["system_activities"]["Update"];

export type Noticia = Database["public"]["Tables"]["noticias"]["Row"];
export type NoticiaInsert = Database["public"]["Tables"]["noticias"]["Insert"];
export type NoticiaUpdate = Database["public"]["Tables"]["noticias"]["Update"];

export type GaleriaCategoria =
  Database["public"]["Tables"]["galeria_categorias"]["Row"];
export type GaleriaCategoriaInsert =
  Database["public"]["Tables"]["galeria_categorias"]["Insert"];
export type GaleriaCategoriaUpdate =
  Database["public"]["Tables"]["galeria_categorias"]["Update"];

export type GaleriaItem = Database["public"]["Tables"]["galeria_itens"]["Row"];
export type GaleriaItemInsert =
  Database["public"]["Tables"]["galeria_itens"]["Insert"];
export type GaleriaItemUpdate =
  Database["public"]["Tables"]["galeria_itens"]["Update"];

export type ProfilesHistory =
  Database["public"]["Tables"]["profiles_history"]["Row"];
export type ProfilesHistoryInsert =
  Database["public"]["Tables"]["profiles_history"]["Insert"];
export type ProfilesHistoryUpdate =
  Database["public"]["Tables"]["profiles_history"]["Update"];

export type User = SupabaseUser;

// ==================== TIPOS ESTENDIDOS ====================

export interface NoticiaCompleta extends Noticia {
  profiles?: Profile | null;
}

export interface GaleriaCategoriaComItens extends GaleriaCategoria {
  itens_count?: number;
  itens?: GaleriaItemComCategoria[];
}

export interface GaleriaItemComCategoria extends GaleriaItem {
  galeria_categorias?: GaleriaCategoria | null;
  profiles?: Profile | null; // Autor da mídia
}

// ==================== TIPOS PARA NOTÍCIAS ====================

export interface NoticiaFormData {
  titulo: string;
  slug: string;
  conteudo: string;
  resumo: string;
  media_url: string;
  categoria: string;
  destaque: boolean;
  data_publicacao: string;
  status: "rascunho" | "publicado" | "arquivado";
  video_url?: string;
  thumbnail_url?: string;
  tipo_media: "imagem" | "video";
  duracao_video?: number;
}

export interface NoticiaUploadData {
  media_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  tipo_media: "imagem" | "video";
  duracao_video?: number;
}

// ==================== TIPOS PARA FILTROS ====================

export type TipoCategoriaFilter = "all" | "fotos" | "videos";
export type TipoItemFilter = "all" | "foto" | "video";
export type TipoNoticiaFilter = "all" | "imagem" | "video";
export type StatusFilter = "all" | "ativo" | "inativo";
export type StatusNoticiaFilter =
  | "all"
  | "rascunho"
  | "publicado"
  | "arquivado";
export type DestaqueFilter = "all" | boolean;

// ==================== TIPOS PARA FORMULÁRIOS ====================

export interface FormDataCategoria {
  nome: string;
  slug: string;
  descricao: string;
  tipo: "fotos" | "videos";
  status: boolean;
  ordem: number;
}

export interface FormDataItem {
  titulo: string;
  descricao: string;
  categoria_id: string | null;
  arquivo_url: string;
  thumbnail_url: string | null;
  tipo: "foto" | "video";
  ordem: number;
  status: boolean;
  destaque: boolean;
}

// ==================== TIPOS PARA PAGINAÇÃO ====================

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
  pagination?: PaginationData;
}

// ==================== TIPOS PARA ESTATÍSTICAS ====================

export interface EstatisticasGaleria {
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

export interface EstatisticasNoticias {
  total: number;
  publicadas: number;
  rascunhos: number;
  arquivadas: number;
  com_destaque: number;
  imagens: number;
  videos: number;
  views_total: number;
  por_categoria: Record<string, number>;
}

export interface EstatisticasAgentes {
  total: number;
  ativos: number;
  inativos: number;
  admins: number;
  agentes: number;
  por_uf: Record<string, number>;
}

// ✅ TIPO PARA O STORE DE GALERIA
export type EstatisticasStore = {
  total: number;
  fotos: number;
  videos: number;
  ativos: number;
  inativos: number;
  comDestaque: number;
};

// ==================== TIPOS PARA UPLOAD ====================

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration?: number; // Para vídeos
  thumbnailUrl?: string; // Para vídeos
}

export type MediaType = "image" | "video";

// ==================== TIPOS PARA SESSÃO ADMIN ====================

export interface AdminSessionData {
  userId: string;
  userEmail: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
}

// ==================== TIPOS PARA DASHBOARD ====================

export interface DashboardStats {
  summary: {
    agents: {
      total: number;
      active: number;
      inactive: number;
      admins: number;
      regular: number;
    };
    news: {
      total: number;
      published: number;
      draft: number;
      archived: number;
      featured: number;
      images: number;
      videos: number;
    };
    gallery: {
      total_categories: number;
      total_items: number;
      photos: number;
      videos: number;
      active_categories: number;
      featured_items: number;
    };
    system: {
      totalActivities: number;
      recentActivities: number;
      activeUsers: number;
      totalStorage: number;
    };
  };
  recentActivities: Array<{
    id: string;
    action_type: string;
    description: string;
    created_at: string;
    user_name: string | null;
  }>;
  calculations: {
    activePercentage: number;
    adminPercentage: number;
    publishedPercentage: number;
    featuredPercentage: number;
    galleryActivePercentage: number;
  };
}

// ==================== UTILITÁRIOS ====================

export function toJson(data?: Record<string, unknown>): Json | null {
  if (!data) return null;
  try {
    return JSON.parse(JSON.stringify(data)) as Json;
  } catch {
    return data as Json;
  }
}

// ==================== TIPOS PARA OPERAÇÕES DE STORAGE ====================

export interface StorageUploadConfig {
  bucket: string;
  maxSize: number;
  allowedTypes: string[];
  path: (identifier: string) => string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// ==================== TIPOS PARA NOTIFICAÇÕES ====================

export interface NotificationData {
  user_id?: string | null;
  type:
    | "system"
    | "user_created"
    | "news_published"
    | "gallery_upload"
    | "warning"
    | "info";
  title: string;
  message: string;
  action_url?: string;
  metadata?: Json;
}

// ==================== TIPOS PARA ATIVIDADES DO SISTEMA ====================

export interface SystemActivityData {
  user_id?: string | null;
  action_type: string;
  description: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Json;
}

// ==================== EXPORT COMPLETO ====================

export type {
  Database as SupabaseDatabase,
  Profile as SupabaseProfile,
  Notification as SupabaseNotification,
  SystemActivity as SupabaseSystemActivity,
  Noticia as SupabaseNoticia,
  GaleriaCategoria as SupabaseGaleriaCategoria,
  GaleriaItem as SupabaseGaleriaItem,
};

export * from "./types";
