// CORREÇÃO: O import agora busca do arquivo que criamos acima
import { GaleriaDetalheContent } from "../components/GaleriaDetalheContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return {
    title: `Galeria - ${slug} | Patrulha Aérea Civil`,
    description: "Visualize fotos e vídeos desta operação.",
  };
}

export default async function GaleriaDetalhePage({ params }: PageProps) {
  // Aguarda a resolução dos parâmetros (Obrigatório no Next 15)
  const { slug } = await params;

  return <GaleriaDetalheContent slug={slug} />;
}
