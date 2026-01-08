"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  RiSearchLine,
  RiCloseLine,
  RiUserLine,
  RiArticleLine,
  RiImageLine,
  RiLoaderLine,
  RiExternalLinkLine,
  RiFolderLine,
  RiCalendarLine,
  RiAwardLine,
  RiBuildingLine,
} from "react-icons/ri";

interface SearchResult {
  id: string;
  type: "agent" | "news" | "gallery_item" | "gallery_category";
  title: string;
  description?: string;
  href: string;
  metadata?: {
    role?: string;
    published_at?: string;
    items_count?: number;
    tipo?: string;
    graduacao?: string;
    status?: string;
  };
}

interface SearchComponentProps {
  className?: string;
}

export function SearchComponent({ className }: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || query.trim().length < 2) return;

      setIsSearching(true);
      setSearchError(null);
      setIsSearchOpen(true);

      try {
        const results: SearchResult[] = [];

        // Buscar agentes
        const { data: agents, error: agentsError } = await supabase
          .from("profiles")
          .select("id, full_name, role, graduacao, matricula")
          .or(
            `full_name.ilike.%${query}%,role.ilike.%${query}%,matricula.ilike.%${query}%,graduacao.ilike.%${query}%`
          )
          .eq("status", true)
          .limit(5);

        if (!agentsError && agents) {
          agents.forEach((agent) => {
            results.push({
              id: agent.id,
              type: "agent",
              title: agent.full_name || "Agente sem nome",
              description: `${agent.graduacao || "Sem graduação"} • ${
                agent.role === "admin" ? "Administrador" : "Agente"
              } • ${agent.matricula}`,
              href: `/admin/agentes/${agent.id}`,
              metadata: {
                role: agent.role,
                graduacao: agent.graduacao || undefined,
              },
            });
          });
        }

        // Buscar notícias
        const { data: news, error: newsError } = await supabase
          .from("noticias")
          .select("id, titulo, resumo, data_publicacao, status")
          .or(
            `titulo.ilike.%${query}%,resumo.ilike.%${query}%,categoria.ilike.%${query}%`
          )
          .in("status", ["publicado", "rascunho"])
          .limit(5);

        if (!newsError && news) {
          news.forEach((newsItem) => {
            results.push({
              id: newsItem.id,
              type: "news",
              title: newsItem.titulo,
              description: newsItem.resumo || "Sem resumo",
              href: `/admin/noticias/${newsItem.id}`,
              metadata: {
                published_at: newsItem.data_publicacao,
                status: newsItem.status,
              },
            });
          });
        }

        // Buscar itens da galeria
        const { data: galleryItems, error: galleryItemsError } = await supabase
          .from("galeria_itens")
          .select("id, titulo, descricao, tipo, destaque")
          .or(`titulo.ilike.%${query}%,descricao.ilike.%${query}%`)
          .eq("status", true)
          .limit(5);

        if (!galleryItemsError && galleryItems) {
          galleryItems.forEach((item) => {
            results.push({
              id: item.id,
              type: "gallery_item",
              title: item.titulo,
              description:
                item.descricao ||
                `${item.tipo === "foto" ? "Foto" : "Vídeo"} ${
                  item.destaque ? "• Destaque" : ""
                }`,
              href: `/admin/galeria/itens/${item.id}`,
              metadata: { tipo: item.tipo },
            });
          });
        }

        // Buscar categorias da galeria
        const { data: galleryCategories, error: galleryCategoriesError } =
          await supabase
            .from("galeria_categorias")
            .select("id, nome, descricao, tipo")
            .or(`nome.ilike.%${query}%,descricao.ilike.%${query}%`)
            .eq("status", true)
            .eq("arquivada", false)
            .limit(5);

        if (!galleryCategoriesError && galleryCategories) {
          galleryCategories.forEach((category) => {
            results.push({
              id: category.id,
              type: "gallery_category",
              title: category.nome,
              description:
                category.descricao ||
                `${
                  category.tipo === "fotos"
                    ? "Categoria de Fotos"
                    : "Categoria de Vídeos"
                }`,
              href: `/admin/galeria/categorias/${category.id}`,
              metadata: { tipo: category.tipo },
            });
          });
        }

        setSearchResults(results);
      } catch (err) {
        console.error("Erro na busca:", err);
        setSearchError("Erro ao realizar a busca. Tente novamente.");
      } finally {
        setIsSearching(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  const getResultIcon = (type: SearchResult["type"]) => {
    const iconClass = "w-4 h-4 flex-shrink-0";
    switch (type) {
      case "agent":
        return <RiUserLine className={`${iconClass} text-blue-600`} />;
      case "news":
        return <RiArticleLine className={`${iconClass} text-green-600`} />;
      case "gallery_item":
        return <RiImageLine className={`${iconClass} text-purple-600`} />;
      case "gallery_category":
        return <RiFolderLine className={`${iconClass} text-orange-600`} />;
      default:
        return <RiSearchLine className={`${iconClass} text-gray-600`} />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Removida a variável não utilizada: const unreadCount = searchResults.length;

  return (
    <div className={`relative ${className}`} ref={searchAreaRef}>
      <div className="relative">
        <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={searchInputRef}
          type="search"
          placeholder="Buscar agentes, notícias, galeria..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
              setIsSearchOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchQuery.trim()) {
              e.preventDefault();
              performSearch(searchQuery);
            }
            if (e.key === "Escape") {
              setIsSearchOpen(false);
            }
          }}
          className="pl-10 pr-10 w-full max-w-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg h-10 px-3 py-2 text-sm transition-all duration-200 bg-white"
          aria-label="Buscar no sistema"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setIsSearchOpen(false);
              setSearchResults([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Limpar busca"
          >
            <RiCloseLine className="h-4 w-4" />
          </button>
        )}
      </div>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-hidden p-0 bg-white"
          id="search-results-dialog"
        >
          <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-700 to-blue-900">
            <DialogTitle className="flex items-center gap-2 text-white">
              <RiSearchLine className="w-5 h-5 text-white" />
              Resultados da Busca
            </DialogTitle>
            <DialogDescription className="text-blue-200 mt-1">
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : "Digite para buscar no sistema"}
            </DialogDescription>
            <DialogClose className="absolute right-4 top-4">
              <RiCloseLine className="h-5 w-5 text-white hover:text-gray-200" />
            </DialogClose>
          </DialogHeader>

          <div className="px-6 py-4 bg-white">
            <div className="relative mb-4">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="search"
                placeholder="Continue buscando..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg h-10 px-3 py-2 text-sm bg-white"
                autoFocus
                aria-label="Buscar"
              />
            </div>

            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-8"
                >
                  <RiLoaderLine className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
                  <p className="text-gray-600">Buscando no sistema...</p>
                </motion.div>
              ) : searchError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-red-600"
                >
                  <p className="font-medium">{searchError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(searchQuery)}
                    className="mt-4"
                  >
                    Tentar novamente
                  </Button>
                </motion.div>
              ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-gray-500"
                >
                  <RiSearchLine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Nenhum resultado encontrado</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Tente outros termos de busca
                  </p>
                </motion.div>
              ) : searchResults.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 max-h-[50vh] overflow-y-auto pr-2"
                >
                  {searchResults.map((result) => (
                    <motion.div
                      key={`${result.type}-${result.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href={result.href}
                        onClick={() => setIsSearchOpen(false)}
                        className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                                {result.title}
                              </h3>
                              <RiExternalLinkLine className="w-3 h-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {result.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {result.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md capitalize">
                                {result.type === "agent" && (
                                  <RiUserLine className="w-3 h-3" />
                                )}
                                {result.type === "news" && (
                                  <RiArticleLine className="w-3 h-3" />
                                )}
                                {result.type === "gallery_item" && (
                                  <RiImageLine className="w-3 h-3" />
                                )}
                                {result.type === "gallery_category" && (
                                  <RiFolderLine className="w-3 h-3" />
                                )}
                                {result.type === "agent"
                                  ? "Agente"
                                  : result.type === "news"
                                  ? "Notícia"
                                  : result.type === "gallery_item"
                                  ? "Item"
                                  : "Categoria"}
                              </span>

                              {result.metadata?.role && (
                                <span className="inline-flex items-center gap-1">
                                  <RiAwardLine className="w-3 h-3" />
                                  {result.metadata.role === "admin"
                                    ? "Administrador"
                                    : "Agente"}
                                </span>
                              )}

                              {result.metadata?.published_at && (
                                <span className="inline-flex items-center gap-1">
                                  <RiCalendarLine className="w-3 h-3" />
                                  {formatDate(result.metadata.published_at)}
                                </span>
                              )}

                              {result.metadata?.graduacao && (
                                <span className="inline-flex items-center gap-1">
                                  <RiBuildingLine className="w-3 h-3" />
                                  {result.metadata.graduacao}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {searchResults.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {searchResults.length} resultado
                    {searchResults.length !== 1 ? "s" : ""} encontrado
                    {searchResults.length !== 1 ? "s" : ""}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                      setSearchResults([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <RiCloseLine className="w-3 h-3 mr-1" />
                    Limpar busca
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
