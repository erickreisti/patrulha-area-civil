import { Metadata } from "next";
import Link from "next/link";
import { GaleriaDetalheContent } from "../components/GaleriaDetalheContent"; // Corrigido path (..// -> ../)
import { createClient } from "@/lib/supabase/client"; // Assumindo que você tem um client server-side ou use o padrão
import { RiArrowLeftLine, RiGalleryLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// --- 1. METADATA DINÂMICA (SEO) ---
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Criamos um client simples para buscar o título real
  // Nota: Em Next.js App Router, fetchs são deduped automaticamente se usar fetch nativo,
  // mas com client do supabase direto, é bom ser econômico.
  const supabase = createClient();
  const { data } = await supabase
    .from("galeria_categorias")
    .select("nome, descricao")
    .eq("slug", slug)
    .single();

  const title = data?.nome || slug.charAt(0).toUpperCase() + slug.slice(1);
  const description =
    data?.descricao || "Visualize fotos e vídeos oficiais desta operação.";

  return {
    title: `${title} | Galeria PAC`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "website",
    },
  };
}

// --- 2. PÁGINA PRINCIPAL ---
export default async function GaleriaDetalhePage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* --- BACKGROUND CONSISTENTE (Igual ao Header) --- 
        Mantemos a identidade visual com o grid e o blob azul
      */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-pac-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none z-0" />

      {/* Container Principal */}
      <main className="relative z-10 container mx-auto px-4 py-24 lg:py-32">
        {/* Navegação de Topo (Breadcrumb simplificado) */}
        <div className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Button
            variant="ghost"
            asChild
            className="group pl-0 text-slate-500 hover:text-pac-primary hover:bg-transparent transition-colors"
          >
            <Link href="/galeria">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-pac-primary/30 group-hover:shadow-sm transition-all">
                  <RiArrowLeftLine className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="font-semibold text-sm uppercase tracking-wide">
                  Voltar para Galeria
                </span>
              </div>
            </Link>
          </Button>

          {/* Badge Decorativo (Opcional) */}
          <div className="hidden sm:flex items-center gap-2 text-pac-primary/60">
            <RiGalleryLine className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Visualização de Álbum
            </span>
          </div>
        </div>

        {/* --- CONTEÚDO DO CLIENT COMPONENT --- */}
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-6 sm:p-8 lg:p-10 shadow-sm">
          <GaleriaDetalheContent slug={slug} />
        </div>
      </main>
    </div>
  );
}
