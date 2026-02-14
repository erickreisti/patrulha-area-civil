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
  RiArchiveLine,
  RiFolderLine,
  RiToggleLine,
} from "react-icons/ri";

interface FiltrosCategoriasProps {
  filtros: {
    busca: string;
    tipo: string;
    status: string;
    arquivada: string;
  };
  onFiltroChange: (
    key: "busca" | "tipo" | "status" | "arquivada",
    value: string,
  ) => void;
  onAplicarFiltros: () => void;
  onLimparFiltros: () => void;
  categoriasCount: number;
  totalCategorias: number;
}

export function FiltrosCategorias({
  filtros,
  onFiltroChange,
  onAplicarFiltros,
  onLimparFiltros,
  categoriasCount,
  totalCategorias,
}: FiltrosCategoriasProps) {
  const hasActiveFilters =
    filtros.busca !== "" ||
    filtros.tipo !== "all" ||
    filtros.status !== "all" ||
    filtros.arquivada !== "all";

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
                    placeholder="Nome da categoria..."
                    value={filtros.busca}
                    onChange={(e) => onFiltroChange("busca", e.target.value)}
                    className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-lg focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Select de Tipo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <RiFolderLine className="w-3.5 h-3.5" /> Tipo
                </label>
                <Select
                  value={filtros.tipo}
                  onValueChange={(value) => onFiltroChange("tipo", value)}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 focus:bg-white text-slate-600 rounded-lg">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="fotos">Fotos</SelectItem>
                    <SelectItem value="videos">Vídeos</SelectItem>
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
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select de Arquivada */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <RiArchiveLine className="w-3.5 h-3.5" /> Arquivadas
                </label>
                <Select
                  value={filtros.arquivada}
                  onValueChange={(value) => onFiltroChange("arquivada", value)}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-slate-50/50 focus:bg-white text-slate-600 rounded-lg">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="false">Não Arquivadas</SelectItem>
                    <SelectItem value="true">Arquivadas</SelectItem>
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
                  Aplicar
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
                  {categoriasCount} / {totalCategorias}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
