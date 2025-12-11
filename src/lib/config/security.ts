// lib/config/security.ts
export const SECURITY_CONFIG = {
  // Senhas
  DEFAULT_PASSWORD: "PAC@2025!Secure",
  MIN_PASSWORD_LENGTH: 12,
  REQUIRE_COMPLEX_PASSWORD: true,
  PASSWORD_ROTATION_MONTHS: 6,

  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION_MINUTES: 15,
  IP_BLOCK_DURATION_MINUTES: 60,

  // Sessão
  SESSION_TIMEOUT_MINUTES: 60,
  REFRESH_TOKEN_ENABLED: true,

  // Validações
  REQUIRE_EMAIL_CONFIRMATION: true,
  REQUIRE_PHONE_VERIFICATION: false,

  // Criptografia
  ENCRYPTION_LEVEL: "high" as const,
} as const;

export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      message: `A senha deve ter pelo menos ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} caracteres`,
    };
  }

  if (SECURITY_CONFIG.REQUIRE_COMPLEX_PASSWORD) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[@$!%*?&]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      return {
        isValid: false,
        message:
          "A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais",
      };
    }
  }

  return { isValid: true };
};

export const generateSessionId = (): string => {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove tags HTML
    .substring(0, 1000); // Limita tamanho
};
