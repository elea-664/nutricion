"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

import { ProductPhoto } from "@/components/product-photo";

// Ease-in cúbico a mano (framer-motion no reexporta el suyo desde el
// paquete principal): arranca lento y acelera hacia el final, para que
// el mismo tramo de scroll "cueste más" al principio de cada tarjeta y
// se sienta rápido justo cuando está a punto de terminar de aparecer.
const easeIn = (t: number) => t * t * t;

interface CategoryCard {
  /** Nombre de la categoría tal como existe en el catálogo (filtro de /shop). */
  category: string;
  title: string;
  description: string;
  emoji: string;
  query: string;
}

// Copy oficial de ATHL8 para las cuatro categorías del catálogo.
const CATEGORIES: CategoryCard[] = [
  {
    category: "Energy",
    title: "Fuel for every effort",
    description:
      "Carbs help sustain physical activity, especially during intense or prolonged sessions. Our selection offers snacks, gels, and other energy sources for different stages of training and competition, giving you practical ways to fuel before you start and maintain your pace while you train or compete.",
    emoji: "⚡",
    query: "runner energy gel endurance",
  },
  {
    category: "Hydrate",
    title: "Hydration that keeps up with your training",
    description:
      "Exercise and heat increase the amount of fluid and sodium lost through sweat. Our selection brings together drinks and electrolytes in different formulations to meet hydration demands across sports, conditions, and training durations.",
    emoji: "💧",
    query: "athlete drinking water bottle",
  },
  {
    category: "Protein",
    title: "Recovery that supports progress",
    description:
      "Protein provides the amino acids your muscles need to repair and adapt after exercise. Our selection offers practical ways to add protein to your diet, whether after a training session, between workouts, or on competition day.",
    emoji: "💪",
    query: "protein shake gym recovery",
  },
  {
    category: "Performance",
    title: "Support for strength, endurance, and recovery",
    description:
      "Not all supplements have the same level of scientific evidence or serve the same purpose. Our selection is focused on ingredients and products with specific uses in sport to support the demands of strength, high-intensity training, endurance, and competition.",
    emoji: "🏋️",
    query: "athlete strength training gym",
  },
];

function CardInner({ item }: { item: CategoryCard }) {
  return (
    <>
      <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
        {item.category}
      </span>
      <h3 className="text-xl font-bold text-white">{item.title}</h3>
      <p className="text-sm leading-relaxed text-white/75">{item.description}</p>
      <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/50 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase transition-colors group-hover:border-white group-hover:bg-white group-hover:text-black">
        Shop {item.category}
        <ArrowRight className="size-3.5" />
      </span>
    </>
  );
}

function CardShell({ item, children }: { item: CategoryCard; children: ReactNode }) {
  return (
    <Link
      href={`/shop?category=${encodeURIComponent(item.category)}`}
      className="group relative flex h-full min-h-112 flex-col justify-end overflow-hidden rounded-2xl border border-border"
    >
      <ProductPhoto
        query={item.query}
        category={item.category}
        emoji={item.emoji}
        emojiClassName="text-7xl"
        className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/10" />
      {children}
    </Link>
  );
}

// Animación en dos tiempos atada al scroll de la sección: primero la
// tarjeta sube y aparece despacio (curva ease-in); ya casi colocada, el
// texto de adentro se asienta en una ráfaga corta. Cada tarjeta arranca
// un poco después que la anterior (stagger) dentro del mismo scroll.
function AnimatedCard({
  item,
  index,
  progress,
}: {
  item: CategoryCard;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index * 0.1;
  const cardY = useTransform(progress, [start, start + 0.55], [110, 0], { ease: easeIn });
  const cardOpacity = useTransform(progress, [start, start + 0.55], [0, 1], { ease: easeIn });
  const infoY = useTransform(progress, [start + 0.42, start + 0.6], [14, 0]);
  const infoOpacity = useTransform(progress, [start + 0.42, start + 0.6], [0, 1]);

  return (
    <motion.div style={{ y: cardY, opacity: cardOpacity }} className="h-full">
      <CardShell item={item}>
        <motion.div
          style={{ y: infoY, opacity: infoOpacity }}
          className="relative flex flex-col gap-2 p-5"
        >
          <CardInner item={item} />
        </motion.div>
      </CardShell>
    </motion.div>
  );
}

// Las cuatro categorías de ATHL8 como tarjetas grandes que enlazan
// directo a /shop ya filtrado. Usa el mismo mecanismo de fotos (Pexels +
// fallback a emoji) que el catálogo, así que no rompe sin API key.
export function CategoriesSection() {
  // El ref va en la sección completa para que el progreso 1 caiga justo
  // cuando su borde superior llega arriba de la pantalla.
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });

  return (
    <section
      id="categories"
      ref={sectionRef}
      className="flex min-h-[calc(100vh-4rem)] flex-col justify-center border-t border-border bg-background px-4 py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-12 max-w-2xl text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">
          Shop by category
        </h2>
        <p className="mt-3 text-muted-foreground">
          Fueling, hydration, recovery, and performance — all in one place.
        </p>
      </motion.div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((item, i) =>
          shouldReduceMotion ? (
            <CardShell key={item.category} item={item}>
              <div className="relative flex flex-col gap-2 p-5">
                <CardInner item={item} />
              </div>
            </CardShell>
          ) : (
            <AnimatedCard
              key={item.category}
              item={item}
              index={i}
              progress={scrollYProgress}
            />
          )
        )}
      </div>
    </section>
  );
}
