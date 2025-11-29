"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUserLine,
  RiSearchLine,
  RiEditLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShieldKeyholeLine,
  RiIdCardLine,
  RiMailLine,
  RiBarChartLine,
  RiHomeLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiUserAddLine,
  RiShieldUserLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from "react-icons/ri";

interface AgentProfile {
  id: string;
  matricula: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  graduacao: string | null;
  status: boolean;
  role: "admin" | "agent";
  created_at: string;
}

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
        onError={() => setImageError(true)}
        priority={false}
        loading="lazy"
      />
    </div>
  );
};

export default function AgentesPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "agent">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const supabase = createClient();

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      console.log("🔄 Buscando agentes...");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(`✅ ${data?.length || 0} agentes carregados`);
      setAgents(data || []);
    } catch (error: unknown) {
      console.error("❌ Erro ao buscar agentes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: !currentStatus })
        .eq("id", agentId);

      if (error) throw error;

      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId ? { ...agent, status: !currentStatus } : agent
        )
      );
    } catch (error: unknown) {
      console.error("❌ Erro ao alterar status:", error);
    }
  };

  const deleteAgent = async (agentId: string, agentName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o agente ${agentName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", agentId);

      if (error) throw error;

      setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
    } catch (error: unknown) {
      console.error("❌ Erro ao excluir agente:", error);
    }
  };

  // Filtrar agentes
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.full_name &&
        agent.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === "all" || agent.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && agent.status) ||
      (filterStatus === "inactive" && !agent.status);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.status).length,
    inactive: agents.filter((a) => !a.status).length,
    admins: agents.filter((a) => a.role === "admin").length,
  };

  const navigationButtons = [
    {
      href: "/admin/dashboard",
      icon: RiBarChartLine,
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
    {
      href: "/admin/agentes/criar",
      icon: RiUserAddLine,
      label: "Novo Agente",
      className: "bg-green-600 hover:bg-green-700 text-white",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
              GERENCIAR AGENTES
            </h1>
            <p className="text-gray-600">
              Gerencie todos os agentes da Patrulha Aérea Civil
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setRefreshing(true);
                  fetchAgents();
                }}
                disabled={refreshing}
                variant="outline"
                size="sm"
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
                <span className="hidden sm:inline">
                  {refreshing ? "Atualizando..." : "Atualizar"}
                </span>
              </Button>
            </motion.div>

            <div className="flex gap-3">
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
                      variant={
                        button.href.includes("/criar") ? "default" : "outline"
                      }
                      className={`transition-all duration-300 ${button.className}`}
                    >
                      <button.icon className="w-4 h-4 mr-2" />
                      {button.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={<RiUserLine className="w-6 h-6" />}
            description="Agentes no sistema"
            color="blue"
            delay={0}
            loading={loading}
          />
          <StatCard
            title="Ativos"
            value={stats.active}
            icon={<RiEyeLine className="w-6 h-6" />}
            description="Agentes ativos"
            color="green"
            delay={1}
            loading={loading}
          />
          <StatCard
            title="Inativos"
            value={stats.inactive}
            icon={<RiEyeOffLine className="w-6 h-6" />}
            description="Agentes inativos"
            color="red"
            delay={2}
            loading={loading}
          />
          <StatCard
            title="Administradores"
            value={stats.admins}
            icon={<RiShieldUserLine className="w-6 h-6" />}
            description="Com acesso total"
            color="purple"
            delay={3}
            loading={loading}
          />
          <StatCard
            title="Agentes"
            value={stats.total - stats.admins}
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtro por Tipo */}
                <div>
                  <Select
                    value={filterRole}
                    onValueChange={(value: "all" | "admin" | "agent") =>
                      setFilterRole(value)
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
                    value={filterStatus}
                    onValueChange={(value: "all" | "active" | "inactive") =>
                      setFilterStatus(value)
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

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
                <div className="flex-1 text-right">
                  <span className="text-sm text-gray-600 transition-colors duration-300">
                    {filteredAgents.length} agentes encontrados
                  </span>
                </div>
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
              <CardTitle className="flex items-center text-gray-800">
                <RiUserLine className="w-5 h-5 mr-2 text-navy-600" />
                Lista de Agentes ({filteredAgents.length})
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
                    {searchTerm ||
                    filterRole !== "all" ||
                    filterStatus !== "all"
                      ? "Tente ajustar os filtros de busca"
                      : "Cadastre o primeiro agente do sistema"}
                  </p>
                  {!searchTerm &&
                    filterRole === "all" &&
                    filterStatus === "all" && (
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
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {filteredAgents.map((agent) => (
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
                                      {agent.full_name || "Nome não informado"}
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
                                          <RiCheckboxCircleLine className="w-3 h-3 mr-1" />{" "}
                                          ATIVO
                                        </>
                                      ) : (
                                        <>
                                          <RiCloseCircleLine className="w-3 h-3 mr-1" />{" "}
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
                                      toggleAgentStatus(agent.id, agent.status)
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
                                      deleteAgent(
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
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
