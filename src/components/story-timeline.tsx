"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Milestone {
  year: string;
  emoji: string;
  title: string;
  description: string;
}

const MILESTONES: Milestone[] = [
  {
    year: "2019",
    emoji: "💡",
    title: "The idea is born",
    description:
      'Two coaches, tired of the gym counter saying "in stock" while the online store said "sold out", sketch the first diagram on a napkin.',
  },
  {
    year: "2020",
    emoji: "🧪",
    title: "First pilot",
    description:
      "We tested the idea in a single gym: one register and a simple online store sharing the same inventory. It worked better than expected.",
  },
  {
    year: "2022",
    emoji: "🔗",
    title: "One single inventory",
    description:
      "We built the single-source-of-truth engine: every sale, from any channel, comes out of the same stock instantly.",
  },
  {
    year: "2024",
    emoji: "🤝",
    title: "Partnerships",
    description:
      "Gyms, boxes and nutrition shops across the city start running on the same inventory brain.",
  },
  {
    year: "2026",
    emoji: "🚀",
    title: "Today",
    description:
      "We keep building: the same product you see in this demo, ready to scale to more channels and locations.",
  },
];

// Línea vertical que se "llena" conforme se hace scroll por la sección,
// con cada hito apareciendo de forma independiente al entrar en vista.
export function StoryTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.4"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative mx-auto max-w-2xl">
      <div className="absolute top-2 bottom-2 left-[15px] w-px bg-border" aria-hidden />
      <motion.div
        style={{ height: lineHeight }}
        className="absolute top-2 left-[15px] w-px bg-primary"
        aria-hidden
      />

      <div className="flex flex-col gap-10">
        {MILESTONES.map((m, i) => (
          <motion.div
            key={m.year}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="relative flex gap-5"
          >
            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-base shadow-sm">
              <span aria-hidden>{m.emoji}</span>
            </div>
            <div className="pb-1">
              <p className="text-sm font-bold text-primary">{m.year}</p>
              <h3 className="text-lg font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
