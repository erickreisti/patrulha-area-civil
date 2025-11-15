// src/app/(app)/admin/dashboard/page.tsx - VERSÃO COM ESPAÇAMENTO PRECISO
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaUsers,
  FaNewspaper,
  FaImages,
  FaChartBar,
  FaPlus,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

interface DashboardStats {
  totalAgents: number;
  totalNews: number;
  totalGalleryItems: number;
  activeAgents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalNews: 0,
    totalGalleryItems: 0,
    activeAgents: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar estatísticas do banco de dados
        const [agentsResponse, newsResponse, galleryResponse] =
          await Promise.all([
            supabase.from("profiles").select("*"),
            supabase.from("noticias").select("*"),
            supabase.from("galeria_itens").select("*"),
          ]);

        const totalAgents = agentsResponse.data?.length || 0;
        const activeAgents =
          agentsResponse.data?.filter((agent) => agent.status).length || 0;

        setStats({
          totalAgents,
          totalNews: newsResponse.data?.length || 0,
          totalGalleryItems: galleryResponse.data?.length || 0,
          activeAgents,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend,
    color = "blue",
  }: {
    title: string;
    value: number;
    icon: any;
    description: string;
    trend?: string;
    color?: "blue" | "green" | "purple" | "red" | "navy";
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      red: "from-red-500 to-red-600",
      navy: "from-navy-light to-navy",
    };

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-3xl font-bold text-gray-800 mb-2">
                {loading ? "..." : value}
              </p>
              <p className="text-xs text-gray-500">{description}</p>
              {trend && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  {trend}
                </p>
              )}
            </div>
            <div
              className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const QuickAction = ({
    title,
    description,
    icon: Icon,
    onClick,
    color = "navy",
  }: {
    title: string;
    description: string;
    icon: any;
    onClick: () => void;
    color?: "blue" | "green" | "red" | "navy";
  }) => {
    const colorClasses = {
      navy: "bg-navy-light hover:bg-navy text-white",
      green: "bg-green-600 hover:bg-green-700 text-white",
      red: "bg-red-600 hover:bg-red-700 text-white",
      blue: "bg-blue-600 hover:bg-blue-700 text-white",
    };

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div
              className={`p-3 rounded-lg ${
                colorClasses[color].split(" ")[0]
              } text-white`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
              <p className="text-sm text-gray-600 mb-3">{description}</p>
              <Button
                onClick={onClick}
                className={`${colorClasses[color]} font-medium`}
                size="sm"
              >
                Acessar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RecentActivity = () => (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <FaClock className="w-5 h-5 text-gray-600 mr-2" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Sistema atualizado
              </p>
              <p className="text-xs text-gray-600">Há 2 minutos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <FaExclamationTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Backup pendente
              </p>
              <p className="text-xs text-gray-600">Há 1 hora</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <FaUsers className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Novo agente cadastrado
              </p>
              <p className="text-xs text-gray-600">Hoje às 14:30</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-32">
      {" "}
      {/* AUMENTEI PARA pt-32 (128px) */}
      <div className="container mx-auto px-4 py-8">
        {/* Header do Dashboard */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
                PAINEL ADMINISTRATIVO
              </h1>
              <p className="text-gray-600 text-lg">
                Bem-vindo ao centro de controle da Patrulha Aérea Civil
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button className="bg-navy-light hover:bg-navy text-white font-medium px-6 py-2.5">
                <FaCog className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>

        {/* Grid de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Agentes"
            value={stats.totalAgents}
            icon={FaUsers}
            description={`${stats.activeAgents} ativos`}
            trend="+2 este mês"
            color="blue"
          />
          <StatCard
            title="Notícias Publicadas"
            value={stats.totalNews}
            icon={FaNewspaper}
            description="Última: Hoje"
            trend="+5 esta semana"
            color="green"
          />
          <StatCard
            title="Itens na Galeria"
            value={stats.totalGalleryItems}
            icon={FaImages}
            description="Fotos e vídeos"
            trend="+12 este mês"
            color="navy"
          />
          <StatCard
            title="Relatórios"
            value={4}
            icon={FaChartBar}
            description="Disponíveis"
            trend="Atualizado hoje"
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ações Rápidas */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <FaPlus className="w-5 h-5 text-gray-600 mr-2" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickAction
                    title="Gerenciar Agentes"
                    description="Adicionar, editar ou remover agentes do sistema"
                    icon={FaUsers}
                    onClick={() => (window.location.href = "/admin/agentes")}
                    color="navy"
                  />
                  <QuickAction
                    title="Criar Notícia"
                    description="Publicar nova notícia no site"
                    icon={FaNewspaper}
                    onClick={() => (window.location.href = "/admin/noticias")}
                    color="green"
                  />
                  <QuickAction
                    title="Gerenciar Galeria"
                    description="Adicionar fotos e vídeos"
                    icon={FaImages}
                    onClick={() => (window.location.href = "/admin/galeria")}
                    color="blue"
                  />
                  <QuickAction
                    title="Relatórios"
                    description="Gerar relatórios do sistema"
                    icon={FaChartBar}
                    onClick={() => (window.location.href = "/admin/relatorios")}
                    color="red"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividade Recente */}
          <div>
            <RecentActivity />
          </div>
        </div>

        {/* Status do Sistema */}
        <Card className="mt-8 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-800">
                  Sistema operando normalmente
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Última verificação: Hoje
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
