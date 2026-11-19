"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CategoryCard {
  /** Nombre de la categorÃ­a tal como existe en el catÃ¡logo (filtro de /shop). */
  category: string;
  description: string;
  image: { src: string; alt: string };
}

// Copy oficial (resumido) de ATHL8 para las cuatro categorÃ­as. Las fotos
// son de Pexels (sin marcas), descargadas a /public/images para que no
// dependan de la API ni cambien solas:
//   energy      â€” Victor Freitas   https://www.pexels.com/photo/2261481/
//   hydrate     â€” Ron Lach         https://www.pexels.com/photo/8736751/
//   protein     â€” Samer Daboul     https://www.pexels.com/photo/1212845/
//   performance â€” RDNE Stock proj. https://www.pexels.com/photo/8611295/
const CATEGORIES: CategoryCard[] = [
  {
    category: "Energy",
    description:
      "Stay fueled before and during training or competition. Explore energy snacks, gels, and carbs to keep you going.",
    image: { src: "/images/goal-energy.jpg", alt: "Loaded barbell resting on a dark gym floor" },
  },
  {
    category: "Hydrate",
    description:
      "Replace fluids and electrolytes lost through sweat. Explore hydration options for every workout, sport, and condition.",
    image: { src: "/images/goal-hydrate.jpg", alt: "Water bottle on the floor of a boxing gym" },
  },
  {
    category: "Protein",
    description:
      "Support muscle repair, growth, and recovery with convenient protein options for training and everyday needs.",
    image: { src: "/images/goal-protein.jpg", alt: "Spoonful of protein powder over an open tub" },
  },
  {
    category: "Performance",
    description:
      "Targeted ingredients that work alongside your training and nutrition to support strength, endurance, and recovery.",
    image: { src: "/images/goal-performance.jpg", alt: "Row of kettlebells on a gym floor" },
  },
];

// "Shop by your goal": foto limpia arriba y nombre + descripciÃ³n abajo,
// cada tarjeta enlaza a /shop ya filtrado. Va pegada a la franja de
// cifras bajo el hero, asÃ­ que se anima al entrar en viewport (no atada
// al scroll) para que no arranque a medio aparecer si ya estÃ¡ a la vista.
export function CategoriesSection() {
  return (
    <section id="products" className="scroll-mt-16 bg-background px-4 pt-12 pb-24">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-6 font-display text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
          Shop by your <span className="text-primary">goal</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((item, i) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="h-full"
            >
              <Link
                href={`/shop?category=${encodeURIComponent(item.category)}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="flex items-center justify-between gap-2 font-display text-xl font-extrabold tracking-tight uppercase">
                    {item.category}
                    <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
