"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
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
  FaInfo,
  FaImage,
  FaChartBar,
  FaHome,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

// Opções baseadas no schema

const GRADUACOES = [
  "COMODORO DE BRIGADA - PAC",
  "COMODORO - PAC",
  "VICE COMODORO - PAC",
  "CORONEL - PAC",
  "TENENTE CORONEL - PAC",
  "MAJOR - PAC",
  "CAPITÃO - PAC",
  "1° TENENTE - PAC",
  "2° TENENTE - PAC",
  "ASPIRANTE -a- OFICIAL - PAC",
  "SUBOFICIAL - PAC",
  "1° SARGENTO - PAC",
  "2° SARGENTO - PAC",
  "3° SARGENTO - PAC",
  "CABO - PAC",
  "PATRULHEIRO",
  "AGENTE - PAC",
];

const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function CriarAgentePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
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

  // Função para fazer upload do avatar
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatares-agentes")
        .upload(fileName, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("❌ Erro ao fazer upload do avatar:", error);
        return null;
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from("avatares-agentes")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ Erro no upload do avatar:", error);
      return null;
    }
  };

  // Função para lidar com a seleção de arquivo
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB");
      return;
    }

    setAvatarFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Função para remover avatar selecionado
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

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
          password: "pac12345",
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

      // 2. Fazer upload do avatar se existir
      let avatarUrl = null;
      if (avatarFile) {
        console.log("📤 Fazendo upload do avatar...");
        avatarUrl = await uploadAvatar(authData.user.id);
        if (avatarUrl) {
          console.log("✅ Avatar upload completo:", avatarUrl);
        }
      }

      // 3. Criar perfil na tabela profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        matricula: formData.matricula,
        email: formData.email,
        full_name: formData.full_name,
        avatar_url: avatarUrl,
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

      // 4. Enviar email de boas-vindas
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        console.warn("⚠️ Não foi possível enviar email de reset:", resetError);
      } else {
        console.log("✅ Email de reset enviado");
      }

      // Sucesso - redirecionar para lista de agentes
      alert(
        "Agente criado com sucesso! Um email foi enviado para definir a senha."
      );
      router.push("/admin/agentes");
    } catch (err: unknown) {
      console.error("💥 Erro completo:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setFormError(errorMessage);
      alert(errorMessage);
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

            <Link href="/admin/agentes">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Lista
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaUser className="w-5 h-5 mr-2 text-blue-800" />
                  Dados do Agente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      <strong>Erro:</strong> {formError}
                    </div>
                  )}

                  {/* Upload de Avatar */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Foto do Agente
                    </Label>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      {/* Preview do Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <Image
                              src={avatarPreview}
                              alt="Preview do avatar"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaUser className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Controles de Upload */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Label
                            htmlFor="avatar-upload"
                            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
                          >
                            <FaUpload className="w-4 h-4 mr-2" />
                            {avatarPreview ? "Alterar Foto" : "Selecionar Foto"}
                          </Label>

                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            disabled={loading}
                          />

                          {avatarPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={removeAvatar}
                              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                              disabled={loading}
                            >
                              <FaTrash className="w-4 h-4 mr-2" />
                              Remover
                            </Button>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">
                          Formatos: JPG, PNG, GIF. Tamanho máximo: 5MB
                        </p>
                      </div>
                    </div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
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
                  <FaInfo className="w-4 h-4 mr-2 text-blue-800" />
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
                  <FaKey className="w-4 h-4 mr-2 text-blue-800" />
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
