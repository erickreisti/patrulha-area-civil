// src/app/(app)/agent/perfil/page.tsx - VERSÃO ATUALIZADA
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  FaUser,
  FaIdCard,
  FaTint,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaEdit,
  FaCamera,
  FaExclamationTriangle,
  FaSync,
  FaArrowLeft,
  FaShieldAlt,
  FaChartBar,
  FaBan,
} from "react-icons/fa";

interface ProfileData {
  id: string;
  matricula: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  graduacao: string | null;
  validade_certificacao: string | null;
  tipo_sanguineo: string | null;
  status: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function AgentPerfil() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        setLoading(true);

        const supabase = createClient();
        let userData: ProfileData | null = null;

        console.log("🔍 Iniciando busca de perfil...");

        // PRIMEIRO: Tentar buscar dados do localStorage (dados completos do login)
        const localData = localStorage.getItem("pac_user_data");
        if (localData) {
          try {
            userData = JSON.parse(localData);
            console.log("✅ Dados completos do localStorage:", userData);
          } catch (parseError) {
            console.error("❌ Erro ao parsear dados locais:", parseError);
          }
        }

        // SEGUNDO: Se não tem dados locais, tentar buscar do banco via auth
        if (!userData) {
          console.log("🔄 Buscando dados via auth...");
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            console.log("❌ Erro no auth:", userError);
          }

          if (user) {
            console.log("✅ Usuário encontrado no Auth, buscando perfil...");
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profileError) {
              throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
            }

            userData = profileData;
            console.log("📊 Dados completos do banco:", userData);

            // Salvar no localStorage para próximas visits
            localStorage.setItem("pac_user_data", JSON.stringify(userData));
          }
        }

        if (userData) {
          setProfile(userData);
          setIsAdmin(userData.role?.toLowerCase().trim() === "admin");
          console.log("🎉 Perfil carregado com sucesso!");
        } else {
          throw new Error(
            "Nenhum usuário autenticado encontrado. Faça login novamente."
          );
        }
      } catch (err: any) {
        console.error("❌ Erro ao carregar perfil:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.removeItem("pac_user_data");
      localStorage.removeItem("supabase.auth.token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // ✅ ATUALIZADA: Formatar data da certificação considerando status
  const formatCertificationDate = (profile: ProfileData) => {
    // ❗ Se agente está INATIVO, mostra "CERTIFICAÇÃO CANCELADA"
    if (!profile.status) {
      return {
        text: "CERTIFICAÇÃO CANCELADA",
        className: "text-red-600 font-semibold",
        iconColor: "text-red-600",
      };
    }

    // ✅ Se agente está ATIVO, verifica a data
    if (!profile.validade_certificacao) {
      return {
        text: "Não definida",
        className: "text-gray-700",
        iconColor: "text-gray-600",
      };
    }

    const certificationDate = new Date(profile.validade_certificacao);
    const today = new Date();

    if (certificationDate < today) {
      return {
        text: `EXPIRADA - ${certificationDate.toLocaleDateString("pt-BR")}`,
        className: "text-red-600 font-semibold",
        iconColor: "text-red-600",
      };
    } else {
      return {
        text: certificationDate.toLocaleDateString("pt-BR"),
        className: "text-gray-700",
        iconColor: "text-navy-light",
      };
    }
  };

  // Formatar data normal (para criação, etc)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definida";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Componente de Layout Base
  const BaseLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-navy-dark relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-dark z-0"></div>

      {/* Marca d'água */}
      <div className="absolute inset-0 opacity-20 flex items-center justify-center z-10">
        <div className="w-full max-w-4xl aspect-square relative">
          <Image
            src="/images/logos/logo-pattern.svg"
            alt="Marca d'água"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {children}
    </div>
  );

  // Componente de Loading
  const LoadingState = () => (
    <BaseLayout>
      <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-light mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">
            Carregando perfil...
          </h2>
          <p className="text-gray-600 mt-2">Aguarde um momento</p>
        </div>
      </div>
    </BaseLayout>
  );

  // Componente de Erro
  const ErrorState = () => (
    <BaseLayout>
      <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error ? "Erro ao carregar perfil" : "Perfil Não Encontrado"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Não foi possível carregar os dados do perfil."}
          </p>
          <div className="flex flex-col gap-3">
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
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Fazer Login Novamente
            </Button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );

  // Componente Principal do Perfil
  const ProfileContent = () => {
    const certificationInfo = formatCertificationDate(profile!);

    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              {/* Logo, Título e Bandeira */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6 w-full">
                {/* Logo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full shadow-lg overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/logos/logo.webp"
                    alt="Patrulha Aérea Civil"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>

                {/* Títulos - Centralizado */}
                <div className="text-center flex-1 max-w-2xl">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-bebas tracking-wide uppercase">
                    Patrulha Aérea Civil
                  </h1>
                  <p className="text-white/90 text-base sm:text-lg lg:text-xl font-roboto mt-1">
                    Comando Integrado do Estado do Rio de Janeiro
                  </p>
                </div>

                {/* Bandeira do Brasil */}
                <div className="w-16 h-12 sm:w-20 sm:h-15 lg:w-24 lg:h-18 border-2 border-white rounded shadow-lg flex-shrink-0">
                  <Image
                    src="/images/logos/flag-br.webp"
                    alt="Bandeira do Brasil"
                    width={96}
                    height={72}
                    className="w-full h-full object-cover rounded"
                    priority
                  />
                </div>
              </div>

              {/* Título "Informações do Patrulheiro" */}
              <div className="text-center w-full max-w-2xl">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-bebas tracking-wide uppercase border-b-2 border-white pb-2">
                  Informações do Patrulheiro
                </h2>
              </div>
            </div>

            {/* Card do Perfil */}
            <div className="flex justify-center">
              <Card className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl border-0">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  {/* Layout Principal */}
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
                    {/* Lado Esquerdo - Informações Textuais */}
                    <div className="flex-1 w-full space-y-4 sm:space-y-6 text-center lg:text-left">
                      {/* Nome */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Nome Completo
                        </label>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight break-words">
                          {profile!.full_name || "Nome não definido"}
                        </h1>
                      </div>

                      {/* Graduação */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Graduação
                        </label>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 uppercase break-words">
                          {profile!.graduacao
                            ? `${profile!.graduacao.toUpperCase()} - PAC`
                            : "GRADUAÇÃO NÃO DEFINIDA - PAC"}
                        </p>
                      </div>

                      {/* Matrícula */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Matrícula
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-2">
                          <FaIdCard className="w-5 h-5 sm:w-6 sm:h-6 text-navy-light flex-shrink-0" />
                          <p className="text-lg sm:text-xl lg:text-2xl font-mono font-bold text-gray-700 break-all">
                            {profile!.matricula} RJ
                          </p>
                        </div>
                      </div>

                      {/* ✅ ATUALIZADA: Validade da Certificação com status */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Validade da Certificação
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-2">
                          <FaCalendarAlt
                            className={`w-5 h-5 sm:w-6 sm:h-6 ${certificationInfo.iconColor} flex-shrink-0`}
                          />
                          <p
                            className={`text-lg sm:text-xl lg:text-2xl font-semibold ${certificationInfo.className}`}
                          >
                            {certificationInfo.text}
                          </p>
                        </div>
                        {!profile!.status && (
                          <p className="text-sm text-red-600 mt-1">
                            ⚠️ Agente inativo - certificação cancelada
                            automaticamente
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Email
                        </label>
                        <p className="text-lg sm:text-xl font-medium text-gray-600 break-all">
                          {profile!.email}
                        </p>
                      </div>

                      {/* Badge de Admin - MOVIDO PARA AQUI (debaixo do email) */}
                      {isAdmin && (
                        <div className="flex justify-center lg:justify-start">
                          <Badge className="bg-purple-500 text-white px-4 py-2 font-semibold text-sm">
                            <FaShieldAlt className="w-3 h-3 mr-1" />
                            ADMINISTRADOR
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Divisor Vertical - Apenas em desktop */}
                    <div className="hidden lg:block w-px h-80 bg-gray-300"></div>

                    {/* Lado Direito - Foto e Tipo Sanguíneo */}
                    <div className="flex-1 w-full space-y-6 flex flex-col items-center">
                      {/* Foto de Perfil 3x4 */}
                      <div className="space-y-3 w-full max-w-xs">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block text-center">
                          Foto de Identificação
                        </label>
                        <div className="flex justify-center">
                          <div className="relative">
                            <div className="w-48 h-60 sm:w-56 sm:h-72 bg-gray-200 rounded-xl border-4 border-navy-light shadow-2xl flex items-center justify-center overflow-hidden">
                              {profile!.avatar_url ? (
                                <img
                                  src={profile!.avatar_url}
                                  alt="Foto de perfil"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FaUser className="w-20 h-20 sm:w-24 sm:h-24 text-gray-400" />
                              )}
                            </div>
                            {/* Botão de câmera apenas para admin */}
                            {isAdmin && (
                              <button className="absolute -bottom-2 -right-2 bg-navy-light text-white p-2 sm:p-3 rounded-full hover:bg-navy transition-colors shadow-xl border-2 border-white">
                                <FaCamera className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tipo Sanguíneo */}
                      <div className="space-y-2 text-center w-full">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Tipo Sanguíneo
                        </label>
                        <div className="flex justify-center items-center space-x-2">
                          <FaTint className="w-6 h-6 sm:w-7 sm:h-7 text-red-600 flex-shrink-0" />
                          <p className="text-2xl sm:text-3xl font-bold text-red-600">
                            {profile!.tipo_sanguineo || "NÃO DEFINIDO"}
                          </p>
                        </div>
                      </div>

                      {/* Data de Cadastro */}
                      <div className="space-y-2 text-center w-full">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Data de Cadastro
                        </label>
                        <p className="text-sm font-medium text-gray-600">
                          {formatDate(profile!.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divisor Horizontal */}
                  <div className="my-6 lg:my-8 border-t border-gray-200"></div>

                  {/* Status e Botões */}
                  <div className="flex flex-col items-center space-y-6">
                    {/* Status do Agente - AUMENTADO O WIDTH */}
                    <div className="text-center w-full">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block mb-2">
                        Situação do Agente
                      </label>
                      <div className="flex justify-center">
                        <Badge
                          className={`
                            text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 font-bold rounded-lg
                            min-w-[200px] max-w-[300px] w-full
                            ${
                              profile!.status
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }
                            transition-all duration-300 transform hover:scale-105
                            shadow-lg text-center
                          `}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {profile!.status ? (
                              <FaCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <FaBan className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                            <span className="text-sm sm:text-base">
                              {profile!.status ? "ATIVO" : "INATIVO"}
                            </span>
                          </div>
                        </Badge>
                      </div>
                      {!profile!.status && (
                        <p className="text-sm text-red-600 mt-2">
                          ❗ Agente inativo - acesso limitado ao sistema
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                      {/* Botão de Editar - APENAS PARA ADMIN */}
                      {isAdmin && (
                        <Link href={`/admin/agentes/${profile!.id}`}>
                          <Button className="bg-navy-light hover:bg-navy text-white px-6 py-3 text-base font-semibold shadow-md w-full sm:w-auto">
                            <FaEdit className="w-4 h-4 mr-2" />
                            Editar Perfil
                          </Button>
                        </Link>
                      )}

                      {/* Botões de Navegação */}
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {/* Link "Voltar ao Site" - SEMPRE VISÍVEL */}
                        <Link
                          href="/"
                          className="flex items-center justify-center gap-2 text-navy-light hover:bg-navy-light hover:text-white transition-colors duration-300 font-medium px-4 py-3 border border-navy-light rounded-lg text-sm w-full sm:w-auto text-center"
                        >
                          <FaArrowLeft className="w-4 h-4" />
                          Voltar ao Site
                        </Link>

                        {/* Botão "Ir ao Dashboard" - APENAS PARA ADMIN */}
                        {isAdmin && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center justify-center gap-2 bg-navy-light text-white hover:bg-navy transition-colors duration-300 font-medium px-4 py-3 border border-navy-light rounded-lg hover:shadow-md text-sm w-full sm:w-auto text-center"
                          >
                            <FaChartBar className="w-4 h-4" />
                            Dashboard
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Botão de Logout */}
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 mt-4"
                    >
                      Sair do Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  };

  // Renderização condicional
  if (loading) return <LoadingState />;
  if (error || !profile) return <ErrorState />;
  return <ProfileContent />;
}
