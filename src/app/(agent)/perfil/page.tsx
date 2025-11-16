// src/app/(app)/agent/perfil/page.tsx - VERSÃO CORRIGIDA E RESPONSIVA
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

        // PRIMEIRO: Tentar buscar dados do localStorage
        const localData = localStorage.getItem("pac_user_data");
        if (localData) {
          try {
            userData = JSON.parse(localData);
            console.log("✅ Dados completos do localStorage:", userData);
          } catch (parseError) {
            console.error("❌ Erro ao parsear dados locais:", parseError);
            localStorage.removeItem("pac_user_data");
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
            console.error("❌ Erro no auth:", userError);
            throw new Error("Erro de autenticação");
          }

          if (user) {
            console.log("✅ Usuário encontrado no Auth, buscando perfil...");
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profileError) {
              console.error("❌ Erro ao buscar perfil:", profileError);
              // Tenta criar perfil básico se não existir
              const newProfile = {
                id: user.id,
                matricula: `PAC${Date.now()}`,
                email: user.email || "",
                full_name: user.user_metadata?.full_name || "Agente PAC",
                avatar_url: null,
                graduacao: "Agente",
                validade_certificacao: null,
                tipo_sanguineo: null,
                status: true,
                role: "agent",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              const { data: insertedProfile, error: insertError } =
                await supabase
                  .from("profiles")
                  .insert([newProfile])
                  .select()
                  .single();

              if (insertError) {
                throw new Error(`Erro ao criar perfil: ${insertError.message}`);
              }

              userData = insertedProfile;
              console.log("✅ Perfil criado automaticamente:", userData);
            } else {
              userData = profileData;
            }

            // Salvar no localStorage para próximas visits
            if (userData) {
              localStorage.setItem("pac_user_data", JSON.stringify(userData));
            }
          } else {
            throw new Error("Nenhum usuário autenticado encontrado");
          }
        }

        if (userData) {
          setProfile(userData);
          setIsAdmin(userData.role?.toLowerCase().trim() === "admin");
          console.log("🎉 Perfil carregado com sucesso!");
        } else {
          throw new Error("Não foi possível carregar os dados do perfil");
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

  // ✅ CORRIGIDO: Formatar data da certificação considerando status
  const formatCertificationDate = (profile: ProfileData) => {
    // ❗ Se agente está INATIVO, mostra "CERTIFICAÇÃO CANCELADA"
    if (!profile.status) {
      return {
        text: "CERTIFICAÇÃO CANCELADA",
        className: "text-red-600 font-semibold",
        iconColor: "text-red-600",
        badgeVariant: "destructive" as const,
      };
    }

    // ✅ Se agente está ATIVO, verifica a data
    if (!profile.validade_certificacao) {
      return {
        text: "NÃO DEFINIDA",
        className: "text-gray-700",
        iconColor: "text-gray-600",
        badgeVariant: "secondary" as const,
      };
    }

    const certificationDate = new Date(profile.validade_certificacao);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove hora para comparação apenas de data

    if (certificationDate < today) {
      return {
        text: `EXPIRADA - ${certificationDate.toLocaleDateString("pt-BR")}`,
        className: "text-red-600 font-semibold",
        iconColor: "text-red-600",
        badgeVariant: "destructive" as const,
      };
    } else {
      const daysUntilExpiry = Math.ceil(
        (certificationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 30) {
        return {
          text: `EXPIRA EM ${daysUntilExpiry} DIAS - ${certificationDate.toLocaleDateString(
            "pt-BR"
          )}`,
          className: "text-orange-600 font-semibold",
          iconColor: "text-orange-600",
          badgeVariant: "secondary" as const,
        };
      } else {
        return {
          text: certificationDate.toLocaleDateString("pt-BR"),
          className: "text-green-600 font-semibold",
          iconColor: "text-green-600",
          badgeVariant: "default" as const,
        };
      }
    }
  };

  // Formatar data normal
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definida";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Componente de Layout Base
  const BaseLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark to-navy relative overflow-hidden">
      {/* Background com gradiente suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light/20 z-0"></div>

      {/* Marca d'água responsiva */}
      <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center z-10">
        <div className="w-full max-w-6xl aspect-square relative">
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-navy-light border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Carregando Perfil
          </h2>
          <p className="text-gray-600 text-lg">Buscando suas informações...</p>
        </div>
      </div>
    </BaseLayout>
  );

  // Componente de Erro
  const ErrorState = () => (
    <BaseLayout>
      <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20">
          <FaExclamationTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {error ? "Erro ao Carregar" : "Perfil Não Encontrado"}
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            {error || "Não foi possível carregar os dados do perfil."}
          </p>
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleRetry}
              className="bg-navy-light hover:bg-navy text-white py-3 text-lg font-semibold"
              size="lg"
            >
              <FaSync className="w-5 h-5 mr-3" />
              Tentar Novamente
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 py-3 text-lg"
              size="lg"
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
            {/* Header Responsivo */}
            <div className="flex flex-col items-center mb-6 sm:mb-8 lg:mb-12">
              {/* Layout responsivo para logo, título e bandeira */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8 mb-6 w-full max-w-4xl mx-auto">
                {/* Logo - Esquerda */}
                <div className="order-2 sm:order-1 flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full shadow-2xl overflow-hidden border-4 border-white">
                    <Image
                      src="/images/logos/logo.webp"
                      alt="Patrulha Aérea Civil"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Títulos - Centro (ocupando espaço disponível) */}
                <div className="order-1 sm:order-2 flex-1 text-center min-w-0 px-2 sm:px-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white font-bebas tracking-wide uppercase leading-tight">
                    Patrulha Aérea Civil
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base lg:text-lg xl:text-xl font-roboto mt-1 sm:mt-2 leading-snug">
                    Comando Integrado do Estado do Rio de Janeiro
                  </p>
                </div>

                {/* Bandeira - Direita */}
                <div className="order-3 flex-shrink-0">
                  <div className="w-12 h-9 sm:w-16 sm:h-12 lg:w-20 lg:h-15 border-2 border-white rounded shadow-lg">
                    <Image
                      src="/images/logos/flag-br.webp"
                      alt="Bandeira do Brasil"
                      width={80}
                      height={60}
                      className="w-full h-full object-cover rounded"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Título "Informações do Patrulheiro" */}
              <div className="text-center w-full max-w-2xl">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-bebas tracking-wide uppercase border-b-2 border-white/30 pb-2 sm:pb-3">
                  Informações do Patrulheiro
                </h2>
              </div>
            </div>

            {/* Card do Perfil Responsivo */}
            <div className="flex justify-center">
              <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl border-0">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  {/* Layout Principal Responsivo */}
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 items-center lg:items-start">
                    {/* Lado Esquerdo - Informações Textuais */}
                    <div className="flex-1 w-full space-y-4 sm:space-y-6 text-center lg:text-left">
                      {/* Nome */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Nome Completo
                        </label>
                        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 leading-tight break-words min-h-[1.2em]">
                          {profile!.full_name || "Nome não definido"}
                        </h1>
                      </div>

                      {/* Graduação */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Graduação
                        </label>
                        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-red-600 uppercase break-words min-h-[1.2em]">
                          {profile!.graduacao
                            ? `${profile!.graduacao.toUpperCase()} - PAC`
                            : "GRADUAÇÃO NÃO DEFINIDA - PAC"}
                        </p>
                      </div>

                      {/* Matrícula */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Matrícula
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
                          <FaIdCard className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-navy-light flex-shrink-0" />
                          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-mono font-bold text-gray-700 break-all">
                            {profile!.matricula} RJ
                          </p>
                        </div>
                      </div>

                      {/* Validade da Certificação */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Validade da Certificação
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
                          <FaCalendarAlt
                            className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${certificationInfo.iconColor} flex-shrink-0`}
                          />
                          <Badge
                            variant={certificationInfo.badgeVariant}
                            className={`text-xs sm:text-sm px-3 py-1 font-semibold ${certificationInfo.className}`}
                          >
                            {certificationInfo.text}
                          </Badge>
                        </div>
                        {!profile!.status && (
                          <p className="text-xs text-red-600 mt-1 text-center lg:text-left">
                            ⚠️ Agente inativo - certificação cancelada
                            automaticamente
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Email
                        </label>
                        <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 break-all">
                          {profile!.email}
                        </p>
                      </div>

                      {/* Badge de Admin */}
                      {isAdmin && (
                        <div className="flex justify-center lg:justify-start pt-2">
                          <Badge className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition-colors">
                            <FaShieldAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            ADMINISTRADOR
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Divisor Vertical - Apenas em desktop */}
                    <div className="hidden lg:block w-px h-80 bg-gray-300/50"></div>

                    {/* Lado Direito - Foto e Informações Adicionais */}
                    <div className="flex-1 w-full space-y-6 flex flex-col items-center">
                      {/* Foto de Perfil 3x4 Responsiva */}
                      <div className="space-y-3 w-full max-w-xs">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block text-center">
                          Foto de Identificação
                        </label>
                        <div className="flex justify-center">
                          <div className="relative">
                            <div className="w-40 h-52 sm:w-48 sm:h-60 lg:w-52 lg:h-64 xl:w-56 xl:h-72 bg-gray-100 rounded-xl border-4 border-navy-light shadow-2xl flex items-center justify-center overflow-hidden">
                              {profile!.avatar_url ? (
                                <img
                                  src={profile!.avatar_url}
                                  alt="Foto de perfil"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                  <FaUser className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-2" />
                                  <span className="text-xs sm:text-sm text-center px-2">
                                    Sem foto
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Botão de câmera apenas para admin */}
                            {isAdmin && (
                              <button className="absolute -bottom-2 -right-2 bg-navy-light text-white p-2 sm:p-3 rounded-full hover:bg-navy transition-colors shadow-xl border-2 border-white">
                                <FaCamera className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tipo Sanguíneo */}
                      <div className="space-y-2 text-center w-full">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Tipo Sanguíneo
                        </label>
                        <div className="flex justify-center items-center space-x-2 sm:space-x-3">
                          <FaTint className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-red-600 flex-shrink-0" />
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
                            {profile!.tipo_sanguineo || "NÃO DEFINIDO"}
                          </p>
                        </div>
                      </div>

                      {/* Data de Cadastro */}
                      <div className="space-y-2 text-center w-full">
                        <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block">
                          Data de Cadastro
                        </label>
                        <p className="text-sm font-medium text-gray-600">
                          {formatDate(profile!.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divisor Horizontal */}
                  <div className="my-6 lg:my-8 border-t border-gray-200/50"></div>

                  {/* Status e Botões */}
                  <div className="flex flex-col items-center space-y-6">
                    {/* Status do Agente */}
                    <div className="text-center w-full">
                      <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide block mb-3">
                        Situação do Agente
                      </label>
                      <div className="flex justify-center">
                        <Badge
                          className={`
                            text-sm sm:text-base px-6 sm:px-8 lg:px-10 py-3 sm:py-4 font-bold rounded-lg
                            min-w-[180px] sm:min-w-[200px] max-w-[280px] w-full
                            transition-all duration-300 transform hover:scale-105 cursor-default
                            shadow-lg text-center
                            ${
                              profile!.status
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }
                          `}
                        >
                          <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                            {profile!.status ? (
                              <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <FaBan className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                            <span className="text-xs sm:text-sm">
                              {profile!.status ? "ATIVO" : "INATIVO"}
                            </span>
                          </div>
                        </Badge>
                      </div>
                      {!profile!.status && (
                        <p className="text-xs sm:text-sm text-red-600 mt-2 max-w-md mx-auto">
                          ❗ Agente inativo - acesso limitado ao sistema
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação Responsivos */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                      {/* Botão de Editar - APENAS PARA ADMIN */}
                      {isAdmin && (
                        <Link
                          href={`/admin/agentes/${profile!.id}`}
                          className="w-full sm:w-auto"
                        >
                          <Button className="bg-navy-light hover:bg-navy text-white px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold shadow-md w-full">
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
                          className="flex items-center justify-center gap-2 text-navy-light hover:bg-navy-light hover:text-white transition-colors duration-300 font-medium px-4 py-3 border border-navy-light rounded-lg text-xs sm:text-sm w-full sm:w-auto text-center"
                        >
                          <FaArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                          Voltar ao Site
                        </Link>

                        {/* Botão "Ir ao Dashboard" - APENAS PARA ADMIN */}
                        {isAdmin && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center justify-center gap-2 bg-navy-light text-white hover:bg-navy transition-colors duration-300 font-medium px-4 py-3 border border-navy-light rounded-lg hover:shadow-md text-xs sm:text-sm w-full sm:w-auto text-center"
                          >
                            <FaChartBar className="w-3 h-3 sm:w-4 sm:h-4" />
                            Dashboard
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Botão de Logout */}
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 mt-2 px-6 py-2 text-sm"
                    >
                      Sair do Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer com informações do sistema */}
            <div className="text-center mt-6 sm:mt-8">
              <p className="text-white/70 text-xs sm:text-sm">
                Sistema Patrulha Aérea Civil • {new Date().getFullYear()}
              </p>
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
