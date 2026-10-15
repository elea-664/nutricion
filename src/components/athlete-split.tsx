"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Panel {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  image: { src: string; alt: string; width: number; height: number };
  /** Foto a la derecha en escritorio. */
  reverse?: boolean;
}

// Fotos reales de ATHL8 (entrenamiento y estante en Mesa, AZ).
const PANELS: Panel[] = [
  {
    eyebrow: "Built for athletes",
    title: "Fuel for the work you put in",
    body: "From the mat to the cage to the road, every discipline asks something different of your body. ATHL8 brings together fueling, hydration, recovery, and performance so you can find what fits your training and competition — all in one place.",
    cta: { label: "Shop the selection", href: "/shop" },
    image: {
      src: "/images/training-bjj.jpg",
      alt: "Athletes drilling jiu-jitsu on the mat while a coach watches",
      width: 1800,
      height: 1200,
    },
  },
  {
    eyebrow: "Selected by professionals",
    title: "Backed by current research",
    body: "Every product on our shelf is selected with professional expertise and backed by current sports nutrition research. Not every supplement has the same evidence or purpose — we focus on the ones with specific uses in sport.",
    cta: { label: "Explore Performance", href: "/shop?category=Performance" },
    image: {
      src: "/images/expert-portrait.jpg",
      alt: "ATHL8 team member standing in front of the ATHL8 product wall",
      width: 1200,
      height: 1800,
    },
    reverse: true,
  },
];

function SplitPanel({ panel }: { panel: Panel }) {
  const ref = useRef<HTMLDivElement>(null);
  // Parallax suave: la foto se desplaza un poco más lento que el scroll.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const portrait = panel.image.height > panel.image.width;

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14",
        panel.reverse && "md:[&>*:first-child]:order-2"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          portrait ? "aspect-4/5 md:aspect-3/4" : "aspect-4/3 md:aspect-4/5"
        )}
      >
        <motion.div style={{ y: imageY }} className="absolute -inset-y-[8%] inset-x-0">
          <Image
            src={panel.image.src}
            alt={panel.image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-start gap-4"
      >
        <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
          {panel.eyebrow}
        </span>
        <h2 className="text-4xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-5xl">
          {panel.title}
        </h2>
        <p className="max-w-md text-lg text-muted-foreground">{panel.body}</p>
        <Link href={panel.cta.href} className="mt-2">
          <Button size="lg" variant="outline" className="gap-2">
            {panel.cta.label}
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

// Bloques foto/texto alternados a sangre, al estilo de las landings de
// nutrición para atletas de combate.
export function AthleteSplit() {
  return (
    <section className="border-t border-border bg-background px-4 py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-24">
        {PANELS.map((panel) => (
          <SplitPanel key={panel.title} panel={panel} />
        ))}
      </div>
    </section>
  );
}
