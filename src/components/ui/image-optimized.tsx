// src/components/ui/optimized-image.tsx
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils/cn";

interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  ...props
}: OptimizedImageProps) {
  // Sempre use Image diretamente sem wrappers complexos
  return (
    <Image
      src={src}
      alt={alt}
      width={width ? Number(width) : undefined}
      height={height ? Number(height) : undefined}
      className={cn(className)}
      {...props}
    />
  );
}
