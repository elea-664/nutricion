"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Pack {
  name: string;
  description: string;
  image: { src: string; alt: string };
}

// Copy oficial de ATHL8. Fotos de Pexels elegidas por parecido con las
// referencias del cliente, descargadas a /public/images:
//   school — Yan Krukau    https://www.pexels.com/photo/8617507/
//   team   — Laura Rincón  https://www.pexels.com/photo/17922532/
const PACKS: Pack[] = [
  {
    name: "School & Party Packs",
    description:
      "School-compliant products and convenient snack options for classroom celebrations, school activities, and everyday needs.",
    image: {
      src: "/images/pack-school.jpg",
      alt: "Two girls smiling while eating snacks during break time at school",
    },
  },
  {
    name: "Team & Tournament Packs",
    description:
      "Fueling, hydration, recovery and performance products for athletes and sports clubs, from training sessions to competitions.",
    image: {
      src: "/images/pack-team.jpg",
      alt: "Smiling girls in soccer uniforms with their team",
    },
  },
];

export function SchoolsTeamsSection() {
  return (
    <section id="schools-teams" className="scroll-mt-16 border-t border-border bg-muted/20 px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-12 max-w-3xl text-center"
      >
        {/* Jerarquía pedida por ATHL8: el nombre de la sección es el
            título grande; la frase va chica y la descripción destacada. */}
        <h2 className="font-display text-4xl leading-[0.95] font-black tracking-tight uppercase sm:text-5xl">
          Schools, Teams &amp; <span className="text-primary">Organizations</span>
        </h2>
        <p className="mt-4 text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase">
          Practical solutions for every need
        </p>
        <p className="mt-5 text-lg leading-relaxed font-medium text-foreground sm:text-xl">
          ATHL8 offers NSLP-compliant products and USDA Smart Snacks for schools, along with
          products to meet the needs of student-athletes, sports clubs, and organizations.
        </p>
      </motion.div>

      {/* Mismo patrón que "Shop by your goal": foto limpia arriba y nombre
          + descripción abajo, sobre fondo sólido para que se lea bien. */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
        {PACKS.map((pack, i) => (
          <motion.div
            key={pack.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-video w-full">
              <Image
                src={pack.image.src}
                alt={pack.image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 p-6">
              <h3 className="font-display text-xl font-extrabold tracking-tight uppercase">
                {pack.name}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{pack.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.16 }}
        className="mx-auto mt-10 flex max-w-5xl flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center"
      >
        <h3 className="text-2xl font-bold tracking-tight uppercase">
          Interested in Our Products?
        </h3>
        <p className="max-w-md text-muted-foreground">
          Tell us what you&apos;re looking for, and we&apos;ll help you explore the available
          options.
        </p>
        <a href="#contact">
          <Button className="gap-2">
            Get in touch
            <ArrowRight className="size-4" />
          </Button>
        </a>
      </motion.div>
    </section>
  );
}
