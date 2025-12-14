// lib/utils/auth-utils.ts
/**
 * Utilitários de autenticação e formatação
 */

// Formatação de matrícula no padrão: XXX.XXX.XXX-XX
export function formatMatricula(matricula: string): string {
  if (!matricula) return "";

  // Remove qualquer caractere não numérico
  const cleaned = matricula.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return matricula;

  // Formata: XXX.XXX.XXX-XX
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
    6,
    9
  )}-${cleaned.slice(9, 11)}`;
}

// Validação de matrícula
export function validateMatricula(matricula: string): boolean {
  const cleaned = matricula.replace(/\D/g, "");
  return cleaned.length === 11;
}

// Extrair apenas números da matrícula
export function extractMatriculaNumbers(matricula: string): string {
  return matricula.replace(/\D/g, "");
}

// Mascarar matrícula para exibição (últimos 2 dígitos visíveis)
export function maskMatricula(matricula: string): string {
  const cleaned = extractMatriculaNumbers(matricula);
  if (cleaned.length !== 11) return matricula;

  return `***.***.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
}
