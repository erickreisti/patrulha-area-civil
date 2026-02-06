"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RiTimeLine,
  RiArrowLeftLine,
  RiShareLine,
  RiErrorWarningLine,
  RiArrowRightLine,
  RiUser3Line,
} from "react-icons/ri";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Hook & Actions
import { useNoticiaDetalhe } from "@/lib/stores/useNoticiasStore";
import { getNoticiasRelacionadas } from "@/app/actions/news/noticias";
import type { NoticiaLista } from "@/app/actions/news/noticias";

// --- TYPES ---
interface PageProps {
  params: Promise<{ slug: string }>;
}

// --- HELPERS ---
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/imagens-noticias/${url}`;
};

// --- COMPONENTES AUXILIARES ---

function NoticiaSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-8 w-32 mb-8 bg-slate-200" />
          <div className="space-y-4 mb-12">
            <Skeleton className="h-4 w-24 bg-slate-200" />
            <Skeleton className="h-12 w-3/4 bg-slate-200" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32 bg-slate-200" />
              <Skeleton className="h-4 w-32 bg-slate-200" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl mb-8 bg-slate-200" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-slate-200" />
            <Skeleton className="h-4 w-full bg-slate-200" />
            <Skeleton className="h-4 w-3/4 bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="max-w-md mx-4 border-red-100 shadow-lg bg-white">
        <CardContent className="pt-6 text-center">
          <RiErrorWarningLine className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Erro ao carregar
          </h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
            <Button
              onClick={onRetry}
              className="bg-pac-primary hover:bg-pac-primary-dark text-white"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---

export default function NoticiaPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string>("");
  const [imageError, setImageError] = useState(false);

  const {
    noticiaDetalhe,
    noticiasRelacionadas,
    loading,
    error,
    fetchNoticiaDetalhe,
    setNoticiasRelacionadas,
  } = useNoticiaDetalhe();

  // 1. Resolver Params
  useEffect(() => {
    params.then((resolved) => setSlug(decodeURIComponent(resolved.slug)));
  }, [params]);

  // 2. Buscar Notícia
  useEffect(() => {
    if (slug) {
      fetchNoticiaDetalhe(slug);
    }
  }, [slug, fetchNoticiaDetalhe]);

  // 3. Buscar Relacionadas (AGORA COM SERVER ACTION)
  const loadRelacionadas = useCallback(async () => {
    if (!noticiaDetalhe?.categoria || !noticiaDetalhe?.id) return;

    try {
      const res = await getNoticiasRelacionadas(
        noticiaDetalhe.categoria,
        noticiaDetalhe.id,
      );
      if (res.success && res.data) {
        setNoticiasRelacionadas(res.data);
      }
    } catch (err) {
      console.error("Erro ao carregar relacionadas", err);
    }
  }, [noticiaDetalhe, setNoticiasRelacionadas]);

  useEffect(() => {
    if (noticiaDetalhe) {
      loadRelacionadas();
    }
  }, [noticiaDetalhe, loadRelacionadas]);

  // 4. Handle 404
  useEffect(() => {
    if (!loading && !noticiaDetalhe && !error && slug) {
      const timer = setTimeout(() => notFound(), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, noticiaDetalhe, error, slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: noticiaDetalhe?.titulo,
          text: noticiaDetalhe?.resumo || "",
          url,
        });
      } catch {
        // Ignora erro de compartilhamento
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copiado para a área de transferência!");
    }
  };

  if (loading) return <NoticiaSkeleton />;
  if (error && !noticiaDetalhe)
    return (
      <ErrorState
        error={error}
        onRetry={() => slug && fetchNoticiaDetalhe(slug)}
      />
    );
  if (!noticiaDetalhe) return null;

  const imageUrl = getImageUrl(noticiaDetalhe.media_url);
  const readingTime = Math.ceil((noticiaDetalhe.conteudo?.length || 0) / 1000);

  return (
    <div className="min-h-screen bg-white">
      {/* --- HEADER CLEAN --- */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-slate-100 overflow-hidden">
        {/* Background Sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          {/* Botão Voltar */}
          <Link
            href="/noticias"
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-pac-primary transition-colors mb-8 group"
          >
            <RiArrowLeftLine className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Voltar para Notícias
          </Link>

          {/* Badge de Categoria */}
          <div className="flex items-center gap-4 mb-6">
            <Badge
              variant="outline"
              className="text-pac-primary border-pac-primary/30 bg-pac-primary/5 font-bold uppercase tracking-wider text-xs px-3 py-1 rounded-md"
            >
              {noticiaDetalhe.categoria || "Geral"}
            </Badge>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
              {new Date(noticiaDetalhe.data_publicacao).toLocaleDateString(
                "pt-BR",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                },
              )}
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
            {noticiaDetalhe.titulo}
          </h1>

          {/* Metadados Autor/Tempo */}
          <div className="flex flex-wrap items-center gap-6 py-6 border-t border-slate-100 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <RiUser3Line className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-slate-400">
                  Por
                </span>
                <span className="text-slate-900 font-bold">
                  {noticiaDetalhe.autor?.full_name || "Redação PAC"}
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <RiTimeLine className="h-4 w-4 text-pac-primary" />
              <span>{readingTime} min de leitura</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Imagem de Destaque */}
          {imageUrl && !imageError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video w-full rounded-2xl overflow-hidden mb-12 shadow-lg ring-1 ring-slate-200"
            >
              <Image
                src={imageUrl}
                alt={noticiaDetalhe.titulo}
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
              />
            </motion.div>
          )}

          <div className="relative z-10">
            {/* Resumo / Lead */}
            {noticiaDetalhe.resumo && (
              <div className="mb-10 p-8 bg-slate-50 border-l-4 border-pac-primary rounded-r-xl">
                <p className="text-xl text-slate-700 font-medium leading-relaxed italic">
                  &quot;{noticiaDetalhe.resumo}&quot;
                </p>
              </div>
            )}

            {/* Corpo do Texto (Tipografia Ajustada) */}
            <div
              className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-a:text-pac-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-l-pac-primary prose-blockquote:bg-white prose-blockquote:text-slate-700 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic
              "
            >
              <div
                dangerouslySetInnerHTML={{ __html: noticiaDetalhe.conteudo }}
              />
            </div>
          </div>

          {/* Rodapé do Artigo */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-16 pt-8 border-t border-slate-200">
            <Link
              href="/noticias"
              className="text-slate-500 hover:text-pac-primary font-bold text-sm flex items-center transition-colors"
            >
              <RiArrowLeftLine className="mr-2 h-4 w-4" />
              Voltar para a lista
            </Link>

            <Button
              onClick={handleShare}
              variant="outline"
              className="border-pac-primary text-pac-primary hover:bg-pac-primary hover:text-white font-bold transition-all w-full sm:w-auto gap-2"
            >
              <RiShareLine className="h-4 w-4" />
              Compartilhar Artigo
            </Button>
          </div>

          {/* --- NOTÍCIAS RELACIONADAS --- */}
          {noticiasRelacionadas.length > 0 && (
            <div className="mt-20 pt-16 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-pac-primary rounded-full" />
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Veja Também
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {noticiasRelacionadas.map((relacionada: NoticiaLista) => (
                  <Link
                    href={`/noticias/${relacionada.slug}`}
                    key={relacionada.id}
                    className="group"
                  >
                    <Card className="h-full border border-slate-200 hover:border-pac-primary/30 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden hover:-translate-y-1">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="text-[10px] font-bold text-pac-primary mb-3 uppercase tracking-widest bg-pac-primary/5 w-fit px-2 py-1 rounded">
                          {relacionada.categoria || "Geral"}
                        </div>
                        <h4 className="font-bold text-slate-800 mb-3 group-hover:text-pac-primary transition-colors line-clamp-3 leading-snug flex-grow">
                          {relacionada.titulo}
                        </h4>
                        <div className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-wider mt-4">
                          Ler Matéria{" "}
                          <RiArrowRightLine className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
