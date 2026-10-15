"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { ProductPhoto } from "@/components/product-photo";
import { Button } from "@/components/ui/button";

// Banda inspirada en el bloque de "arma tu plan / suscripción" que suele
// verse en la competencia. Contenido de EJEMPLO: aquí solo enlaza a la
// línea de Meals del catálogo — si el cliente ofrece planes o
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
          category="Meals"
          emoji="🍱"
          emojiClassName="text-7xl"
          className="h-56 w-full sm:h-full"
        />
        <div className="flex flex-col items-start gap-3 p-6 sm:p-8">
          <h3 className="text-2xl font-bold tracking-tight uppercase">
            Not sure where to start?
          </h3>
          <p className="text-muted-foreground">
            Tell us your goals and how many meals you want each week — we&apos;ll recommend
            meals that match. Skip, pause or cancel anytime.
          </p>
          <Link href="/plans">
            <Button size="lg" className="mt-2 gap-2">
              Get started
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
