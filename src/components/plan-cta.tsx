"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { ProductPhoto } from "@/components/product-photo";
import { Button } from "@/components/ui/button";

// Banda inspirada en el bloque de "arma tu plan / suscripción" que suele
// verse en la competencia. Contenido de EJEMPLO: aquí solo enlaza a la
// línea de Comidas del catálogo — si el cliente ofrece planes o
// suscripciones reales, esta banda es donde se explicarían y se pediría
// el copy, precios y fotos correspondientes.
export function PlanCta() {
  return (
    <section className="border-t border-border bg-background px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2"
      >
        <ProductPhoto
          query="meal prep healthy lunch boxes"
          category="Comidas"
          emoji="🍱"
          emojiClassName="text-7xl"
          className="h-56 w-full sm:h-full"
        />
        <div className="flex flex-col items-start gap-3 p-6 sm:p-8">
          <h3 className="text-2xl font-bold tracking-tight uppercase">
            ¿No sabes por dónde empezar?
          </h3>
          <p className="text-muted-foreground">
            Arma tu combo ideal desde la línea de Comidas preparadas — o pide asesoría en
            tienda. Mismo catálogo, mismo stock, sin importar dónde compres.
          </p>
          <Link href="/tienda?categoria=Comidas">
            <Button size="lg" className="mt-2 gap-2">
              Arma tu combo
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
