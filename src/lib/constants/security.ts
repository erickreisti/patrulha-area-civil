// src/lib/constants/security.ts
export const SECURITY = {
  // Senhas
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
    ROTATION_DAYS: 180,
    HISTORY_COUNT: 5,
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 60 * 1000,
    BLOCK_DURATION_MS: 15 * 60 * 1000,
  },

  // Sessões
  SESSION: {
    // Sessão principal Supabase (padrão)
    SUPABASE_TIMEOUT_MINUTES: 1440, // 24 horas
    // Sessão administrativa adicional
    ADMIN_TIMEOUT_MINUTES: 120, // 2 horas
    ADMIN_WARNING_MINUTES: 5, // Aviso 5 minutos antes
    REFRESH_ENABLED: true,
    MULTI_SESSION: false,
    INACTIVITY_TIMEOUT_MINUTES: 30, // Timeout por inatividade
  },

  // Validações
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MATRICULA_REGEX: /^\d{11}$/,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
  },

  // Criptografia
  ENCRYPTION: {
    SALT_ROUNDS: 12,
    ALGORITHM: "sha256" as const,
  },
} as const;

export const AGENTS = {
  PAGINATION_LIMIT: 50,
  MATRICULA_LENGTH: 11,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  DEFAULT_ROLE: "agent" as const,
} as const;
