// app/galeria/components/SearchAndFilter.tsx - COM CORES DA PAC
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RiSearchLine,
  RiFilterLine,
  RiStackLine,
  RiImageLine,
  RiVideoLine,
} from "react-icons/ri";

interface SearchAndFilterProps {
  initialSearch?: string;
  initialTipo?: string;
}

export function SearchAndFilter({
  initialSearch = "",
  initialTipo = "Todas",
}: SearchAndFilterProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialTipo);

  const tipos = [
    { value: "Todas", label: "Todas as Categorias", icon: RiStackLine },
    { value: "Fotos", label: "Fotos", icon: RiImageLine },
    { value: "Vídeos", label: "Vídeos", icon: RiVideoLine },
  ];

  useEffect(() => {
    const updateURL = (search: string, tipo: string) => {
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (tipo !== "Todas") params.set("tipo", tipo);

      const queryString = params.toString();
      const newUrl = queryString ? `/galeria?${queryString}` : "/galeria";

      router.push(newUrl, { scroll: false });
    };

    const timer = setTimeout(() => {
      updateURL(searchTerm, selectedType);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, router]);

  return (
    <section className="py-6 sm:py-8 bg-white/90 backdrop-blur-sm border-b border-navy-100">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="relative">
              <RiSearchLine className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 border-2 border-navy-100 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl transition-all duration-300 bg-white/80 text-sm sm:text-base shadow-navy-sm"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48 lg:w-64 border-2 border-navy-100 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 rounded-xl py-2.5 sm:py-3 bg-white/80 text-sm sm:text-base shadow-navy-sm">
                <RiFilterLine className="w-4 h-4 mr-2 text-navy-600" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent className="border-navy-100 shadow-navy">
                {tipos.map((tipo) => {
                  const Icon = tipo.icon;
                  return (
                    <SelectItem
                      key={tipo.value}
                      value={tipo.value}
                      className="text-slate-700 hover:bg-navy-50 focus:bg-navy-50"
                    >
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2 text-navy-600" />
                        {tipo.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(searchTerm || selectedType !== "Todas") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("Todas");
                }}
                className="border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-300 text-sm sm:text-base"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
