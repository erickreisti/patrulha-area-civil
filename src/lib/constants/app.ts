// src/lib/constants/app.ts

// Configurações Gerais da Aplicação
export const APP = {
  NAME: "Sistema PAC",
  VERSION: "1.0.0",
  DESCRIPTION: "Sistema de Gerenciamento de Agentes",
  SUPPORT_EMAIL: "suporte@pac.com.br",
  SUPPORT_PHONE: "(11) 99999-9999",
  DEFAULT_PASSWORD: "PAC@2025!Secure",
  API_TIMEOUT: 30000,
} as const;

// Categorias Padrão de Notícias
// Isso serve como "fallback" se o banco estiver vazio e garante a ordem correta
export const NOTICIA_CATEGORIAS_PADRAO = [
  "Operações",
  "Treinamento",
  "Eventos",
  "Comunicados",
  "Social",
  "Institucional",
  "Geral",
] as const;

// Tipo derivado das categorias padrão
export type NoticiaCategoria =
  | (typeof NOTICIA_CATEGORIAS_PADRAO)[number]
  | string;

// Outras constantes globais do app podem vir aqui...
