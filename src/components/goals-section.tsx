"use client";

import Link from "next/link";
import { useRef } from "react";
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

function GoalCardBody({ goal }: { goal: Goal }) {
  return (
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
  );
}

// Animación en dos tiempos, atada al scroll de la cuadrícula completa (no
// a un trigger por tarjeta): primero la tarjeta/imagen "sube" y se asoma
// muy despacio; una vez que ya está prácticamente colocada, el título y
// el botón de adentro se terminan de asentar encima en una ráfaga corta
// y rápida. La curva ease-in acentúa ese contraste de velocidad: al
// principio del tramo de scroll casi no se nota movimiento, y hacia el
// final avanza de golpe. Cada tarjeta arranca un poco después que la
// anterior (stagger) dentro del mismo scroll.
function GoalCard({
  goal,
  index,
  progress,
}: {
  goal: Goal;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index * 0.15;
  const cardY = useTransform(progress, [start, start + 0.55], [110, 0], { ease: easeIn });
  const cardOpacity = useTransform(progress, [start, start + 0.55], [0, 1], { ease: easeIn });
  // Ventana angosta y hacia el final del tramo de la tarjeta: el
  // texto se siente "rápido" porque le toca poco recorrido de scroll.
  const infoY = useTransform(progress, [start + 0.42, start + 0.6], [14, 0]);
  const infoOpacity = useTransform(progress, [start + 0.42, start + 0.6], [0, 1]);

  return (
    <motion.div style={{ y: cardY, opacity: cardOpacity }}>
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
        <motion.div
          style={{ y: infoY, opacity: infoOpacity }}
          className="relative flex flex-col gap-2 p-5"
        >
          <h3 className="text-xl font-bold text-white uppercase">{goal.title}</h3>
          <p className="text-sm text-white/75">{goal.description}</p>
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/50 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase transition-colors group-hover:border-white group-hover:bg-white group-hover:text-black">
            Ver productos
            <ArrowRight className="size-3.5" />
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Sección inspirada en el patrón "¿Cuáles son tus objetivos?" que suele
// verse en la competencia (p. ej. Athletes Nutrition): tarjetas grandes
// por objetivo que enlazan directo a una categoría ya filtrada en
// /tienda. Reutiliza el mismo mecanismo de fotos (Pexels + fallback a
// emoji) que ya usa el catálogo, así que no rompe si no hay API key.
//
// Ocupa exactamente la misma altura que el Hero (100vh menos el header
// sticky, contenido centrado) — antes usaba min-h-screen a secas, que
// no descuenta el header, así que las "pantallas" no medían lo mismo.
export function GoalsSection() {
  // El ref va en la SECCIÓN completa, no en la cuadrícula: si se ata a la
  // cuadrícula, su progreso 0→1 depende de cuánto texto/margen haya arriba
  // (el título "¿Cuál es tu objetivo?"), así que no coincide con el
  // momento exacto en que la sección "llegó" al tope de la pantalla — el
  // reveal se veía incompleto todavía cuando ya estabas viendo la
  // sección. Midiendo desde la sección misma, progreso 1 cae justo ahí.
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Exactamente una altura de pantalla de scroll: arranca cuando la
    // sección apenas asoma al pie del viewport (0) y termina cuando su
    // borde superior llega arriba del todo (1). Así el reveal siempre
    // termina dentro de esta pantalla, nunca después de que el usuario
    // ya se movió a la siguiente.
    offset: ["start end", "start start"],
  });

  return (
    <section
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
          ¿Cuál es tu objetivo?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Elige una meta y te llevamos directo a los productos del catálogo que le sirven.
        </p>
      </motion.div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 sm:grid-cols-3">
        {GOALS.map((goal, i) =>
          shouldReduceMotion ? (
            <GoalCardBody key={goal.title} goal={goal} />
          ) : (
            <GoalCard key={goal.title} goal={goal} index={i} progress={scrollYProgress} />
          )
        )}
      </div>
    </section>
  );
}
