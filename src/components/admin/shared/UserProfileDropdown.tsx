"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiUserLine } from "react-icons/ri";

export function UserProfileDropdown() {
  const { profile } = useAuthStore();

  // Pega as iniciais do nome (ex: "Erick Silva" -> "ES")
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Link href="/perfil" title="Ir para meu perfil">
      <Avatar className="h-10 w-10 border border-slate-200 shadow-sm transition-transform hover:scale-105 cursor-pointer bg-white">
        {/* Tenta carregar a foto do perfil */}
        <AvatarImage
          src={profile?.avatar_url || ""}
          alt={profile?.full_name || "Usuário"}
          className="object-cover"
        />

        {/* Se não tiver foto, mostra as iniciais ou ícone */}
        <AvatarFallback className="bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
          {profile?.full_name ? (
            getInitials(profile.full_name)
          ) : (
            <RiUserLine className="h-5 w-5" />
          )}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
