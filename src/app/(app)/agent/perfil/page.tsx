// src/app/(app)/agent/perfil/page.tsx - VERSÃO COMPLETA CORRIGIDA
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FaUser,
  FaIdCard,
  FaShieldAlt,
  FaTint,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaEdit,
  FaCamera,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";

interface ProfileData {
  id: string;
  matricula: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  graduacao: string;
  validade_certificacao: string | null;
  tipo_sanguineo: string;
  status: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

// Componente auxiliar para exibir informações
const InfoItem = ({
  label,
  value,
  icon: Icon,
  isDate = false,
}: {
  label: string;
  value: string;
  icon?: any;
  isDate?: boolean;
}) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <span className="text-gray-600 font-medium">{label}:</span>
    </div>
    <span
      className={`font-semibold ${
        isDate && value !== "Não definida" ? "text-blue-600" : "text-gray-800"
      }`}
    >
      {value}
    </span>
  </div>
);

export default function AgentPerfil() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("🔄 === INICIANDO BUSCA DO PERFIL ===");

      try {
        setError(null);
        setLoading(true);

        // 🔥 SOLUÇÃO: Criar client Supabase diretamente e aguardar inicialização
        let supabase;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          try {
            console.log(
              `🔧 Tentativa ${attempts + 1} de inicializar Supabase...`
            );
            supabase = createClient();

            // 🔥 AGUARDAR o client estar pronto
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Testar se o client está funcionando
            const {
              data: { session },
              error: sessionError,
            } = await supabase.auth.getSession();

            if (!sessionError) {
              console.log("✅ Supabase inicializado com sucesso");
              break;
            } else {
              console.log("❌ Erro na inicialização:", sessionError);
            }
          } catch (error) {
            console.log(`❌ Tentativa ${attempts + 1} falhou:`, error);
          }

          attempts++;
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (!supabase) {
          throw new Error("Não foi possível inicializar o cliente Supabase");
        }

        console.log("🔐 Verificando autenticação...");

        // 1. Verificar usuário autenticado
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log("👤 Resultado do usuário:", user);
        console.log("❌ Erro do usuário:", userError);

        if (userError) {
          throw new Error(`Erro de autenticação: ${userError.message}`);
        }

        if (!user) {
          throw new Error(
            "Nenhum usuário autenticado encontrado. Faça login novamente."
          );
        }

        console.log("✅ Usuário autenticado:", user.id);

        // 2. Buscar perfil com retry
        console.log("🔍 Buscando perfil na tabela profiles...");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        console.log("📊 Dados retornados:", profileData);
        console.log("❌ Erro da query:", profileError);

        if (profileError) {
          console.error("💥 Erro detalhado:", {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
          });

          if (profileError.code === "PGRST116") {
            throw new Error("Perfil não encontrado na base de dados.");
          } else if (profileError.code === "42501") {
            throw new Error("Permissão negada. Verifique as políticas RLS.");
          } else {
            throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
          }
        }

        if (!profileData) {
          throw new Error("Perfil não encontrado (retorno vazio)");
        }

        console.log("🎉 PERFIL ENCONTRADO:", profileData.full_name);
        setProfile(profileData);
      } catch (err: any) {
        console.error("💥 ERRO NO PROCESSO:", err);
        setError(err.message);
      } finally {
        console.log("🏁 Finalizando processo de busca");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [retryCount]); // Recarregar quando retryCount mudar

  const handleRetry = () => {
    console.log("🔄 Tentando novamente...");
    setRetryCount((prev) => prev + 1);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definida";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusInfo = (status: boolean) => {
    return {
      text: status ? "Ativo" : "Inativo",
      color: status ? "bg-green-500" : "bg-red-500",
      icon: status ? FaCheckCircle : FaTimesCircle,
    };
  };

  const getRoleInfo = (role: string) => {
    return {
      text: role === "admin" ? "Administrador" : "Agente",
      color: role === "admin" ? "bg-purple-500" : "bg-blue-500",
    };
  };

  // Estados de renderização
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-light mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800">
                Carregando perfil...
              </h2>
              <p className="text-gray-600 mt-2">Inicializando sistema</p>
            </div>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto text-center">
            <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Erro ao carregar perfil
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>

            <div className="space-y-4">
              <Button
                onClick={handleRetry}
                className="bg-navy-light hover:bg-navy text-white"
              >
                <FaSync className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="ml-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                Fazer Login Novamente
              </Button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>
                Se o problema persistir, entre em contato com o administrador.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto text-center">
            <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Perfil Não Encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Não foi possível carregar os dados do seu perfil.
            </p>
            <Button
              onClick={handleRetry}
              className="bg-navy-light hover:bg-navy text-white"
            >
              <FaSync className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ RENDERIZAÇÃO DO PERFIL
  console.log("🎨 Renderizando perfil:", profile.full_name);

  const statusInfo = getStatusInfo(profile.status);
  const roleInfo = getRoleInfo(profile.role);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32">
      <div className="container mx-auto px-4 py-8">
        {/* Banner de sucesso */}
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg">
          <p className="text-green-800 text-sm font-medium">
            ✅ Perfil carregado com sucesso:{" "}
            <strong>{profile.full_name}</strong> - {profile.matricula}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          {/* Cabeçalho do Perfil */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="relative">
                <div className="w-24 h-24 bg-navy-light rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Foto de perfil"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-10 h-10" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-navy-light text-white p-2 rounded-full hover:bg-navy transition-colors">
                  <FaCamera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {profile.full_name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${roleInfo.color} text-white`}>
                    {roleInfo.text}
                  </Badge>
                  <Badge
                    className={`${statusInfo.color} text-white flex items-center gap-1`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.text}
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="bg-navy-light hover:bg-navy text-white">
              <FaEdit className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Pessoais */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FaUser className="w-5 h-5 text-navy-light mr-2" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem label="Nome Completo" value={profile.full_name} />
                <InfoItem label="Email" value={profile.email} />
                <InfoItem
                  label="Tipo Sanguíneo"
                  value={profile.tipo_sanguineo || "Não definido"}
                  icon={FaTint}
                />
              </CardContent>
            </Card>

            {/* Informações de Serviço */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FaShieldAlt className="w-5 h-5 text-navy-light mr-2" />
                  Informações de Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem
                  label="Matrícula"
                  value={profile.matricula}
                  icon={FaIdCard}
                />
                <InfoItem
                  label="Graduação"
                  value={profile.graduacao || "Não definida"}
                />
                <InfoItem
                  label="Validade da Certificação"
                  value={formatDate(profile.validade_certificacao)}
                  icon={FaCalendarAlt}
                  isDate={true}
                />
              </CardContent>
            </Card>

            {/* Status do Sistema */}
            <Card className="border-0 shadow-md md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FaCheckCircle className="w-5 h-5 text-navy-light mr-2" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <FaCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Conta Verificada
                      </p>
                      <p className="text-sm text-gray-600">
                        Sistema autenticado
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                    <StatusIcon
                      className={`w-6 h-6 ${
                        profile.status ? "text-green-600" : "text-red-600"
                      } flex-shrink-0`}
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Status do Agente
                      </p>
                      <p className="text-sm text-gray-600">{statusInfo.text}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                    <FaShieldAlt className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Nível de Acesso
                      </p>
                      <p className="text-sm text-gray-600">{roleInfo.text}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
