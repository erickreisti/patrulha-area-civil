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
import {
  RiSearchLine,
  RiFilterLine,
  RiStackLine,
  RiImageLine,
  RiVideoLine,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";
import { cn } from "@/lib/utils/cn";

// --- CONSTANTES ---

const TIPO_OPTIONS = [
  { value: "all", label: "Todos os Tipos", icon: RiStackLine },
  { value: "fotos", label: "Apenas Fotos", icon: RiImageLine },
  { value: "videos", label: "Apenas Vídeos", icon: RiVideoLine },
] as const;

// --- TIPOS ---

interface SearchAndFilterProps {
  initialSearch?: string;
  initialTipo?: string;
  placeholder?: string;
  debounceDelay?: number;
  className?: string;
  showActiveFilters?: boolean;
}

export function SearchAndFilter({
  initialSearch = "",
  initialTipo = "all",
  placeholder = "Buscar na galeria...",
  debounceDelay = 500,
  className = "",
  showActiveFilters = true,
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialTipo);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Refs para controle de timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Sincronizar URL -> Estado Local (Deep linking / Back button)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlTipo = searchParams.get("tipo") || "all";

    if (urlSearch !== searchTerm) setSearchTerm(urlSearch);
    if (urlTipo !== selectedType) setSelectedType(urlTipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 2. Função Core de Atualização da URL
  const updateQueryParams = useCallback(
    (newSearch: string, newType: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Lógica de Busca
      if (newSearch.trim()) {
        params.set("search", newSearch.trim());
      } else {
        params.delete("search");
      }

      // Lógica de Tipo
      if (newType && newType !== "all") {
        params.set("tipo", newType);
      } else {
        params.delete("tipo");
      }

      // Reseta paginação ao filtrar
      params.delete("page");

      // Atualiza Rota
      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;

      router.push(newUrl, { scroll: false });
      setIsDebouncing(false);
    },
    [router, searchParams],
  );

  // 3. Handler de Busca (com Debounce)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsDebouncing(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      updateQueryParams(value, selectedType);
    }, debounceDelay);
  };

  // 4. Handler de Tipo (Imediato)
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    // Cancela debounce pendente de texto para evitar sobrescrita
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    updateQueryParams(searchTerm, value);
  };

  // 5. Handlers de Limpeza
  const clearSearch = () => handleSearchChange("");
  const clearType = () => handleTypeChange("all");

  const clearAll = () => {
    setSearchTerm("");
    setSelectedType("all");
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    updateQueryParams("", "all");
  };

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const hasActiveFilters = searchTerm || selectedType !== "all";

  return (
    <section
      className={cn(
        // Design Sticky e Blur consistente com outras páginas
        "sticky top-[80px] z-30 py-4 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* BARRA DE BUSCA */}
          <div className="relative flex-1 w-full lg:max-w-md group">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-pac-primary" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-pac-primary focus:ring-2 focus:ring-pac-primary/20 shadow-sm transition-all placeholder:text-slate-400"
            />

            {/* Ícone de Loading ou Botão Limpar */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {isDebouncing ? (
                <RiLoader4Line className="w-4 h-4 animate-spin text-pac-primary" />
              ) : searchTerm ? (
                <button
                  onClick={clearSearch}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all"
                  aria-label="Limpar busca"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>

          {/* FILTROS E AÇÕES */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            {/* SELECT TIPO: Largura Fixa para caber texto */}
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl border-slate-200 bg-white shadow-sm hover:border-pac-primary/50 transition-colors focus:ring-pac-primary/20">
                <div className="flex items-center gap-2 text-slate-600 truncate">
                  <RiFilterLine className="w-4 h-4 shrink-0 text-slate-400" />
                  <SelectValue placeholder="Filtrar por Tipo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TIPO_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4 text-slate-400" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* BOTÃO LIMPAR TUDO */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearAll}
                size="icon"
                className="h-11 w-11 rounded-xl border border-transparent text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all flex-shrink-0"
                title="Limpar todos os filtros"
              >
                <RiCloseLine className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* BADGES DE FILTROS ATIVOS */}
        {showActiveFilters && hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {searchTerm && (
              <Badge
                variant="secondary"
                className="pl-3 pr-1 py-1.5 gap-2 bg-pac-primary/10 text-pac-primary border border-pac-primary/20 hover:bg-pac-primary/20 transition-colors rounded-lg font-medium"
              >
                Busca: &quot;{searchTerm}&quot;
                <button
                  onClick={clearSearch}
                  className="hover:bg-white/50 rounded-md p-0.5 transition-colors text-pac-primary"
                  aria-label="Remover filtro de busca"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </Badge>
            )}

            {selectedType !== "all" && (
              <Badge
                variant="secondary"
                className="pl-3 pr-1 py-1.5 gap-2 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors rounded-lg font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <RiFilterLine className="w-3.5 h-3.5 opacity-50" />
                  {TIPO_OPTIONS.find((t) => t.value === selectedType)?.label}
                </span>
                <button
                  onClick={clearType}
                  className="hover:bg-white/50 rounded-md p-0.5 transition-colors text-slate-500 hover:text-red-500"
                  aria-label="Remover filtro de tipo"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
