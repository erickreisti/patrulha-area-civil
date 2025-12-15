export const SECURITY = {
  // Senhas
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    ROTATION_DAYS: 180,
    HISTORY_COUNT: 5,
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 60 * 1000, // 1 minuto
    BLOCK_DURATION_MS: 15 * 60 * 1000, // 15 minutos
  },

  // Sessão
  SESSION: {
    TIMEOUT_MINUTES: 60,
    REFRESH_ENABLED: true,
    MULTI_SESSION: false,
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
