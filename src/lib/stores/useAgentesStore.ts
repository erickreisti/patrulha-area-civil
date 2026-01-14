"use client";

import { create } from "zustand";
import { useMemo, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  createAgent,
  getAgents,
  getAgent,
  updateAgent,
  deleteAgent,
  getAgentsStats,
  toggleAgentStatus,
  type CreateAgentInput,
  type UpdateAgentInput,
  type Agent as ApiAgentType,
} from "@/app/actions/admin/agents/agents";

// Constantes para graduações
export const GRADUACOES = [
  "Soldado",
  "Cabo",
  "3º Sargento",
  "2º Sargento",
  "1º Sargento",
  "Subtenente",
  "Cadete",
  "Aspirante",
  "2º Tenente",
  "1º Tenente",
  "Capitão",
  "Major",
  "Tenente-Coronel",
  "Coronel",
  "General de Brigada",
  "General de Divisão",
  "General de Exército",
];

// Constantes para tipos sanguíneos
export const TIPOS_SANGUINEOS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

// Função para formatar data
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "Não informada";
  try {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "Data inválida";
  }
}

// Função para verificar status da certificação
export function getCertificationStatus(certDate?: string | null): {
  status: "valida" | "proximo-vencimento" | "expirada" | "nao-informada";
  color: "green" | "yellow" | "red" | "gray";
  daysLeft?: number;
} {
  if (!certDate) {
    return {
      status: "nao-informada",
      color: "gray",
    };
  }

  try {
    const expiryDate = new Date(certDate);
    const today = new Date();

    // Resetar horas para comparar apenas datas
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(expiryDate.getTime())) {
      return {
        status: "nao-informada",
        color: "gray",
      };
    }

    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        status: "expirada",
        color: "red",
        daysLeft,
      };
    } else if (daysLeft <= 30) {
      return {
        status: "proximo-vencimento",
        color: "yellow",
        daysLeft,
      };
    } else {
      return {
        status: "valida",
        color: "green",
        daysLeft,
      };
    }
  } catch {
    return {
      status: "nao-informada",
      color: "gray",
    };
  }
}

// Interface do store principal
interface AgentsStore {
  // Estado
  agents: ApiAgentType[];
  filteredAgents: ApiAgentType[];
  agentsStats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    agents: number;
  };
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    role: "all" | "admin" | "agent";
    status: "all" | "active" | "inactive";
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };

  // Ações
  fetchAgents: () => Promise<void>;
  fetchAgentsStats: () => Promise<void>;
  setFilters: (filters: Partial<AgentsStore["filters"]>) => void;
  setPagination: (pagination: Partial<AgentsStore["pagination"]>) => void;
  toggleAgentStatus: (agentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  deleteAgent: (agentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  clearError: () => void;
}

// Função auxiliar para aplicar filtros
function applyFilters(
  agentList: ApiAgentType[],
  filters: AgentsStore["filters"]
): ApiAgentType[] {
  if (!agentList || agentList.length === 0) return [];

  return agentList.filter((agent) => {
    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        agent.matricula.toLowerCase().includes(searchTerm) ||
        agent.email.toLowerCase().includes(searchTerm) ||
        (agent.full_name && agent.full_name.toLowerCase().includes(searchTerm));
      if (!matchesSearch) return false;
    }

    // Filtro de role
    if (filters.role !== "all" && agent.role !== filters.role) {
      return false;
    }

    // Filtro de status
    if (filters.status !== "all") {
      const shouldBeActive = filters.status === "active";
      if (agent.status !== shouldBeActive) return false;
    }

    return true;
  });
}

// Criação do store principal
export const useAgentsStore = create<AgentsStore>((set, get) => ({
  // Estado inicial
  agents: [],
  filteredAgents: [],
  agentsStats: {
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    agents: 0,
  },
  loading: false,
  error: null,
  filters: {
    search: "",
    role: "all",
    status: "all",
  },
  pagination: {
    page: 1,
    limit: 50,
    totalPages: 1,
  },

  // Buscar agentes
  fetchAgents: async () => {
    try {
      console.log("🔄 [AgentsStore] Buscando agentes...");
      set({ loading: true, error: null });

      const { filters, pagination } = get();

      // Converter filtros para o formato da API
      const apiFilters = {
        search: filters.search,
        role: filters.role === "all" ? undefined : filters.role,
        status: filters.status === "all" ? undefined : filters.status,
        page: pagination.page,
        limit: pagination.limit,
      };

      const result = await getAgents(apiFilters);

      if (result.success && result.data) {
        console.log(
          `✅ [AgentsStore] ${result.data.length} agentes carregados`
        );

        const agentsData = result.data;
        const filteredAgentsData = applyFilters(agentsData, filters);
        const totalPages = result.pagination?.totalPages || 1;

        set({
          agents: agentsData,
          filteredAgents: filteredAgentsData,
          pagination: {
            ...pagination,
            totalPages,
          },
          loading: false,
        });
      } else {
        throw new Error(result.error || "Erro ao buscar agentes");
      }
    } catch (error) {
      console.error("❌ [AgentsStore] Erro:", error);
      set({
        error: error instanceof Error ? error.message : "Erro desconhecido",
        loading: false,
      });
    }
  },

  // Buscar estatísticas
  fetchAgentsStats: async () => {
    try {
      console.log("📊 [AgentsStore] Buscando estatísticas...");

      const result = await getAgentsStats();

      if (result.success && result.data) {
        set({
          agentsStats: result.data,
        });
      } else {
        console.warn(
          "⚠️ [AgentsStore] Estatísticas não carregadas:",
          result.error
        );
      }
    } catch (error) {
      console.error("❌ [AgentsStore] Erro nas estatísticas:", error);
    }
  },

  // Aplicar filtros
  setFilters: (newFilters) => {
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      const filteredAgents = applyFilters(state.agents, updatedFilters);
      return {
        filters: updatedFilters,
        filteredAgents,
        pagination: { ...state.pagination, page: 1 }, // Resetar para página 1
      };
    });
  },

  // Atualizar paginação
  setPagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
  },

  // Alternar status do agente
  toggleAgentStatus: async (agentId: string) => {
    try {
      console.log("🔄 [AgentsStore] Alternando status do agente:", agentId);

      const result = await toggleAgentStatus(agentId);

      if (result.success) {
        // Recarregar agentes para atualizar a lista
        await get().fetchAgents();
        await get().fetchAgentsStats();

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ [AgentsStore] Erro ao alternar status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  },

  // Deletar agente
  deleteAgent: async (agentId: string) => {
    try {
      console.log("🗑️ [AgentsStore] Excluindo agente:", agentId);

      const result = await deleteAgent(agentId);

      if (result.success) {
        // Recarregar agentes e estatísticas
        await get().fetchAgents();
        await get().fetchAgentsStats();

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ [AgentsStore] Erro ao excluir agente:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  },

  // Limpar erro
  clearError: () => set({ error: null }),
}));

// Hook para listar agentes
export function useAgentsList() {
  const {
    filteredAgents,
    agentsStats,
    loading,
    error,
    filters,
    pagination,
    fetchAgents,
    fetchAgentsStats,
    setFilters,
    setPagination,
    toggleAgentStatus,
    deleteAgent,
    clearError,
  } = useAgentsStore(
    useShallow((state) => ({
      agents: state.agents,
      filteredAgents: state.filteredAgents,
      agentsStats: state.agentsStats,
      loading: state.loading,
      error: state.error,
      filters: state.filters,
      pagination: state.pagination,
      fetchAgents: state.fetchAgents,
      fetchAgentsStats: state.fetchAgentsStats,
      setFilters: state.setFilters,
      setPagination: state.setPagination,
      toggleAgentStatus: state.toggleAgentStatus,
      deleteAgent: state.deleteAgent,
      clearError: state.clearError,
    }))
  );

  // Calcular agentes paginados
  const paginatedAgents = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredAgents.slice(startIndex, startIndex + pagination.limit);
  }, [filteredAgents, pagination.page, pagination.limit]);

  return {
    // Agentes (paginados)
    agents: paginatedAgents,
    filteredAgents,
    agentsStats,
    loading,
    error,
    filters,
    pagination,
    fetchAgents,
    fetchAgentsStats,
    setFilters,
    setPagination,
    toggleAgentStatus,
    deleteAgent,
    clearError,
    // Funções utilitárias
    formatDate,
    getCertificationStatus,
  };
}

// Store para criação de agentes
interface AgentCreateStore {
  // Estado do formulário
  formData: Partial<CreateAgentInput> & {
    matricula?: string;
    email?: string;
    full_name?: string;
    graduacao?: string;
    tipo_sanguineo?: string;
    validade_certificacao?: string;
    role?: "agent" | "admin";
    avatar_url?: string;
  };
  saving: boolean;
  error: string | null;

  // Ações
  setFormData: (data: Partial<AgentCreateStore["formData"]>) => void;
  resetFormData: () => void;
  createAgent: (data: CreateAgentInput) => Promise<{
    success: boolean;
    error?: string;
    data?: unknown;
  }>;
  validateForm: () => string[];
  generateMatricula: () => void;
}

export const useAgentCreate = create<AgentCreateStore>((set, get) => ({
  // Estado inicial
  formData: {
    matricula: "",
    email: "",
    full_name: "",
    graduacao: "",
    tipo_sanguineo: "",
    validade_certificacao: "",
    role: "agent",
    avatar_url: "",
  },
  saving: false,
  error: null,

  // Atualizar dados do formulário
  setFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  // Resetar formulário
  resetFormData: () => {
    set({
      formData: {
        matricula: "",
        email: "",
        full_name: "",
        graduacao: "",
        tipo_sanguineo: "",
        validade_certificacao: "",
        role: "agent",
        avatar_url: "",
      },
      error: null,
    });
  },

  // Criar agente
  createAgent: async (data) => {
    try {
      console.log("🆕 [AgentCreateStore] Criando agente...");
      set({ saving: true, error: null });

      const result = await createAgent(data);

      if (result.success) {
        console.log("✅ [AgentCreateStore] Agente criado com sucesso");
        return { success: true, data: result.data };
      } else {
        console.error(
          "❌ [AgentCreateStore] Erro ao criar agente:",
          result.error
        );
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ [AgentCreateStore] Erro:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar agente";
      return { success: false, error: errorMessage };
    } finally {
      set({ saving: false });
    }
  },

  // Validar formulário
  validateForm: () => {
    const { formData } = get();
    const errors: string[] = [];

    if (!formData.matricula) errors.push("Matrícula é obrigatória");
    if (!formData.email) errors.push("Email é obrigatório");
    if (!formData.full_name) errors.push("Nome completo é obrigatório");
    if (!formData.role) errors.push("Tipo de usuário é obrigatório");

    if (formData.matricula && formData.matricula.length !== 11) {
      errors.push("Matrícula deve ter 11 dígitos");
    }

    if (formData.email && !formData.email.includes("@")) {
      errors.push("Email inválido");
    }

    return errors;
  },

  // Gerar matrícula
  generateMatricula: () => {
    // Gerar uma matrícula aleatória de 11 dígitos
    const randomMatricula = Math.floor(
      10000000000 + Math.random() * 90000000000
    ).toString();
    get().setFormData({ matricula: randomMatricula });
  },
}));

// Store para edição de agentes
interface AgentEditStore {
  agent: ApiAgentType | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: Partial<ApiAgentType>;
  hasUnsavedChanges: boolean;

  // Ações
  setAgent: (agent: ApiAgentType) => void;
  setFormData: (data: Partial<ApiAgentType>) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  updateAgent: (data: Partial<UpdateAgentInput>) => Promise<{
    success: boolean;
    error?: string;
    data?: unknown;
  }>;
  validateForm: () => string[];
}

export const useAgentEditStore = create<AgentEditStore>((set, get) => ({
  agent: null,
  loading: true,
  saving: false,
  error: null,
  formData: {},
  hasUnsavedChanges: false,

  // Definir agente
  setAgent: (agent) => {
    set({
      agent,
      formData: { ...agent },
      loading: false,
      hasUnsavedChanges: false,
    });
  },

  // Atualizar dados do formulário
  setFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
      hasUnsavedChanges: true,
    }));
  },

  // Controlar mudanças não salvas
  setHasUnsavedChanges: (hasChanges) => {
    set({ hasUnsavedChanges: hasChanges });
  },

  // Atualizar agente
  updateAgent: async (data) => {
    try {
      const { agent } = get();
      if (!agent) throw new Error("Agente não encontrado");

      console.log("✏️ [AgentEditStore] Atualizando agente:", agent.id);
      set({ saving: true, error: null });

      const result = await updateAgent(agent.id, { id: agent.id, ...data });

      if (result.success && result.data) {
        console.log("✅ [AgentEditStore] Agente atualizado com sucesso");
        set({ agent: result.data as ApiAgentType, hasUnsavedChanges: false });
        return { success: true, data: result.data };
      } else {
        console.error(
          "❌ [AgentEditStore] Erro ao atualizar agente:",
          result.error
        );
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ [AgentEditStore] Erro:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar agente";
      return { success: false, error: errorMessage };
    } finally {
      set({ saving: false });
    }
  },

  // Validar formulário
  validateForm: () => {
    const { formData } = get();
    const errors: string[] = [];

    if (!formData.matricula) errors.push("Matrícula é obrigatória");
    if (!formData.email) errors.push("Email é obrigatório");
    if (!formData.full_name) errors.push("Nome completo é obrigatório");
    if (!formData.role) errors.push("Tipo de usuário é obrigatório");

    if (formData.matricula && formData.matricula.length !== 11) {
      errors.push("Matrícula deve ter 11 dígitos");
    }

    if (formData.email && !formData.email.includes("@")) {
      errors.push("Email inválido");
    }

    return errors;
  },
}));

// Hook para edição de agente - EXPORTADO COM O NOME CORRETO
export function useAgentEdit(agentId: string) {
  const [initialized, setInitialized] = useState(false);
  const {
    agent,
    loading,
    saving,
    error,
    formData,
    hasUnsavedChanges,
    setAgent,
    setFormData,
    setHasUnsavedChanges,
    updateAgent,
    validateForm,
  } = useAgentEditStore(
    useShallow((state) => ({
      agent: state.agent,
      loading: state.loading,
      saving: state.saving,
      error: state.error,
      formData: state.formData,
      hasUnsavedChanges: state.hasUnsavedChanges,
      setAgent: state.setAgent,
      setFormData: state.setFormData,
      setHasUnsavedChanges: state.setHasUnsavedChanges,
      updateAgent: state.updateAgent,
      validateForm: state.validateForm,
    }))
  );

  // Carregar dados do agente
  useEffect(() => {
    async function loadAgent() {
      if (initialized) return;

      try {
        const result = await getAgent(agentId);
        if (result.success && result.data) {
          setAgent(result.data as ApiAgentType);
        } else {
          throw new Error(result.error || "Agente não encontrado");
        }
      } catch (error) {
        console.error("❌ Erro ao carregar agente:", error);
      } finally {
        setInitialized(true);
      }
    }

    if (agentId) {
      loadAgent();
    }
  }, [agentId, setAgent, initialized]);

  return {
    agent,
    loading,
    saving,
    error,
    formData,
    hasUnsavedChanges,
    setFormData,
    setHasUnsavedChanges,
    updateAgent,
    validateForm,
  };
}
