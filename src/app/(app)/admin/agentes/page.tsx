// src/app/(app)/admin/agentes/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
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
  RiAlertLine,
  RiIdCardLine,
  RiCalendarLine,
  RiDropLine,
  RiFilterLine,
} from "react-icons/ri";

// IMPORT CORRIGIDO - usando o hook exportado do store
import { useAgentsList, formatDate } from "@/lib/stores/useAgentesStore";

// Interface para agentes (mantida igual)
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

// Componente de placeholder para avatar
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
        className={`${className} rounded-full bg-gray-200 flex items-center justify-center border border-gray-300`}
      >
        <RiUserLine className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-full overflow-hidden relative`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="48px"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

// Status da certificação (correspondente ao store)
const getCertificationStatus = (certDate: string | null) => {
  if (!certDate) return { color: "gray", label: "Não informada" };

  const expiryDate = new Date(certDate);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { color: "red", label: "Expirada" };
  } else if (diffDays <= 30) {
    return { color: "yellow", label: "Próximo do vencimento" };
  } else {
    return { color: "green", label: "Válida" };
  }
};

// Componente principal
export default function AgentesPage() {
  // Usar o hook do store
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
  const [agentToDelete, setAgentToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchAgents(), fetchAgentsStats()]);
      } catch {
        console.error("Erro ao carregar dados");
      }
    };

    loadData();
  }, [fetchAgents, fetchAgentsStats]);

  // Tratar erros
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Atualizar lista
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchAgents();
      toast.success("Lista atualizada");
    } catch {
      toast.error("Erro ao atualizar lista");
    } finally {
      setRefreshing(false);
    }
  }, [fetchAgents]);

  // Alternar status do agente
  const handleToggleStatus = async (agent: Agent) => {
    try {
      const result = await toggleAgentStatus(agent.id);
      if (result.success) {
        toast.success(
          `Agente ${agent.status ? "desativado" : "ativado"} com sucesso`,
        );
      } else {
        toast.error(result.error || "Erro ao alterar status");
      }
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  // Excluir agente
  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;

    try {
      const result = await deleteAgent(agentToDelete.id);
      if (result.success) {
        toast.success("Agente excluído com sucesso");
        setAgentToDelete(null);
      } else {
        toast.error(result.error || "Erro ao excluir agente");
      }
    } catch {
      toast.error("Erro ao excluir agente");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciamento de Agentes
        </h1>
        <p className="text-gray-600">
          Gerencie todos os agentes cadastrados no sistema
        </p>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RiRefreshLine
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>

        <Link href="/admin/agentes/criar">
          <Button className="bg-green-600 hover:bg-green-700">
            <RiUserAddLine className="w-4 h-4 mr-2" />
            Novo Agente
          </Button>
        </Link>

        <Link href="/admin/dashboard">
          <Button variant="outline">
            <RiShieldUserLine className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">
                  {loading ? "-" : agentsStats.total || 0}
                </p>
              </div>
              <RiUserLine className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? "-" : agentsStats.active || 0}
                </p>
              </div>
              <RiEyeLine className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? "-" : agentsStats.inactive || 0}
                </p>
              </div>
              <RiEyeOffLine className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? "-" : agentsStats.admins || 0}
                </p>
              </div>
              <RiShieldUserLine className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agentes</p>
                <p className="text-2xl font-bold">
                  {loading ? "-" : agentsStats.agents || 0}
                </p>
              </div>
              <RiUserLine className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiFilterLine className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
            </div>

            <Select
              value={filters.role}
              onValueChange={(value: "all" | "admin" | "agent") =>
                setFilters({ ...filters, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="agent">Agentes</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value: "all" | "active" | "inactive") =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de agentes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && agents.length === 0 ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <RiUserLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum agente encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                {filters.search ||
                filters.role !== "all" ||
                filters.status !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Cadastre o primeiro agente do sistema"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => {
                const certStatus = getCertificationStatus(
                  agent.validade_certificacao,
                );

                return (
                  <div
                    key={agent.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-4 mb-4 sm:mb-0 flex-1">
                      <AvatarWithFallback
                        src={agent.avatar_url}
                        alt={agent.full_name || "Agente"}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {agent.full_name || "Nome não informado"}
                          </h3>
                          <Badge
                            variant={agent.status ? "default" : "destructive"}
                          >
                            {agent.status ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge
                            variant={
                              agent.role === "admin" ? "secondary" : "outline"
                            }
                          >
                            {agent.role === "admin" ? "Admin" : "Agente"}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <RiIdCardLine className="w-3 h-3" />
                            <span className="font-mono">{agent.matricula}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RiMailLine className="w-3 h-3" />
                            <span>{agent.email}</span>
                          </div>
                          {agent.graduacao && (
                            <div className="flex items-center gap-2">
                              <span>Graduação: {agent.graduacao}</span>
                            </div>
                          )}
                          {agent.tipo_sanguineo && (
                            <div className="flex items-center gap-2">
                              <RiDropLine className="w-3 h-3" />
                              <span>
                                Tipo Sanguíneo: {agent.tipo_sanguineo}
                              </span>
                            </div>
                          )}
                          {agent.validade_certificacao && (
                            <div className="flex items-center gap-2">
                              <RiCalendarLine className="w-3 h-3" />
                              <span>
                                Certificação:{" "}
                                {formatDate(agent.validade_certificacao)}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  certStatus.color === "green"
                                    ? "border-green-200 text-green-700"
                                    : certStatus.color === "yellow"
                                      ? "border-yellow-200 text-yellow-700"
                                      : certStatus.color === "red"
                                        ? "border-red-200 text-red-700"
                                        : "border-gray-200 text-gray-700"
                                }`}
                              >
                                {certStatus.label}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/admin/agentes/${agent.id}`}>
                        <Button variant="outline" size="sm">
                          <RiEditLine className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(agent)}
                        className={
                          agent.status
                            ? "text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 border-green-600 hover:bg-green-50"
                        }
                      >
                        {agent.status ? (
                          <>
                            <RiEyeOffLine className="w-4 h-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <RiEyeLine className="w-4 h-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>

                      <AlertDialog
                        open={
                          agentToDelete?.id === agent.id &&
                          agentToDelete !== null
                        }
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
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() =>
                              setAgentToDelete({
                                id: agent.id,
                                name: agent.full_name || "Agente",
                              })
                            }
                          >
                            <RiDeleteBinLine className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              <div className="flex items-center gap-2 text-red-600">
                                <RiAlertLine className="w-5 h-5" />
                                Confirmar exclusão
                              </div>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir permanentemente o
                              agente <strong>{agentToDelete?.name}</strong>?
                              <br />
                              <br />
                              <span className="text-red-500 font-semibold">
                                ⚠️ Esta ação não pode ser desfeita!
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setAgentToDelete(null)}
                            >
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAgent}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
