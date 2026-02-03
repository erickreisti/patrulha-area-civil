// src/app/(site)/galeria/components/GaleriaItemCard.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  RiStarFill,
  RiPlayLine,
  RiVideoLine,
  RiCameraOffLine,
  RiCalendarLine,
  RiEyeLine,
  RiDownloadLine,
} from "react-icons/ri";
import type { Item } from "@/app/actions/gallery/types";

const FALLBACK_IMAGE_FOTO = "/images/defaults/photo.jpg";
const FALLBACK_IMAGE_VIDEO = "/images/defaults/video.jpg";

export function GaleriaItemCard({ item }: { item: Item }) {
  const [imageError, setImageError] = useState(false);
  const isVideo = item.tipo === "video";
  const imageUrl =
    item.thumbnail_url ||
    item.arquivo_url ||
    (isVideo ? FALLBACK_IMAGE_VIDEO : FALLBACK_IMAGE_FOTO);

  return (
    <Card className="group border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative h-48 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <>
            <Image
              src={imageUrl}
              alt={item.titulo}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            {item.destaque && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-amber-500 text-white border-0 hover:bg-amber-600">
                  <RiStarFill className="w-3 h-3 mr-1" /> Destaque
                </Badge>
              </div>
            )}
            {isVideo && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <RiPlayLine className="h-6 w-6 text-navy-600" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            {isVideo ? (
              <RiVideoLine className="h-8 w-8" />
            ) : (
              <RiCameraOffLine className="h-8 w-8" />
            )}
            <span className="text-xs mt-2">Mídia indisponível</span>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {item.titulo}
        </h3>

        {item.descricao && (
          <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-2">
            {item.descricao}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 mt-auto">
          <div className="flex items-center">
            <RiCalendarLine className="h-3 w-3 mr-1" />
            <span>{new Date(item.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
          <Badge variant="outline" className="text-xs font-normal">
            {isVideo ? "Vídeo" : "Foto"}
          </Badge>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            asChild
          >
            <a
              href={item.arquivo_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {isVideo ? (
                <RiPlayLine className="mr-2" />
              ) : (
                <RiEyeLine className="mr-2" />
              )}
              Visualizar
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-green-600 hover:bg-green-50"
            asChild
          >
            <a
              href={item.arquivo_url}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiDownloadLine />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
