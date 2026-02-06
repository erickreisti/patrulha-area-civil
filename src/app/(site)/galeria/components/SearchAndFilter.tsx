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
  RiLoader4Line, // Usando React Icons para consistência
} from "react-icons/ri";
import { cn } from "@/lib/utils/cn";

// --- CONSTANTES ---

const TIPO_OPTIONS = [
  { value: "all", label: "Todos os Tipos", icon: RiStackLine },
  { value: "fotos", label: "Fotos", icon: RiImageLine },
  { value: "videos", label: "Vídeos", icon: RiVideoLine },
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
  placeholder = "Buscar categorias...",
  debounceDelay = 500, // Aumentei levemente para evitar muitas chamadas
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

      // Search Logic
      if (newSearch.trim()) {
        params.set("search", newSearch.trim());
      } else {
        params.delete("search");
      }

      // Type Logic
      if (newType && newType !== "all") {
        params.set("tipo", newType);
      } else {
        params.delete("tipo");
      }

      // Reset Page
      params.delete("page");

      // Push to Router
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
        "py-6 bg-white/80 backdrop-blur-sm border-b border-slate-100",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* BARRA DE BUSCA */}
          <div className="relative flex-1 w-full max-w-2xl group">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-pac-primary" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 py-5 rounded-xl border-slate-200 focus:border-pac-primary focus:ring-2 focus:ring-pac-primary/20 bg-white shadow-sm transition-all"
            />

            {/* Ícone de Loading ou Botão Limpar */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {isDebouncing ? (
                <RiLoader4Line className="w-4 h-4 animate-spin text-pac-primary" />
              ) : searchTerm ? (
                <button
                  onClick={clearSearch}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label="Limpar busca"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* FILTROS E AÇÕES */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[200px] h-[44px] rounded-xl border-slate-200 bg-white shadow-sm focus:ring-pac-primary/20">
                <div className="flex items-center gap-2 text-slate-700">
                  <RiFilterLine className="w-4 h-4" />
                  <SelectValue />
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
                      <option.icon className="w-4 h-4 text-slate-500" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAll}
                className="h-[44px] rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-500 hover:border-red-200 transition-all"
              >
                Limpar Filtros
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
                className="pl-3 pr-1 py-1 gap-2 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                Busca: &quot;{searchTerm}&quot;
                <button
                  onClick={clearSearch}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label="Remover filtro de busca"
                >
                  <RiCloseLine className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {selectedType !== "all" && (
              <Badge
                variant="secondary"
                className="pl-3 pr-1 py-1 gap-2 bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors"
              >
                Tipo:{" "}
                {TIPO_OPTIONS.find((t) => t.value === selectedType)?.label}
                <button
                  onClick={clearType}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  aria-label="Remover filtro de tipo"
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
