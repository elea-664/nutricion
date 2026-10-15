"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Microwave, UtensilsCrossed } from "lucide-react";

import { PLAN_OPTIONS } from "@/lib/plans";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Choose your plan",
    description: "Pick your goals and how many meals you want each week.",
  },
  {
    icon: UtensilsCrossed,
    title: "Pick your meals",
    description: "Select from our weekly menu and add ATHL8 essentials to your box.",
  },
  {
    icon: Microwave,
    title: "Heat & eat",
    description: "Fresh, never frozen. Ready in minutes — skip or cancel anytime.",
  },
];

const lowestPrice = Math.min(...PLAN_OPTIONS.map((p) => p.pricePerMeal));

// Flujo de suscripción en 3 pasos, al estilo de los servicios de comidas
// preparadas por semana. Lleva al asistente /plans.
export function HowItWorks() {
  return (
    <section className="border-t border-border bg-background px-4 py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">
          Weekly meal plans
        </h2>
        <p className="mt-3 text-muted-foreground">
          Chef-prepared, macro-balanced meals delivered to your door. From{" "}
          <span className="font-semibold text-foreground">{formatMoney(lowestPrice)}/meal</span>.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
                <step.icon className="size-5" />
              </span>
              <span className="text-sm font-bold text-muted-foreground">Step {i + 1}</span>
            </div>
            <h3 className="text-lg font-bold uppercase">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/plans">
          <Button size="lg" className="gap-2">
            Get started
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
