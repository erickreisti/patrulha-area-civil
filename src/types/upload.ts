// src/types/upload.ts - VERSÃO CORRIGIDA
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
