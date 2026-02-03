"use client";

import { useState, useEffect, useCallback } from "react";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RiCalendarLine,
  RiUserLine,
  RiTimeLine,
  RiArrowLeftLine,
  RiShareLine,
  RiArrowRightLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useNoticias } from "@/lib/stores/useNoticiasStore";

// Interface para Params (Next 15)
interface PageProps {
  params: Promise<{ slug: string }>;
}

function NoticiaSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-10 w-32 mb-8 bg-gray-200" />
          <div className="space-y-4 mb-12">
            <Skeleton className="h-4 w-24 bg-gray-200" />
            <Skeleton className="h-12 w-3/4 bg-gray-200" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32 bg-gray-200" />
              <Skeleton className="h-4 w-32 bg-gray-200" />
            </div>
          </div>
          <Skeleton className="h-96 w-full rounded-xl mb-8 bg-gray-200" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/2 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md mx-4 border-red-100 shadow-lg">
        <CardContent className="pt-6 text-center">
          <RiErrorWarningLine className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Erro ao carregar
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
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

export default function NoticiaPage({ params }: PageProps) {
  const router = useRouter();
  const [slug, setSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const {
    noticiaDetalhe,
    noticiasRelacionadas,
    fetchNoticiaDetalhe,
    setNoticiasRelacionadas,
  } = useNoticias();

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(decodeURIComponent(resolvedParams.slug));
    });
  }, [params]);

  // Carregar notícias relacionadas
  // Removido setNoticiasRelacionadas da dependência para evitar avisos
  const loadRelacionadas = useCallback(async () => {
    if (!noticiaDetalhe?.categoria || !noticiaDetalhe?.id) return;

    try {
      const result = await fetch(
        `/api/noticias?categoria=${noticiaDetalhe.categoria}&limit=3&exclude=${noticiaDetalhe.id}`,
      );

      if (result.ok) {
        const data = await result.json();
        if (data.success && data.data) {
          setNoticiasRelacionadas(data.data);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar notícias relacionadas:", err);
    }
  }, [noticiaDetalhe, setNoticiasRelacionadas]);

  useEffect(() => {
    if (!slug) return;
    const loadNoticia = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageError(false);
        await fetchNoticiaDetalhe(slug);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };
    loadNoticia();
  }, [slug, fetchNoticiaDetalhe]);

  useEffect(() => {
    if (noticiaDetalhe?.id) {
      loadRelacionadas();
    }
  }, [noticiaDetalhe?.id, loadRelacionadas]);

  // Se o carregamento terminou e não há notícia nem erro, é 404
  useEffect(() => {
    if (!loading && !noticiaDetalhe && !error) {
      notFound();
    }
  }, [loading, noticiaDetalhe, error]);

  const handleShare = async () => {
    if (navigator.share && noticiaDetalhe) {
      try {
        await navigator.share({
          title: noticiaDetalhe.titulo,
          text: noticiaDetalhe.resumo || "",
          url: window.location.href,
        });
      } catch {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copiado!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado!");
    }
  };

  if (loading) return <NoticiaSkeleton />;
  if (error && !noticiaDetalhe)
    return (
      <ErrorState error={error} onRetry={() => window.location.reload()} />
    );
  if (!noticiaDetalhe) return null; // Será tratado pelo useEffect do notFound

  const imageUrl = noticiaDetalhe.media_url;
  const readingTime = Math.ceil((noticiaDetalhe.conteudo?.length || 0) / 1000);
  const authorName = noticiaDetalhe.autor?.full_name || "Autor da PAC";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Dark Minimalista */}
      <section className="relative bg-gray-900 text-white pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-pac-primary/20" />

        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push("/noticias")}
            className="mb-8 text-gray-300 hover:text-white hover:bg-white/10 transition-colors px-0 pl-2"
          >
            <RiArrowLeftLine className="mr-2 h-4 w-4" />
            Voltar Para Notícias
          </Button>

          <Badge className="bg-pac-primary text-white hover:bg-pac-primary mb-6 border-0">
            {noticiaDetalhe.categoria || "Geral"}
          </Badge>

          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            {noticiaDetalhe.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm md:text-base">
            <div className="flex items-center">
              <RiUserLine className="h-4 w-4 mr-2" />
              <span className="font-medium">{authorName}</span>
            </div>
            <div className="flex items-center">
              <RiCalendarLine className="h-4 w-4 mr-2" />
              <span>
                {new Date(noticiaDetalhe.data_publicacao).toLocaleDateString(
                  "pt-BR",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </span>
            </div>
            <div className="flex items-center">
              <RiTimeLine className="h-4 w-4 mr-2" />
              <span>{readingTime} min de leitura</span>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Imagem Principal */}
          {imageUrl && !imageError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative h-64 md:h-[500px] w-full bg-gray-200 rounded-xl shadow-2xl overflow-hidden mb-10 border-4 border-white z-20"
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8 relative z-10">
            {/* Resumo */}
            {noticiaDetalhe.resumo && (
              <div className="mb-8 p-6 bg-blue-50 border-l-4 border-pac-primary rounded-r-lg">
                <p className="text-lg text-gray-700 italic font-medium leading-relaxed">
                  {noticiaDetalhe.resumo}
                </p>
              </div>
            )}

            {/* Texto Rico */}
            {noticiaDetalhe.conteudo ? (
              <div
                className="prose prose-lg max-w-none text-gray-700 
                  prose-headings:font-bold prose-headings:text-gray-900 
                  prose-a:text-pac-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-blockquote:border-l-pac-primary prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: noticiaDetalhe.conteudo }}
              />
            ) : (
              <p className="text-gray-500 italic">Conteúdo não disponível.</p>
            )}
          </div>

          {/* Botões Finais */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-16">
            <Button
              variant="outline"
              onClick={() => router.push("/noticias")}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RiArrowLeftLine className="mr-2 h-4 w-4" />
              Voltar para Notícias
            </Button>

            <Button
              variant="secondary"
              onClick={handleShare}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <RiShareLine className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </div>

          {/* Relacionados */}
          {noticiasRelacionadas.length > 0 && (
            <div className="border-t border-gray-200 pt-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8">
                Notícias Relacionadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {noticiasRelacionadas.map((relacionada) => (
                  <Link
                    href={`/noticias/${relacionada.slug}`}
                    key={relacionada.id}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all border-gray-200">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-gray-800 mb-2 group-hover:text-pac-primary transition-colors line-clamp-2">
                          {relacionada.titulo}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-3">
                          {relacionada.resumo}
                        </p>
                        <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
                          Ler mais <RiArrowRightLine className="ml-1 w-3 h-3" />
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
