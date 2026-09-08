"use client";

import { useEffect, useState } from "react";

export interface ProductPhoto {
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

// Caché en memoria por consulta: cada foto se pide una sola vez por
// sesión del navegador, sin importar cuántas tarjetas la usen o cuántas
// veces se navegue entre vistas.
const cache = new Map<string, ProductPhoto | null>();

export function useProductPhoto(query: string) {
  const [lastQuery, setLastQuery] = useState(query);
  const [photo, setPhoto] = useState<ProductPhoto | null>(() => cache.get(query) ?? null);
  const [loading, setLoading] = useState(() => !cache.has(query));

  // Si `query` cambia (reuso del componente para otro producto), sincroniza
  // de inmediato con lo que ya haya en caché — patrón de "ajustar estado
  // durante el render" en vez de un efecto con setState síncrono.
  if (query !== lastQuery) {
    setLastQuery(query);
    setPhoto(cache.get(query) ?? null);
    setLoading(!cache.has(query));
  }

  useEffect(() => {
    if (cache.has(query)) return;

    let cancelled = false;

    fetch(`/api/photo?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data: { photo: ProductPhoto | null }) => {
        cache.set(query, data.photo ?? null);
        if (!cancelled) setPhoto(data.photo ?? null);
      })
      .catch(() => {
        cache.set(query, null);
        if (!cancelled) setPhoto(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return { photo, loading };
}
