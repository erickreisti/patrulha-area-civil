import { createBrowserClient } from "@supabase/ssr";

// ==================== INTERFACES DO DATABASE ====================
export interface Database {
  public: {
    Tables: {
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
        Insert: Partial<
          Database["public"]["Tables"]["galeria_categorias"]["Row"]
        >;
        Update: Partial<
          Database["public"]["Tables"]["galeria_categorias"]["Row"]
        >;
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
        Insert: Partial<Database["public"]["Tables"]["galeria_itens"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["galeria_itens"]["Row"]>;
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
        Insert: Partial<Database["public"]["Tables"]["noticias"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["noticias"]["Row"]>;
      };
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
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
    };
  };
}

// ==================== TIPOS DE SUPABASE ====================
export type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

// ==================== CLIENTE SUPABASE ====================
export const createClient = (): SupabaseClient => {
  // Para SSR (Server Side Rendering) - retorna um mock seguro
  if (typeof window === "undefined") {
    // Cria um mock client com a mesma interface
    const mockClient = {
      // 🔥 CORREÇÃO: Use ESLint ignore para parâmetros não usados
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      from: <T>(_table: string) => ({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        select: (_columns?: string) => ({
          data: [] as T[],
          error: null,
          count: 0,
          order: () => ({ data: [] as T[], error: null }),
          eq: () => ({ data: [] as T[], error: null }),
          or: () => ({ data: [] as T[], error: null }),
          range: () => ({ data: [] as T[], error: null }),
          maybeSingle: async () => ({ data: null as T | null, error: null }),
          single: async () => ({ data: null as T | null, error: null }),
        }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    };

    return mockClient as unknown as SupabaseClient;
  }

  // Para Client Side - cria o cliente real
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};

// ==================== CLIENTE SEGURO ====================
export const createBrowserClientSafe = (): SupabaseClient | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Variáveis de ambiente do Supabase não configuradas");
    return null;
  }

  try {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error);
    return null;
  }
};
