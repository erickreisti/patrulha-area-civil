// Funções gerais de validação e formatação
// Funções específicas do sistema estão em constants/security.ts
// NÃO inclua validateMatricula ou formatMatricula aqui!

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
