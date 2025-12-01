// ==================== AUTH ====================
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
  role: "admin" | "agent"; // Especificando os valores possíveis
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

// ==================== GALERIA ====================
export type TipoCategoria = "fotos" | "videos";
export type TipoItem = "foto" | "video";

export interface GaleriaCategoria {
  id: string;
  nome: string;
  descricao?: string;
  slug: string;
  tipo: TipoCategoria;
  ordem: number;
  status: boolean;
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
  tipo: TipoItem;
  arquivo_url: string;
  thumbnail_url?: string;
  ordem: number;
  autor_id?: string;
  status: boolean;
  destaque: boolean;
  created_at: string;
  updated_at?: string;
}

// Interfaces para listagem
export interface GaleriaItemListagem {
  id: string;
  titulo: string;
  tipo: TipoItem;
  arquivo_url: string;
  thumbnail_url?: string;
  status: boolean;
  destaque: boolean;
  created_at: string;
  categoria_nome?: string;
}

export interface CategoriaListagem {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  status: boolean;
  ordem: number;
  itens_count: number;
}

// Formulários
export interface CreateCategoriaData {
  nome: string;
  descricao?: string;
  slug: string;
  tipo: TipoCategoria;
  ordem?: number;
  status?: boolean;
}

export interface CreateItemData {
  titulo: string;
  descricao?: string;
  categoria_id?: string;
  tipo: TipoItem;
  arquivo_url: string;
  thumbnail_url?: string;
  ordem?: number;
  status?: boolean;
  destaque?: boolean;
}

// ==================== NOTÍCIAS ====================
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

// ==================== NOTIFICAÇÕES ====================
export interface NotificationMetadata {
  resource_type?: string;
  resource_id?: string;
  action_type?: string;
  user_id?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  user_id: string;
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
  is_read: boolean;
  metadata?: NotificationMetadata;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== UPLOAD ====================
export interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  url?: string;
  path?: string;
}

export interface UploadResult {
  url: string | null;
  error: string | null;
  path: string | null;
  success: boolean;
}
