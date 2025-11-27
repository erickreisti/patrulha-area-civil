"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";

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

  const tipos = ["Todas", "Fotos", "Vídeos"];

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
  }, [searchTerm, selectedType, router]); // ✅ Adicionado router como dependência

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleTypeChange = (tipo: string) => {
    setSelectedType(tipo);
  };

  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 py-2 rounded-lg transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tipos.map((tipo) => (
              <Button
                key={tipo}
                variant={selectedType === tipo ? "default" : "outline"}
                onClick={() => handleTypeChange(tipo)}
                className={`${
                  selectedType === tipo
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } transition-all duration-300`}
              >
                {tipo}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
