import { GaleriaItem, GaleriaCategoria } from "@/types";
import {
  RiImageFill,
  RiVideoFill,
  RiEyeFill,
  RiEyeOffFill,
  RiArchiveFill,
  RiStarFill,
} from "react-icons/ri";
import { Badge } from "@/components/ui/badge";
import React from "react";

export function getTipoBadge(tipo: string): React.ReactNode {
  return tipo === "foto" ? (
    <Badge className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
      <RiImageFill className="w-3 h-3 mr-1" />
      Foto
    </Badge>
  ) : (
    <Badge className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
      <RiVideoFill className="w-3 h-3 mr-1" />
      Vídeo
    </Badge>
  );
}

export function getStatusBadge(
  status: boolean,
  arquivada?: boolean
): React.ReactNode {
  if (arquivada) {
    return (
      <Badge className="bg-gray-600 hover:bg-gray-700 text-white transition-colors duration-300">
        <RiArchiveFill className="w-3 h-3 mr-1" />
        Arquivada
      </Badge>
    );
  }

  return status ? (
    <Badge className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
      <RiEyeFill className="w-3 h-3 mr-1" />
      Ativo
    </Badge>
  ) : (
    <Badge className="bg-amber-600 hover:bg-amber-700 text-white transition-colors duration-300">
      <RiEyeOffFill className="w-3 h-3 mr-1" />
      Inativo
    </Badge>
  );
}

export function getDestaqueBadge(destaque: boolean): React.ReactNode | null {
  return destaque ? (
    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-300">
      <RiStarFill className="w-3 h-3 mr-1" />
      Destaque
    </Badge>
  ) : null;
}

export function getCategoriaTipoBadge(tipo: string): React.ReactNode {
  return tipo === "fotos" ? (
    <Badge className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
      <RiImageFill className="w-3 h-3 mr-1" />
      Fotos
    </Badge>
  ) : (
    <Badge className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
      <RiVideoFill className="w-3 h-3 mr-1" />
      Vídeos
    </Badge>
  );
}

export function calcularEstatisticas(
  itens: GaleriaItem[],
  categorias: GaleriaCategoria[],
  totalItens: number
) {
  const categoriasAtivas = categorias.filter((c) => c.status && !c.arquivada);
  const categoriasArquivadas = categorias.filter((c) => c.arquivada);
  const categoriasInativas = categorias.filter(
    (c) => !c.status && !c.arquivada
  );

  return {
    totalItens: totalItens,
    fotos: itens.filter((i) => i.tipo === "foto").length,
    videos: itens.filter((i) => i.tipo === "video").length,
    ativos: itens.filter((i) => i.status).length,
    totalCategorias: categorias.length,
    categoriasAtivas: categoriasAtivas.length,
    categoriasArquivadas: categoriasArquivadas.length,
    categoriasInativas: categoriasInativas.length,
  };
}
