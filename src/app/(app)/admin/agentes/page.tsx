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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  RiUserLine,
  RiSearchLine,
  RiEditLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShieldKeyholeLine,
  RiIdCardLine,
  RiMailLine,
  RiHomeLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiUserAddLine,
  RiShieldUserLine,
  RiCalendarLine,
  RiDropLine,
  RiDashboardLine,
} from "react-icons/ri";

// IMPORT DO STORE CORRIGIDO
import { useAgentsList } from "@/lib/stores/useAgentesStore";

// Componente de estatísticas
const StatCard = ({
  title,
  value,
  icon,
  description,
  color = "blue",
  delay,
  loading = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color?: "blue" | "green" | "red" | "purple" | "gray";
  delay: number;
  loading?: boolean;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    gray: "from-gray-500 to-gray-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1 bg-gray-200" />
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                  {value}
                </p>
              )}
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div
              className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente de placeholder para imagem
const ImageWithFallback = ({
  src,
  alt,
  className = "w-16 h-16",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div
        className={`${className} rounded-full flex items-center justify-center bg-gray-200 border-2 border-gray-300`}
      >
        <RiUserLine className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={`${className} rounded-full overflow-hidden relative bg-gray-200 border-2 border-gray-300`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="64px"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default function AgentesPage() {
  // Usando o hook simplificado
  const {
    agents, // Agentes paginados
    loading,
    error,
    filters,
    pagination,
    agentsStats,
    filteredAgents,
    fetchAgents,
    fetchAgentsStats,
    setFilters,
    setPagination,
    toggleAgentStatus,
    deleteAgent,
    clearError,
    formatDate,
    getCertificationStatus,
  } = useAgentsList();

  const [refreshing, setRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Marcar que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar agentes e estatísticas no início (apenas no cliente)
  useEffect(() => {
    if (isClient) {
      console.log("🔄 [AgentesPage] Iniciando carregamento...");
      fetchAgents();
      fetchAgentsStats().then(() => {
        setStatsLoaded(true);
      });
    }
  }, [fetchAgents, fetchAgentsStats, isClient]);

  // Debug para verificar dados
  useEffect(() => {
    if (isClient && !loading && statsLoaded) {
      console.log("🔍 [AgentesPage] Dados carregados:", {
        agentsCount: agents.length,
        filteredAgentsCount: filteredAgents.length,
        agentsStats,
        loading,
        page: pagination.page,
        totalPages: pagination.totalPages,
      });
    }
  }, [
    agents,
    filteredAgents,
    agentsStats,
    loading,
    pagination,
    isClient,
    statsLoaded,
  ]);

  // Função para buscar agentes
  const handleFetchAgents = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchAgents(), fetchAgentsStats()]);
      toast.success("Lista de agentes atualizada");
    } catch (err) {
      console.error("Erro ao atualizar agentes:", err);
      toast.error("Erro ao atualizar agentes");
    } finally {
      setRefreshing(false);
    }
  }, [fetchAgents, fetchAgentsStats]);

  // Função para excluir agente
  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o agente "${agentName}"?`)) {
      return;
    }

    const result = await deleteAgent(agentId);
    if (result.success) {
      toast.success(`Agente ${agentName} excluído com sucesso`);
    } else {
      toast.error(result.error || "Erro ao excluir agente");
    }
  };

  // Botões de navegação
  const navigationButtons = [
    {
      href: "/admin/dashboard",
      icon: RiDashboardLine,
      label: "Dashboard",
      className:
        "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white",
    },
    {
      href: "/",
      icon: RiHomeLine,
      label: "Voltar ao Site",
      className:
        "border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white",
    },
  ];

  // Resetar página 1 quando filtros mudarem
  useEffect(() => {
    if (pagination.page > 1) {
      setPagination({ page: 1 });
    }
  }, [
    filters.search,
    filters.role,
    filters.status,
    setPagination,
    pagination.page,
  ]);

  // Tratar erros
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Se ainda não está no cliente, mostrar loading
  if (!isClient || (loading && agents.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Spinner className="w-8 h-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            GERENCIAR AGENTES
          </h1>
          <p className="text-gray-600">
            Gerencie todos os agentes da Patrulha Aérea Civil
            <span className="block text-sm text-gray-500 mt-1">
              Total de agentes no sistema:{" "}
              <strong>{agentsStats.total || 0}</strong>
              {filteredAgents.length !== agentsStats.total && (
                <span>
                  {" "}
                  (Filtrados: <strong>{filteredAgents.length}</strong>)
                </span>
              )}
            </span>
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={handleFetchAgents}
            disabled={refreshing || loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RiRefreshLine
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Atualizando..." : "Atualizar Lista"}
          </Button>

          <Link href="/admin/agentes/criar">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <RiUserAddLine className="w-4 h-4 mr-2" />
              Novo Agente
            </Button>
          </Link>

          {navigationButtons.map((button) => (
            <Link key={button.href} href={button.href}>
              <Button variant="outline" className={button.className}>
                <button.icon className="w-4 h-4 mr-2" />
                {button.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total"
            value={agentsStats.total || 0}
            icon={<RiUserLine className="w-6 h-6" />}
            description="Agentes no sistema"
            color="blue"
            delay={0}
            loading={loading && !statsLoaded}
          />
          <StatCard
            title="Ativos"
            value={agentsStats.active || 0}
            icon={<RiEyeLine className="w-6 h-6" />}
            description="Agentes ativos"
            color="green"
            delay={1}
            loading={loading && !statsLoaded}
          />
          <StatCard
            title="Inativos"
            value={agentsStats.inactive || 0}
            icon={<RiEyeOffLine className="w-6 h-6" />}
            description="Agentes inativos"
            color="red"
            delay={2}
            loading={loading && !statsLoaded}
          />
          <StatCard
            title="Administradores"
            value={agentsStats.admins || 0}
            icon={<RiShieldUserLine className="w-6 h-6" />}
            description="Com acesso total"
            color="purple"
            delay={3}
            loading={loading && !statsLoaded}
          />
          <StatCard
            title="Agentes"
            value={agentsStats.agents || 0}
            icon={<RiIdCardLine className="w-6 h-6" />}
            description="Com acesso básico"
            color="gray"
            delay={4}
            loading={loading && !statsLoaded}
          />
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiSearchLine className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por matrícula, nome ou email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={filters.role}
                onValueChange={(value: "all" | "admin" | "agent") =>
                  setFilters({ role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="agent">Agentes</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value: "all" | "active" | "inactive") =>
                  setFilters({ status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Mostrando <strong>{agents.length}</strong> de{" "}
                <strong>{filteredAgents.length}</strong> agentes
                {pagination.totalPages > 1 && (
                  <span>
                    {" "}
                    (Página <strong>{pagination.page}</strong> de{" "}
                    <strong>{pagination.totalPages}</strong>)
                  </span>
                )}
              </div>

              {filteredAgents.length > 0 && (
                <div className="text-sm text-gray-500">
                  <strong>{pagination.limit}</strong> itens por página
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Agentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <RiUserLine className="w-5 h-5 mr-2" />
                Lista de Agentes
              </div>
              {filteredAgents.length > 0 && (
                <Badge variant="secondary">
                  {filteredAgents.length} agentes
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && agents.length === 0 ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
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
                <RiUserLine className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {agentsStats.total === 0
                    ? "Nenhum agente cadastrado"
                    : "Nenhum agente encontrado"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filters.search ||
                  filters.role !== "all" ||
                  filters.status !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Cadastre o primeiro agente do sistema"}
                </p>
                {!filters.search &&
                  filters.role === "all" &&
                  filters.status === "all" &&
                  agentsStats.total === 0 && (
                    <Link href="/admin/agentes/criar">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <RiUserAddLine className="w-4 h-4 mr-2" />
                        Cadastrar Primeiro Agente
                      </Button>
                    </Link>
                  )}
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {agents.map((agent) => {
                    const certStatus = getCertificationStatus(
                      agent.validade_certificacao
                    );

                    return (
                      <div
                        key={agent.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <ImageWithFallback
                              src={agent.avatar_url}
                              alt={agent.full_name || "Agente"}
                              className="w-16 h-16"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-800 truncate">
                                  {agent.full_name || "Nome não informado"}
                                </h3>
                                <Badge
                                  className={
                                    agent.status
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {agent.status ? "✅ ATIVO" : "❌ INATIVO"}
                                </Badge>
                                <Badge
                                  className={
                                    agent.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }
                                >
                                  {agent.role === "admin" ? "ADMIN" : "AGENTE"}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <RiIdCardLine className="w-3 h-3" />
                                  <span className="font-mono">
                                    {agent.matricula}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RiMailLine className="w-3 h-3" />
                                  <span>{agent.email}</span>
                                </div>
                                {agent.graduacao && (
                                  <div className="flex items-center gap-2">
                                    <RiShieldKeyholeLine className="w-3 h-3" />
                                    <span>{agent.graduacao}</span>
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
                                      {formatDate(agent.validade_certificacao)}{" "}
                                      <Badge
                                        variant="outline"
                                        className={`ml-2 text-xs ${
                                          certStatus.color === "green"
                                            ? "bg-green-50 text-green-700"
                                            : certStatus.color === "yellow"
                                            ? "bg-yellow-50 text-yellow-700"
                                            : certStatus.color === "red"
                                            ? "bg-red-50 text-red-700"
                                            : "bg-gray-50 text-gray-700"
                                        }`}
                                      >
                                        {certStatus.status === "valida" &&
                                          "✅ Válida"}
                                        {certStatus.status ===
                                          "proximo-vencimento" && "⚠️ Próximo"}
                                        {certStatus.status === "expirada" &&
                                          "❌ Expirada"}
                                        {certStatus.status ===
                                          "nao-informada" && "ℹ️ Não informada"}
                                      </Badge>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 ml-4">
                            <Link href={`/admin/agentes/${agent.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-600 text-blue-600"
                              >
                                <RiEditLine className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </Link>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAgentStatus(agent.id)}
                              className={
                                agent.status
                                  ? "border-yellow-600 text-yellow-600"
                                  : "border-green-600 text-green-600"
                              }
                            >
                              {agent.status ? (
                                <>
                                  <RiEyeOffLine className="w-3 h-3 mr-1" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <RiEyeLine className="w-3 h-3 mr-1" />
                                  Ativar
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteAgent(
                                  agent.id,
                                  agent.full_name || "Agente"
                                )
                              }
                              className="text-red-600 border-red-600"
                            >
                              <RiDeleteBinLine className="w-3 h-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Página <strong>{pagination.page}</strong> de{" "}
                      <strong>{pagination.totalPages}</strong> -{" "}
                      <strong>{filteredAgents.length}</strong> agentes no total
                    </div>

                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              pagination.page > 1 &&
                              setPagination({ page: pagination.page - 1 })
                            }
                            className={
                              pagination.page === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {[...Array(pagination.totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === pagination.totalPages ||
                            (pageNum >= pagination.page - 1 &&
                              pageNum <= pagination.page + 1)
                          ) {
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() =>
                                    setPagination({ page: pageNum })
                                  }
                                  isActive={pagination.page === pageNum}
                                  className="cursor-pointer"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          if (
                            pageNum === 2 ||
                            pageNum === pagination.totalPages - 1
                          ) {
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              pagination.page < pagination.totalPages &&
                              setPagination({ page: pagination.page + 1 })
                            }
                            className={
                              pagination.page === pagination.totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
