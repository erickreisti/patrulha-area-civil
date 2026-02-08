"use client";

import { useEffect } from "react";
import { useGaleriaDetalhe } from "@/lib/stores/useGaleriaStore";
import { toast } from "sonner";
import { RiImageLine } from "react-icons/ri";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GaleriaItemCard } from "./GaleriaItemCard";

export function GaleriaDetalheContent({ slug }: { slug: string }) {
  const {
    categoria,
    itens,
    loading,
    errorItens,
    fetchItens,
    clearErrorItens,
    resetFiltrosItens,
  } = useGaleriaDetalhe();

  useEffect(() => {
    if (slug) {
      fetchItens(slug);
    }
    return () => {
      resetFiltrosItens();
    };
  }, [slug, fetchItens, resetFiltrosItens]);

  useEffect(() => {
    if (errorItens) {
      toast.error(errorItens);
      clearErrorItens();
    }
  }, [errorItens, clearErrorItens]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <RiImageLine className="w-12 h-12 mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold">Galeria Vazia</h3>
        <p className="text-sm">
          Não há itens disponíveis nesta categoria no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-l-4 border-pac-primary pl-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">
          {categoria?.titulo || "Galeria"}
        </h1>
        {categoria?.descricao && (
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
            {categoria.descricao}
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            {itens.length} {itens.length === 1 ? "item" : "itens"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {itens.map((item) => (
          <div key={item.id} className="h-full">
            <GaleriaItemCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
