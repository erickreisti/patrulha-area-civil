export { useAuth } from "./useAuth";
export { useNotifications, useNotificationCreator } from "./useNotifications";
export { useGaleria } from "./useGaleria";
export { useNoticias } from "./useNoticias";

// Interfaces específicas para hooks (com menos campos)
export interface NoticiaListagem {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  categoria: string | null;
  data_publicacao: string;
  destaque: boolean;
}

export interface CategoriaListagem {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: string;
  ordem: number;
}
