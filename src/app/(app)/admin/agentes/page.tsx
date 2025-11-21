"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  FaUser,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaIdCard,
  FaEnvelope,
  FaChartBar,
  FaHome,
} from "react-icons/fa";

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

export default function AgentesPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "agent">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

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
    } catch (error: any) {
      console.error("Erro ao buscar agentes:", error);
      alert("Erro ao carregar lista de agentes");
    } finally {
      setLoading(false);
    }
  };

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

      alert(`Agente ${!currentStatus ? "ativado" : "desativado"} com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar status do agente");
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
      alert("Agente excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir agente:", error);
      alert("Erro ao excluir agente");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando lista de agentes...</p>
          </div>
        </div>
      </div>
    );
  }

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
              Gerencie todos os agentes da Patrulha Aérea Civil
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                <FaChartBar className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-700 hover:bg-gray-100"
              >
                <FaHome className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </Link>

            <Link href="/admin/agentes/criar">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <FaPlus className="w-4 h-4 mr-2" />
                Novo Agente
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {agents.length}
                  </p>
                </div>
                <FaUser className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {agents.filter((a) => a.status).length}
                  </p>
                </div>
                <FaEye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {agents.filter((a) => !a.status).length}
                  </p>
                </div>
                <FaEyeSlash className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {agents.filter((a) => a.role === "admin").length}
                  </p>
                </div>
                <FaShieldAlt className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Busca */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por matrícula, nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por Tipo */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Todos os tipos</option>
                <option value="admin">Administradores</option>
                <option value="agent">Agentes</option>
              </select>

              {/* Filtro por Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Agentes */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaUser className="w-5 h-5 mr-2 text-blue-800" />
              Lista de Agentes ({filteredAgents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum agente encontrado
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterRole !== "all" || filterStatus !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Cadastre o primeiro agente do sistema"}
                </p>
                <Link href="/admin/agentes/criar">
                  <Button className="bg-blue-800 hover:bg-blue-900 text-white">
                    <FaPlus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Agente
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Graduação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAgents.map((agent) => (
                      <tr
                        key={agent.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {agent.avatar_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={agent.avatar_url}
                                  alt={agent.full_name || "Agente"}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center">
                                  <FaUser className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {agent.full_name || "Nome não informado"}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FaIdCard className="w-3 h-3 mr-1" />
                                {agent.matricula}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FaEnvelope className="w-3 h-3 mr-2 text-gray-400" />
                            {agent.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {agent.graduacao || "Não informada"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              agent.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {agent.status ? (
                              <>
                                <FaEye className="w-3 h-3 mr-1" /> ATIVO
                              </>
                            ) : (
                              <>
                                <FaEyeSlash className="w-3 h-3 mr-1" /> INATIVO
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              agent.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {agent.role === "admin" ? "ADMIN" : "AGENTE"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin/agentes/${agent.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
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
                              className={
                                agent.status
                                  ? "border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                                  : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                              }
                            >
                              {agent.status ? (
                                <>
                                  <FaEyeSlash className="w-3 h-3 mr-1" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <FaEye className="w-3 h-3 mr-1" />
                                  Ativar
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteAgent(
                                  agent.id,
                                  agent.full_name || "Agente"
                                )
                              }
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <FaTrash className="w-3 h-3 mr-1" />
                              Excluir
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
