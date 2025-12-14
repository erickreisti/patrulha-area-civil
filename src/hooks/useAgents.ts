import useSWR, { SWRConfiguration } from "swr";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import type { UserRole } from "@/lib/types/shared"; // ← Import corrigido

interface UseAgentsOptions {
  search?: string;
  status?: boolean;
  role?: UserRole; // ← Tipo corrigido
  page?: number;
  limit?: number;
  enabled?: boolean;
}

interface FetcherResult {
  agents: Profile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const fetcher = async (
  key: string,
  search?: string,
  status?: boolean,
  role?: UserRole, // ← Tipo corrigido
  page: number = 1,
  limit: number = 50
): Promise<FetcherResult> => {
  const supabase = createClient();
  const offset = (page - 1) * limit;

  let query = supabase.from("profiles").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `matricula.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`
    );
  }

  if (status !== undefined) {
    query = query.eq("status", status);
  }

  if (role) {
    query = query.eq("role", role);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    agents: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  };
};

export function useAgents(options: UseAgentsOptions = {}) {
  const {
    search,
    status,
    role,
    page = 1,
    limit = 50,
    enabled = true,
  } = options;

  const cacheKey = `agents:${search || ""}:${status}:${role}:${page}:${limit}`;

  const swrConfig: SWRConfiguration = {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    focusThrottleInterval: 10000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    isPaused: () => !enabled,
  };

  // 🔧 Corrigir: Tipar explicitamente os parâmetros do fetcher
  const fetcherWithTypedParams = async (
    args: [
      string,
      string | undefined,
      boolean | undefined,
      UserRole | undefined, // ← Tipo corrigido
      number,
      number
    ]
  ): Promise<FetcherResult> => {
    const [key, search, status, role, page, limit] = args;
    return fetcher(key, search, status, role, page, limit);
  };

  const { data, error, mutate, isLoading, isValidating } =
    useSWR<FetcherResult>(
      enabled ? [cacheKey, search, status, role, page, limit] : null,
      fetcherWithTypedParams,
      swrConfig
    );

  return {
    agents: data?.agents || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    },
    isLoading: isLoading && !data,
    isValidating,
    isError: !!error,
    error,
    refresh: () => mutate(),
    mutate,

    // Helpers
    findAgent: (id: string) => data?.agents.find((agent) => agent.id === id),
    filterAgents: (predicate: (agent: Profile) => boolean) =>
      data?.agents.filter(predicate) || [],

    // Statistics
    stats: {
      total: data?.pagination.total || 0,
      active: data?.agents.filter((a) => a.status).length || 0,
      admins: data?.agents.filter((a) => a.role === "admin").length || 0,
    },
  };
}
