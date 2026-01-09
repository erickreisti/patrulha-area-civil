"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { RiUserLine, RiLogoutBoxLine, RiHomeLine } from "react-icons/ri";

export function UserProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { profile, user, logout, hasAdminSession } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    setOpen(false);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  if (!profile) return null;

  // Função para gerar iniciais do nome
  const getInitials = () => {
    if (!profile.full_name) return "U";
    const names = profile.full_name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Cor baseada no status
  const getStatusColor = () => {
    if (!profile.status) return "bg-gray-500";
    return "bg-green-500";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative p-0 h-auto rounded-full hover:bg-gray-50 transition-all duration-200 group"
        >
          <div className="relative">
            {/* Avatar com borda */}
            <Avatar className="h-12 w-12 border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-200">
              <AvatarImage
                src={profile.avatar_url || undefined}
                alt={profile.full_name || "Perfil"}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-navy/90 to-blue-600 text-white text-lg font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Indicador de status */}
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor()}`}
              title={profile.status ? "Ativo" : "Inativo"}
            />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 shadow-xl border-gray-200 rounded-lg p-0"
      >
        {/* Header com informações do usuário */}
        <div className="p-4 bg-gradient-to-r from-navy/5 to-blue-50">
          <DropdownMenuLabel className="p-0">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow">
                <AvatarImage
                  src={profile.avatar_url || undefined}
                  alt={profile.full_name || "Perfil"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-navy/90 to-blue-600 text-white font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">
                  {profile.full_name || "Usuário"}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {user?.email || profile.email}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700"
                  >
                    {profile.role === "admin" ? "Administrador" : "Agente"}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${
                      profile.status
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    {profile.status ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </div>

        <DropdownMenuSeparator />

        {/* Menu simplificado */}
        <div className="p-1">
          <DropdownMenuItem
            onClick={() => handleNavigate("/perfil")}
            className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 rounded"
          >
            <RiUserLine className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-gray-900">Meu Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleNavigate("/")}
            className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 rounded"
          >
            <RiHomeLine className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-gray-900">Ver Site</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-red-50 rounded text-red-600"
          >
            <RiLogoutBoxLine className="mr-3 h-4 w-4" />
            <span className="font-medium">Sair</span>
          </DropdownMenuItem>
        </div>

        {/* Footer com informações da sessão */}
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {hasAdminSession ? "Sessão admin ativa" : "Sessão usuário"}
            </p>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-xs text-gray-500">
                {profile.status ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
