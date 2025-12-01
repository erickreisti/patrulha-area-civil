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
import { RiFilterFill, RiSearchFill } from "react-icons/ri";
import { GaleriaCategoria } from "@/types";

interface FiltrosItensProps {
  filtros: {
    busca: string;
    categoria: string;
    tipo: string;
    status: string;
  };
  onFiltroChange: (
    key: "busca" | "categoria" | "tipo" | "status",
    value: string
  ) => void;
  onAplicarFiltros: () => void;
  onLimparFiltros: () => void;
  categorias: GaleriaCategoria[];
  itensCount: number;
  totalItens: number;
  currentPage: number;
  totalPages: number;
}

export function FiltrosItens({
  filtros,
  onFiltroChange,
  onAplicarFiltros,
  onLimparFiltros,
  categorias,
  itensCount,
  totalItens,
  currentPage,
  totalPages,
}: FiltrosItensProps) {
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
            Filtros e Busca - Itens
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Campo de Busca */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Buscar:
                </span>
              </div>
              <div className="relative">
                <RiSearchFill className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors duration-300" />
                <Input
                  placeholder="por título..."
                  value={filtros.busca}
                  onChange={(e) => onFiltroChange("busca", e.target.value)}
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Select de Categoria */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Categoria:
                </span>
              </div>
              <Select
                value={filtros.categoria}
                onValueChange={(value) => onFiltroChange("categoria", value)}
              >
                <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {categorias
                    .filter((c) => c.status && !c.arquivada)
                    .map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select de Tipo */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Mídia:
                </span>
              </div>
              <Select
                value={filtros.tipo}
                onValueChange={(value) => onFiltroChange("tipo", value)}
              >
                <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos tipos</SelectItem>
                  <SelectItem value="foto">Fotos</SelectItem>
                  <SelectItem value="video">Vídeos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Select de Status */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
              </div>
              <Select
                value={filtros.status}
                onValueChange={(value) => onFiltroChange("status", value)}
              >
                <SelectTrigger className="transition-all duration-300 hover:border-blue-500">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onAplicarFiltros}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
              >
                <RiFilterFill className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={onLimparFiltros}
                className="border-gray-700 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
              >
                Limpar Filtros
              </Button>
            </motion.div>
            <div className="flex-1 text-right">
              <span className="text-sm text-gray-600 transition-colors duration-300">
                Mostrando {itensCount} de {totalItens} itens • Página{" "}
                {currentPage} de {totalPages}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
