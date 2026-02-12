"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, Suspense } from "react";
import { RiCloseLine, RiDownloadLine, RiLoader4Line } from "react-icons/ri";

function ViewerContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const type = searchParams.get("type"); // 'foto' ou 'video'
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    window.close();
    if (!window.closed) {
      window.history.back();
    }
  };

  if (!url) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* BOTÕES DE CONTROLE */}
      <div className="absolute top-6 right-6 z-50 flex gap-4">
        {/* Download */}
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-white/50 hover:text-white transition-colors"
          title="Baixar original"
        >
          <RiDownloadLine className="w-6 h-6" />
        </a>

        {/* Fechar */}
        <button
          onClick={handleClose}
          className="p-2 bg-white/10 hover:bg-red-600/80 text-white rounded-full transition-all duration-300 group backdrop-blur-sm"
          title="Fechar aba"
        >
          <RiCloseLine className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* ÁREA DA MÍDIA */}
      <div className="w-full h-full p-4 flex items-center justify-center">
        {type === "video" ? (
          <div className="relative z-10 w-full max-w-6xl">
            {/* VÍDEO: Sem spinner customizado, usa o nativo do browser */}
            <video
              src={url}
              controls
              autoPlay
              className="w-full max-h-[90vh] shadow-2xl outline-none rounded-sm bg-black"
            />
          </div>
        ) : (
          <div className="relative w-full h-[90vh] z-10">
            {/* IMAGEM: Mantém spinner pois imagem não tem loading nativo visual */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-white z-0">
                <RiLoader4Line className="w-10 h-10 animate-spin" />
              </div>
            )}
            <Image
              src={url}
              alt="Visualização"
              fill
              className="object-contain"
              sizes="100vw"
              onLoadingComplete={() => setLoading(false)}
              priority
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ViewerContent />
    </Suspense>
  );
}
