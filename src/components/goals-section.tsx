"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { ProductPhoto } from "@/components/product-photo";

interface Goal {
  title: string;
  description: string;
  category: string;
  emoji: string;
  query: string;
}

// Contenido de EJEMPLO — el copy final, las categorías que se destacan y
// las fotos reales los define el cliente; aquí solo se muestra el patrón.
const GOALS: Goal[] = [
  {
    title: "Bajo en calorías",
    description:
      "Hidratación y snacks ligeros para cuidar la porción sin sacrificar sabor.",
    category: "Bebidas",
    emoji: "🥤",
    query: "sports hydration drink bottle",
  },
  {
    title: "Rendimiento",
    description:
      "Energía antes y durante el entreno: pre-entrenos y creatina para el siguiente rep.",
    category: "Suplementos",
    emoji: "⚡",
    query: "athlete workout performance gym",
  },
  {
    title: "Aumento de masa muscular",
    description:
      "Proteína de calidad para la recuperación y el crecimiento muscular post-entreno.",
    category: "Proteínas",
    emoji: "💪",
    query: "bodybuilder muscle gym protein shake",
  },
];

// Sección inspirada en el patrón "¿Cuáles son tus objetivos?" que suele
// verse en la competencia (p. ej. Athletes Nutrition): tarjetas grandes
// por objetivo que enlazan directo a una categoría ya filtrada en
// /tienda. Reutiliza el mismo mecanismo de fotos (Pexels + fallback a
// emoji) que ya usa el catálogo, así que no rompe si no hay API key.
export function GoalsSection() {
  return (
    <section className="border-t border-border bg-background px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-12 max-w-2xl text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">
          ¿Cuál es tu objetivo?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Elige una meta y te llevamos directo a los productos del catálogo que le sirven.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-3">
        {GOALS.map((goal, i) => (
          <motion.div
            key={goal.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              href={`/tienda?categoria=${encodeURIComponent(goal.category)}`}
              className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-2xl border border-border"
            >
              <ProductPhoto
                query={goal.query}
                category={goal.category}
                emoji={goal.emoji}
                emojiClassName="text-7xl"
                className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative flex flex-col gap-2 p-5">
                <h3 className="text-xl font-bold text-white uppercase">{goal.title}</h3>
                <p className="text-sm text-white/75">{goal.description}</p>
                <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/50 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase transition-colors group-hover:border-white group-hover:bg-white group-hover:text-black">
                  Ver productos
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
