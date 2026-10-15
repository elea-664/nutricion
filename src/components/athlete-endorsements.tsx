"use client";

import { motion } from "framer-motion";

import { ProductPhoto } from "@/components/product-photo";
import { cn } from "@/lib/utils";

interface Endorsement {
  eyebrow: string;
  title: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  query: string;
}

// Contenido de EJEMPLO: nombres, atletas y equipos ficticios — solo para
// mostrar el patrón de "prueba social" alternada que suele verse en la
// competencia (fotos + testimonio + logo/afiliación). Para producción
// esto necesita testimonios, fotos y autorizaciones reales del cliente.
const ENDORSEMENTS: Endorsement[] = [
  {
    eyebrow: "Real stories",
    title: "Athlete-approved plans",
    name: "Renata Cruz — amateur triathlete",
    description:
      "Renata plans her week of meals and supplements from the ATHL8 catalog, whether she shops online or stops by the store counter.",
    category: "Meals",
    emoji: "🥗",
    query: "athlete meal prep kitchen",
  },
  {
    eyebrow: "Partnerships",
    title: "Powering local teams",
    name: "Mesa CrossFit Club",
    description:
      "The box keeps its fridge stocked from the same inventory the online store sees — they never run out of what their athletes need after training.",
    category: "Performance",
    emoji: "🏆",
    query: "gym team group photo",
  },
  {
    eyebrow: "Performance",
    title: "Results you can see",
    name: "Diego Salas — amateur boxer",
    description:
      "Diego relies on ATHL8 protein and creatine for recovery between training sessions and competition.",
    category: "Protein",
    emoji: "🥊",
    query: "boxer training gym portrait",
  },
];

// Filas alternadas foto/texto, inspiradas en el bloque de testimonios de
// atletas/equipos de la competencia. Reutiliza ProductPhoto (Pexels +
// fallback a emoji) igual que el resto de la landing.
export function AthleteEndorsements() {
  return (
    <section className="border-t border-border bg-background px-4 py-20">
      <div className="mx-auto flex max-w-5xl flex-col">
        {ENDORSEMENTS.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className={cn(
              "flex flex-col items-center gap-8 py-10 sm:flex-row",
              i > 0 && "border-t border-border",
              i % 2 === 1 && "sm:flex-row-reverse"
            )}
          >
            <ProductPhoto
              query={item.query}
              category={item.category}
              emoji={item.emoji}
              emojiClassName="text-6xl"
              className="aspect-4/3 w-full shrink-0 overflow-hidden rounded-2xl sm:w-80"
            />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                {item.eyebrow}
              </span>
              <h3 className="text-2xl font-bold tracking-tight uppercase sm:text-3xl">
                {item.title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
              <p className="mt-1 max-w-md text-muted-foreground">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
