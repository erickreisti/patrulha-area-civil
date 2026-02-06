"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RiImageLine,
  RiVideoLine,
  RiEyeLine,
  RiEyeOffLine,
  RiFolderLine,
  RiCalendarLine,
  RiCheckLine,
  RiArrowRightLine,
  RiImage2Line,
} from "react-icons/ri";
import { cn } from "@/lib/utils/cn";
import type { Categoria } from "@/app/actions/gallery";

// Tipagem estendida se necessário
export interface ExtendedCategoria extends Categoria {
  capa_url?: string | null;
  itens_count?: number;
  tipo: "fotos" | "videos";
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== "string" || url.trim() === "") return null;
  if (url.startsWith("http")) return url;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = "galerias";
  if (!supabaseUrl) return null;
  if (url.includes(bucket))
    return `${supabaseUrl}/storage/v1/object/public/${url}`;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
};

export function GaleriaCard({ categoria }: { categoria: ExtendedCategoria }) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getImageUrl(categoria.capa_url);
  const shouldShowImage = !!imageUrl && !hasError;

  // Lógica de ícones e cores
  const IconTipo = categoria.tipo === "fotos" ? RiImageLine : RiVideoLine;
  const isActive = categoria.status !== false && !categoria.arquivada;
  const hasItems = (categoria.itens_count || 0) > 0;

  return (
    <motion.div variants={cardVariants} className="h-full">
      <Card className="group border-2 border-slate-200/60 hover:border-pac-primary/50 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col">
        {/* Imagem de Capa */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {shouldShowImage ? (
            <Image
              src={imageUrl}
              alt={categoria.nome}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              loading="lazy"
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
              <RiImage2Line className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-xs uppercase font-bold tracking-widest">
                Sem Capa
              </span>
            </div>
          )}

          {/* Badges Superiores */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={cn(
                "backdrop-blur-sm text-xs border-0",
                isActive ? "bg-green-600 hover:bg-green-700" : "bg-slate-500",
              )}
            >
              {isActive ? (
                <RiEyeLine className="w-3 h-3 mr-1" />
              ) : (
                <RiEyeOffLine className="w-3 h-3 mr-1" />
              )}
              {isActive ? "Ativa" : "Indisponível"}
            </Badge>

            <Badge
              className={cn(
                "backdrop-blur-sm text-xs border-0 text-white",
                categoria.tipo === "videos"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                  : "bg-gradient-to-r from-pac-primary to-blue-600",
              )}
            >
              <IconTipo className="w-3 h-3 mr-1" />
              {categoria.tipo === "videos" ? "Vídeos" : "Fotos"}
            </Badge>
          </div>

          {/* Badge Inferior (Contador) */}
          <Badge className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 border-0 text-xs shadow-sm hover:bg-white">
            <RiFolderLine className="w-3 h-3 mr-1" />
            {categoria.itens_count || 0}{" "}
            {categoria.itens_count === 1 ? "item" : "itens"}
          </Badge>
        </div>

        {/* Corpo do Card */}
        <CardHeader className="pb-3 flex-grow px-5 pt-5">
          <CardTitle className="text-lg font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-pac-primary transition-colors duration-300 uppercase tracking-tight">
            {categoria.nome}
          </CardTitle>
          <CardDescription className="text-slate-500 leading-relaxed line-clamp-2 text-xs mt-2">
            {categoria.descricao || "Sem descrição disponível."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 mt-auto px-5 pb-5">
          {/* Data */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <div className="flex items-center">
              <RiCalendarLine className="w-3.5 h-3.5 mr-1" />
              <span>
                {new Date(categoria.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
            {categoria.ordem && (
              <div className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Ordem: {categoria.ordem}
              </div>
            )}
          </div>

          {/* Botão de Ação */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              "w-full border-slate-200 text-slate-600 hover:bg-pac-primary hover:text-white hover:border-pac-primary transition-all duration-300 group/btn",
              (!hasItems || !isActive) &&
                "opacity-60 cursor-not-allowed bg-slate-50",
            )}
            disabled={!hasItems || !isActive}
          >
            <Link
              href={hasItems && isActive ? `/galeria/${categoria.slug}` : "#"}
              onClick={(e) => {
                if (!hasItems || !isActive) e.preventDefault();
              }}
              className="flex items-center justify-center w-full"
            >
              {!hasItems ? (
                <>
                  <RiCheckLine className="w-4 h-4 mr-1.5" /> Vazia
                </>
              ) : !isActive ? (
                <>
                  <RiEyeOffLine className="w-4 h-4 mr-1.5" /> Privada
                </>
              ) : (
                <>
                  Ver Galeria
                  <RiArrowRightLine className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </>
              )}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
