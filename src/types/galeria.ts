export type TipoCategoria = "fotos" | "videos";
export type TipoItem = "foto" | "video";
export type StatusItem = "rascunho" | "publicado" | "arquivado";

export interface GaleriaCategoria {
  id: string;
  nome: string;
  descricao?: string;
  slug: string;
  tipo: TipoCategoria;
  ordem: number;
  status: boolean;
  created_at: string;
  _count?: {
    itens: number;
  };
}

export interface GaleriaItem {
  id: string;
  titulo: string;
  descricao?: string;
  categoria_id?: string;
  categoria?: GaleriaCategoria;
  tipo: TipoItem;
  arquivo_url: string;
  thumbnail_url?: string;
  ordem: number;
  autor_id?: string;
  status: boolean;
  created_at: string;
}

export interface CreateCategoriaData {
  nome: string;
  descricao?: string;
  slug: string;
  tipo: TipoCategoria;
  ordem?: number;
  status?: boolean;
}

export interface UpdateCategoriaData extends Partial<CreateCategoriaData> {}

export interface CreateItemData {
  titulo: string;
  descricao?: string;
  categoria_id?: string;
  tipo: TipoItem;
  arquivo_url: string;
  thumbnail_url?: string;
  ordem?: number;
  status?: boolean;
}

export interface UpdateItemData extends Partial<CreateItemData> {}
