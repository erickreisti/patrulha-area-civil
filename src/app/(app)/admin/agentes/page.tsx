// src/app/(app)/admin/agentes/criar/page.tsx - COM UPLOAD
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FaPlus,
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

export default function CriarAgentePage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    matricula: "",
    email: "",
    full_name: "",
    graduacao: "",
    tipo_sanguineo: "",
    validade_certificacao: "",
    role: "agent" as "agent" | "admin",
    status: true,
  });

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
    setLoading(true);

    try {
      // Validar campos obrigatórios
      if (!formData.matricula || !formData.email || !formData.full_name) {
        toast.error(
          "Preencha todos os campos obrigatórios",
          "Campos obrigatórios"
        );
        setLoading(false);
        return;
      }

      // Criar usuário no Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: formData.email,
          password: "pac2024", // Senha padrão
          email_confirm: true,
          user_metadata: {
            matricula: formData.matricula,
            full_name: formData.full_name,
          },
        });

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("Este email já está cadastrado", "Erro de cadastro");
        } else {
          toast.error(
            "Erro ao criar usuário: " + authError.message,
            "Erro de cadastro"
          );
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Erro ao criar usuário", "Erro de cadastro");
        setLoading(false);
        return;
      }

      // Criar perfil no banco
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          matricula: formData.matricula,
          email: formData.email,
          full_name: formData.full_name,
          avatar_url: avatarUrl || null,
          graduacao: formData.graduacao || null,
          tipo_sanguineo: formData.tipo_sanguineo || null,
          validade_certificacao: formData.validade_certificacao || null,
          role: formData.role,
          status: formData.status,
        },
      ]);

      if (profileError) {
        // Se der erro no perfil, deletar o usuário do Auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        toast.error(
          "Erro ao criar perfil: " + profileError.message,
          "Erro de cadastro"
        );
        setLoading(false);
        return;
      }

      toast.success("Agente criado com sucesso!", "Sucesso");

      // Redirecionar para a lista
      setTimeout(() => {
        router.push("/admin/agentes");
      }, 1500);
    } catch (error: any) {
      console.error("Erro ao criar agente:", error);
      toast.error("Erro inesperado ao criar agente", "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              NOVO AGENTE
            </h1>
            <p className="text-gray-600">
              Cadastre um novo agente da Patrulha Aérea Civil
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
                  Dados do Novo Agente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Upload de Avatar */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700">
                      Foto do Agente
                    </Label>
                    <AvatarUpload
                      onAvatarChange={setAvatarUrl}
                      className="justify-start"
                    />
                  </div>

                  {/* Matrícula e Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matrícula */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="matricula"
                        className="text-sm font-medium text-gray-700"
                      >
                        Matrícula *
                      </Label>
                      <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          name="matricula"
                          value={formData.matricula}
                          onChange={handleChange}
                          placeholder="Ex: PAC2024001"
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email *
                      </Label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="agente@patrulhaaerea.com"
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="full_name"
                      className="text-sm font-medium text-gray-700"
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
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Graduação e Tipo Sanguíneo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Graduação */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="graduacao"
                        className="text-sm font-medium text-gray-700"
                      >
                        Graduação
                      </Label>
                      <select
                        name="graduacao"
                        value={formData.graduacao}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-light"
                        disabled={loading}
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
                        className="text-sm font-medium text-gray-700"
                      >
                        Tipo Sanguíneo
                      </Label>
                      <div className="relative">
                        <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="tipo_sanguineo"
                          value={formData.tipo_sanguineo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-light"
                          disabled={loading}
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
                      <Label
                        htmlFor="validade_certificacao"
                        className="text-sm font-medium text-gray-700"
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
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Tipo de Usuário */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="text-sm font-medium text-gray-700"
                      >
                        Tipo de Usuário
                      </Label>
                      <div className="relative">
                        <FaShieldAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-light"
                          disabled={loading}
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
                        disabled={loading}
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
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <FaPlus className="w-4 h-4 mr-2" />
                          Criar Agente
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/agentes")}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={loading}
                    >
                      <FaArrowLeft className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm">
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  • Campos com <strong>*</strong> são obrigatórios
                </p>
                <p>
                  • A <strong>matrícula</strong> deve ser única no sistema
                </p>
                <p>
                  • O <strong>email</strong> será usado para login
                </p>
                <p>
                  • Senha padrão:{" "}
                  <code className="bg-gray-100 px-1 rounded">pac2024</code>
                </p>
                <p>• O agente receberá um email para redefinir a senha</p>
                <p>
                  • <strong>Agentes inativos</strong> não podem fazer login
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm">Status do Agente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      formData.status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {formData.status ? "ATIVO" : "INATIVO"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      formData.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {formData.role === "admin" ? "ADMIN" : "AGENTE"}
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
