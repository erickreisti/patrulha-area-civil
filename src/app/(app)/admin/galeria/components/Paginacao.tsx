"use client";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { RiArrowLeftLine, RiArrowRightLine, RiMoreFill } from "react-icons/ri";

interface PaginacaoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Paginacao({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginacaoProps) {
  // Lógica de páginas a exibir
  const getVisiblePages = () => {
    const delta = 2; // Quantas páginas mostrar ao redor da atual
    const range = [];
    const rangeWithDots: (number | string)[] = [];
    let l;

    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    range.push(totalPages);

    // Adicionar reticências
    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-8 pt-6 border-t border-gray-200"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-bold">{startItem}</span> -{" "}
          <span className="font-bold">{endItem}</span> de{" "}
          <span className="font-bold">{totalItems}</span> resultados
        </div>

        <div className="flex items-center gap-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="gap-2 pl-2.5"
                >
                  <RiArrowLeftLine className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
              </PaginationItem>

              {getVisiblePages().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "..." ? (
                    <span className="flex h-9 w-9 items-center justify-center">
                      <RiMoreFill className="w-4 h-4 text-gray-400" />
                    </span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`w-9 h-9 p-0 ${
                        currentPage === page
                          ? "bg-navy-600 hover:bg-navy-700 text-white"
                          : ""
                      }`}
                      onClick={() => onPageChange(page as number)}
                    >
                      {page}
                    </Button>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="gap-2 pr-2.5"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <RiArrowRightLine className="w-4 h-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <span>Ir para:</span>
            <Select
              value={currentPage.toString()}
              onValueChange={(val) => onPageChange(Number(val))}
            >
              <SelectTrigger className="w-[70px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <SelectItem key={p} value={p.toString()}>
                      {p}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
