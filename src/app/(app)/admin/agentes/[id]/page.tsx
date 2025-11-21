// src/app/(app)/admin/agentes/[id]/page.tsx - VERSÃO COMPLETA COM UPLOAD
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { useToast } from "@/hooks/useToast";
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
  FaInfo,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

// Opções
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
  const { toast } = useToast();

  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
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
      setAvatarUrl(data.avatar_url || "");
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
      toast.error("Agente não encontrado", "Erro");
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

    try {
      // Validações básicas
      if (!formData.full_name.trim()) {
        toast.error("Nome completo é obrigatório", "Validação");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          graduacao: formData.graduacao || null,
          tipo_sanguineo: formData.tipo_sanguineo || null,
          validade_certificacao: formData.validade_certificacao || null,
          avatar_url: avatarUrl || null,
          role: formData.role,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", agentId);

      if (error) throw error;

      toast.success("Agente atualizado com sucesso!", "Sucesso");

      // Redirecionar após sucesso
      setTimeout(() => {
        router.push("/admin/agentes");
      }, 1500);
    } catch (err: any) {
      console.error("Erro ao atualizar agente:", err);
      toast.error(
        err.message || "Erro ao atualizar agente",
        "Erro de atualização"
      );
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

      toast.success(
        `Email de reset de senha enviado para: ${agent.email}`,
        "Reset de Senha"
      );
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      toast.error("Erro ao enviar email de reset", "Erro");
    }
  };

  const getCertificationStatus = () => {
    if (!agent?.validade_certificacao) return "Não informada";

    const today = new Date();
    const certDate = new Date(agent.validade_certificacao);

    if (certDate < today) {
      return { status: "expirada", color: "bg-red-500", text: "Expirada" };
    }

    const diffTime = certDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return {
        status: "proximo",
        color: "bg-yellow-500",
        text: "Próximo do vencimento",
      };
    }

    return { status: "valida", color: "bg-green-500", text: "Válida" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados do agente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Agente Não Encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O agente que você está tentando editar não existe ou foi removido.
            </p>
            <Link href="/admin/agentes">
              <Button className="bg-navy hover:bg-navy-600 text-white">
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Lista de Agentes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const certStatus = getCertificationStatus();

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
              Editando dados de <strong>{agent.full_name || "Agente"}</strong>
            </p>
          </div>
          <Link href="/admin/agentes">
            <Button
              variant="outline"
              className="border-navy text-navy hover:bg-navy hover:text-white"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Lista
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-navy to-navy-600 text-white">
                <CardTitle className="flex items-center text-xl">
                  <FaUser className="w-5 h-5 mr-2" />
                  Editar Dados do Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Upload de Avatar */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <Label className="text-sm font-semibold text-gray-700">
                      Foto do Agente
                    </Label>
                    <AvatarUpload
                      currentAvatar={avatarUrl}
                      onAvatarChange={setAvatarUrl}
                      className="justify-start"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos: JPG, PNG, WebP. Tamanho máximo: 2MB
                    </p>
                  </div>

                  {/* Informações Fixas (somente leitura) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <Label className="block text-sm font-medium text-gray-500">
                        Matrícula
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <FaIdCard className="w-4 h-4 text-gray-400" />
                        <p className="text-lg font-mono font-bold text-gray-800">
                          {agent.matricula}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-gray-500">
                        Email
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <FaEnvelope className="w-4 h-4 text-gray-400" />
                        <p className="text-lg text-gray-800 truncate">
                          {agent.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="full_name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Nome Completo *
                    </Label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Nome completo do agente"
                        className="pl-10"
                        required
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Graduação e Tipo Sanguíneo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Graduação */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="graduacao"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Graduação
                      </Label>
                      <select
                        name="graduacao"
                        value={formData.graduacao}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
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
                      <Label
                        htmlFor="tipo_sanguineo"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Tipo Sanguíneo
                      </Label>
                      <div className="relative">
                        <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="tipo_sanguineo"
                          value={formData.tipo_sanguineo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Validade da Certificação */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="validade_certificacao"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Validade da Certificação
                      </Label>
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
                      <Label
                        htmlFor="role"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Tipo de Usuário
                      </Label>
                      <div className="relative">
                        <FaShieldAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                          disabled={saving}
                        >
                          <option value="agent">Agente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="status"
                        checked={formData.status}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-navy focus:ring-navy w-5 h-5"
                        disabled={saving}
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">
                          Agente Ativo no Sistema
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.status
                            ? "Agente pode acessar o sistema normalmente"
                            : "Agente não poderá fazer login no sistema"}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 py-3"
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
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 py-3"
                      disabled={saving}
                    >
                      <FaHistory className="w-4 h-4 mr-2" />
                      Resetar Senha
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/agentes")}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                      disabled={saving}
                    >
                      <FaArrowLeft className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Informações e Status */}
          <div className="space-y-6">
            {/* Status do Agente */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FaInfo className="w-4 h-4 mr-2 text-navy" />
                  Status do Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge
                    className={
                      agent.status
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
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
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <Badge
                    className={
                      agent.role === "admin"
                        ? "bg-purple-500 text-white"
                        : "bg-blue-500 text-white"
                    }
                  >
                    {agent.role === "admin" ? "ADMIN" : "AGENTE"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Certificação:</span>
                  {typeof certStatus === "object" ? (
                    <Badge className={certStatus.color + " text-white"}>
                      {certStatus.text}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-400 text-white">
                      {certStatus}
                    </Badge>
                  )}
                </div>

                {agent.validade_certificacao && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Validade:</span>
                    <span className="text-sm text-gray-800">
                      {new Date(agent.validade_certificacao).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Cadastrado em:</span>
                  <span className="text-sm text-gray-800">
                    {new Date(agent.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">
                    Última atualização:
                  </span>
                  <span className="text-sm text-gray-800">
                    {new Date(agent.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Sistema */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>ID do Agente:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {agent.id.substring(0, 8)}...
                  </code>
                </div>
                <p>• Alterações são salvas automaticamente</p>
                <p>• O agente receberá um email para reset de senha</p>
                <p>• Status "Inativo" bloqueia o login</p>
                <p>• Admins têm acesso total ao sistema</p>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={resetPassword}
                >
                  <FaHistory className="w-4 h-4 mr-2" />
                  Enviar Reset de Senha
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50"
                  asChild
                >
                  <Link href={`/perfil/${agent.id}`}>
                    <FaUser className="w-4 h-4 mr-2" />
                    Ver Perfil Público
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50"
                  asChild
                >
                  <Link href="/admin/agentes">
                    <FaArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Lista
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
