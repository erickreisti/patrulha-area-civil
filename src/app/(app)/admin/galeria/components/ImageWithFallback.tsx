"use client";

import { useState } from "react";
import Image from "next/image";
import { RiImageLine, RiVideoLine } from "react-icons/ri";
import { cn } from "@/lib/utils/cn";

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  tipo: "foto" | "video";
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function ImageWithFallback({
  src,
  alt,
  tipo,
  className,
  fill = false,
  width = 48,
  height = 48,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  // Classes base para o container
  const containerClasses = cn(
    "relative overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200",
    !fill && `w-[${width}px] h-[${height}px]`,
    className,
  );

  // Renderizar ícone de vídeo se for vídeo e não tiver thumbnail (ou se der erro)
  if (tipo === "video" && (!src || error)) {
    return (
      <div className={cn(containerClasses, "bg-purple-50 border-purple-100")}>
        <RiVideoLine className="w-1/2 h-1/2 text-purple-400" />
      </div>
    );
  }

  // Renderizar ícone de erro/fallback para imagem
  if (!src || error) {
    return (
      <div className={containerClasses}>
        <RiImageLine className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      style={!fill ? { width, height } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        className="object-cover w-full h-full"
        onError={() => setError(true)}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={fill ? "(max-width: 768px) 100vw, 33vw" : undefined}
        priority={false}
      />
      {/* Overlay ícone de vídeo se for vídeo mas tiver imagem (thumbnail) */}
      {tipo === "video" && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-white/80 p-1 rounded-full backdrop-blur-sm">
            <RiVideoLine className="w-4 h-4 text-purple-600" />
          </div>
        </div>
      )}
    </div>
  );
}
