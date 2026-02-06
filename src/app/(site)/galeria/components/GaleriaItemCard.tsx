"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  RiStarFill,
  RiPlayFill,
  RiVideoLine,
  RiImageLine,
  RiCameraOffLine,
  RiCalendarLine,
  RiEyeLine,
  RiDownloadLine,
} from "react-icons/ri";
import type { Item } from "@/app/actions/gallery/types";

// --- CONSTANTES ---
const FALLBACK_IMAGE_FOTO = "/images/defaults/photo.jpg";
const FALLBACK_IMAGE_VIDEO = "/images/defaults/video.jpg";

// --- HELPERS ---
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "--/--/----";
  }
};

export function GaleriaItemCard({ item }: { item: Item }) {
  const [imageError, setImageError] = useState(false);

  const isVideo = item.tipo === "video";
  const IconType = isVideo ? RiVideoLine : RiImageLine;

  // Define a imagem final
  const imageUrl =
    item.thumbnail_url ||
    item.arquivo_url ||
    (isVideo ? FALLBACK_IMAGE_VIDEO : FALLBACK_IMAGE_FOTO);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card className="group border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden rounded-2xl hover:-translate-y-1 ring-1 ring-slate-200 hover:ring-pac-primary/30">
        {/* --- ÁREA DA MÍDIA --- */}
        <div className="relative h-52 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <>
              <Image
                src={imageUrl}
                alt={item.titulo}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onError={() => setImageError(true)}
                loading="lazy"
              />

              {/* Overlay Gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge de Destaque */}
              {item.destaque && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg px-2 py-1 uppercase tracking-wider text-[10px] font-bold">
                    <RiStarFill className="w-3 h-3 mr-1" /> Destaque
                  </Badge>
                </div>
              )}

              {/* Botão de Play (Se Vídeo) */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <RiPlayFill className="h-6 w-6 text-white ml-1" />
                  </div>
                </div>
              )}
            </>
          ) : (
            // Fallback de Erro
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
              <RiCameraOffLine className="h-10 w-10 opacity-50" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Mídia Indisponível
              </span>
            </div>
          )}

          {/* Badge de Tipo (Canto Inferior Esquerdo) */}
          <div className="absolute bottom-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm text-slate-800 shadow-sm text-[10px] uppercase font-bold tracking-wider hover:bg-white"
            >
              <IconType className="w-3 h-3 mr-1 text-pac-primary" />
              {isVideo ? "Vídeo" : "Foto"}
            </Badge>
          </div>
        </div>

        {/* --- CONTEÚDO --- */}
        <CardContent className="p-5 flex-grow flex flex-col">
          <div className="flex-grow">
            {/* Título */}
            <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight line-clamp-1 group-hover:text-pac-primary transition-colors">
              {item.titulo}
            </h3>

            {/* Descrição */}
            {item.descricao && (
              <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                {item.descricao}
              </p>
            )}
          </div>

          {/* Metadados e Ações */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            {/* Data */}
            <div className="flex items-center text-xs font-medium text-slate-400">
              <RiCalendarLine className="h-3.5 w-3.5 mr-1.5 text-pac-primary" />
              {formatDate(item.created_at)}
            </div>

            {/* Botões */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-slate-600 hover:text-pac-primary hover:border-pac-primary/30 hover:bg-pac-primary/5 transition-colors text-xs font-semibold"
                asChild
              >
                <a
                  href={item.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <RiEyeLine className="mr-2 w-3.5 h-3.5" />
                  Visualizar
                </a>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors text-xs font-semibold"
                asChild
              >
                <a
                  href={item.arquivo_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <RiDownloadLine className="mr-2 w-3.5 h-3.5" />
                  Baixar
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
