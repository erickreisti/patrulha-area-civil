// lib/config/index.ts
// Primeiro exportar tudo
export * from "./upload";
export * from "./security";
export * from "./service-worker";

// Depois definir tipos que dependem das exportações
export type UserRole = "admin" | "agent";
export type UserStatus = "active" | "inactive" | "suspended" | "pending";

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
  pending: "Pendente",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  agent: "Agente",
};
