// src/app/(app)/admin/agentes/page.tsx - VERSÃO ATUALIZADA
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FaUsers,
  FaPlus,
  FaSearch,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaKey,
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaCalendarAlt,
  FaTint,
  FaArrowLeft,
  FaChartBar,
  FaHome,
  FaBan,
} from "react-icons/fa";

interface AgentProfile {
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "agent">(
    "all"
  );

  const supabase = createClient();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Erro ao buscar agentes:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ VERIFICAÇÃO DE CERTIFICAÇÃO VÁLIDA (APENAS PARA ATIVOS)
  const isCertificationValid = (agent: AgentProfile) => {
    // ❗ Agente INATIVO nunca tem certificação válida
    if (!agent.status) return false;

    // Agente ATIVO: verifica data
    if (!agent.validade_certificacao) return false;
    return new Date(agent.validade_certificacao) >= new Date();
  };

  // ✅ ATUALIZADA: Ativar/Desativar agente COM CANCELAMENTO DE CERTIFICAÇÃO
  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const updateData: any = {
        status: !currentStatus,
        updated_at: new Date().toISOString(),
      };

      // ✅ SE ESTÁ DESATIVANDO (tornando inativo), CANCELAR CERTIFICAÇÃO
      if (currentStatus === true) {
        updateData.validade_certificacao = null; // Cancela a certificação
        console.log(`🔴 Certificação cancelada para agente ${agentId}`);
      }
      // ❗ SE ESTÁ ATIVANDO (tornando ativo), mantém a certificação como estava

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", agentId);

      if (error) throw error;

      // Atualizar estado local
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId
            ? {
                ...agent,
                ...updateData, // Aplica tanto status quanto certificação
              }
            : agent
        )
      );

      console.log(
        `✅ Agente ${agentId} ${
          !currentStatus ? "ativado" : "desativado"
        } com sucesso`
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  // Reset de senha
  const resetPassword = async (agentEmail: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(agentEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      alert(`Email de reset enviado para: ${agentEmail}`);
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      alert("Erro ao enviar email de reset");
    }
  };

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definida";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Filtros combinados
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      agent.matricula.includes(search) ||
      agent.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && agent.status) ||
      (filterStatus === "inactive" && !agent.status);

    const matchesRole = filterRole === "all" || agent.role === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // ✅ ATUALIZADA: Calcular estatísticas - Certificações válidas apenas para ATIVOS
  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.status).length,
    inactive: agents.filter((a) => !a.status).length,
    admins: agents.filter((a) => a.role === "admin").length,
    validCertifications: agents.filter(isCertificationValid).length, // ✅ Só conta ativos com data válida
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              GERENCIAR AGENTES
            </h1>
            <p className="text-gray-600">
              Gerencie todos os agentes e administradores do sistema
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-navy-light text-navy-light hover:bg-navy-light hover:text-white"
              >
                <FaChartBar className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/agent/perfil">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FaUser className="w-4 h-4 mr-2" />
                Meu Perfil
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FaHome className="w-4 h-4 mr-2" />
                Site
              </Button>
            </Link>
            <Link href="/admin/agentes/criar">
              <Button className="bg-navy-light hover:bg-navy text-white">
                <FaPlus className="w-4 h-4 mr-2" />
                Novo Agente
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas - ATUALIZADA com certificações válidas apenas para ativos */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <FaUsers className="w-8 h-8 text-navy-light" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <FaToggleOn className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.inactive}
                  </p>
                </div>
                <FaToggleOff className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Administradores
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.admins}
                  </p>
                </div>
                <FaUser className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Cert. Válidas
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.validCertifications}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.active > 0
                      ? `${Math.round(
                          (stats.validCertifications / stats.active) * 100
                        )}% dos ativos`
                      : "Nenhum ativo"}
                  </p>
                </div>
                <FaCalendarAlt className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome, matrícula ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-light"
                >
                  <option value="all">Todos os status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-light"
                >
                  <option value="all">Todos os cargos</option>
                  <option value="agent">Agentes</option>
                  <option value="admin">Administradores</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Agentes */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaUsers className="w-5 h-5 mr-2 text-navy-light" />
              Lista de Agentes ({filteredAgents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-light mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando agentes...</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-8">
                <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {agents.length === 0
                    ? "Nenhum agente cadastrado no sistema"
                    : "Nenhum agente encontrado com os filtros aplicados"}
                </p>
                {agents.length === 0 && (
                  <Link href="/admin/agentes/criar">
                    <Button className="bg-navy-light hover:bg-navy text-white mt-4">
                      <FaPlus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Agente
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Agente
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Matrícula
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Contato
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Informações
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => (
                      <tr
                        key={agent.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        {/* Coluna Agente */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-navy-light rounded-full flex items-center justify-center text-white">
                              {agent.avatar_url ? (
                                <img
                                  src={agent.avatar_url}
                                  alt={agent.full_name || "Agente"}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <FaUser className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {agent.full_name || "Nome não definido"}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {agent.graduacao || "Graduação não definida"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Coluna Matrícula */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <FaIdCard className="w-4 h-4 text-gray-400" />
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {agent.matricula}
                            </code>
                          </div>
                        </td>

                        {/* Coluna Contato */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <FaEnvelope className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate max-w-[150px]">
                              {agent.email}
                            </span>
                          </div>
                        </td>

                        {/* Coluna Informações - ATUALIZADA para mostrar certificação cancelada */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <FaTint className="w-3 h-3 text-red-500" />
                              <span className="text-sm text-gray-600">
                                {agent.tipo_sanguineo || "N/D"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaCalendarAlt
                                className={`w-3 h-3 ${
                                  !agent.status
                                    ? "text-red-500"
                                    : !agent.validade_certificacao
                                    ? "text-gray-400"
                                    : new Date(agent.validade_certificacao) <
                                      new Date()
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  !agent.status
                                    ? "text-red-600 font-medium"
                                    : !agent.validade_certificacao
                                    ? "text-gray-500"
                                    : new Date(agent.validade_certificacao) <
                                      new Date()
                                    ? "text-red-600 font-medium"
                                    : "text-gray-600"
                                }`}
                              >
                                {!agent.status
                                  ? "CERTIFICAÇÃO CANCELADA"
                                  : formatDate(agent.validade_certificacao)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Coluna Status */}
                        <td className="py-3 px-4">
                          <div className="space-y-2">
                            <Badge
                              className={`
                                ${
                                  agent.status
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-red-500 text-white hover:bg-red-600"
                                }
                              `}
                            >
                              {agent.status ? "ATIVO" : "INATIVO"}
                            </Badge>
                            {agent.role === "admin" && (
                              <Badge className="bg-purple-500 text-white hover:bg-purple-600 block mt-1">
                                ADMIN
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Coluna Ações */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <Link href={`/admin/agentes/${agent.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                              >
                                <FaEdit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleAgentStatus(agent.id, agent.status)
                              }
                              className="w-full sm:w-auto"
                            >
                              {agent.status ? (
                                <>
                                  <FaBan className="w-3 h-3 mr-1 text-red-500" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <FaToggleOn className="w-3 h-3 mr-1 text-green-500" />
                                  Ativar
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetPassword(agent.email)}
                              className="w-full sm:w-auto"
                            >
                              <FaKey className="w-3 h-3 mr-1" />
                              Resetar Senha
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
