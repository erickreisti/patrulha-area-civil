"use client";

import { useState } from "react";
import Image from "next/image";
import { RiImageFill, RiVideoFill } from "react-icons/ri";

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  tipo: "foto" | "video";
}

export function ImageWithFallback({ src, alt, tipo }: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  if (tipo === "video" || !src) {
    return (
      <div className="w-12 h-12 rounded flex items-center justify-center bg-purple-100">
        <RiVideoFill className="w-6 h-6 text-purple-500" />
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
        <RiImageFill className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded overflow-hidden relative bg-gray-200">
      <Image
        src={src}
        alt={alt}
        width={48}
        height={48}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        priority={false}
        loading="lazy"
      />
    </div>
  );
}
