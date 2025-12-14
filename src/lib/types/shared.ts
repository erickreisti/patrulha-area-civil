// Tipos fundamentais do sistema
export type UserRole = "admin" | "agent";
export type UserStatus = "active" | "inactive" | "suspended" | "pending";
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
  | Record<string, unknown>;

// Labels para UI
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  agent: "Agente",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
  pending: "Pendente",
};

// Helper para normalizar status
export function normalizeUserStatus(
  status: boolean | string | number | null | undefined
): UserStatus {
  if (status === undefined || status === null) {
    return "inactive";
  }

  if (status === true) return "active";
  if (status === false) return "inactive";

  if (typeof status === "string") {
    const normalized = status.toLowerCase().trim();
    if (normalized === "true" || normalized === "t" || normalized === "1") {
      return "active";
    }
    if (normalized === "false" || normalized === "f" || normalized === "0") {
      return "inactive";
    }
    if (normalized === "suspended" || normalized === "suspenso") {
      return "suspended";
    }
    if (normalized === "pending" || normalized === "pendente") {
      return "pending";
    }
  }

  if (typeof status === "number") {
    return status === 1 ? "active" : "inactive";
  }

  return "inactive";
}
