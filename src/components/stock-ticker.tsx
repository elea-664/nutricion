"use client";

// Barra de "stock en vivo" bajo el header (sección 9 de claude.md).
// Es el elemento que vende la tesis del demo: al vender en cualquier canal,
// el chip del producto afectado destella para que el cambio sea visible.

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store-context";
import { cn } from "@/lib/utils";

type FlashDirection = "up" | "down";

function snapshotStock(products: { id: string; stock: number }[]) {
  return Object.fromEntries(products.map((p) => [p.id, p.stock]));
}

export function StockTicker() {
  const { state } = useStore();

  const [prevStock, setPrevStock] = useState<Record<string, number>>(() =>
    snapshotStock(state.products)
  );
  const [flashing, setFlashing] = useState<Record<string, FlashDirection>>({});

  // Patrón "ajustar estado durante el render" (en vez de useEffect + setState
  // síncrono): compara el stock actual contra el último snapshot visto y, si
  // cambió, agenda el destello en la misma pasada de render.
  const changed: Record<string, FlashDirection> = {};
  for (const p of state.products) {
    const before = prevStock[p.id];
    if (before !== undefined && before !== p.stock) {
      changed[p.id] = p.stock < before ? "down" : "up";
    }
  }
  if (Object.keys(changed).length > 0) {
    setPrevStock(snapshotStock(state.products));
    setFlashing((f) => ({ ...f, ...changed }));
  }

  // Efecto real: apagar el destello después de un momento (side effect
  // legítimo — timer hacia un sistema externo).
  useEffect(() => {
    const ids = Object.keys(flashing);
    if (ids.length === 0) return;
    const timer = setTimeout(() => {
      setFlashing((f) => {
        const rest = { ...f };
        for (const id of ids) delete rest[id];
        return rest;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [flashing]);

  return (
    <div className="border-b bg-muted/40">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2">
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          Stock en vivo
        </span>
        <div className="flex items-center gap-1.5">
          {state.products.map((p) => {
            const dir = flashing[p.id];
            return (
              <span
                key={p.id}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs transition-all duration-300",
                  dir === "down" &&
                    "scale-110 border-red-400 bg-red-100 text-red-700",
                  dir === "up" &&
                    "scale-110 border-emerald-400 bg-emerald-100 text-emerald-700",
                  !dir && p.stock === 0 && "border-border bg-background text-muted-foreground",
                  !dir && p.stock > 0 && "border-border bg-background"
                )}
                title={`${p.name} — ${p.stock} en stock`}
              >
                <span aria-hidden>{p.emoji}</span>
                <span className="max-w-24 truncate font-medium">{p.name}</span>
                <span className="font-semibold tabular-nums">{p.stock}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
