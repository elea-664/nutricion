"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Timer, Wifi } from "lucide-react";

import { useStore } from "@/lib/store-context";
import { formatMXN } from "@/lib/format";
import { ProductPhoto } from "@/components/product-photo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ALL_TAG = "Todas";

// Vitrina de la línea "Comidas" — platillos reales del catálogo,
// exclusivos de la tienda en línea. Pastillas de filtro funcionales +
// cuadrícula simple (sin scroll horizontal).
export function MealsShowcase() {
  const { state } = useStore();
  const meals = useMemo(
    () => state.products.filter((p) => p.category === "Comidas" && p.mealInfo),
    [state.products]
  );

  const tags = useMemo(() => {
    const set = new Set<string>();
    meals.forEach((m) => m.mealInfo?.tags.forEach((t) => set.add(t)));
    return [ALL_TAG, ...Array.from(set)];
  }, [meals]);

  const [activeTag, setActiveTag] = useState(ALL_TAG);

  const visible = useMemo(
    () =>
      activeTag === ALL_TAG
        ? meals
        : meals.filter((m) => m.mealInfo?.tags.includes(activeTag)),
    [meals, activeTag]
  );

  if (meals.length === 0) return null;

  return (
    <section className="chevron-texture relative border-t border-border bg-card/60 px-4 py-24 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-10 flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">
            Comidas que suman. 🥗
            <br />
            Resultados que se notan.
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Platillos preparados, listos en minutos, con sus macros a la vista.{" "}
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Wifi className="size-4" />
              Exclusivos de la tienda en línea.
            </span>
          </p>
        </div>
        <Link href="/tienda?categoria=Comidas">
          <Button size="lg" className="gap-2">
            Explorar comidas
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </motion.div>

      <div className="mx-auto mb-8 flex max-w-6xl flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeTag === tag
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((meal) => (
          <div
            key={meal.id}
            className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-lg"
          >
            <ProductPhoto
              query={meal.photoQuery}
              category={meal.category}
              emoji={meal.emoji}
              className="aspect-4/3 w-full"
            />
            <div className="flex flex-col gap-2 p-4">
              <h3 className="font-semibold leading-tight">{meal.name}</h3>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Flame className="size-3.5 text-primary" />
                  {meal.mealInfo?.calories} kcal · {meal.mealInfo?.protein}g proteína
                </li>
                <li>{meal.mealInfo?.tags[0]}</li>
                <li className="flex items-center gap-1.5">
                  <Timer className="size-3.5" />
                  {meal.mealInfo?.minutes} min
                </li>
              </ul>
              <p className="mt-1 font-bold text-primary">{formatMXN(meal.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
