"use client";

import { create } from "zustand";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react"; // <--- Importante para o hook useAgentEdit
import {
  createAgent,
  getAgents,
  getAgent, // <--- Agora será usado no hook lá embaixo
  deleteAgent,
  getAgentsStats,
  toggleAgentStatus,
  updateAgent,
  type CreateAgentInput,
  type UpdateAgentInput,
  type Agent as ApiAgentType,
} from "@/app/actions/admin/agents/agents";

// ==================== RE-EXPORTAÇÃO DE TIPOS ====================
export type { CreateAgentInput, UpdateAgentInput, ApiAgentType };

// ==================== CONSTANTES ====================

export const GRADUACOES = [
  "PATRULHEIRO",
  "PATRULHEIRA",
  "CABO - PAC",
  "3° SARGENTO - PAC",
  "2° SARGENTO - PAC",
  "1° SARGENTO - PAC",
  "SUBOFICIAL - PAC",
  "ASPIRANTE-a-OFICIAL - PAC",
  "2° TENENTE - PAC",
  "1° TENENTE - PAC",
  "CAPITÃO - PAC",
  "CAPITÃ - PAC",
  "MAJOR - PAC",
  "TENENTE CORONEL - PAC",
  "CORONEL - PAC",
  "VICE COMODORO - PAC",
  "COMODORO - PAC",
  "COMODORO DE BRIGADA - PAC",
];

export const UFS_BRASIL = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// ==================== FUNÇÕES UTILITÁRIAS ====================

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "Não informada";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "Data inválida";
  }
}

export function getCertificationStatus(certDate?: string | null): {
  status: "valida" | "proximo-vencimento" | "expirada" | "nao-informada";
  color: "green" | "yellow" | "red" | "gray";
  daysLeft?: number;
} {
  if (!certDate) {
    return { status: "nao-informada", color: "gray" };
  }

  try {
    const expiryDate = new Date(certDate);
    const today = new Date();
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(expiryDate.getTime())) {
      return { status: "nao-informada", color: "gray" };
    }

    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { status: "expirada", color: "red", daysLeft };
    } else if (daysLeft <= 30) {
      return { status: "proximo-vencimento", color: "yellow", daysLeft };
    } else {
      return { status: "valida", color: "green", daysLeft };
    }
  } catch {
    return { status: "nao-informada", color: "gray" };
  }
}

// ==================== TIPOS DAS STORES ====================

// Estendemos o input para aceitar 'unidade' no frontend antes de enviar
export type AgentFormData = Partial<CreateAgentInput> & { unidade?: string };

interface AgentCreateStore {
  formData: AgentFormData;
  saving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  setFormData: (data: AgentFormData) => void;
  resetFormData: () => void;
  createAgent: (
    data: CreateAgentInput,
  ) => Promise<{ success: boolean; error?: string; data?: unknown }>;
  validateForm: () => string[];
  generateMatricula: () => void;
}

interface AgentEditStore {
  agent: ApiAgentType | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: Partial<ApiAgentType>;
  hasUnsavedChanges: boolean;
  setAgent: (agent: ApiAgentType) => void;
  setFormData: (data: Partial<ApiAgentType>) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  updateAgent: (
    data: Partial<Omit<UpdateAgentInput, "id">>,
  ) => Promise<{ success: boolean; error?: string; data?: unknown }>;
  validateForm: () => string[];
}

interface AgentsStore {
  agents: ApiAgentType[];
  filteredAgents: ApiAgentType[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    role: "all" | "admin" | "agent";
    status: "all" | "active" | "inactive";
  };
  pagination: { page: number; limit: number; totalPages: number };
  agentsStats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    agents: number;
  };
  fetchAgents: () => Promise<void>;
  fetchAgentsStats: () => Promise<void>;
  setFilters: (filters: Partial<AgentsStore["filters"]>) => void;
  setPagination: (pagination: Partial<AgentsStore["pagination"]>) => void;
  toggleAgentStatus: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteAgent: (id: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

// ==================== STORE: CREATE ====================

export const useAgentCreateStore = create<AgentCreateStore>((set, get) => ({
  formData: {
    matricula: "",
    email: "",
    full_name: "",
    role: "agent",
    status: true,
  },
  saving: false,
  error: null,
  hasUnsavedChanges: false,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      hasUnsavedChanges: true,
    })),
  resetFormData: () =>
    set({
      formData: {
        matricula: "",
        email: "",
        full_name: "",
        role: "agent",
        status: true,
      },
      error: null,
      hasUnsavedChanges: false,
    }),

  createAgent: async (data) => {
    set({ saving: true, error: null });
    try {
      const result = await createAgent(data);
      if (!result.success) throw new Error(result.error);
      return { success: true, data: result.data };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      set({ error: msg });
      return { success: false, error: msg };
    } finally {
      set({ saving: false });
    }
  },

  validateForm: () => {
    const { formData } = get();
    const errors = [];
    if (!formData.matricula || formData.matricula.length !== 11)
      errors.push("Matrícula inválida");
    if (!formData.email || !formData.email.includes("@"))
      errors.push("Email inválido");
    return errors;
  },

  generateMatricula: () => {
    const random = Math.floor(
      10000000000 + Math.random() * 90000000000,
    ).toString();
    get().setFormData({ matricula: random });
  },
}));

// ==================== STORE: EDIT ====================

export const useAgentEditStore = create<AgentEditStore>((set, get) => ({
  agent: null,
  loading: true,
  saving: false,
  error: null,
  formData: {},
  hasUnsavedChanges: false,

  setAgent: (agent) => {
    set({
      agent,
      formData: { ...agent },
      loading: false,
      hasUnsavedChanges: false,
    });
  },

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      hasUnsavedChanges: true,
    })),

  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),

  updateAgent: async (data) => {
    try {
      const { agent } = get();
      if (!agent) throw new Error("Agente não encontrado");

      set({ saving: true, error: null });
      const result = await updateAgent(agent.id, data);

      if (result.success && result.data) {
        set({ agent: result.data as ApiAgentType, hasUnsavedChanges: false });
        return { success: true, data: result.data };
      } else {
        set({ error: result.error || "Erro ao atualizar" });
        return { success: false, error: result.error };
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao atualizar";
      set({ error: msg });
      return { success: false, error: msg };
    } finally {
      set({ saving: false });
    }
  },

  validateForm: () => {
    const { formData } = get();
    const errors: string[] = [];
    if (!formData.matricula) errors.push("Matrícula é obrigatória");
    if (!formData.email) errors.push("Email é obrigatório");
    return errors;
  },
}));

// ==================== STORE: LIST ====================

export const useAgentsStore = create<AgentsStore>((set, get) => ({
  agents: [],
  filteredAgents: [],
  agentsStats: { total: 0, active: 0, inactive: 0, admins: 0, agents: 0 },
  loading: false,
  error: null,
  filters: { search: "", role: "all", status: "all" },
  pagination: { page: 1, limit: 50, totalPages: 1 },

  fetchAgents: async () => {
    set({ loading: true });
    const { filters, pagination } = get();
    const apiFilters = {
      search: filters.search,
      role: filters.role === "all" ? undefined : filters.role,
      status:
        filters.status === "all"
          ? undefined
          : (filters.status as "active" | "inactive"),
      page: pagination.page,
      limit: pagination.limit,
    };
    const res = await getAgents(apiFilters);
    if (res.success && res.data) {
      set({
        agents: res.data,
        filteredAgents: res.data,
        pagination: {
          ...pagination,
          totalPages: res.pagination?.totalPages || 1,
        },
        loading: false,
      });
    } else {
      set({ error: res.error, loading: false });
    }
  },

  fetchAgentsStats: async () => {
    const res = await getAgentsStats();
    if (res.success && res.data) set({ agentsStats: res.data });
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchAgents();
  },

  setPagination: (p) => {
    set((state) => ({ pagination: { ...state.pagination, ...p } }));
    get().fetchAgents();
  },

  toggleAgentStatus: async (id) => {
    const res = await toggleAgentStatus(id);
    if (res.success) get().fetchAgents();
    return res;
  },

  deleteAgent: async (id) => {
    const res = await deleteAgent(id);
    if (res.success) get().fetchAgents();
    return res;
  },

  clearError: () => set({ error: null }),
}));

// ==================== HOOKS PÚBLICOS ====================

// Hook personalizado para conectar a store de edição com o carregamento inicial
export function useAgentEdit(agentId: string) {
  const [initialized, setInitialized] = useState(false);
  const store = useAgentEditStore();

  useEffect(() => {
    async function loadAgent() {
      if (initialized) return;
      try {
        // Carrega dados iniciais usando a função getAgent
        const result = await getAgent(agentId);
        if (result.success && result.data) {
          store.setAgent(result.data);
        }
      } finally {
        setInitialized(true);
      }
    }
    if (agentId) loadAgent();
  }, [agentId, initialized, store]);

  return store;
}

export const useAgentCreate = useAgentCreateStore;
export const useAgentsList = useAgentsStore;
