"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RiCalendarLine,
  RiArrowRightLine,
  RiTimeLine,
  RiNewspaperLine,
  RiEyeLine,
  RiExternalLinkLine,
  RiStarFill,
} from "react-icons/ri";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Store & Types
import { useNoticiasBasico } from "@/lib/stores/useNoticiasStore";

import type { NoticiaLista } from "@/app/actions/news/noticias";

// --- TIPOS ---

interface AutorComGraduacao {
  full_name?: string | null;
  graduacao?: string | null;
}

interface NewsCardProps {
  noticia: NoticiaLista;
  index: number;
}

// --- SUB-COMPONENTES ---

// 1. Skeleton de Carregamento
function SkeletonCard() {
  return (
    <Card className="border-gray-200 bg-white overflow-hidden h-full flex flex-col shadow-sm">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <CardHeader className="pb-3 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-1" />
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse" />
        </div>
        <div className="pt-4 mt-auto">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

// 2. Card de Notícia
function NewsCard({ noticia, index }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = "imagens-noticias";

    if (url.includes(bucket)) {
      return `${supabaseUrl}/storage/v1/object/public/${url}`;
    }
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${url}`;
  };

  const imageUrl = getImageUrl(noticia.thumbnail_url || noticia.media_url);
  const hasImage = !!imageUrl;

  const autor = noticia.autor as AutorComGraduacao;
  const autorGraduacao = autor?.graduacao || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="h-full"
    >
      <Card className="border-gray-100 bg-white hover:shadow-xl transition-all duration-300 group h-full flex flex-col hover:-translate-y-1 overflow-hidden relative shadow-md">
        {/* Badge de Destaque */}
        {noticia.destaque && (
          <div className="absolute top-3 right-3 z-30">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 text-[10px] font-bold shadow-md uppercase tracking-wider flex items-center gap-1">
              <RiStarFill className="w-3 h-3" /> Destaque
            </Badge>
          </div>
        )}

        {/* Área da Imagem / Mídia */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-100 flex-shrink-0">
          {hasImage ? (
            <>
              <Image
                src={imageUrl!}
                alt={noticia.titulo}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
              <RiNewspaperLine className="w-16 h-16 opacity-50" />
            </div>
          )}

          {/* Categoria */}
          <div className="absolute top-3 left-3 z-20">
            <Badge
              variant="secondary"
              className="bg-white/95 text-slate-800 hover:bg-white border-0 text-[10px] font-bold backdrop-blur-md shadow-sm uppercase tracking-wide px-2"
            >
              {noticia.categoria || "Geral"}
            </Badge>
          </div>
        </div>

        {/* Corpo do Card */}
        <div className="flex flex-col flex-1 p-5">
          {/* Metadados */}
          <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5 text-pac-primary">
              <RiCalendarLine className="w-3.5 h-3.5" />
              {formatDate(noticia.data_publicacao)}
            </div>
            <div className="flex items-center gap-1" title="Visualizações">
              <RiEyeLine className="w-3.5 h-3.5" />
              {noticia.views || 0}
            </div>
          </div>

          {/* Título */}
          <Link
            href={`/noticias/${noticia.slug}`}
            className="block group/link mb-3"
          >
            <h3 className="font-bold text-lg leading-snug text-slate-800 group-hover/link:text-pac-primary transition-colors line-clamp-2">
              {noticia.titulo}
            </h3>
          </Link>

          {/* Resumo */}
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6 flex-1">
            {noticia.resumo || "Clique para ler a notícia completa."}
          </p>

          {/* Rodapé: Autor e Botão */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            {/* Info Autor */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-200">
                <RiExternalLinkLine className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-slate-700 truncate">
                  {noticia.autor?.full_name || "Ascom PAC"}
                </span>
                {autorGraduacao && (
                  <span className="text-[9px] font-semibold text-slate-400 truncate uppercase tracking-wider">
                    {autorGraduacao}
                  </span>
                )}
              </div>
            </div>

            {/* Botão Ler Mais */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-pac-primary hover:text-pac-primary-dark hover:bg-pac-primary/5 font-bold px-2 h-8"
            >
              <Link
                href={`/noticias/${noticia.slug}`}
                className="flex items-center gap-1"
              >
                Ler Mais
                <RiArrowRightLine className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export function NewsSection() {
  // ✅ CORREÇÃO: Usando setFilters em vez de setFiltros
  const { noticias, loading, setFilters, setPagination, fetchNoticias } =
    useNoticiasBasico();

  useEffect(() => {
    // 1. Configura os filtros para a Home
    setFilters({
      search: "",
      categoria: "all",
      status: "publicado",
      destaque: "all",
      tipo_media: "all",
      sortBy: "recent",
      sortOrder: "desc",
    });

    // 2. Configura paginação (apenas 3 itens)
    if (setPagination) {
      setPagination({
        page: 1,
        limit: 3,
        total: 0,
        totalPages: 1,
      });
    }

    // 3. Busca os dados
    fetchNoticias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestNews = noticias ? noticias.slice(0, 3) : [];

  return (
    <section className="w-full bg-white py-16 lg:py-24 overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Título da Seção */}
        <motion.div
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="inline-block">
            <span className="text-pac-primary font-bold tracking-widest text-sm uppercase bg-pac-primary/10 px-3 py-1 rounded-full mb-2 inline-block">
              Atualizações
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 uppercase tracking-tight">
            ÚLTIMAS <span className="text-pac-primary">NOTÍCIAS</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Acompanhe as ações, eventos e comunicados oficiais da Patrulha Aérea
            Civil.
          </p>
        </motion.div>

        {/* Grid de Notícias */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestNews.map((noticia: NoticiaLista, index: number) => (
                <NewsCard key={noticia.id} noticia={noticia} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 max-w-lg mx-auto shadow-sm">
                <div className="bg-white p-4 rounded-full w-fit mx-auto mb-6 shadow-sm">
                  <RiNewspaperLine className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold text-xl mb-3">
                  Nenhuma notícia recente
                </h3>
                <p className="text-slate-500 mb-0">
                  No momento não há publicações disponíveis. Volte em breve para
                  novidades!
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Botão Ver Todas */}
        {latestNews.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              asChild
              className="bg-pac-primary hover:bg-pac-primary-dark text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-pac-primary/25 hover:shadow-pac-primary/40 px-10 py-6 text-lg h-auto group"
            >
              <Link
                href="/noticias"
                className="flex items-center justify-center gap-3"
              >
                <RiTimeLine className="w-5 h-5" />
                Ver Todas as Notícias
                <RiArrowRightLine className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
