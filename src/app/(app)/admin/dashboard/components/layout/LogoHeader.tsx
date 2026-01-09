"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoHeaderProps {
  compact?: boolean;
  className?: string;
}

export default function LogoHeader({ compact, className }: LogoHeaderProps) {
  const logoUrl = "/images/logos/logo.webp";
  const altText = "Logotipo da Patrulha Aérea Civil";

  if (compact) {
    return (
      <Link
        href="/"
        className={cn(
          "flex items-center space-x-2 hover:opacity-90 transition-opacity",
          className
        )}
        aria-label="Ir para o início"
      >
        <div className="relative h-10 w-10 flex-shrink-0">
          <Image
            src={logoUrl}
            alt={altText}
            fill
            sizes="(max-width: 768px) 40px, 40px"
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-base leading-tight truncate">
            PAC Dashboard
          </span>
          <span className="text-xs text-gray-500 truncate">Administração</span>
        </div>
      </Link>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Link
        href="/"
        className="flex items-center justify-center mb-2 hover:opacity-90 transition-opacity"
        aria-label="Ir para o início"
      >
        <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0">
          <Image
            src={logoUrl}
            alt={altText}
            fill
            sizes="(max-width: 768px) 64px, 80px"
            className="object-contain"
            priority
          />
        </div>
      </Link>
      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          Patrulha Aérea Civil
        </h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">
          Painel Administrativo
        </p>
      </div>
    </div>
  );
}
