// src/app/(app)/agent/perfil/page.tsx - VERSÃO CORRIGIDA
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
  FaHome,
} from "react-icons/fa";
import { motion } from "framer-motion";

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
        className: "text-alert font-semibold",
        iconColor: "text-alert",
        badgeVariant: "destructive" as const,
      };
    }

    // ✅ Se agente está ATIVO, verifica a data
    if (!profile.validade_certificacao) {
      return {
        text: "NÃO DEFINIDA",
        className: "text-slate-600",
        iconColor: "text-slate-500",
        badgeVariant: "secondary" as const,
      };
    }

    const certificationDate = new Date(profile.validade_certificacao);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove hora para comparação apenas de data

    if (certificationDate < today) {
      return {
        text: `EXPIRADA - ${certificationDate.toLocaleDateString("pt-BR")}`,
        className: "text-alert font-semibold",
        iconColor: "text-alert",
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
          className: "text-warning font-semibold",
          iconColor: "text-warning",
          badgeVariant: "secondary" as const,
        };
      } else {
        return {
          text: certificationDate.toLocaleDateString("pt-BR"),
          className: "text-success font-semibold",
          iconColor: "text-success",
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

  // 🎯 COMPONENTE DE LOADING PADRONIZADO
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-3">
      <div className="relative w-6 h-6">
        <motion.div
          className="absolute inset-0 border-2 border-navy/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-0 border-2 border-transparent border-t-navy rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <span className="text-slate-700 font-medium">Carregando...</span>
    </div>
  );

  // Componente de Layout Base
  const BaseLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-700 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-navy-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-alert/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {children}
    </div>
  );

  // Componente de Loading
  const LoadingState = () => (
    <BaseLayout>
      <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20"
        >
          <div className="flex justify-center mb-6">
            <LoadingSpinner />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3 font-bebas">
            Carregando Perfil
          </h2>
          <p className="text-slate-600 text-lg font-roboto">
            Buscando suas informações...
          </p>
        </motion.div>
      </div>
    </BaseLayout>
  );

  // Componente de Erro
  const ErrorState = () => (
    <BaseLayout>
      <div className="flex items-center justify-center min-h-screen p-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-white/20"
        >
          <FaExclamationTriangle className="w-16 h-16 text-alert mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-3 font-bebas">
            {error ? "Erro ao Carregar" : "Perfil Não Encontrado"}
          </h2>
          <p className="text-slate-600 text-lg mb-6 font-roboto">
            {error || "Não foi possível carregar os dados do perfil."}
          </p>
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleRetry}
              className="bg-navy hover:bg-navy-700 text-white py-3 text-lg font-semibold font-roboto transition-all duration-300 hover:scale-105 group relative overflow-hidden"
              size="lg"
            >
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <FaSync className="w-5 h-5 mr-3 relative z-10" />
              <span className="relative z-10">Tentar Novamente</span>
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 py-3 text-lg font-roboto transition-all duration-300 hover:scale-105"
              size="lg"
            >
              Fazer Login Novamente
            </Button>
          </div>
        </motion.div>
      </div>
    </BaseLayout>
  );

  // Componente Principal do Perfil - ESTILO PASSAPORTE
  const ProfileContent = () => {
    const certificationInfo = formatCertificationDate(profile!);

    return (
      <BaseLayout>
        <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
          <div className="w-full max-w-6xl">
            {/* Card do Perfil - ESTILO PASSAPORTE */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center"
            >
              <Card className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl border-2 border-slate-200/80">
                {/* MARCA D'ÁGUA DO PASSAPORTE - Logo Pattern Central */}
                <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none z-0">
                  <div className="w-full h-full max-w-[400px] max-h-[400px] relative">
                    <Image
                      src="/images/logos/logo-pattern.svg"
                      alt="Marca d'água Patrulha Aérea Civil"
                      fill
                      className="object-contain"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    />
                  </div>
                </div>

                {/* BORDA DECORATIVA DO PASSAPORTE */}
                <div className="absolute inset-2 border border-slate-300/50 rounded-xl pointer-events-none z-0" />
                <div className="absolute inset-4 border border-slate-200/30 rounded-lg pointer-events-none z-0" />

                <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
                  {/* HEADER INTERNO DO CARD - SEM BACKGROUND, LOGO 2X MAIOR */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-between pb-6 lg:pb-8 border-b-2 border-slate-200/50 mb-6 lg:mb-8"
                  >
                    {/* Logo - Esquerda - 2X MAIOR */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 overflow-hidden">
                        <Image
                          src="/images/logos/logo.webp"
                          alt="Patrulha Aérea Civil"
                          width={112}
                          height={112}
                          className="w-full h-full object-cover"
                          priority
                        />
                      </div>
                    </motion.div>

                    {/* Título - Centro - SEM BACKGROUND */}
                    <div className="flex-1 text-center px-4 sm:px-6 min-w-0">
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 tracking-wide uppercase leading-tight font-bebas">
                        Patrulha Aérea Civil
                      </h1>
                      <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-snug font-roboto">
                        Comando Integrado do Estado do Rio de Janeiro
                      </p>
                      {/* Subtítulo "Identificação de Agente" */}
                      <div className="mt-2">
                        <h2 className="text-sm sm:text-base font-bold text-slate-700 tracking-wide uppercase font-bebas">
                          Identificação de Agente
                        </h2>
                      </div>
                    </div>

                    {/* Bandeira - Direita - 2X MAIOR */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0"
                    >
                      <div className="w-16 h-12 sm:w-20 sm:h-15 lg:w-24 lg:h-18 border-2 border-slate-300 rounded">
                        <Image
                          src="/images/logos/flag-br.webp"
                          alt="Bandeira do Brasil"
                          width={96}
                          height={72}
                          className="w-full h-full object-cover rounded"
                          priority
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Layout Principal Responsivo */}
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-12 items-center lg:items-start">
                    {/* Lado Esquerdo - Informações Textuais */}
                    <div className="flex-1 w-full space-y-4 sm:space-y-6 text-center lg:text-left">
                      {/* Nome */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto">
                          Nome Completo
                        </label>
                        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-800 leading-tight break-words min-h-[1.2em] font-bebas">
                          {profile!.full_name || "Nome não definido"}
                        </h1>
                      </div>

                      {/* Graduação */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto">
                          Graduação
                        </label>
                        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-alert uppercase break-words min-h-[1.2em] font-bebas">
                          {profile!.graduacao
                            ? `${profile!.graduacao.toUpperCase()} - PAC`
                            : "GRADUAÇÃO NÃO DEFINIDA - PAC"}
                        </p>
                      </div>

                      {/* Matrícula */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto">
                          Matrícula
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
                          <FaIdCard className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-navy flex-shrink-0" />
                          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-mono font-bold text-slate-700 break-all">
                            {profile!.matricula} RJ
                          </p>
                        </div>
                      </div>

                      {/* Validade da Certificação */}
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto">
                          Validade da Certificação
                        </label>
                        <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
                          <FaCalendarAlt
                            className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${certificationInfo.iconColor} flex-shrink-0`}
                          />
                          <Badge
                            variant={certificationInfo.badgeVariant}
                            className={`text-base sm:text-lg lg:text-xl xl:text-2xl font-mono font-bold px-4 py-2 ${certificationInfo.className} transition-all duration-300`}
                          >
                            {certificationInfo.text}
                          </Badge>
                        </div>
                        {!profile!.status && (
                          <p className="text-xs text-alert mt-1 text-center lg:text-left font-roboto">
                            ⚠️ Agente inativo - certificação cancelada
                            automaticamente
                          </p>
                        )}
                      </div>

                      {/* Badge de Admin */}
                      {isAdmin && (
                        <div className="flex justify-center lg:justify-start pt-2">
                          <Badge className="bg-navy hover:bg-navy-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 font-roboto">
                            <FaShieldAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            ADMINISTRADOR
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Divisor Vertical - Apenas em desktop */}
                    <div className="hidden lg:block w-px h-80 bg-gradient-to-b from-transparent via-slate-300/50 to-transparent"></div>

                    {/* Lado Direito - Foto e Informações Adicionais */}
                    <div className="flex-1 w-full space-y-6 flex flex-col items-center">
                      {/* Foto de Perfil 3x4 Responsiva */}
                      <div className="space-y-3 w-full max-w-xs">
                        <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block text-center font-roboto">
                          Foto de Identificação
                        </label>
                        <div className="flex justify-center">
                          <motion.div
                            className="relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Moldura estilo passaporte */}
                            <div className="w-40 h-52 sm:w-48 sm:h-60 lg:w-52 lg:h-64 xl:w-56 xl:h-72 bg-slate-100 rounded-lg border-4 border-navy shadow-xl flex items-center justify-center overflow-hidden relative">
                              {/* Padrão de fundo sutil */}
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-200/30 to-slate-100/50"></div>

                              {profile!.avatar_url ? (
                                <img
                                  src={profile!.avatar_url}
                                  alt="Foto de perfil"
                                  className="w-full h-full object-cover relative z-10"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 relative z-10">
                                  <FaUser className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-2" />
                                  <span className="text-xs sm:text-sm text-center px-2 font-roboto">
                                    Sem foto
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Botão de câmera apenas para admin */}
                            {isAdmin && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 sm:p-3 rounded-full hover:bg-blue-700 transition-all duration-300 shadow-xl border-2 border-white z-20"
                              >
                                <FaCamera className="w-3 h-3 sm:w-4 sm:h-4" />
                              </motion.button>
                            )}
                          </motion.div>
                        </div>
                      </div>

                      {/* Tipo Sanguíneo */}
                      <div className="space-y-2 text-center w-full">
                        <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto">
                          Tipo Sanguíneo
                        </label>
                        <div className="flex justify-center items-center space-x-2 sm:space-x-3">
                          <FaTint className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-alert flex-shrink-0" />
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-alert font-bebas">
                            {profile!.tipo_sanguineo || "NÃO DEFINIDO"}
                          </p>
                        </div>
                      </div>

                      {/* Data de Cadastro */}
                      <div className="space-y-2 text-center w-full">
                        <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block font-roboto">
                          Data de Cadastro
                        </label>
                        <p className="text-sm font-medium text-slate-600 font-roboto">
                          {formatDate(profile!.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divisor Horizontal com estilo de passaporte */}
                  <div className="my-6 lg:my-8 border-t border-slate-300/50 relative">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-navy/20 rounded-full"></div>
                  </div>

                  {/* Status do Agente - ÚLTIMO ELEMENTO DENTRO DO CARD */}
                  <div className="flex flex-col items-center">
                    {/* Status do Agente */}
                    <div className="text-center w-full">
                      <label className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wide block mb-3 font-roboto">
                        Situação do Agente
                      </label>
                      <div className="flex justify-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge
                            className={`
                              text-sm sm:text-base px-6 sm:px-8 lg:px-10 py-3 sm:py-4 font-bold rounded-lg
                              min-w-[180px] sm:min-w-[200px] max-w-[280px] w-full
                              transition-all duration-300 cursor-default
                              shadow-lg text-center font-roboto border-2
                              ${
                                profile!.status
                                  ? "bg-success text-white hover:bg-success/90 border-success/50"
                                  : "bg-alert text-white hover:bg-alert/90 border-alert/50"
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
                        </motion.div>
                      </div>
                      {!profile!.status && (
                        <p className="text-xs sm:text-sm text-alert mt-2 max-w-md mx-auto font-roboto">
                          ❗ Agente inativo - acesso limitado ao sistema
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* BOTÕES FORA DO CARD - MELHORADOS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col items-center gap-4 mt-8"
            >
              {/* BOTÕES PRINCIPAIS */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl">
                {/* 🔵 BOTÃO EDITAR PERFIL (Admin) */}
                {isAdmin && (
                  <Link
                    href={`/admin/agentes/${profile!.id}`}
                    className="w-full sm:w-auto flex-1"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold shadow-lg w-full transition-all duration-300 font-roboto border-2 border-blue-500/50 group relative overflow-hidden">
                        {/* Efeito de brilho */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <FaEdit className="w-4 h-4 mr-3 relative z-10" />
                        <span className="relative z-10">Editar Perfil</span>
                      </Button>
                    </motion.div>
                  </Link>
                )}

                {/* 🟣 BOTÃO DASHBOARD (Admin) */}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="w-full sm:w-auto flex-1"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold shadow-lg w-full transition-all duration-300 font-roboto border-2 border-purple-500/50 group relative overflow-hidden">
                        {/* Efeito de brilho */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <FaChartBar className="w-4 h-4 mr-3 relative z-10" />
                        <span className="relative z-10">Dashboard</span>
                      </Button>
                    </motion.div>
                  </Link>
                )}

                {/* ⚪ BOTÃO VOLTAR AO SITE */}
                <Link href="/" className="w-full sm:w-auto flex-1">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold shadow-md w-full transition-all duration-300 font-roboto group relative overflow-hidden"
                    >
                      {/* Efeito de fundo sutil */}
                      <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <FaHome className="w-4 h-4 mr-3 relative z-10" />
                      <span className="relative z-10">Voltar ao Site</span>
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* 🔴 BOTÃO SAIR DO SISTEMA */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full max-w-2xl"
              >
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="bg-white hover:bg-red-50 text-red-600 border-2 border-red-300 hover:border-red-400 hover:text-red-700 px-8 py-3 text-sm font-semibold w-full transition-all duration-300 font-roboto group relative overflow-hidden"
                >
                  {/* Efeito de fundo sutil */}
                  <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Sair do Sistema</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Footer com informações do sistema */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center mt-8"
            >
              <p className="text-white/70 text-sm font-roboto">
                Sistema Patrulha Aérea Civil • {new Date().getFullYear()}
              </p>
            </motion.div>
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
