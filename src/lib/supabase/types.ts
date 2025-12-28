import { UserRole, Json } from "@/lib/types/shared";
import { User as SupabaseUser } from "@supabase/supabase-js";

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
          }
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
          }
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
          }
        ];
      };

      noticias: {
        Row: {
          id: string;
          titulo: string;
          slug: string;
          conteudo: string;
          resumo: string | null;
          imagem: string | null;
          categoria: string | null;
          autor_id: string | null;
          destaque: boolean;
          data_publicacao: string;
          status: "rascunho" | "publicado" | "arquivado";
          created_at: string;
          updated_at: string;
          views: number;
        };
        Insert: {
          id?: string;
          titulo: string;
          slug: string;
          conteudo: string;
          resumo?: string | null;
          imagem?: string | null;
          categoria?: string | null;
          autor_id?: string | null;
          destaque?: boolean;
          data_publicacao?: string;
          status?: "rascunho" | "publicado" | "arquivado";
          created_at?: string;
          updated_at?: string;
          views?: number;
        };
        Update: {
          id?: string;
          titulo?: string;
          slug?: string;
          conteudo?: string;
          resumo?: string | null;
          imagem?: string | null;
          categoria?: string | null;
          autor_id?: string | null;
          destaque?: boolean;
          data_publicacao?: string;
          status?: "rascunho" | "publicado" | "arquivado";
          created_at?: string;
          updated_at?: string;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "noticias_autor_id_fkey";
            columns: ["autor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
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
          }
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
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // ✅ ADICIONE ESTA FUNÇÃO
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

// Tipos de uso comum
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

// Helper para converter Record<string, unknown> para Json
export function toJson(data?: Record<string, unknown>): Json | null {
  if (!data) return null;
  try {
    return JSON.parse(JSON.stringify(data)) as Json;
  } catch {
    return data as Json;
  }
}

export type User = SupabaseUser;
