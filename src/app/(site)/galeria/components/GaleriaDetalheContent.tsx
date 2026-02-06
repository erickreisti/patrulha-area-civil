"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { RiArrowLeftLine, RiCalendarLine, RiImage2Line } from "react-icons/ri";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Store
import { useGaleriaDetalhe } from "@/lib/stores/useGaleriaStore";

// --- TIPAGEM LOCAL (Para resolver conflitos de tipos) ---
interface ExtendedCategoria {
  titulo?: string;
  nome?: string; // Algumas versões do banco usam nome
  data_evento?: string;
  created_at: string;
  descricao?: string;
}

interface ExtendedItem {
  id: string;
  titulo?: string;
  url?: string; // Fallback 1
  media_url?: string; // Fallback 2
  imagem_url?: string; // Fallback 3
}

// --- HELPERS ---
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/galeria/${url}`;
};

interface GaleriaDetalheContentProps {
  slug: string;
}

export function GaleriaDetalheContent({ slug }: GaleriaDetalheContentProps) {
  const {
    categoria,
    itens,
    loading,
    fetchCategoria,
    fetchItens,
    setFiltros,
    clearError,
  } = useGaleriaDetalhe();

  const [mounted, setMounted] = useState(false);

  // Efeito de montagem (apenas no cliente)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Efeito de busca de dados
  useEffect(() => {
    if (!mounted) return;

    // 1. Busca os detalhes da categoria
    fetchCategoria(slug);

    // 2. Configura o filtro e busca os itens
    setFiltros({
      categoriaSlug: slug,
      page: 1,
      limit: 50,
    });
    fetchItens();

    // Limpeza ao desmontar
    return () => clearError();
  }, [slug, mounted, fetchCategoria, fetchItens, setFiltros, clearError]);

  if (!mounted) return null;

  // --- LOADING STATE ---
  if (loading || !categoria) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4">
        <Skeleton className="h-8 w-32 mb-8 bg-slate-200" />
        <Skeleton className="h-12 w-3/4 mb-4 bg-slate-200" />
        <Skeleton className="h-4 w-1/2 mb-12 bg-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-video w-full rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  // Cast seguro usando as interfaces locais
  const safeCategoria = categoria as unknown as ExtendedCategoria;
  const categoriaNome =
    safeCategoria.nome || safeCategoria.titulo || "Sem Título";
  const categoriaData = safeCategoria.data_evento || safeCategoria.created_at;

  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-slate-100 overflow-hidden bg-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <Link
            href="/galeria"
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-pac-primary transition-colors mb-8 group"
          >
            <RiArrowLeftLine className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar para Álbuns
          </Link>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge
                  variant="outline"
                  className="text-pac-primary border-pac-primary/30 bg-pac-primary/5 font-bold uppercase tracking-wider text-xs px-3 py-1 rounded-md"
                >
                  Álbum Oficial
                </Badge>
                {categoriaData && (
                  <span className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <RiCalendarLine className="mr-1.5 h-3.5 w-3.5" />
                    {new Date(categoriaData).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight uppercase">
                {categoriaNome}
              </h1>

              {safeCategoria.descricao && (
                <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-2xl border-l-4 border-pac-primary pl-6">
                  {safeCategoria.descricao}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- GRID DE FOTOS --- */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          {itens.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {itens.map((item, index) => {
                // Cast item para acessar propriedades variáveis
                const safeItem = item as unknown as ExtendedItem;
                const rawUrl =
                  safeItem.url || safeItem.media_url || safeItem.imagem_url;
                const imgUrl = getImageUrl(rawUrl);

                if (!imgUrl) return null;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="break-inside-avoid"
                  >
                    <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white rounded-2xl cursor-pointer">
                      <div className="relative">
                        <Image
                          src={imgUrl}
                          alt={safeItem.titulo || categoriaNome}
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                          {safeItem.titulo && (
                            <p className="text-white font-bold text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              {safeItem.titulo}
                            </p>
                          )}
                          <div className="w-8 h-1 bg-pac-primary mt-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <RiImage2Line className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                Álbum Vazio
              </h3>
              <p className="text-slate-500">
                Ainda não há fotos publicadas nesta galeria.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
