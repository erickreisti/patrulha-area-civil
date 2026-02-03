"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { RiFilterFill, RiSearchFill, RiCloseLine } from "react-icons/ri";

// Definindo a interface dos filtros baseada no que usamos na page
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <RiFilterFill className="w-5 h-5 text-navy-600" />
            Filtros e Busca - Categorias
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Campo de Busca */}
            <div className="md:col-span-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Buscar
              </label>
              <div className="relative">
                <RiSearchFill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome..."
                  value={filtros.busca}
                  onChange={(e) => onFiltroChange("busca", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Select de Tipo */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tipo
              </label>
              <Select
                value={filtros.tipo}
                onValueChange={(value) => onFiltroChange("tipo", value)}
              >
                <SelectTrigger>
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
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Status
              </label>
              <Select
                value={filtros.status}
                onValueChange={(value) => onFiltroChange("status", value)}
              >
                <SelectTrigger>
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
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Arquivadas
              </label>
              <Select
                value={filtros.arquivada}
                onValueChange={(value) => onFiltroChange("arquivada", value)}
              >
                <SelectTrigger>
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

          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200 items-center">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={onAplicarFiltros}
                className="bg-navy-600 hover:bg-navy-700 text-white flex-1 sm:flex-none"
              >
                <RiFilterFill className="w-4 h-4 mr-2" />
                Aplicar
              </Button>
              <Button
                variant="outline"
                onClick={onLimparFiltros}
                className="flex-1 sm:flex-none"
              >
                <RiCloseLine className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>

            <div className="text-sm text-gray-500 ml-auto">
              Exibindo{" "}
              <span className="font-bold text-gray-900">{categoriasCount}</span>{" "}
              de{" "}
              <span className="font-bold text-gray-900">{totalCategorias}</span>{" "}
              categorias
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
