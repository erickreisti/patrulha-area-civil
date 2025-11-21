// 📁 /src/app/(app)/admin/agentes/criar/page.tsx - ATUALIZADO
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
  FaKey,
} from "react-icons/fa";

// Opções baseadas no schema
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(""); // ✅ NOVO: Estado para avatar
  const [formData, setFormData] = useState({
    matricula: "",
    email: "",
    full_name: "",
    graduacao: "",
    tipo_sanguineo: "",
    validade_certificacao: "",
    role: "agent" as "agent" | "admin",
  });

  const supabase = createClient();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ NOVO: Handler para mudança de avatar
  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar dados básicos
      if (!formData.matricula || !formData.email || !formData.full_name) {
        throw new Error("Matrícula, email e nome são obrigatórios");
      }

      // Validar formato da matrícula (11 dígitos)
      if (!/^\d{11}$/.test(formData.matricula)) {
        throw new Error(
          "Matrícula deve conter exatamente 11 dígitos numéricos"
        );
      }

      // Validar email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Email inválido");
      }

      console.log("🔄 Iniciando criação do agente...", formData);

      // 1. Criar usuário no Auth do Supabase
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: formData.email,
          password: "pac12345", // Senha padrão
          email_confirm: true,
          user_metadata: {
            matricula: formData.matricula,
            full_name: formData.full_name,
            role: formData.role,
          },
        });

      if (authError) {
        console.error("❌ Erro ao criar usuário no Auth:", authError);

        if (authError.message.includes("already registered")) {
          throw new Error("Email já cadastrado no sistema");
        }
        if (authError.message.includes("password")) {
          throw new Error("Senha muito fraca. Use uma senha mais forte");
        }

        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("Nenhum usuário retornado do Auth");
      }

      console.log("✅ Usuário criado no Auth:", authData.user.id);

      // 2. Criar perfil na tabela profiles COM AVATAR
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        matricula: formData.matricula,
        email: formData.email,
        full_name: formData.full_name,
        avatar_url: avatarUrl || null, // ✅ NOVO: Incluir avatar URL
        graduacao: formData.graduacao || null,
        tipo_sanguineo: formData.tipo_sanguineo || null,
        validade_certificacao: formData.validade_certificacao || null,
        role: formData.role,
        status: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("❌ Erro ao criar perfil:", profileError);

        // Tentar deletar o usuário do Auth se o perfil falhou
        await supabase.auth.admin.deleteUser(authData.user.id);

        if (profileError.code === "23505") {
          // Unique violation
          if (profileError.message.includes("matricula")) {
            throw new Error("Matrícula já cadastrada no sistema");
          }
          if (profileError.message.includes("email")) {
            throw new Error("Email já cadastrado no sistema");
          }
        }

        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      console.log("✅ Perfil criado com sucesso!");

      // 3. Enviar email de boas-vindas com instruções para resetar senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        console.warn("⚠️ Não foi possível enviar email de reset:", resetError);
        // Não falha a criação se o email não for enviado
      } else {
        console.log("✅ Email de reset enviado");
      }

      // Sucesso - redirecionar para lista de agentes
      toast.success(
        "Agente criado com sucesso! Um email foi enviado para definir a senha.",
        "Sucesso"
      );
      router.push("/admin/agentes");
    } catch (err: any) {
      console.error("💥 Erro completo:", err);
      setError(err.message);
      toast.error(err.message, "Erro");
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
              CADASTRAR NOVO AGENTE
            </h1>
            <p className="text-gray-600">
              Preencha os dados para cadastrar um novo agente no sistema
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
                  Dados do Agente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <strong>Erro:</strong> {error}
                    </div>
                  )}

                  {/* ✅ NOVO: Upload de Avatar */}
                  <div className="border-b border-gray-200 pb-6">
                    <Label className="text-sm font-semibold mb-4 block">
                      Foto do Perfil
                    </Label>
                    <AvatarUpload
                      onAvatarChange={handleAvatarChange}
                      className="justify-start"
                    />
                  </div>

                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matrícula */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Matrícula *
                      </label>
                      <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          name="matricula"
                          value={formData.matricula}
                          onChange={handleChange}
                          placeholder="00000000000"
                          maxLength={11}
                          required
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        11 dígitos numéricos
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="agente@pac.org.br"
                          required
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Nome completo do agente"
                        required
                        className="pl-10"
                        disabled={loading}
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
                          disabled={loading}
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
                          disabled={loading}
                        >
                          <option value="agent">Agente</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-navy-light hover:bg-navy text-white flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Cadastrando...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4 mr-2" />
                          Cadastrar Agente
                        </>
                      )}
                    </Button>

                    <Link href="/admin/agentes" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                      >
                        <FaArrowLeft className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <FaInfo className="w-4 h-4 mr-2 text-navy-light" />
                  Informações Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <FaPlus className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>O agente receberá um email para definir sua senha</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FaIdCard className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>A matrícula deve conter exatamente 11 dígitos</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FaShieldAlt className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <p>Administradores têm acesso total ao sistema</p>
                </div>
                <div className="flex items-start space-x-2">
                  <FaUser className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p>Agentes têm acesso apenas ao seu perfil</p>
                </div>
                {/* ✅ NOVO: Informação sobre avatar */}
                <div className="flex items-start space-x-2">
                  <FaImage className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <p>
                    A foto de perfil é opcional e pode ser adicionada depois
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <FaKey className="w-4 h-4 mr-2 text-navy-light" />
                  Senha Inicial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Senha padrão:</strong> pac12345
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    O agente deverá alterar esta senha no primeiro acesso
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

// Componente FaInfo para completar
const FaInfo = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);

// Componente FaImage para completar
const FaImage = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 16 16">
    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
  </svg>
);
