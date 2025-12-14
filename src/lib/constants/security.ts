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

// Funções de validação
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < SECURITY.PASSWORD.MIN_LENGTH) {
    errors.push(
      `A senha deve ter pelo menos ${SECURITY.PASSWORD.MIN_LENGTH} caracteres`
    );
  }

  if (SECURITY.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra maiúscula");
  }

  if (SECURITY.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra minúscula");
  }

  if (SECURITY.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push("A senha deve conter pelo menos um número");
  }

  if (SECURITY.PASSWORD.REQUIRE_SPECIAL_CHARS && !/[@$!%*?&]/.test(password)) {
    errors.push(
      "A senha deve conter pelo menos um caractere especial (@$!%*?&)"
    );
  }

  // Verificar senhas comuns
  const commonPasswords = ["password", "123456", "qwerty", "senha", "admin"];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Essa senha é muito comum. Escolha uma senha mais segura.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMatricula(matricula: string): boolean {
  const cleaned = matricula.replace(/\D/g, "");
  return cleaned.length === 11;
}

export function formatMatricula(matricula: string): string {
  const cleaned = matricula.replace(/\D/g, "");
  if (cleaned.length !== 11) return matricula;

  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
    6,
    9
  )}-${cleaned.slice(9, 11)}`;
}
