"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PacAvatarProps {
  avatarUrl?: string;
  nome?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showFallbackImage?: boolean;
}

// URL da imagem padrão
const DEFAULT_AVATAR = "/images/avatars/default/default-agent.webp";

export function PacAvatar({
  avatarUrl,
  nome,
  className,
  size = "md",
  showFallbackImage = true,
}: PacAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-20 h-20 text-lg",
  };

  const imageSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };

  const getIniciais = (nomeCompleto?: string) => {
    if (!nomeCompleto) return "PAC";

    return nomeCompleto
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 2);
  };

  const iniciais = getIniciais(nome);

  return (
    <Avatar
      className={cn(
        "border-2 border-gray-200 shadow-sm",
        sizeClasses[size],
        className
      )}
    >
      {/* Imagem do usuário ou padrão */}
      <AvatarImage
        src={avatarUrl || DEFAULT_AVATAR}
        alt={nome ? `Avatar de ${nome}` : "Avatar padrão PAC"}
        className="object-cover"
      />

      {/* Fallback - mostra imagem padrão OU iniciais */}
      <AvatarFallback className="bg-gradient-to-br from-navy-600 to-navy-800 text-white font-semibold">
        {showFallbackImage ? (
          // Imagem padrão como fallback
          <Image
            src={DEFAULT_AVATAR}
            alt="Avatar padrão PAC"
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="rounded-full object-cover"
            onError={(e) => {
              // Se a imagem padrão falhar, mostra iniciais
              const target = e.target as HTMLElement;
              target.style.display = "none";
            }}
          />
        ) : (
          // Iniciais como fallback
          <span className="flex items-center justify-center w-full h-full">
            {iniciais}
          </span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}

// Componente simplificado para uso rápido
export function AgentAvatar({
  avatarUrl,
  nome,
  size = "md",
}: {
  avatarUrl?: string;
  nome?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <PacAvatar
      avatarUrl={avatarUrl}
      nome={nome}
      size={size}
      showFallbackImage={true}
    />
  );
}

// Componente para admin
export function AdminAvatar({
  avatarUrl,
  nome,
  size = "md",
}: {
  avatarUrl?: string;
  nome?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <PacAvatar
      avatarUrl={avatarUrl}
      nome={nome}
      size={size}
      showFallbackImage={true}
      className="border-yellow-400"
    />
  );
}
