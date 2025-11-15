// src/app/(app)/agent/perfil/page.tsx - VERSÃO CORRIGIDA
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

// Componente auxiliar MOVIDO para fora do componente principal
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
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("🔍 Buscando perfil no Vercel...");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        console.log("👤 Usuário:", user);

        if (userError) {
          throw new Error(`Erro de autenticação: ${userError.message}`);
        }

        if (!user) {
          throw new Error("Nenhum usuário autenticado");
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        console.log("📊 Perfil encontrado:", profileData);
        console.log("❌ Erro do perfil:", profileError);

        if (profileError) {
          throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
        }

        setProfile(profileData);
      } catch (err: any) {
        console.error("💥 Erro:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

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

  // ⚠️ IMPORTANTE: Sempre retorne o JSX de forma consistente
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
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
            <Button
              onClick={() => window.location.reload()}
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto text-center">
            <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Perfil Não Encontrado
            </h2>
            <p className="text-gray-600">
              Não foi possível carregar os dados do seu perfil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ⚠️ CERTIFIQUE-SE de que este return está no final
  const statusInfo = getStatusInfo(profile.status);
  const roleInfo = getRoleInfo(profile.role);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32">
      <div className="container mx-auto px-4 py-8">
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
                  {profile.full_name || "Nome não definido"}
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
                <InfoItem
                  label="Nome Completo"
                  value={profile.full_name || "Não definido"}
                />
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
