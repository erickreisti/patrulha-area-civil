// src/app/(app)/agent/perfil/page.tsx - VERSÃO CENTRALIZADA E RESPONSIVA
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

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Nenhum usuário autenticado encontrado");
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
        }

        setProfile(profileData);

        // VERIFICAÇÃO ROBUSTA DE ADMIN
        const userRole = profileData.role?.toLowerCase().trim();
        setIsAdmin(userRole === "admin");
      } catch (err: any) {
        console.error("Erro ao carregar perfil:", err);
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
          <Button
            onClick={handleRetry}
            className="bg-navy-light hover:bg-navy text-white w-full sm:w-auto"
          >
            <FaSync className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    </BaseLayout>
  );

  // Componente Principal do Perfil
  const ProfileContent = () => (
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
            <Card className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[75vh] w-full max-w-4xl border-0">
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
                        {profile!.full_name}
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
                          : "NÃO DEFINIDO - PAC"}
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

                    {/* Validade da Certificação */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block">
                        Validade da Certificação
                      </label>
                      <div className="flex items-center justify-center lg:justify-start space-x-2">
                        <FaCalendarAlt className="w-5 h-5 sm:w-6 sm:h-6 text-navy-light flex-shrink-0" />
                        <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700">
                          {formatDate(profile!.validade_certificacao)}
                        </p>
                      </div>
                    </div>
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
                          <button className="absolute -bottom-2 -right-2 bg-navy-light text-white p-2 sm:p-3 rounded-full hover:bg-navy transition-colors shadow-xl border-2 border-white">
                            <FaCamera className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
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
                          {profile!.tipo_sanguineo || "N/D"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divisor Horizontal */}
                <div className="my-6 lg:my-8 border-t border-gray-200"></div>

                {/* Status e Botões */}
                <div className="flex flex-col items-center space-y-6">
                  {/* Status do Agente */}
                  <div className="text-center">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide block mb-2">
                      Situação do Agente
                    </label>
                    <Badge
                      className={`
                        text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-bold rounded-lg
                        ${
                          profile!.status
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }
                        transition-all duration-300 transform hover:scale-105
                        shadow-lg min-w-[140px] text-center
                      `}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {profile!.status ? (
                          <FaCheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <FaTimesCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                        <span className="text-sm sm:text-base">
                          {profile!.status ? "ATIVO" : "INATIVO"}
                        </span>
                      </div>
                    </Badge>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                    {/* Botão de Editar */}
                    <Button className="bg-navy-light hover:bg-navy text-white px-6 py-3 text-base font-semibold shadow-md w-full sm:w-auto">
                      <FaEdit className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>

                    {/* Botões de Navegação */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {/* Link "Voltar ao Site" */}
                      <Link
                        href="/"
                        className="flex items-center justify-center gap-2 text-navy-light hover:bg-navy-light hover:text-white transition-colors duration-300 font-medium px-4 py-3 border border-navy-light rounded-lg text-sm w-full sm:w-auto text-center"
                      >
                        <FaArrowLeft className="w-4 h-4" />
                        Voltar ao Site
                      </Link>

                      {/* Botão "Ir ao Dashboard" para Admin */}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );

  // Renderização condicional
  if (loading) return <LoadingState />;
  if (error || !profile) return <ErrorState />;
  return <ProfileContent />;
}
