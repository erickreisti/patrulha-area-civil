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
      transition={{ duration: 0.4, delay: 0.1 }}
      className="p-4 border-t border-slate-100 bg-slate-50/50"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="text-xs font-medium text-slate-500">
          Mostrando{" "}
          <span className="font-bold text-slate-800">{startItem}</span> -{" "}
          <span className="font-bold text-slate-800">{endItem}</span> de{" "}
          <span className="font-bold text-slate-800">{totalItems}</span>{" "}
          resultados
        </div>

        <div className="flex items-center gap-4">
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="gap-1 pl-2.5 bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 h-8 text-xs font-medium shadow-sm"
                >
                  <RiArrowLeftLine className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
              </PaginationItem>

              {getVisiblePages().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "..." ? (
                    <span className="flex h-8 w-8 items-center justify-center">
                      <RiMoreFill className="w-4 h-4 text-slate-400" />
                    </span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`w-8 h-8 p-0 text-xs font-bold transition-all ${
                        currentPage === page
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                  className="gap-1 pr-2.5 bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 h-8 text-xs font-medium shadow-sm"
                >
                  <span className="hidden sm:inline">Próximo</span>
                  <RiArrowRightLine className="w-3.5 h-3.5" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Ir para:</span>
            <Select
              value={currentPage.toString()}
              onValueChange={(val) => onPageChange(Number(val))}
            >
              <SelectTrigger className="w-[60px] h-8 text-xs border-slate-200 bg-white focus:ring-emerald-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <SelectItem
                      key={p}
                      value={p.toString()}
                      className="text-xs"
                    >
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
