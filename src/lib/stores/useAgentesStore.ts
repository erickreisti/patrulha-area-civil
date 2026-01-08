import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Agent,
  CreateAgentInput,
  UpdateAgentInput,
} from "@/app/actions/admin/agents/agents";

// ============================================
// TYPES
// ============================================

export interface AgentFilter {
  search: string;
  role: "admin" | "agent" | "all";
  status: "active" | "inactive" | "all";
}

export interface AgentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AgentFormData {
  matricula: string;
  email: string;
  full_name: string;
  graduacao: string | null;
  tipo_sanguineo: string | null;
  validade_certificacao: string | null;
  role: "admin" | "agent";
  status: boolean;
  avatar_url: string | null;
}

// ============================================
// STORE STATE INTERFACE
// ============================================

interface AgentsStoreState {
  // Estado principal
  agents: Agent[];
  selectedAgent: Agent | null;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;

  // Filtros e paginação
  filters: AgentFilter;
  pagination: AgentPagination;

  // Estado de formulários
  formData: Partial<AgentFormData>;
  hasUnsavedChanges: boolean;

  // Ações - CRUD
  fetchAgents: (force?: boolean) => Promise<void>;
  fetchAgent: (id: string) => Promise<void>;
  createAgent: (
    data: CreateAgentInput
  ) => Promise<{ success: boolean; error?: string }>;
  updateAgent: (
    id: string,
    data: Partial<UpdateAgentInput>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteAgent: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleAgentStatus: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Ações - Filtros e Paginação
  setFilters: (filters: Partial<AgentFilter>) => void;
  setPagination: (pagination: Partial<AgentPagination>) => void;
  resetFilters: () => void;

  // Ações - Seleção e Formulários
  selectAgent: (agent: Agent | null) => void;
  setFormData: (data: Partial<AgentFormData>) => void;
  resetFormData: () => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  // Ações - Utilitárias
  clearError: () => void;
  clearSelection: () => void;
  refreshAgent: (id: string) => Promise<void>;

  // Computed values
  filteredAgents: Agent[];
  paginatedAgents: Agent[];
  agentsStats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    agents: number;
  };
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: Omit<
  AgentsStoreState,
  | "fetchAgents"
  | "fetchAgent"
  | "createAgent"
  | "updateAgent"
  | "deleteAgent"
  | "toggleAgentStatus"
  | "setFilters"
  | "setPagination"
  | "resetFilters"
  | "selectAgent"
  | "setFormData"
  | "resetFormData"
  | "setHasUnsavedChanges"
  | "clearError"
  | "clearSelection"
  | "refreshAgent"
  | "filteredAgents"
  | "paginatedAgents"
  | "agentsStats"
> = {
  agents: [],
  selectedAgent: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,

  filters: {
    search: "",
    role: "all",
    status: "all",
  },

  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },

  formData: {},
  hasUnsavedChanges: false,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Helper para formatar data (evita duplicação)
export const formatDate = (dateString: string | null) => {
  if (!dateString) return "Não informada";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  } catch {
    return "Data inválida";
  }
};

// Helper para status da certificação (evita duplicação)
export const getCertificationStatus = (validadeCertificacao: string | null) => {
  if (!validadeCertificacao) return { status: "nao-informada", color: "gray" };

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const certDate = new Date(validadeCertificacao);

  if (isNaN(certDate.getTime())) {
    return { status: "invalida", color: "red" };
  }

  if (certDate < todayStart) {
    return { status: "expirada", color: "red" };
  }

  const diffTime = certDate.getTime() - todayStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) {
    return { status: "proximo-vencimento", color: "yellow" };
  }

  return { status: "valida", color: "green" };
};

// ============================================
// MAIN STORE
// ============================================

export const useAgentsStore = create<AgentsStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // COMPUTED VALUES (getters)
      // ============================================

      get filteredAgents() {
        const { agents, filters } = get();

        return agents.filter((agent) => {
          const matchesSearch =
            agent.matricula
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            agent.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            (agent.full_name &&
              agent.full_name
                .toLowerCase()
                .includes(filters.search.toLowerCase()));

          const matchesRole =
            filters.role === "all" || agent.role === filters.role;
          const matchesStatus =
            filters.status === "all" ||
            (filters.status === "active" && agent.status) ||
            (filters.status === "inactive" && !agent.status);

          return matchesSearch && matchesRole && matchesStatus;
        });
      },

      get paginatedAgents() {
        const { filteredAgents, pagination } = get();
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        return filteredAgents.slice(startIndex, endIndex);
      },

      get agentsStats() {
        const { agents } = get();

        return {
          total: agents.length,
          active: agents.filter((a) => a.status).length,
          inactive: agents.filter((a) => !a.status).length,
          admins: agents.filter((a) => a.role === "admin").length,
          agents: agents.filter((a) => a.role === "agent").length,
        };
      },

      // ============================================
      // CRUD OPERATIONS
      // ============================================

      fetchAgents: async (force = false) => {
        const state = get();

        // Se já está carregando, não faz nada
        if (state.loading && !force) return;

        // Se tem agentes e não for forçado, usa cache
        if (state.agents.length > 0 && !force) {
          console.log("📦 [AgentsStore] Usando cache de agentes");
          return;
        }

        set({ loading: true, error: null });

        try {
          console.log("🔄 [AgentsStore] Buscando agentes...");

          const agentsModule = await import(
            "@/app/actions/admin/agents/agents"
          );
          const result = await agentsModule.getAgents();

          if (result.success && result.data) {
            console.log(
              `✅ [AgentsStore] ${result.data.length} agentes carregados`
            );

            set({
              agents: result.data,
              pagination: {
                ...state.pagination,
                total: result.data.length,
                totalPages: Math.ceil(
                  result.data.length / state.pagination.limit
                ),
              },
              loading: false,
            });
          } else {
            throw new Error(result.error || "Erro ao buscar agentes");
          }
        } catch (error) {
          console.error("❌ [AgentsStore] Erro ao buscar agentes:", error);

          set({
            loading: false,
            error:
              error instanceof Error ? error.message : "Erro ao buscar agentes",
          });
        }
      },

      fetchAgent: async (id: string) => {
        set({ loading: true, error: null });

        try {
          console.log(`🔄 [AgentsStore] Buscando agente ${id}...`);

          const agentsModule = await import(
            "@/app/actions/admin/agents/agents"
          );
          const result = await agentsModule.getAgent(id);

          if (result.success && result.data) {
            console.log(
              `✅ [AgentsStore] Agente carregado: ${result.data.full_name}`
            );

            // Atualiza na lista também
            set((state) => ({
              selectedAgent: result.data,
              agents: state.agents.map((agent) =>
                agent.id === id ? result.data! : agent
              ),
              loading: false,
            }));
          } else {
            throw new Error(result.error || "Agente não encontrado");
          }
        } catch (error) {
          console.error(`❌ [AgentsStore] Erro ao buscar agente ${id}:`, error);

          set({
            loading: false,
            error:
              error instanceof Error ? error.message : "Erro ao buscar agente",
          });
        }
      },

      createAgent: async (data: CreateAgentInput) => {
        set({ saving: true, error: null });

        try {
          console.log("🔄 [AgentsStore] Criando novo agente...");

          const agentsModule = await import(
            "@/app/actions/admin/agents/agents"
          );
          const result = await agentsModule.createAgent(data);

          if (result.success && result.data) {
            console.log(
              `✅ [AgentsStore] Agente criado: ${result.data.full_name}`
            );

            // Adiciona ao início da lista
            set((state) => ({
              agents: [result.data!, ...state.agents],
              saving: false,
            }));

            // Atualiza estatísticas
            set((state) => ({
              pagination: {
                ...state.pagination,
                total: state.agents.length + 1,
                totalPages: Math.ceil(
                  (state.agents.length + 1) / state.pagination.limit
                ),
              },
            }));

            return { success: true };
          } else {
            throw new Error(result.error || "Erro ao criar agente");
          }
        } catch (error) {
          console.error("❌ [AgentsStore] Erro ao criar agente:", error);

          const errorMsg =
            error instanceof Error ? error.message : "Erro ao criar agente";
          set({ saving: false, error: errorMsg });

          return { success: false, error: errorMsg };
        }
      },

      updateAgent: async (id: string, data: Partial<UpdateAgentInput>) => {
        set({ saving: true, error: null });

        try {
          console.log(`🔄 [AgentsStore] Atualizando agente ${id}...`);

          const agentsModule = await import(
            "@/app/actions/admin/agents/agents"
          );
          const result = await agentsModule.updateAgent(id, data);

          if (result.success && result.data) {
            console.log(
              `✅ [AgentsStore] Agente atualizado: ${result.data.full_name}`
            );

            // Atualiza na lista
            set((state) => ({
              agents: state.agents.map((agent) =>
                agent.id === id ? result.data! : agent
              ),
              selectedAgent:
                state.selectedAgent?.id === id
                  ? result.data!
                  : state.selectedAgent,
              saving: false,
              hasUnsavedChanges: false,
            }));

            return { success: true };
          } else {
            throw new Error(result.error || "Erro ao atualizar agente");
          }
        } catch (error) {
          console.error(
            `❌ [AgentsStore] Erro ao atualizar agente ${id}:`,
            error
          );

          const errorMsg =
            error instanceof Error ? error.message : "Erro ao atualizar agente";
          set({ saving: false, error: errorMsg });

          return { success: false, error: errorMsg };
        }
      },

      deleteAgent: async (id: string) => {
        set({ deleting: true, error: null });

        try {
          console.log(`🔄 [AgentsStore] Excluindo agente ${id}...`);

          const agentsModule = await import(
            "@/app/actions/admin/agents/agents"
          );
          const result = await agentsModule.deleteAgent(id);

          if (result.success) {
            console.log(`✅ [AgentsStore] Agente ${id} excluído`);

            // Remove da lista
            set((state) => {
              const newAgents = state.agents.filter((agent) => agent.id !== id);

              return {
                agents: newAgents,
                selectedAgent:
                  state.selectedAgent?.id === id ? null : state.selectedAgent,
                deleting: false,
                pagination: {
                  ...state.pagination,
                  total: newAgents.length,
                  totalPages: Math.ceil(
                    newAgents.length / state.pagination.limit
                  ),
                },
              };
            });

            return { success: true };
          } else {
            throw new Error(result.error || "Erro ao excluir agente");
          }
        } catch (error) {
          console.error(
            `❌ [AgentsStore] Erro ao excluir agente ${id}:`,
            error
          );

          const errorMsg =
            error instanceof Error ? error.message : "Erro ao excluir agente";
          set({ deleting: false, error: errorMsg });

          return { success: false, error: errorMsg };
        }
      },

      toggleAgentStatus: async (id: string) => {
        const state = get();
        const agent = state.agents.find((a) => a.id === id);

        if (!agent) {
          return { success: false, error: "Agente não encontrado" };
        }

        const newStatus = !agent.status;

        try {
          console.log(
            `🔄 [AgentsStore] Alternando status do agente ${id} para ${
              newStatus ? "ativo" : "inativo"
            }...`
          );

          const agentsModule = await import(
            "@/app/actions/admin/agents/agents"
          );
          const result = await agentsModule.updateAgentStatus(id, newStatus);

          if (result.success && result.data) {
            console.log(
              `✅ [AgentsStore] Status alterado para ${
                newStatus ? "ativo" : "inativo"
              }`
            );

            // Atualiza na lista
            set((state) => ({
              agents: state.agents.map((agent) =>
                agent.id === id ? { ...agent, status: newStatus } : agent
              ),
              selectedAgent:
                state.selectedAgent?.id === id
                  ? { ...state.selectedAgent, status: newStatus }
                  : state.selectedAgent,
            }));

            return { success: true };
          } else {
            throw new Error(result.error || "Erro ao alterar status");
          }
        } catch (error) {
          console.error(
            `❌ [AgentsStore] Erro ao alternar status do agente ${id}:`,
            error
          );

          const errorMsg =
            error instanceof Error ? error.message : "Erro ao alternar status";
          set({ error: errorMsg });

          return { success: false, error: errorMsg };
        }
      },

      // ============================================
      // FILTERS & PAGINATION
      // ============================================

      setFilters: (newFilters) => {
        set((state) => {
          const filters = { ...state.filters, ...newFilters };

          // Reseta para página 1 quando filtro muda
          return {
            filters,
            pagination: {
              ...state.pagination,
              page: 1,
            },
          };
        });
      },

      setPagination: (newPagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination },
        }));
      },

      resetFilters: () => {
        set({
          filters: initialState.filters,
          pagination: {
            ...initialState.pagination,
            page: 1,
          },
        });
      },

      // ============================================
      // SELECTION & FORM MANAGEMENT
      // ============================================

      selectAgent: (agent) => {
        set({
          selectedAgent: agent,
          formData: agent
            ? {
                matricula: agent.matricula,
                email: agent.email,
                full_name: agent.full_name || "",
                graduacao: agent.graduacao || null,
                tipo_sanguineo: agent.tipo_sanguineo || null,
                validade_certificacao: agent.validade_certificacao || null,
                role: agent.role,
                status: agent.status,
                avatar_url: agent.avatar_url || null,
              }
            : {},
          hasUnsavedChanges: false,
        });
      },

      setFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
          hasUnsavedChanges: true,
        }));
      },

      resetFormData: () => {
        set({
          formData: initialState.formData,
          hasUnsavedChanges: false,
        });
      },

      setHasUnsavedChanges: (hasChanges) => {
        set({ hasUnsavedChanges: hasChanges });
      },

      // ============================================
      // UTILITY ACTIONS
      // ============================================

      clearError: () => {
        set({ error: null });
      },

      clearSelection: () => {
        set({
          selectedAgent: null,
          formData: initialState.formData,
          hasUnsavedChanges: false,
        });
      },

      refreshAgent: async (id: string) => {
        try {
          await get().fetchAgent(id);
        } catch (error) {
          console.error(
            `❌ [AgentsStore] Erro ao atualizar agente ${id}:`,
            error
          );
        }
      },
    }),
    {
      name: "agents-storage",
      partialize: (state) => ({
        agents: state.agents,
        filters: state.filters,
        pagination: state.pagination,
        formData: state.formData,
      }),
    }
  )
);

// ============================================
// CUSTOM HOOKS PARA USO ESPECÍFICO
// ============================================

/**
 * Hook para a página de lista de agentes
 */
export const useAgentsList = () => {
  const {
    agents,
    loading,
    error,
    filters,
    pagination,
    paginatedAgents,
    agentsStats,
    filteredAgents,
    fetchAgents,
    setFilters,
    setPagination,
    resetFilters,
    toggleAgentStatus,
    deleteAgent,
    clearError,
  } = useAgentsStore();

  return {
    // Dados
    agents: paginatedAgents,
    allAgents: agents,
    filteredAgents,
    loading,
    error,

    // Filtros e paginação
    filters,
    pagination,
    agentsStats,

    // Ações
    fetchAgents,
    setFilters,
    setPagination,
    resetFilters,
    toggleAgentStatus,
    deleteAgent,
    clearError,

    // Utilitários
    formatDate,
    getCertificationStatus,
  };
};

/**
 * Hook para a página de edição de agente
 */
import { useEffect } from "react";

export const useAgentEdit = (agentId?: string) => {
  const {
    selectedAgent,
    loading,
    saving,
    error,
    formData,
    hasUnsavedChanges,
    fetchAgent,
    updateAgent,
    setFormData,
    setHasUnsavedChanges,
    clearError,
    clearSelection,
  } = useAgentsStore();

  // Carrega o agente se ID for fornecido
  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId);
    }
  }, [agentId, fetchAgent]);

  return {
    // Dados
    agent: selectedAgent,
    loading,
    saving,
    error,
    formData,
    hasUnsavedChanges,

    // Ações
    updateAgent: (data: Partial<UpdateAgentInput>) => {
      if (!agentId)
        return Promise.resolve({ success: false, error: "ID não fornecido" });
      return updateAgent(agentId, data);
    },
    setFormData,
    setHasUnsavedChanges,
    clearError,
    clearSelection,

    // Validação
    validateForm: () => {
      const errors: string[] = [];

      if (!formData.matricula?.trim()) {
        errors.push("Matrícula é obrigatória");
      }

      if (!formData.full_name?.trim()) {
        errors.push("Nome completo é obrigatório");
      }

      if (!formData.email?.trim() || !formData.email.includes("@")) {
        errors.push("Email válido é obrigatório");
      }

      return errors;
    },
  };
};

/**
 * Hook para a página de criação de agente
 */
export const useAgentCreate = () => {
  const {
    saving,
    error,
    formData,
    createAgent,
    setFormData,
    resetFormData,
    clearError,
  } = useAgentsStore();

  // Função para gerar matrícula única
  const generateMatricula = async () => {
    try {
      const generateUnique = async (): Promise<string> => {
        const randomNum = Math.floor(10000000000 + Math.random() * 90000000000);
        const matricula = randomNum.toString();

        // Verificar se já existe
        const agentsModule = await import("@/app/actions/admin/agents/agents");
        const exists = await agentsModule.validateMatricula(matricula);

        if (exists) {
          return generateUnique(); // Recursivo até achar único
        }
        return matricula;
      };

      const newMatricula = await generateUnique();
      setFormData({ matricula: newMatricula });
    } catch (error) {
      console.error("Erro ao gerar matrícula:", error);
      // Fallback: gerar matrícula sem validação
      const randomNum = Math.floor(10000000000 + Math.random() * 90000000000);
      setFormData({ matricula: randomNum.toString() });
    }
  };

  return {
    // Estado
    saving,
    error,
    formData,

    // Ações
    createAgent,
    setFormData,
    resetFormData,
    clearError,
    generateMatricula,

    // Validação
    validateForm: () => {
      const errors: string[] = [];

      if (!formData.matricula?.trim()) {
        errors.push("Matrícula é obrigatória");
      } else if (formData.matricula.length !== 11) {
        errors.push("Matrícula deve ter 11 dígitos");
      } else if (!/^\d+$/.test(formData.matricula)) {
        errors.push("Matrícula deve conter apenas números");
      }

      if (!formData.full_name?.trim()) {
        errors.push("Nome completo é obrigatório");
      }

      if (!formData.email?.trim() || !formData.email.includes("@")) {
        errors.push("Email válido é obrigatório");
      }

      return errors;
    },
  };
};

/**
 * Hook para estatísticas rápidas (dashboard)
 */
export const useAgentsStats = () => {
  const { agentsStats, fetchAgents } = useAgentsStore();

  return {
    stats: agentsStats,
    refresh: fetchAgents,
  };
};

// ============================================
// CONSTANTS (Evita duplicação entre páginas)
// ============================================

export const GRADUACOES = [
  "COMODORO DE BRIGADA - PAC",
  "COMODORO - PAC",
  "VICE COMODORO - PAC",
  "CORONEL - PAC",
  "TENENTE CORONEL - PAC",
  "MAJOR - PAC",
  "CAPITÃO - PAC",
  "1° TENENTE - PAC",
  "2° TENENTE - PAC",
  "ASPIRANTE -a- OFICIAL - PAC",
  "SUBOFICIAL - PAC",
  "1° SARGENTO - PAC",
  "2° SARGENTO - PAC",
  "3° SARGENTO - PAC",
  "CABO - PAC",
  "PATRULHEIRO",
  "AGENTE - PAC",
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
