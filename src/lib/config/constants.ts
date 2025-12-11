export const APP_CONFIG = {
  NAME: "Sistema PAC",
  VERSION: "1.0.0",
  DESCRIPTION: "Sistema de Gerenciamento de Agentes",
  API_TIMEOUT: 30000,
  DEFAULT_PASSWORD: "PAC@2025!Secure",
} as const;

export const AGENTS_CONFIG = {
  PAGINATION_LIMIT: 50,
  MATRICULA_LENGTH: 11,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
} as const;

export const SECURITY_CONFIG = {
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 60 * 1000, // 1 minuto
  },
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const UPLOAD_CONFIG = {
  AVATAR: {
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  NEWS_IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },
  GALLERY_PHOTO: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },
  GALLERY_VIDEO: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ["video/mp4", "video/mpeg", "video/quicktime"],
  },
  DOCUMENT: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
} as const;
