"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  RiSearchLine,
  RiFilterLine,
  RiStackLine,
  RiImageLine,
  RiVideoLine,
  RiCloseLine,
} from "react-icons/ri";

// Tipos definidos fora do componente para estabilidade (não precisa de useMemo)
const TIPO_OPTIONS = [
  { value: "all", label: "Todos os Tipos", icon: RiStackLine },
  { value: "fotos", label: "Fotos", icon: RiImageLine },
  { value: "videos", label: "Vídeos", icon: RiVideoLine },
] as const;

interface SearchAndFilterProps {
  initialSearch?: string;
  initialTipo?: string;
  onSearchChange?: (search: string, tipo: string) => void;
  placeholder?: string;
  debounceDelay?: number;
  className?: string;
  showActiveFilters?: boolean;
}

export function SearchAndFilter({
  initialSearch = "",
  initialTipo = "all",
  onSearchChange,
  placeholder = "Buscar categorias...",
  debounceDelay = 400,
  className = "",
  showActiveFilters = true,
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialTipo);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar estado local com a URL apenas se a URL mudar externamente
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlTipo = searchParams.get("tipo") || "all";

    // Só atualiza se for diferente do estado atual (evita loops)
    if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
    if (urlTipo !== selectedType) setSelectedType(urlTipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Função centralizada para atualizar a URL e notificar pai
  const updateUrlAndNotify = useCallback(
    (search: string, tipo: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Lógica de parâmetros
      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");

      if (tipo && tipo !== "all") params.set("tipo", tipo);
      else params.delete("tipo");

      // Resetar paginação sempre que filtrar
      params.delete("page");

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;

      router.push(newUrl, { scroll: false });
      onSearchChange?.(search, tipo);
      setIsDebouncing(false);
    },
    [router, searchParams, onSearchChange],
  );

  // Debounce para busca de texto
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsDebouncing(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      updateUrlAndNotify(value, selectedType);
    }, debounceDelay);
  };

  // Atualização imediata para filtros (Select)
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    // Limpa debounce pendente de texto para evitar conflito
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    updateUrlAndNotify(searchTerm, value);
  };

  // Limpar tudo
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    updateUrlAndNotify("", "all");
  };

  // Limpar apenas busca
  const handleClearSearch = () => {
    handleSearchChange("");
  };

  // Limpar apenas tipo
  const handleClearTypeFilter = () => {
    handleTypeChange("all");
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const hasActiveFilters = searchTerm || selectedType !== "all";

  return (
    <section
      className={`py-6 bg-white/80 backdrop-blur-sm border-b border-gray-100 ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Barra de Busca */}
          <div className="relative flex-1 w-full max-w-2xl">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 py-5 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white shadow-sm"
            />

            {/* Loading Indicator ou Botão Limpar */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isDebouncing ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : searchTerm ? (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpar busca"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[200px] h-[44px] rounded-xl border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <RiFilterLine className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TIPO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4 text-gray-500" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="h-[44px] rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Badges de Filtros Ativos */}
        {showActiveFilters && hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {searchTerm && (
              <Badge
                variant="secondary"
                className="pl-3 pr-1 py-1 gap-2 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
              >
                {/* CORREÇÃO AQUI: Aspas escapadas */}
                Busca: &quot;{searchTerm}&quot;
                <button
                  onClick={handleClearSearch}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <RiCloseLine className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {selectedType !== "all" && (
              <Badge
                variant="secondary"
                className="pl-3 pr-1 py-1 gap-2 bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
              >
                Tipo:{" "}
                {TIPO_OPTIONS.find((t) => t.value === selectedType)?.label}
                <button
                  onClick={handleClearTypeFilter}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <RiCloseLine className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
