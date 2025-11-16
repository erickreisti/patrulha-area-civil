// src/app/(app)/admin/agentes/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaTint,
  FaCalendarAlt,
  FaShieldAlt,
  FaArrowLeft,
  FaSave,
  FaHistory,
} from "react-icons/fa";

// Opções (mesmas da criação)
const GRADUACOES = [
  "Soldado",
  "Cabo",
  "Sargento",
  "Subtenente",
  "Tenente",
  "Capitão",
  "Major",
  "Coronel",
];

const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

export default function EditarAgentePage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    graduacao: "",
    tipo_sanguineo: "",
    validade_certificacao: "",
    role: "agent" as "agent" | "admin",
    status: true,
  });

  const supabase = createClient();

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", agentId)
        .single();

      if (error) throw error;

      setAgent(data);
      setFormData({
        full_name: data.full_name || "",
        graduacao: data.graduacao || "",
        tipo_sanguineo: data.tipo_sanguineo || "",
        validade_certificacao: data.validade_certificacao || "",
        role: data.role,
        status: data.status,
      });
    } catch (error) {
      console.error("Erro ao buscar agente:", error);
      setError("Agente não encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          graduacao: formData.graduacao || null,
          tipo_sanguineo: formData.tipo_sanguineo || null,
          validade_certificacao: formData.validade_certificacao || null,
          role: formData.role,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", agentId);

      if (error) throw error;

      alert("Agente atualizado com sucesso!");
      router.push("/admin/agentes");
    } catch (err: any) {
      console.error("Erro ao atualizar agente:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!agent) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(agent.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      alert(`Email de reset de senha enviado para: ${agent.email}`);
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      alert("Erro ao enviar email de reset");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-light mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando agente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              {error || "Agente não encontrado"}
            </p>
            <Link href="/admin/agentes">
              <Button className="bg-navy-light hover:bg-navy text-white">
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Lista
              </Button>
            </Link>
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
              EDITAR AGENTE
            </h1>
            <p className="text-gray-600">
              Editando dados de {agent.full_name || "Agente"}
            </p>
          </div>
          <Link href="/admin/agentes">
            <Button
              variant="outline"
              className="border-navy-light text-navy-light hover:bg-navy-light hover:text-white"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Lista
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaUser className="w-5 h-5 mr-2 text-navy-light" />
                  Editar Dados do Agente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <strong>Erro:</strong> {error}
                    </div>
                  )}

                  {/* Informações Fixas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Matrícula
                      </label>
                      <p className="text-lg font-mono font-bold text-gray-800">
                        {agent.matricula}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-lg text-gray-800 truncate">
                        {agent.email}
                      </p>
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Nome completo do agente"
                        className="pl-10"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Graduação e Tipo Sanguíneo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Graduação */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Graduação
                      </label>
                      <select
                        name="graduacao"
                        value={formData.graduacao}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-light"
                        disabled={saving}
                      >
                        <option value="">Selecione uma graduação</option>
                        {GRADUACOES.map((graduacao) => (
                          <option key={graduacao} value={graduacao}>
                            {graduacao}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo Sanguíneo */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo Sanguíneo
                      </label>
                      <div className="relative">
                        <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="tipo_sanguineo"
                          value={formData.tipo_sanguineo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-light"
                          disabled={saving}
                        >
                          <option value="">Selecione o tipo sanguíneo</option>
                          {TIPOS_SANGUINEOS.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Validade da Certificação e Tipo de Usuário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Validade da Certificação */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Validade da Certificação
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="date"
                          name="validade_certificacao"
                          value={formData.validade_certificacao}
                          onChange={handleChange}
                          className="pl-10"
                          disabled={saving}
                        />
                      </div>
                    </div>

                    {/* Tipo de Usuário */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Usuário
                      </label>
                      <div className="relative">
                        <FaShieldAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-light"
                          disabled={saving}
                        >
                          <option value="agent">Agente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="status"
                        checked={formData.status}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-navy-light focus:ring-navy-light"
                        disabled={saving}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Agente Ativo no Sistema
                      </span>
                    </label>
                    <p className="text-xs text-gray-500">
                      Desmarque para desativar o acesso do agente ao sistema
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-navy-light hover:bg-navy text-white flex-1"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetPassword}
                      className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      disabled={saving}
                    >
                      <FaHistory className="w-4 h-4 mr-2" />
                      Resetar Senha
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Agente */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <FaInfo className="w-4 h-4 mr-2 text-navy-light" />
                  Status do Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge
                    className={`
                    ${
                      agent.status
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  `}
                  >
                    {agent.status ? "ATIVO" : "INATIVO"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <Badge
                    className={`
                    ${
                      agent.role === "admin"
                        ? "bg-purple-500 text-white"
                        : "bg-blue-500 text-white"
                    }
                  `}
                  >
                    {agent.role === "admin" ? "ADMIN" : "AGENTE"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cadastrado em:</span>
                  <span className="text-sm text-gray-800">
                    {new Date(agent.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Última atualização:
                  </span>
                  <span className="text-sm text-gray-800">
                    {new Date(agent.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente FaInfo
const FaInfo = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);
