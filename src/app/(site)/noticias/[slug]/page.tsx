"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RiCalendarLine,
  RiTimeLine,
  RiArrowLeftLine,
  RiShareLine,
  RiErrorWarningLine,
  RiArrowRightLine,
} from "react-icons/ri";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Hook
import { useNoticiaDetalhe } from "@/lib/stores/useNoticiasStore";
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
      <Card className="max-w-md mx-4 border-red-100 shadow-lg">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
  const router = useRouter();
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

  // 3. Buscar Relacionadas
  const loadRelacionadas = useCallback(async () => {
    if (!noticiaDetalhe?.categoria || !noticiaDetalhe?.id) return;

    try {
      // Simulação de fetch para relacionadas. Em produção, use sua API real.
      const res = await fetch(
        `/api/noticias?categoria=${noticiaDetalhe.categoria}&limit=3&exclude=${noticiaDetalhe.id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setNoticiasRelacionadas(data.data || []);
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
        // Ignora
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
    <div className="min-h-screen bg-slate-50">
      {/* Header Imersivo */}
      <section className="relative bg-slate-900 text-white pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />

        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push("/noticias")}
            className="mb-8 text-slate-300 hover:text-white hover:bg-white/10 px-0 pl-2 transition-all group"
          >
            <RiArrowLeftLine className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Notícias
          </Button>

          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-6 hover:bg-emerald-500/30 px-3 py-1 text-sm font-medium">
            {noticiaDetalhe.categoria || "Geral"}
          </Badge>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight text-white">
            {noticiaDetalhe.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                {noticiaDetalhe.autor?.full_name?.charAt(0) || "P"}
              </div>
              <span>{noticiaDetalhe.autor?.full_name || "Redação PAC"}</span>
            </div>

            <div className="flex items-center gap-2">
              <RiCalendarLine className="h-4 w-4 text-emerald-400" />
              {new Date(noticiaDetalhe.data_publicacao).toLocaleDateString(
                "pt-BR",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                },
              )}
            </div>

            <div className="flex items-center gap-2">
              <RiTimeLine className="h-4 w-4 text-emerald-400" />
              {readingTime} min de leitura
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 -mt-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Mídia Principal */}
          {imageUrl && !imageError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video w-full bg-slate-200 rounded-2xl shadow-2xl overflow-hidden mb-12 border-4 border-white z-20"
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

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 mb-12 relative z-10">
            {/* Resumo / Lead (CORRIGIDO: Escaped Quotes) */}
            {noticiaDetalhe.resumo && (
              <div className="mb-10 p-6 bg-slate-50 border-l-4 border-emerald-500 rounded-r-lg">
                <p className="text-xl text-slate-700 font-serif italic leading-relaxed">
                  &quot;{noticiaDetalhe.resumo}&quot;
                </p>
              </div>
            )}

            {/* Corpo do Texto */}
            <div
              className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-bold prose-headings:text-slate-900 
              prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg
              prose-blockquote:border-l-emerald-500 prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg
            "
            >
              <div
                dangerouslySetInnerHTML={{ __html: noticiaDetalhe.conteudo }}
              />
            </div>
          </div>

          {/* Rodapé do Artigo */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-20">
            <Button
              variant="outline"
              onClick={() => router.push("/noticias")}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
            >
              <RiArrowLeftLine className="mr-2 h-4 w-4" />
              Ler outras notícias
            </Button>

            <Button
              onClick={handleShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-md shadow-emerald-200"
            >
              <RiShareLine className="mr-2 h-4 w-4" />
              Compartilhar Artigo
            </Button>
          </div>

          {/* Notícias Relacionadas */}
          {noticiasRelacionadas.length > 0 && (
            <div className="border-t border-slate-200 pt-16">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <span className="w-1 h-8 bg-emerald-500 rounded-full" />
                Veja Também
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {noticiasRelacionadas.map((relacionada: NoticiaLista) => (
                  <Link
                    href={`/noticias/${relacionada.slug}`}
                    key={relacionada.id}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden hover:-translate-y-1">
                      <CardContent className="p-5">
                        <div className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wider">
                          {relacionada.categoria || "Geral"}
                        </div>
                        <h4 className="font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                          {relacionada.titulo}
                        </h4>
                        <div className="flex items-center text-xs text-slate-400 font-medium mt-auto">
                          Ler mais{" "}
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
