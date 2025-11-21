"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  FaTimes,
  FaTrash,
  FaChartBar,
  FaHome,
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
    } catch (error: any) {
      console.error("❌ Erro ao buscar agente:", error);
      alert(`Erro ao carregar agente: ${error.message}`);
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

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validações básicas
      if (!formData.full_name.trim()) {
        alert("Nome completo é obrigatório");
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

      console.log("✅ Agente atualizado com sucesso");
      alert("Agente atualizado com sucesso!");

      // Redirecionar após sucesso
      setTimeout(() => {
        router.push("/admin/agentes");
      }, 1000);
    } catch (err: any) {
      console.error("❌ Erro ao atualizar agente:", err);
      alert(`Erro ao atualizar agente: ${err.message}`);
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
      console.error("❌ Erro ao resetar senha:", err);
      alert(`Erro ao enviar email de reset: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;

    if (
      !confirm(`Tem certeza que deseja desativar o agente ${agent.full_name}?`)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: false })
        .eq("id", agentId);

      if (error) throw error;

      console.log("🗑️ Agente desativado");
      alert("Agente desativado com sucesso!");
      router.push("/admin/agentes");
    } catch (err: any) {
      console.error("❌ Erro ao desativar agente:", err);
      alert(`Erro ao desativar agente: ${err.message}`);
    }
  };

  const getCertificationStatus = () => {
    if (!formData.validade_certificacao) return "Não informada";

    const today = new Date();
    const certDate = new Date(formData.validade_certificacao);

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
              Editando: <strong>{agent.full_name || "Agente"}</strong>
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <Link href="/admin/agentes">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>

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

            <Button
              onClick={resetPassword}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              <FaHistory className="w-4 h-4 mr-2" />
              Resetar Senha
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center text-xl">
                  <FaUser className="w-5 h-5 mr-2 text-blue-800" />
                  Editar Dados do Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="text-sm font-semibold"
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
                        className="pl-10 text-lg py-3"
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
                        className="text-sm font-semibold"
                      >
                        Graduação
                      </Label>
                      <select
                        name="graduacao"
                        value={formData.graduacao}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                        className="text-sm font-semibold"
                      >
                        Tipo Sanguíneo
                      </Label>
                      <div className="relative">
                        <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="tipo_sanguineo"
                          value={formData.tipo_sanguineo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                        className="text-sm font-semibold"
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
                      <Label htmlFor="role" className="text-sm font-semibold">
                        Tipo de Usuário
                      </Label>
                      <div className="relative">
                        <FaShieldAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          disabled={saving}
                        >
                          <option value="agent">Agente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-3"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
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
                      onClick={handleDelete}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white py-3"
                    >
                      <FaTrash className="w-4 h-4 mr-2" />
                      Desativar
                    </Button>

                    <Button
                      type="button"
                      onClick={() => router.push("/admin/agentes")}
                      variant="outline"
                      className="border-gray-700 text-gray-700 hover:bg-gray-100 py-3"
                    >
                      <FaTimes className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Configurações e Informações */}
          <div className="space-y-6">
            {/* Status e Permissões */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaShieldAlt className="w-4 h-4 mr-2 text-blue-800" />
                  Status e Permissões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status do Agente */}
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="status"
                    className="text-sm font-semibold cursor-pointer"
                  >
                    Agente Ativo
                  </Label>
                  <Switch
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("status", checked)
                    }
                  />
                </div>
                {!formData.status && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    ⚠️ Agente não poderá fazer login no sistema
                  </p>
                )}

                {/* Tipo de Usuário */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Tipo de Acesso
                  </Label>
                  <div className="space-y-2">
                    {(["agent", "admin"] as const).map((role) => (
                      <label
                        key={role}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={formData.role === role}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              role: e.target.value as "agent" | "admin",
                            }))
                          }
                          className="text-blue-600 focus:ring-blue-600"
                        />
                        <span className="text-sm capitalize">
                          {role === "agent" ? "Agente" : "Administrador"}
                        </span>
                        {role === "admin" && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            Acesso Total
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificação */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-blue-800" />
                  Status da Certificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  {typeof certStatus === "object" ? (
                    <>
                      <Badge
                        className={`${certStatus.color} text-white text-sm mb-2`}
                      >
                        {certStatus.text}
                      </Badge>
                      <p className="text-sm text-gray-600">
                        Validade:{" "}
                        {new Date(
                          formData.validade_certificacao
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">{certStatus}</p>
                  )}
                </div>
                {formData.validade_certificacao && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      • Certificação{" "}
                      {typeof certStatus === "object" &&
                        certStatus.status === "expirada" &&
                        " expirada"}
                      {typeof certStatus === "object" &&
                        certStatus.status === "proximo" &&
                        " próxima do vencimento"}
                      {typeof certStatus === "object" &&
                        certStatus.status === "valida" &&
                        " dentro da validade"}
                    </p>
                    <p>• Mantenha sempre atualizada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações do Agente */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FaHistory className="w-4 h-4 mr-2 text-blue-800" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>
                    <strong>ID:</strong>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      {agent.id.substring(0, 8)}...
                    </code>
                  </div>
                  <div>
                    <strong>Cadastrado em:</strong>
                    <span className="ml-2 text-gray-600">
                      {new Date(agent.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <strong>Última atualização:</strong>
                    <span className="ml-2 text-gray-600">
                      {new Date(agent.updated_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div>
                    <strong>Status atual:</strong>
                    <Badge
                      className={`ml-2 ${
                        agent.status
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      } text-xs`}
                    >
                      {agent.status ? "ATIVO" : "INATIVO"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Rápido */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Preview Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Nome:</strong>{" "}
                    {formData.full_name || "Não definido"}
                  </p>
                  <p>
                    <strong>Graduação:</strong>{" "}
                    {formData.graduacao || "Não definida"}
                  </p>
                  <p>
                    <strong>Tipo Sanguíneo:</strong>{" "}
                    {formData.tipo_sanguineo || "Não informado"}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <Badge
                      className={`ml-2 ${
                        formData.status ? "bg-green-500" : "bg-red-500"
                      } text-white text-xs`}
                    >
                      {formData.status ? "ATIVO" : "INATIVO"}
                    </Badge>
                  </p>
                  <p>
                    <strong>Tipo:</strong>
                    <Badge
                      className={`ml-2 ${
                        formData.role === "admin"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                      } text-white text-xs`}
                    >
                      {formData.role === "admin" ? "ADMIN" : "AGENTE"}
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
