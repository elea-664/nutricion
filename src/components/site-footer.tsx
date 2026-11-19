"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/lib/store-context";
import { BrandMark } from "@/components/brand-mark";

// Footer del sitio de la empresa: aquí quedan los accesos al demo
// funcional (Shop/Meal plans/POS/Admin) y el reset de datos.
export function SiteFooter() {
  const { reset } = useStore();

  return (
    <footer className="border-t border-border px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <BrandMark compact />
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <Link href="/plans" className="hover:text-foreground">
            Meal plans
          </Link>
          <Link href="/pos" className="hover:text-foreground">
            POS
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
          <button
            type="button"
            onClick={() => {
              reset();
              toast.success("Demo reset");
            }}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset demo
          </button>
        </nav>
        <p className="text-sm text-muted-foreground">© 2026 ATHL8 — demo project</p>
      </div>
    </footer>
  );
}
