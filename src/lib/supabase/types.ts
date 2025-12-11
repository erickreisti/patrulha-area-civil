// lib/supabase/types.ts
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
          role: "admin" | "agent";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          matricula: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          status?: boolean;
          role?: "admin" | "agent";
          created_at?: string;
          updated_at?: string;
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
          role?: "admin" | "agent";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      profiles_simple: {
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
          role: "admin" | "agent";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          matricula: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          status?: boolean;
          role?: "admin" | "agent";
          created_at?: string;
          updated_at?: string;
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
          role?: "admin" | "agent";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_simple_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      profiles_backup: {
        Row: {
          id: string | null;
          matricula: string | null;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          graduacao: string | null;
          validade_certificacao: string | null;
          tipo_sanguineo: string | null;
          status: boolean | null;
          role: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          matricula?: string | null;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          status?: boolean | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          matricula?: string | null;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          graduacao?: string | null;
          validade_certificacao?: string | null;
          tipo_sanguineo?: string | null;
          status?: boolean | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
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
        };
        Relationships: [
          {
            foreignKeyName: "noticias_autor_id_fkey";
            columns: ["autor_id"];
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
      [_ in never]: never;
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
