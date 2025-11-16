// src/types/noticias.ts
export type NoticiaStatus = "rascunho" | "publicado" | "arquivado";

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

export interface NoticiaWithAutor extends Noticia {
  autor?: {
    full_name: string;
    graduacao: string;
  };
}

export interface NoticiaFormData {
  titulo: string;
  slug: string;
  conteudo: string;
  resumo: string;
  imagem: string | null;
  categoria: string;
  destaque: boolean;
  data_publicacao: string;
  status: NoticiaStatus;
}
