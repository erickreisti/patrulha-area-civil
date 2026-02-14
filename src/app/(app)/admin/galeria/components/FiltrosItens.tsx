"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  RiFilterLine,
  RiSearchLine,
  RiCloseLine,
  RiFolderLine,
  RiImageLine,
  RiVideoLine,
  RiToggleLine,
} from "react-icons/ri";
import type { Categoria } from "@/app/actions/gallery/types"; // Ajuste o import conforme sua estrutura

interface FiltrosItensProps {
  filtros: {
    busca: string;
    categoria: string;
    tipo: string;
    status: string;
  };
  onFiltroChange: (
    key: "busca" | "categoria" | "tipo" | "status",
    value: string,
  ) => void;
  onAplicarFiltros: () => void;
  onLimparFiltros: () => void;
  categorias: Categoria[];
  itensCount: number;
  totalItens: number;
}

export function FiltrosItens({
  filtros,
  onFiltroChange,
  onAplicarFiltros,
  onLimparFiltros,
  categorias,
  itensCount,
  totalItens,
}: FiltrosItensProps) {
  const hasActiveFilters =
    filtros.busca !== "" ||
    filtros.categoria !== "all" ||
    filtros.tipo !== "all" ||
    filtros.status !== "all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-none shadow-sm bg-white mb-6">
        <CardContent className="p-5">
          <div className="flex flex-col gap-5">
            {/* Linha de Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Campo de Busca */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <RiSearchLine className="w-3.5 h-3.5" /> Buscar
                </label>
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Título do item..."
                    value={filtros.busca}
                    onChange={(e) => onFiltroChange("busca", e.target.value)}
                    className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-lg focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Select de Categoria */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <RiFolderLine className="w-3.5 h-3.5" /> Categoria
                </label>
                <Select
                  value={filtros.categoria}
                  onValueChange={(value) => onFiltroChange("categoria", value)}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 focus:bg-white text-slate-600 rounded-lg">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select de Tipo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <RiImageLine className="w-3.5 h-3.5" /> Tipo
                </label>
                <Select
                  value={filtros.tipo}
                  onValueChange={(value) => onFiltroChange("tipo", value)}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 focus:bg-white text-slate-600 rounded-lg">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="foto">
                      <div className="flex items-center gap-2">
                        <RiImageLine className="text-blue-500" /> Fotos
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <RiVideoLine className="text-purple-500" /> Vídeos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select de Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <RiToggleLine className="w-3.5 h-3.5" /> Status
                </label>
                <Select
                  value={filtros.status}
                  onValueChange={(value) => onFiltroChange("status", value)}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 focus:bg-white text-slate-600 rounded-lg">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer Status</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha de Ações e Contador */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2 border-t border-slate-100 mt-2">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={onAplicarFiltros}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 flex-1 sm:flex-none font-bold h-10 rounded-lg"
                >
                  <RiFilterLine className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={onLimparFiltros}
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50 flex-1 sm:flex-none h-10 rounded-lg"
                  >
                    <RiCloseLine className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Resultados:
                </span>
                <Badge
                  variant="secondary"
                  className="bg-white border-slate-200 text-slate-700 shadow-sm"
                >
                  {itensCount} / {totalItens}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
