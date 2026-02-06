"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// UI Components
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Icons
import {
  RiStarFill,
  RiPlayFill,
  RiVideoLine,
  RiImageLine,
  RiCalendarLine,
  RiEyeLine,
  RiDownloadLine,
  RiImage2Line,
} from "react-icons/ri";

// Types & Utils
import type { Item } from "@/app/actions/gallery/types";
import { cn } from "@/lib/utils/cn";

// --- HELPERS ---
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "--/--/----";
  }
};

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/galeria/${url}`;
};

// --- COMPONENTE ---
export function GaleriaItemCard({ item }: { item: Item }) {
  const [imageError, setImageError] = useState(false);

  const isVideo = item.tipo === "video";
  const IconType = isVideo ? RiVideoLine : RiImageLine;

  // Tenta usar thumbnail, se não, arquivo direto (se for imagem)
  const rawUrl = item.thumbnail_url || (!isVideo ? item.arquivo_url : null);
  const imageUrl = getImageUrl(rawUrl);
  const downloadUrl = getImageUrl(item.arquivo_url);

  const hasImage = !!imageUrl && !imageError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden rounded-2xl">
        {/* --- ÁREA DA MÍDIA --- */}
        <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
          {hasImage ? (
            <>
              <Image
                src={imageUrl}
                alt={item.titulo}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImageError(true)}
                loading="lazy"
              />

              {/* Overlay Gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge Destaque */}
              {item.destaque && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-amber-500 text-white border-0 shadow-md px-2 py-1 uppercase tracking-wider text-[10px] font-bold gap-1">
                    <RiStarFill className="w-3 h-3" /> Destaque
                  </Badge>
                </div>
              )}

              {/* Botão de Play (Overlay) */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <RiPlayFill className="h-6 w-6 text-white ml-0.5" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
              <RiImage2Line className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Pré-visualização Indisponível
              </span>
            </div>
          )}

          {/* Badge de Tipo */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              className={cn(
                "backdrop-blur-md border-0 text-white shadow-sm px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold gap-1.5",
                isVideo ? "bg-purple-600/90" : "bg-pac-primary/90",
              )}
            >
              <IconType className="w-3.5 h-3.5" />
              {isVideo ? "Vídeo" : "Foto"}
            </Badge>
          </div>
        </div>

        {/* --- CONTEÚDO --- */}
        <CardContent className="p-5 flex-grow flex flex-col">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <RiCalendarLine className="w-3.5 h-3.5 text-pac-primary" />
            {formatDate(item.created_at)}
          </div>

          <h3 className="font-black text-lg text-slate-800 mb-2 leading-tight line-clamp-2 group-hover:text-pac-primary transition-colors uppercase tracking-tight">
            {item.titulo}
          </h3>

          {item.descricao && (
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
              {item.descricao}
            </p>
          )}
        </CardContent>

        {/* --- RODAPÉ COM AÇÕES --- */}
        <CardFooter className="p-5 pt-0 mt-auto grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-200 text-slate-600 font-bold hover:bg-pac-primary hover:text-white hover:border-pac-primary transition-all duration-300 rounded-xl"
            asChild
            disabled={!downloadUrl}
          >
            <a
              href={downloadUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiEyeLine className="mr-2 w-4 h-4" />
              Ver
            </a>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="w-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all duration-300 rounded-xl"
            asChild
            disabled={!downloadUrl}
          >
            <a
              href={downloadUrl || "#"}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiDownloadLine className="mr-2 w-4 h-4" />
              Baixar
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
