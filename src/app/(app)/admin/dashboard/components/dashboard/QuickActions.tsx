// src/app/admin/dashboard/components/dashboard/QuickActions.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RiUserAddLine,
  RiFileAddLine,
  RiFolderAddLine,
  RiSettingsLine,
  RiCalendarLine,
  RiBarChartLine,
} from "react-icons/ri";

interface QuickActionsProps {
  navigateTo: (path: string) => void;
}

export function QuickActions({ navigateTo }: QuickActionsProps) {
  const actions = [
    {
      title: "Novo Agente",
      description: "Cadastrar novo agente no sistema",
      icon: RiUserAddLine,
      color: "blue",
      action: () => navigateTo("/admin/agentes/criar"),
    },
    {
      title: "Nova Notícia",
      description: "Publicar nova notícia",
      icon: RiFileAddLine,
      color: "green",
      action: () => navigateTo("/admin/noticias/criar"),
    },
    {
      title: "Upload Galeria",
      description: "Adicionar fotos/vídeos",
      icon: RiFolderAddLine,
      color: "orange",
      action: () => navigateTo("/admin/galeria/itens/criar"),
    },
    {
      title: "Relatórios",
      description: "Gerar relatórios do sistema",
      icon: RiBarChartLine,
      color: "purple",
      action: () => navigateTo("/admin/relatorios"),
    },
    {
      title: "Calendário",
      description: "Agendar eventos",
      icon: RiCalendarLine,
      color: "cyan",
      action: () => navigateTo("/admin/calendario"),
    },
    {
      title: "Configurações",
      description: "Configurar sistema",
      icon: RiSettingsLine,
      color: "gray",
      action: () => navigateTo("/admin/configuracoes"),
    },
  ];

  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    green: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
    orange:
      "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    purple:
      "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100",
    gray: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RiBarChartLine className="h-5 w-5 text-blue-600" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className={`flex flex-col items-center justify-center p-6 h-full w-full ${
                  colors[action.color as keyof typeof colors]
                }`}
                onClick={action.action}
              >
                <action.icon className="h-8 w-8 mb-2" />
                <span className="font-medium">{action.title}</span>
                <span className="text-sm text-gray-500 mt-1 text-center">
                  {action.description}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
