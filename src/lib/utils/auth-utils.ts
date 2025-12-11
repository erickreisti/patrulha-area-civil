import { type UserStatus } from "@/lib/config";

/**
 * Tipo para status possível no banco de dados
 */
export type DatabaseStatus = boolean | string | number | null | undefined;

/**
 * Converte o status do banco de dados para o tipo UserStatus padronizado
 */
export function normalizeUserStatus(status: DatabaseStatus): UserStatus {
  if (status === undefined || status === null) {
    return "inactive";
  }

  // Boolean true
  if (status === true) return "active";

  // String 'true' ou 't' ou '1'
  if (typeof status === "string") {
    const normalized = status.toLowerCase().trim();
    if (normalized === "true" || normalized === "t" || normalized === "1") {
      return "active";
    }
    if (normalized === "false" || normalized === "f" || normalized === "0") {
      return "inactive";
    }
    // Mapear strings específicas para outros status
    if (normalized === "suspended" || normalized === "suspenso") {
      return "suspended";
    }
    if (normalized === "pending" || normalized === "pendente") {
      return "pending";
    }
  }

  // Número 1 para active, 0 para inactive
  if (typeof status === "number") {
    return status === 1 ? "active" : "inactive";
  }

  return "inactive";
}

/**
 * Interface para payload JWT
 */
export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Extrai informações do token JWT
 */
export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Valida se um usuário tem permissão para acessar uma rota
 */
export function canAccessRoute(
  userRole: string | undefined,
  userStatus: UserStatus | undefined,
  requiredRole?: "admin" | "agent",
  requireActive = true
): { allowed: boolean; reason?: string } {
  // Se não há usuário, não tem acesso
  if (!userRole || !userStatus) {
    return { allowed: false, reason: "Usuário não autenticado" };
  }

  // Verificar status
  if (requireActive && userStatus !== "active") {
    return { allowed: false, reason: `Conta ${userStatus}` };
  }

  // Verificar role
  if (requiredRole && userRole !== requiredRole) {
    return { allowed: false, reason: "Permissão insuficiente" };
  }

  return { allowed: true };
}

/**
 * Verifica se um token está expirado
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Formata a matrícula no padrão XXX.XXX.XXX-XX
 */
export function formatMatricula(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
    6,
    9
  )}-${numbers.slice(9, 11)}`;
}

/**
 * Valida se uma matrícula tem o formato correto
 */
export function isValidMatricula(matricula: string): boolean {
  const cleaned = matricula.replace(/\D/g, "");
  return cleaned.length === 11;
}

/**
 * Sanitiza dados de entrada do usuário
 */
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>"'`]/g, "") // Remove caracteres perigosos
    .substring(0, 255); // Limita tamanho
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Gera senha temporária
 */
export function generateTempPassword(length = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
