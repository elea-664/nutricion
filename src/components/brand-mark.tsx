import { Triangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Lockup del logo inspirado en el empaque de referencia (▲THL8 by
// HEALTHYLICIOUS): triángulo + wordmark tracked-out, con una píldora
// delgada debajo a modo de "by ...". Solo se usa en la landing.
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Triangle className="size-4 fill-primary text-primary" strokeWidth={0} />
        <span className="text-lg font-extrabold tracking-[0.15em] uppercase">
          Nutri<span className="text-primary">Demo</span>
        </span>
      </div>
      {!compact && (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-[0.65rem] font-medium tracking-[0.25em] text-muted-foreground uppercase">
          Tienda + POS · un inventario
        </span>
      )}
    </div>
  );
}

export function BrandTriangleDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <Triangle
          key={i}
          className="size-3 fill-primary/70 text-primary/70 -rotate-90"
          strokeWidth={0}
          style={{ opacity: 1 - i * 0.3 }}
        />
      ))}
    </div>
  );
}
