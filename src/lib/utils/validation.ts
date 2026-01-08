/**
 * Utilitários de validação e formatação
 */

// =========== VALIDAÇÃO BÁSICA ===========

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 11;
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>"'`\\]/g, "")
    .substring(0, 1000);
}

export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === "";
}

export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

// =========== FORMATAÇÃO DE TELEFONE ===========

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
      7
    )}`;
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
      6
    )}`;
  }

  return phone;
}

// =========== MATRÍCULA (PAC) - Padrão: XXX.XXX.XXX-XX (11 dígitos) ===========

// Formatação de matrícula no padrão: XXX.XXX.XXX-XX (3-3-3-2)
export function formatMatricula(matricula: string): string {
  if (!matricula) return "";

  // Remove qualquer caractere não numérico
  const cleaned = matricula.replace(/\D/g, "");

  // Se não tiver 11 dígitos, retorna o valor limpo
  if (cleaned.length !== 11) return cleaned;

  // Formata: XXX.XXX.XXX-XX (3-3-3-2)
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
    6,
    9
  )}-${cleaned.slice(9, 11)}`;
}

// Validação de matrícula - aceita com ou sem formatação
export function validateMatricula(matricula: string): boolean {
  if (!matricula || typeof matricula !== "string") return false;

  // Remove formatação e verifica se tem 11 dígitos
  const cleaned = matricula.replace(/\D/g, "");
  return cleaned.length === 11;
}

// Extrair apenas números da matrícula
export function extractMatriculaNumbers(matricula: string): string {
  if (!matricula) return "";
  return matricula.replace(/\D/g, "");
}

// Mascarar matrícula para exibição (primeiros 9 dígitos mascarados, últimos 2 visíveis)
export function maskMatricula(matricula: string): string {
  const cleaned = extractMatriculaNumbers(matricula);
  if (cleaned.length !== 11) return "***.***.***-**";

  return `***.***.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
}

// Normalizar matrícula (remove formatação e garante 11 dígitos)
export function normalizeMatricula(matricula: string): string {
  const cleaned = extractMatriculaNumbers(matricula);

  if (cleaned.length > 11) {
    return cleaned.substring(0, 11); // Trunca se tiver mais de 11
  }

  if (cleaned.length < 11) {
    return cleaned.padStart(11, "0"); // Adiciona zeros à esquerda
  }

  return cleaned;
}

// Valida se uma string tem formato de matrícula (aceita formatada ou não)
export function isMatriculaFormat(value: string): boolean {
  if (!value) return false;

  // Verifica se tem formato XXX.XXX.XXX-XX
  const formattedPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (formattedPattern.test(value)) {
    return true;
  }

  // Verifica se tem apenas números
  const numericPattern = /^\d{11}$/;
  return numericPattern.test(value);
}

// =========== FUNÇÕES DE VALIDAÇÃO COMPOSTAS ===========

// Interface para dados de formulário comum
export interface FormValidationData {
  email?: string;
  telefone?: string;
  matricula?: string;
  [key: string]: unknown;
}

export function validateFormData(data: FormValidationData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validação de email
  if (
    typeof data.email === "string" &&
    data.email &&
    !validateEmail(data.email)
  ) {
    errors.email = "Email inválido";
  }

  // Validação de telefone
  if (
    typeof data.telefone === "string" &&
    data.telefone &&
    !validatePhone(data.telefone)
  ) {
    errors.telefone = "Telefone inválido (use 10 ou 11 dígitos)";
  }

  // Validação de matrícula
  if (
    typeof data.matricula === "string" &&
    data.matricula &&
    !validateMatricula(data.matricula)
  ) {
    errors.matricula = "Matrícula deve ter exatamente 11 dígitos";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validação específica para login
export interface LoginData {
  matricula: string;
}

export function validateLoginData(data: LoginData): {
  isValid: boolean;
  error?: string;
} {
  if (!data.matricula || typeof data.matricula !== "string") {
    return {
      isValid: false,
      error: "Matrícula é obrigatória",
    };
  }

  const matriculaNumerica = extractMatriculaNumbers(data.matricula);

  if (!validateMatricula(matriculaNumerica)) {
    return {
      isValid: false,
      error: "Matrícula inválida. Deve ter 11 dígitos.",
    };
  }

  return { isValid: true };
}

// Validação para formulário de perfil
export interface ProfileFormData {
  full_name?: string;
  telefone?: string;
  uf?: string;
  data_nascimento?: string;
  tipo_sanguineo?: string;
}

export function validateProfileData(data: ProfileFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Validação de nome
  if (data.full_name && typeof data.full_name === "string") {
    const name = data.full_name.trim();
    if (name.length < 2) {
      errors.full_name = "Nome deve ter pelo menos 2 caracteres";
    } else if (name.length > 100) {
      errors.full_name = "Nome não pode ter mais de 100 caracteres";
    }
  }

  // Validação de telefone
  if (
    data.telefone &&
    typeof data.telefone === "string" &&
    !validatePhone(data.telefone)
  ) {
    errors.telefone = "Telefone inválido";
  }

  // Validação de UF
  if (data.uf && typeof data.uf === "string") {
    const uf = data.uf.trim().toUpperCase();
    if (uf.length !== 2 || !/^[A-Z]{2}$/.test(uf)) {
      errors.uf = "UF deve ter exatamente 2 letras (ex: SP, RJ)";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// =========== HELPERS PARA FORMULÁRIOS ===========

export function getInitials(name: string): string {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Função específica para verificar se pode ser convertida para formato de matrícula
export function canBeFormattedAsMatricula(value: string): boolean {
  if (!value) return false;

  const cleaned = value.replace(/\D/g, "");

  // Pode ser formatada se tiver entre 9 e 11 dígitos
  return cleaned.length >= 9 && cleaned.length <= 11;
}

// Formata matrícula mesmo se incompleta (para UX)
export function formatMatriculaPartial(value: string): string {
  if (!value) return "";

  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length <= 3) {
    return cleaned;
  }

  if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  }

  if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  }

  if (cleaned.length <= 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
      6,
      9
    )}-${cleaned.slice(9, 11)}`;
  }

  // Se tiver mais de 11 dígitos, trunca
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
    6,
    9
  )}-${cleaned.slice(9, 11)}`;
}

// =========== EXPORTAÇÃO POR CATEGORIA ===========

export const ValidationHelpers = {
  email: validateEmail,
  url: validateURL,
  phone: validatePhone,
  matricula: validateMatricula,
  numeric: isNumeric,
  empty: isEmpty,
  isMatriculaFormat,
};

export const FormatHelpers = {
  phone: formatPhone,
  matricula: formatMatricula,
  matriculaPartial: formatMatriculaPartial,
  maskMatricula,
  initials: getInitials,
  capitalize: capitalizeWords,
  truncate: truncateText,
};

export const StringHelpers = {
  sanitize: sanitizeInput,
  extractMatriculaNumbers,
  normalizeMatricula,
  canBeFormattedAsMatricula,
};

// =========== TIPOS UTILITÁRIOS ===========

export type ValidationResult = {
  isValid: boolean;
  errors?: Record<string, string>;
  error?: string;
};

export type FormFieldValidation = {
  value: string;
  isValid: boolean;
  error?: string;
};
