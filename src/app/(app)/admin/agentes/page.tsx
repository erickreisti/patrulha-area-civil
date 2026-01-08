"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";

// IMPORT DO STORE
import {
  useAgentsList,
  formatDate,
  getCertificationStatus,
} from "@/lib/stores";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

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
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1 transition-colors duration-300">
                {title}
              </p>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1 bg-gray-200" />
              ) : (
                <motion.p
                  className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: delay * 0.1 + 0.2 }}
                >
                  {value}
                </motion.p>
              )}
              <p className="text-xs text-gray-500 transition-colors duration-300">
                {description}
              </p>
            </div>
            <motion.div
              className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
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
        sizes="(max-width: 768px) 64px, 64px"
        onError={() => setImageError(true)}
        priority={false}
        loading="lazy"
      />
    </div>
  );
};

// Componente de Paginação Customizado
const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const maxVisiblePages = 5;

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {visiblePages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
                isActive={currentPage === 1}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {visiblePages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
              isActive={currentPage === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(totalPages);
                }}
                isActive={currentPage === totalPages}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default function AgentesPage() {
  // USANDO O STORE
  const {
    agents,
    loading,
    error,
    filters,
    pagination,
    agentsStats,
    filteredAgents,
    fetchAgents,
    setFilters,
    setPagination,
    toggleAgentStatus,
    deleteAgent,
    clearError,
  } = useAgentsList();

  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 10;

  // Calcular agentes paginados
  const paginatedAgents = useMemo(() => {
    const startIndex = (pagination.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAgents.slice(startIndex, endIndex);
  }, [filteredAgents, pagination.page, itemsPerPage]);

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);

  // Função para buscar agentes
  const handleFetchAgents = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchAgents(true); // Force refresh
      toast.success("Lista de agentes atualizada");
    } catch (err) {
      console.error("Erro ao atualizar agentes:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAgents]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Carregar agentes na inicialização
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Resetar página 1 quando filtros mudarem
  useEffect(() => {
    setPagination({ page: 1 });
  }, [filters.search, filters.role, filters.status, setPagination]);

  // Tratar erros
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header - TÍTULO E DESCRIÇÃO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
            GERENCIAR AGENTES
          </h1>
          <p className="text-gray-600">
            Gerencie todos os agentes da Patrulha Aérea Civil
            <span className="block text-sm text-gray-500 mt-1">
              Total de agentes carregados: <strong>{agents.length}</strong>
            </span>
          </p>
        </motion.div>

        {/* ✅ BOTÕES ABAIXO DO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {/* Botão de Atualizar */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleFetchAgents}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50 transition-colors duration-300"
            >
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{
                  duration: 1,
                  repeat: refreshing ? Infinity : 0,
                }}
              >
                <RiRefreshLine
                  className={`w-4 h-4 ${
                    refreshing ? "text-blue-600" : "text-gray-600"
                  }`}
                />
              </motion.div>
              {refreshing ? (
                <>
                  <Spinner className="mr-2" />
                  Atualizando...
                </>
              ) : (
                "Atualizar Lista"
              )}
            </Button>
          </motion.div>

          {/* Botão Novo Agente */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/admin/agentes/criar">
              <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                <RiUserAddLine className="w-4 h-4 mr-2" />
                Novo Agente
              </Button>
            </Link>
          </motion.div>

          {/* Botões de Navegação */}
          {navigationButtons.map((button, index) => (
            <motion.div
              key={button.href}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={button.href}>
                <Button
                  variant="outline"
                  className={`transition-all duration-300 ${button.className}`}
                >
                  <button.icon className="w-4 h-4 mr-2" />
                  {button.label}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total"
            value={agentsStats.total}
            icon={<RiUserLine className="w-6 h-6" />}
            description="Agentes no sistema"
            color="blue"
            delay={0}
            loading={loading}
          />
          <StatCard
            title="Ativos"
            value={agentsStats.active}
            icon={<RiEyeLine className="w-6 h-6" />}
            description="Agentes ativos"
            color="green"
            delay={1}
            loading={loading}
          />
          <StatCard
            title="Inativos"
            value={agentsStats.inactive}
            icon={<RiEyeOffLine className="w-6 h-6" />}
            description="Agentes inativos"
            color="red"
            delay={2}
            loading={loading}
          />
          <StatCard
            title="Administradores"
            value={agentsStats.admins}
            icon={<RiShieldUserLine className="w-6 h-6" />}
            description="Com acesso total"
            color="purple"
            delay={3}
            loading={loading}
          />
          <StatCard
            title="Agentes"
            value={agentsStats.agents}
            icon={<RiIdCardLine className="w-6 h-6" />}
            description="Com acesso básico"
            color="gray"
            delay={4}
            loading={loading}
          />
        </div>

        {/* Filtros e Busca */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <RiSearchLine className="w-5 h-5 text-navy-600" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Busca */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-300" />
                    <Input
                      type="text"
                      placeholder="Buscar por matrícula, nome ou email..."
                      value={filters.search}
                      onChange={(e) => setFilters({ search: e.target.value })}
                      className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtro por Tipo */}
                <div>
                  <Select
                    value={filters.role}
                    onValueChange={(value: "all" | "admin" | "agent") =>
                      setFilters({ role: value })
                    }
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                      <SelectItem value="agent">Agentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por Status */}
                <div>
                  <Select
                    value={filters.status}
                    onValueChange={(value: "all" | "active" | "inactive") =>
                      setFilters({ status: value })
                    }
                  >
                    <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 transition-colors duration-300">
                  Mostrando <strong>{paginatedAgents.length}</strong> de{" "}
                  <strong>{filteredAgents.length}</strong> agentes
                  {totalPages > 1 && (
                    <span>
                      {" "}
                      (Página <strong>{pagination.page}</strong> de{" "}
                      <strong>{totalPages}</strong>)
                    </span>
                  )}
                </div>

                {filteredAgents.length > 0 && (
                  <div className="text-sm text-gray-500">
                    <strong>{itemsPerPage}</strong> itens por página
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Agentes */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-800">
                <div className="flex items-center">
                  <RiUserLine className="w-5 h-5 mr-2 text-navy-600" />
                  Lista de Agentes
                </div>
                {filteredAgents.length > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {filteredAgents.length} agentes
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px] bg-gray-200" />
                          <Skeleton className="h-4 w-[200px] bg-gray-200" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-12"
                >
                  <RiUserLine className="w-20 h-20 text-gray-300 mx-auto mb-4" />
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
                  {!filters.search &&
                    filters.role === "all" &&
                    filters.status === "all" && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link href="/admin/agentes/criar">
                          <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                            <RiUserAddLine className="w-4 h-4 mr-2" />
                            Cadastrar Primeiro Agente
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                </motion.div>
              ) : (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 mb-6"
                  >
                    <AnimatePresence>
                      {paginatedAgents.map((agent) => {
                        const certStatus = getCertificationStatus(
                          agent.validade_certificacao
                        );

                        return (
                          <motion.div
                            key={agent.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            whileHover={{
                              backgroundColor: "rgba(0, 0, 0, 0.02)",
                            }}
                            className="border border-gray-200 rounded-lg transition-colors duration-300"
                          >
                            <Card className="border-0 shadow-none">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-4 flex-1">
                                    <ImageWithFallback
                                      src={agent.avatar_url}
                                      alt={agent.full_name || "Agente"}
                                      className="w-16 h-16 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-800 truncate">
                                          {agent.full_name ||
                                            "Nome não informado"}
                                        </h3>
                                        <Badge
                                          className={
                                            agent.status
                                              ? "bg-green-100 text-green-800 border-green-200"
                                              : "bg-red-100 text-red-800 border-red-200"
                                          }
                                        >
                                          {agent.status ? (
                                            <>
                                              <RiCheckLine className="w-3 h-3 mr-1" />{" "}
                                              ATIVO
                                            </>
                                          ) : (
                                            <>
                                              <RiCloseLine className="w-3 h-3 mr-1" />{" "}
                                              INATIVO
                                            </>
                                          )}
                                        </Badge>
                                        <Badge
                                          className={
                                            agent.role === "admin"
                                              ? "bg-purple-100 text-purple-800 border-purple-200"
                                              : "bg-blue-100 text-blue-800 border-blue-200"
                                          }
                                        >
                                          {agent.role === "admin"
                                            ? "ADMIN"
                                            : "AGENTE"}
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
                                              Tipo Sanguíneo:{" "}
                                              {agent.tipo_sanguineo}
                                            </span>
                                          </div>
                                        )}
                                        {agent.validade_certificacao && (
                                          <div className="flex items-center gap-2">
                                            <RiCalendarLine className="w-3 h-3" />
                                            <span>
                                              Certificação:{" "}
                                              {formatDate(
                                                agent.validade_certificacao
                                              )}{" "}
                                              <Badge
                                                variant="outline"
                                                className={`ml-2 text-xs ${
                                                  certStatus.color === "green"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : certStatus.color ===
                                                      "yellow"
                                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    : certStatus.color === "red"
                                                    ? "bg-red-50 text-red-700 border-red-200"
                                                    : "bg-gray-50 text-gray-700 border-gray-200"
                                                }`}
                                              >
                                                {certStatus.status ===
                                                  "valida" && "✅ Válida"}
                                                {certStatus.status ===
                                                  "proximo-vencimento" &&
                                                  "⚠️ Próximo"}
                                                {certStatus.status ===
                                                  "expirada" && "❌ Expirada"}
                                                {certStatus.status ===
                                                  "nao-informada" &&
                                                  "ℹ️ Não informada"}
                                              </Badge>
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 ml-4">
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Link href={`/admin/agentes/${agent.id}`}>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-300"
                                        >
                                          <RiEditLine className="w-3 h-3 mr-1" />
                                          Editar
                                        </Button>
                                      </Link>
                                    </motion.div>

                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          toggleAgentStatus(agent.id)
                                        }
                                        className={
                                          agent.status
                                            ? "w-full sm:w-auto border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors duration-300"
                                            : "w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-300"
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
                                    </motion.div>

                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteAgent(
                                            agent.id,
                                            agent.full_name || "Agente"
                                          )
                                        }
                                        className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300"
                                      >
                                        <RiDeleteBinLine className="w-3 h-3 mr-1" />
                                        Excluir
                                      </Button>
                                    </motion.div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200"
                    >
                      <div className="text-sm text-gray-600">
                        Página <strong>{pagination.page}</strong> de{" "}
                        <strong>{totalPages}</strong> -{" "}
                        <strong>{filteredAgents.length}</strong> agentes no
                        total
                      </div>

                      <CustomPagination
                        currentPage={pagination.page}
                        totalPages={totalPages}
                        onPageChange={(page) => setPagination({ page })}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
