"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Icons
import {
  RiUserLine,
  RiSearchLine,
  RiEditLine,
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiUserAddLine,
  RiShieldUserLine,
  // RiAlertLine removido (não estava sendo usado)
  RiIdCardLine,
  RiCalendarLine,
  RiFilterLine,
  RiShieldCheckLine,
  RiGroupLine,
  RiDashboardLine,
  RiMedalLine,
} from "react-icons/ri";

// Stores & Components
import { useAgentsList, formatDate } from "@/lib/stores/useAgentesStore";
import { StatCard } from "@/components/admin/StatCard";
import { AdminAuthModal } from "@/components/admin/AdminAuthModal";

// --- TYPES & HELPERS ---

interface Agent {
  id: string;
  matricula: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  graduacao: string | null;
  validade_certificacao: string | null;
  tipo_sanguineo: string | null;
  status: boolean;
  role: "admin" | "agent";
  created_at: string;
  updated_at: string;
}

const AvatarWithFallback = ({
  src,
  alt,
  className = "w-12 h-12",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`${className} rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400`}
      >
        <RiUserLine className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-full overflow-hidden relative border border-slate-200 shadow-sm`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="64px"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

const getCertificationStatus = (certDate: string | null) => {
  if (!certDate)
    return {
      color: "bg-slate-100 text-slate-600 border-slate-200",
      label: "N/A",
    };

  const expiryDate = new Date(certDate);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return {
      color: "bg-red-50 text-red-700 border-red-200",
      label: "Expirada",
    };
  if (diffDays <= 30)
    return {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Vence em breve",
    };
  return {
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Válida",
  };
};

// --- PAGE COMPONENT ---

export default function AgentesPage() {
  const {
    agents,
    loading,
    error,
    filters,
    agentsStats,
    fetchAgents,
    fetchAgentsStats,
    setFilters,
    toggleAgentStatus,
    deleteAgent,
    clearError,
  } = useAgentsList();

  const [refreshing, setRefreshing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchAgents(), fetchAgentsStats()]);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [fetchAgents, fetchAgentsStats]);

  useEffect(() => {
    if (error) {
      if (error.includes("Sessão") || error.includes("autorizado")) {
        setShowAuthModal(true);
      } else {
        toast.error(error);
      }
      clearError();
    }
  }, [error, clearError]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchAgents();
      toast.success("Dados atualizados");
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setRefreshing(false);
    }
  }, [fetchAgents]);

  const handleToggleStatus = async (agent: Agent) => {
    try {
      const result = await toggleAgentStatus(agent.id);
      if (result.success)
        toast.success(`Status de ${agent.full_name} atualizado`);
      else toast.error(result.error);
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      const result = await deleteAgent(agentToDelete.id);
      if (result.success) {
        toast.success("Agente removido");
        setAgentToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 font-sans">
      <AdminAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-bebas">
              GERENCIAR AGENTES
            </h1>
            <p className="text-slate-500 text-sm">
              Administração de efetivo e permissões do sistema.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              variant="outline"
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              <RiRefreshLine
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>

            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
              >
                <RiDashboardLine className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            </Link>

            <Link href="/admin/agentes/criar">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10">
                <RiUserAddLine className="mr-2 h-4 w-4" /> Novo Agente
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total"
            value={agentsStats.total || 0}
            icon={RiGroupLine}
            loading={loading}
            variant="primary"
          />
          <StatCard
            title="Ativos"
            value={agentsStats.active || 0}
            icon={RiShieldCheckLine}
            loading={loading}
            variant="success"
          />
          <StatCard
            title="Inativos"
            value={agentsStats.inactive || 0}
            icon={RiEyeOffLine}
            loading={loading}
            variant="warning"
          />
          <StatCard
            title="Admins"
            value={agentsStats.admins || 0}
            icon={RiShieldUserLine}
            loading={loading}
            variant="purple"
          />
          <StatCard
            title="Agentes"
            value={agentsStats.agents || 0}
            icon={RiUserLine}
            loading={loading}
            // CORREÇÃO: "default" não existe, alterado para "primary"
            variant="primary"
          />
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm mb-8 bg-white">
          <CardHeader className="pb-4 border-b border-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <RiFilterLine className="text-sky-600" /> Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, matrícula ou email..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10 h-10 border-slate-200 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <Select
                value={filters.role}
                onValueChange={(value: "all" | "admin" | "agent") =>
                  setFilters({ ...filters, role: value })
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Tipo de Função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Funções</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="agent">Agentes Operacionais</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value: "all" | "active" | "inactive") =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Status da Conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Contas Ativas</SelectItem>
                  <SelectItem value="inactive">Contas Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card className="border-none shadow-sm bg-white min-h-[400px]">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">
              Membros ({agents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading && agents.length === 0 ? (
              <div className="space-y-4 py-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border rounded-xl border-slate-100"
                  >
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-20">
                <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-3">
                  <RiUserLine className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-600 font-medium">
                  Nenhum agente encontrado
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Tente ajustar os filtros ou cadastre um novo.
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                {agents.map((agent) => {
                  const cert = getCertificationStatus(
                    agent.validade_certificacao,
                  );

                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all bg-white"
                    >
                      {/* Info Principal */}
                      <div className="flex items-start gap-4 mb-4 md:mb-0 flex-1">
                        <AvatarWithFallback
                          src={agent.avatar_url}
                          alt={agent.full_name || ""}
                          className="w-14 h-14"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-slate-800 truncate text-base">
                              {agent.full_name || "Sem Nome"}
                            </h3>
                            {agent.role === "admin" && (
                              <Badge
                                variant="secondary"
                                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 text-[10px] px-2 py-0.5"
                              >
                                Admin
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 ${agent.status ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
                            >
                              {agent.status ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-6 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <RiIdCardLine className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono text-slate-600">
                                {agent.matricula}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <RiMailLine className="w-3.5 h-3.5 text-slate-400" />
                              <span
                                className="truncate max-w-[150px]"
                                title={agent.email}
                              >
                                {agent.email}
                              </span>
                            </div>

                            {agent.graduacao && (
                              <div className="flex items-center gap-1.5">
                                <RiMedalLine className="w-3.5 h-3.5 text-slate-400" />
                                <span>{agent.graduacao}</span>
                              </div>
                            )}

                            {agent.validade_certificacao && (
                              <div className="flex items-center gap-1.5">
                                <RiCalendarLine className="w-3.5 h-3.5 text-slate-400" />
                                {/* CORREÇÃO: Agora 'formatDate' é usado aqui */}
                                <span className="text-slate-600 mr-1">
                                  {formatDate(agent.validade_certificacao)}
                                </span>
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${cert.color}`}
                                >
                                  {cert.label}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 md:border-l md:border-slate-100 md:pl-4 md:ml-2">
                        <Link href={`/admin/agentes/${agent.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                          >
                            <RiEditLine className="w-4 h-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(agent)}
                          className={`h-9 w-9 rounded-lg ${agent.status ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"}`}
                          title={agent.status ? "Desativar" : "Ativar"}
                        >
                          {agent.status ? (
                            <RiEyeOffLine className="w-4 h-4" />
                          ) : (
                            <RiEyeLine className="w-4 h-4" />
                          )}
                        </Button>

                        <AlertDialog
                          open={agentToDelete?.id === agent.id}
                          onOpenChange={(open) =>
                            setAgentToDelete(
                              open
                                ? {
                                    id: agent.id,
                                    name: agent.full_name || "Agente",
                                  }
                                : null,
                            )
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <RiDeleteBinLine className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-800">
                                Confirmar exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500">
                                Tem certeza que deseja excluir{" "}
                                <strong>{agentToDelete?.name}</strong>?
                                <br />
                                Essa ação é irreversível e removerá todos os
                                dados associados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-lg border-slate-200">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAgent}
                                className="bg-red-600 hover:bg-red-700 rounded-lg text-white"
                              >
                                Excluir Permanentemente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
