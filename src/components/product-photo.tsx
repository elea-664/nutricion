"use client";

import Image from "next/image";
import { useProductPhoto } from "@/lib/use-product-photo";
import { tileGradientForCategory } from "@/lib/category-style";
import { cn } from "@/lib/utils";

interface ProductPhotoProps {
  /** Término de búsqueda en Pexels (idealmente en inglés, da mejores resultados). */
  query: string;
  category: string;
  emoji: string;
  emojiClassName?: string;
  className?: string;
}

// Foto real vía Pexels si hay clave configurada y encuentra resultado;
// si no, cae automáticamente al tile de emoji con degradado (el
// comportamiento original) — nunca rompe la demo.
export function ProductPhoto({
  query,
  category,
  emoji,
  emojiClassName,
  className,
}: ProductPhotoProps) {
  const { photo } = useProductPhoto(query);

  if (photo) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 50vw, 300px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-linear-to-br",
        tileGradientForCategory(category),
        className
      )}
    >
      <span aria-hidden className={cn("text-6xl", emojiClassName)}>
        {emoji}
      </span>
    </div>
  );
}
