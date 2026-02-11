export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      galeria_categorias: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          descricao: string | null;
          // ADICIONADO: Necessário para a lógica de capa dos álbuns
          capa_url: string | null;
          tipo: "fotos" | "videos";
          ordem: number;
          status: boolean;
          arquivada: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          descricao?: string | null;
          // ADICIONADO
          capa_url?: string | null;
          tipo?: "fotos" | "videos";
          ordem?: number;
          status?: boolean;
          arquivada?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          slug?: string;
          descricao?: string | null;
          // ADICIONADO
          capa_url?: string | null;
          tipo?: "fotos" | "videos";
          ordem?: number;
          status?: boolean;
          arquivada?: boolean;
          created_at?: string;
          updated_at?: string;
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
          destaque: boolean;
          views: number;
          created_at: string;
          updated_at: string;
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
          destaque?: boolean;
          views?: number;
          created_at?: string;
          updated_at?: string;
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
          destaque?: boolean;
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "galeria_itens_categoria_id_fkey";
            columns: ["categoria_id"];
            referencedRelation: "galeria_categorias";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "galeria_itens_autor_id_fkey";
            columns: ["autor_id"];
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
          media_url: string | null;
          video_url: string | null;
          thumbnail_url: string | null;
          tipo_media: "imagem" | "video";
          duracao_video: number | null;
          categoria: string | null;
          autor_id: string | null;
          destaque: boolean;
          data_publicacao: string;
          status: "rascunho" | "publicado" | "arquivado";
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          slug: string;
          conteudo: string;
          resumo?: string | null;
          media_url?: string | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          tipo_media?: "imagem" | "video";
          duracao_video?: number | null;
          categoria?: string | null;
          autor_id?: string | null;
          destaque?: boolean;
          data_publicacao?: string;
          status?: "rascunho" | "publicado" | "arquivado";
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          slug?: string;
          conteudo?: string;
          resumo?: string | null;
          media_url?: string | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          tipo_media?: "imagem" | "video";
          duracao_video?: number | null;
          categoria?: string | null;
          autor_id?: string | null;
          destaque?: boolean;
          data_publicacao?: string;
          status?: "rascunho" | "publicado" | "arquivado";
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "noticias_autor_id_fkey";
            columns: ["autor_id"];
            referencedRelation: "profiles";
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
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "agent";
          full_name: string | null;
          matricula: string;
          avatar_url: string | null;
          graduacao: string | null;
          validade_certificacao: string | null;
          tipo_sanguineo: string | null;
          status: boolean;
          unidade: string | null;
          uf: string | null;
          data_nascimento: string | null;
          telefone: string | null;
          admin_secret_hash: string | null;
          admin_secret_salt: string | null;
          admin_2fa_enabled: boolean;
          admin_last_auth: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "agent";
          full_name?: string | null;
          matricula: string;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          status?: boolean;
          unidade?: string | null;
          uf?: string | null;
          data_nascimento?: string | null;
          telefone?: string | null;
          admin_secret_hash?: string | null;
          admin_secret_salt?: string | null;
          admin_2fa_enabled?: boolean;
          admin_last_auth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "agent";
          full_name?: string | null;
          matricula?: string;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          status?: boolean;
          unidade?: string | null;
          uf?: string | null;
          data_nascimento?: string | null;
          telefone?: string | null;
          admin_secret_hash?: string | null;
          admin_secret_salt?: string | null;
          admin_2fa_enabled?: boolean;
          admin_last_auth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          action_type: "INSERT" | "UPDATE" | "DELETE";
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
          action_type: "INSERT" | "UPDATE" | "DELETE";
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
          action_type?: "INSERT" | "UPDATE" | "DELETE";
          changed_at?: string;
          changed_by?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_history_changed_by_fkey";
            columns: ["changed_by"];
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
  };
}

// ============================================
// HELPERS DE TIPAGEM (Essenciais para o Supabase)
// ============================================

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// ============================================
// TIPOS EXPORTADOS ESPECÍFICOS (Resolvem seus erros de import)
// ============================================

// Aqui estendemos GaleriaItem para incluir a relação inversa (opcional, mas bom se você fizer join)
export type GaleriaItem = Tables<"galeria_itens">;
export type GaleriaItemInsert = TablesInsert<"galeria_itens">;
export type GaleriaItemUpdate = TablesUpdate<"galeria_itens">;

// Adicionado "itens" opcional para quando fazemos o join na query
export type GaleriaCategoria = Tables<"galeria_categorias"> & {
  itens?: GaleriaItem[];
};
export type GaleriaCategoriaInsert = TablesInsert<"galeria_categorias">;
export type GaleriaCategoriaUpdate = TablesUpdate<"galeria_categorias">;

export type Profile = Tables<"profiles">;
export type Notification = Tables<"notifications">;
export type SystemActivity = Tables<"system_activities">;

// ============================================
// TIPOS DE AUTENTICAÇÃO E SESSÃO
// ============================================

export interface AdminSessionData {
  userId: string;
  userEmail: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
}
