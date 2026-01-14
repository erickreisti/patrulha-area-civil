// src/lib/stores/index.ts - VERSÃO CORRIGIDA

// Exportar tudo do store de agentes
export {
  useAgentsStore,
  useAgentsList,
  useAgentEdit,
  useAgentCreate,
  GRADUACOES,
  TIPOS_SANGUINEOS,
  formatDate,
  getCertificationStatus,
} from "./useAgentesStore";

// Exportar tipos
export type { Agent } from "@/app/actions/admin/agents/agents";

// Exportar outros stores
export { useAuthStore } from "./useAuthStore";
export { useActivitiesStore, useActivitiesList } from "./useActivitiesStore";
export { useConfigStore } from "./useConfigStore";
export { useGaleriaStore } from "./useGaleriaStore";
export { useNoticiasStore } from "./useNoticiasStore";
