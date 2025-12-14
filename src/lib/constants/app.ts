export const APP = {
  NAME: "Sistema PAC",
  VERSION: "1.0.0",
  DESCRIPTION: "Sistema de Gerenciamento de Agentes",
  SUPPORT_EMAIL: "suporte@pac.com.br",
  SUPPORT_PHONE: "(11) 99999-9999",
  DEFAULT_PASSWORD: "PAC@2025!Secure",
  API_TIMEOUT: 30000,
} as const;

export const AGENTS = {
  PAGINATION_LIMIT: 50,
  MATRICULA_LENGTH: 11,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  DEFAULT_ROLE: "agent" as const,
} as const;
