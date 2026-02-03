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

// ==================== CONSTANTES ====================
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
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
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
    return {
      status: "nao-informada",
      color: "gray",
    };
  }

  try {
    const expiryDate = new Date(certDate);
    const today = new Date();

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

// ==================== STORE PRINCIPAL ====================
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
  filters: AgentsStore["filters"],
): ApiAgentType[] {
  if (!agentList || agentList.length === 0) return [];

  return agentList.filter((agent) => {
    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        agent.matricula.toLowerCase().includes(searchTerm) ||
        agent.email.toLowerCase().includes(searchTerm) ||
        (agent.full_name &&
          agent.full_name.toLowerCase().includes(searchTerm)) ||
        (agent.telefone && agent.telefone.includes(searchTerm)) ||
        (agent.uf && agent.uf.toLowerCase().includes(searchTerm));
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
          `✅ [AgentsStore] ${result.data.length} agentes carregados`,
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
          result.error,
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
        pagination: { ...state.pagination, page: 1 },
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

// ==================== STORE PARA CRIAÇÃO ====================
interface AgentCreateStore {
  // Estado do formulário
  formData: Partial<CreateAgentInput> & {
    matricula?: string;
    email?: string;
    full_name?: string;
    graduacao?: string | null;
    tipo_sanguineo?: string | null;
    validade_certificacao?: string | null;
    role?: "agent" | "admin";
    avatar_url?: string | null;
    uf?: string | null;
    data_nascimento?: string | null;
    telefone?: string | null;
  };
  saving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;

  // Ações
  setFormData: (data: Partial<AgentCreateStore["formData"]>) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  resetFormData: () => void;
  createAgent: (data: CreateAgentInput) => Promise<{
    success: boolean;
    error?: string;
    data?: unknown;
  }>;
  validateForm: () => string[];
  generateMatricula: () => void;
}

const useAgentCreateStore = create<AgentCreateStore>((set, get) => ({
  // Estado inicial
  formData: {
    matricula: "",
    email: "",
    full_name: "",
    graduacao: null,
    tipo_sanguineo: null,
    validade_certificacao: null,
    role: "agent",
    avatar_url: null,
    uf: null,
    data_nascimento: null,
    telefone: null,
  },
  saving: false,
  error: null,
  hasUnsavedChanges: false,

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

  // Resetar formulário
  resetFormData: () => {
    set({
      formData: {
        matricula: "",
        email: "",
        full_name: "",
        graduacao: null,
        tipo_sanguineo: null,
        validade_certificacao: null,
        role: "agent",
        avatar_url: null,
        uf: null,
        data_nascimento: null,
        telefone: null,
      },
      error: null,
      hasUnsavedChanges: false,
    });
  },

  // Criar agente
  createAgent: async (data: CreateAgentInput) => {
    try {
      console.log("🆕 [AgentCreateStore] Criando agente com dados:", data);
      set({ saving: true, error: null });

      const result = await createAgent(data);

      if (result.success) {
        console.log("✅ [AgentCreateStore] Agente criado com sucesso");
        get().resetFormData();
        return { success: true, data: result.data };
      } else {
        console.error(
          "❌ [AgentCreateStore] Erro ao criar agente:",
          result.error,
        );
        set({ error: result.error || "Erro desconhecido" });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ [AgentCreateStore] Erro:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar agente";
      set({ error: errorMessage });
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

    if (formData.matricula && !/^\d+$/.test(formData.matricula)) {
      errors.push("Apenas números são permitidos na matrícula");
    }

    if (formData.email && !formData.email.includes("@")) {
      errors.push("Email inválido");
    }

    if (formData.telefone && formData.telefone.trim() !== "") {
      const cleanPhone = formData.telefone.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        errors.push("Telefone deve ter 10 ou 11 dígitos");
      }
    }

    if (formData.uf && formData.uf.trim() !== "") {
      const ufRegex = /^[A-Z]{2}$/;
      if (!ufRegex.test(formData.uf.toUpperCase())) {
        errors.push("UF deve ter exatamente 2 letras maiúsculas");
      }
    }

    return errors;
  },

  // Gerar matrícula
  generateMatricula: () => {
    const randomMatricula = Math.floor(
      10000000000 + Math.random() * 90000000000,
    ).toString();
    get().setFormData({ matricula: randomMatricula });
  },
}));

// ==================== STORE PARA EDIÇÃO ====================
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
  updateAgent: (data: Partial<Omit<UpdateAgentInput, "id">>) => Promise<{
    success: boolean;
    error?: string;
    data?: unknown;
  }>;
  validateForm: () => string[];
}

const useAgentEditStore = create<AgentEditStore>((set, get) => ({
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

      const result = await updateAgent(agent.id, data);

      if (result.success && result.data) {
        console.log("✅ [AgentEditStore] Agente atualizado com sucesso");
        set({ agent: result.data as ApiAgentType, hasUnsavedChanges: false });
        return { success: true, data: result.data };
      } else {
        console.error(
          "❌ [AgentEditStore] Erro ao atualizar agente:",
          result.error,
        );
        set({ error: result.error || "Erro ao atualizar" });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ [AgentEditStore] Erro:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar agente";
      set({ error: errorMessage });
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

    if (formData.matricula && !/^\d+$/.test(formData.matricula)) {
      errors.push("Apenas números são permitidos na matrícula");
    }

    if (formData.email && !formData.email.includes("@")) {
      errors.push("Email inválido");
    }

    if (formData.telefone && formData.telefone.trim() !== "") {
      const cleanPhone = formData.telefone.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        errors.push("Telefone deve ter 10 ou 11 dígitos");
      }
    }

    if (formData.uf && formData.uf.trim() !== "") {
      const ufRegex = /^[A-Z]{2}$/;
      if (!ufRegex.test(formData.uf.toUpperCase())) {
        errors.push("UF deve ter exatamente 2 letras maiúsculas");
      }
    }

    return errors;
  },
}));

// ==================== HOOKS PÚBLICOS ====================

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
    })),
  );

  // Calcular agentes paginados
  const paginatedAgents = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredAgents.slice(startIndex, startIndex + pagination.limit);
  }, [filteredAgents, pagination.page, pagination.limit]);

  return {
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
    formatDate,
    getCertificationStatus,
  };
}

// Hook para criação de agente
export function useAgentCreate() {
  const {
    formData,
    saving,
    error,
    hasUnsavedChanges,
    setFormData,
    setHasUnsavedChanges,
    resetFormData,
    createAgent,
    validateForm,
    generateMatricula,
  } = useAgentCreateStore(
    useShallow((state) => ({
      formData: state.formData,
      saving: state.saving,
      error: state.error,
      hasUnsavedChanges: state.hasUnsavedChanges,
      setFormData: state.setFormData,
      setHasUnsavedChanges: state.setHasUnsavedChanges,
      resetFormData: state.resetFormData,
      createAgent: state.createAgent,
      validateForm: state.validateForm,
      generateMatricula: state.generateMatricula,
    })),
  );

  return {
    formData,
    saving,
    error,
    hasUnsavedChanges,
    setFormData,
    setHasUnsavedChanges,
    resetFormData,
    createAgent,
    validateForm,
    generateMatricula,
    GRADUACOES,
    TIPOS_SANGUINEOS,
    UFS_BRASIL,
    formatDate,
  };
}

// Hook para edição de agente
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
    })),
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
    GRADUACOES,
    TIPOS_SANGUINEOS,
    UFS_BRASIL,
    formatDate,
  };
}

// Hook simplificado para busca rápida de agentes
export function useAgents() {
  const { agents, loading, error, fetchAgents } = useAgentsStore(
    useShallow((state) => ({
      agents: state.agents,
      loading: state.loading,
      error: state.error,
      fetchAgents: state.fetchAgents,
    })),
  );

  return { agents, loading, error, fetchAgents };
}
