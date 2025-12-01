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
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
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

export interface NoticiaWithAutor extends Noticia {
  autor?: {
    full_name: string;
    graduacao: string;
    avatar_url?: string;
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

// ==================== GALERIA ====================
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

export type UpdateCategoriaData = Partial<CreateCategoriaData>;

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

export type UpdateItemData = Partial<CreateItemData>;

export interface CategoriaListagem {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  tipo: string;
  ordem: number;
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

export interface UploadOptions {
  bucket: string;
  folder?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (url: string) => void;
  onError?: (error: string) => void;
}

export interface UploadResult {
  url: string | null;
  error: string | null;
  path: string | null;
  success: boolean;
}

export interface UseUploadReturn {
  uploadFile: (file: File, options: UploadOptions) => Promise<UploadResult>;
  deleteFile: (
    bucket: string,
    path: string
  ) => Promise<{ success: boolean; error: string | null }>;
  uploading: boolean;
  progress: number;
  resetProgress: () => void;
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
