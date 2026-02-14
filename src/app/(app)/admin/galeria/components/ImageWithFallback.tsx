"use client";

import { useState } from "react";
import Image from "next/image";
import { RiImageLine, RiVideoLine, RiFileWarningLine } from "react-icons/ri";
import { cn } from "@/lib/utils/cn";

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  tipo: "foto" | "video";
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  tipo,
  className,
  fill = false,
  width = 48,
  height = 48,
  priority = false,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  // Estado para rastrear a última URL recebida e forçar o reset se mudar
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  // Classes base unificadas com o Design System
  const containerClasses = cn(
    "relative overflow-hidden flex items-center justify-center border transition-all",
    // Se não for fill, evita que o container encolha em flexbox
    !fill && "shrink-0",
    // Estilos padrão (Slate Theme)
    "bg-slate-50 border-slate-200",
    className,
  );

  // Styles inline para width/height quando não é fill
  const styles = !fill ? { width, height } : undefined;

  // 1. Fallback para VÍDEO (Sem thumbnail ou com Erro)
  if (tipo === "video" && (!src || error)) {
    return (
      <div
        className={cn(
          containerClasses,
          "bg-purple-50 border-purple-100 text-purple-300",
        )}
        style={styles}
        title="Vídeo sem capa"
      >
        <RiVideoLine className="w-1/2 h-1/2" />
      </div>
    );
  }

  // 2. Fallback para IMAGEM (Sem source ou com Erro)
  if (!src || error) {
    return (
      <div
        className={cn(containerClasses, "text-slate-300")}
        style={styles}
        title="Imagem não disponível"
      >
        {error ? (
          <RiFileWarningLine className="w-1/2 h-1/2" />
        ) : (
          <RiImageLine className="w-1/2 h-1/2" />
        )}
      </div>
    );
  }

  // 3. Renderização com Sucesso
  return (
    <div className={containerClasses} style={styles}>
      <Image
        src={src}
        alt={alt}
        className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
        onError={() => setError(true)}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={fill ? "(max-width: 768px) 100vw, 33vw" : undefined}
        priority={priority}
      />

      {/* Overlay para Vídeo (apenas se a imagem carregou corretamente) */}
      {tipo === "video" && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none">
          <div className="bg-white/90 p-1.5 rounded-full backdrop-blur-md shadow-sm text-purple-600">
            <RiVideoLine className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
