import { GaleriaDetalheContent } from "..//components/GaleriaDetalheContent";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Opcional: Você poderia buscar o título real no banco aqui para melhor SEO
  // Mas por enquanto, usamos o slug formatado
  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  return {
    title: `${title} | Galeria PAC`,
    description: "Visualize fotos e vídeos oficiais desta operação.",
  };
}

export default async function GaleriaDetalhePage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-50">
      <GaleriaDetalheContent slug={slug} />
    </div>
  );
}
