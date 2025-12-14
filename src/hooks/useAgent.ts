import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

interface UseAgentOptions {
  enabled?: boolean;
  refreshInterval?: number;
}

export function useAgent(
  agentId: string | undefined,
  options: UseAgentOptions = {}
) {
  const { enabled = true, refreshInterval = 300000 } = options;

  const { data, error, mutate, isLoading } = useSWR<Profile | null>(
    enabled && agentId ? [`agent`, agentId] : null,
    async ([, id]: [string, string]) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      errorRetryCount: 2,
      onError: (error) => {
        console.error("Erro ao buscar agente:", error);
      },
    }
  );

  // 🔧 MELHORIA: Extrair lógica para variáveis explícitas
  const isAdmin = data?.role === "admin";
  const isActive = data?.status || false;

  return {
    // Dados do agente
    agent: data,

    // Estados de carregamento
    isLoading: isLoading && !data && !error,
    isError: !!error,
    error,

    // Controle de cache
    update: mutate,
    refresh: () => mutate(),

    // Propriedades computadas (mais claras)
    isActive,
    isAdmin,

    // 🔧 MELHORIA ADICIONAL: Métodos auxiliares
    hasPermission: (requiredRole: "admin" | "agent") => {
      if (!data?.role) return false;
      if (requiredRole === "admin") return data.role === "admin";
      return true; // "agent" ou "admin" têm permissão para ações de agent
    },

    // 🔧 MELHORIA: Verificação de campos específicos
    hasMatricula: !!data?.matricula,
    hasEmail: !!data?.email,
    hasFullName: !!data?.full_name,

    // 🔧 MELHORIA: Formatação de dados
    formattedData: data
      ? {
          matricula: data.matricula,
          email: data.email,
          fullName: data.full_name || "Nome não informado",
          role: data.role === "admin" ? "Administrador" : "Agente",
          status: data.status ? "Ativo" : "Inativo",
          graduacao: data.graduacao || "Não informada",
          uf: data.uf || "Não informado",
        }
      : null,
  };
}
