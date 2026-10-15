"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  LayoutDashboard,
  Mail,
  MapPin,
  RotateCcw,
  ShoppingCart,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/lib/store-context";
import { ScrollProgress } from "@/components/scroll-progress";
import { StoryTimeline } from "@/components/story-timeline";
import { PartnerMarquee } from "@/components/partner-marquee";
import { MealsShowcase } from "@/components/meals-showcase";
import { HowItWorks } from "@/components/how-it-works";
import { CategoriesSection } from "@/components/categories-section";
import { PlanCta } from "@/components/plan-cta";
import { AthleteEndorsements } from "@/components/athlete-endorsements";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AthleteSplit } from "@/components/athlete-split";
import { BrandMark, BrandTriangleDivider } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const ADDRESS = "1455 S Stapley Dr #13, Mesa, AZ 85204";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;
const EMAIL = "hello@athl8nutrition.com";

const contactSchema = z.object({
  nombre: z.string().min(2, "Enter a name"),
  correo: z.email("Invalid email"),
  mensaje: z.string().min(10, "Tell us a bit more (min. 10 characters)"),
});
type ContactFormValues = z.infer<typeof contactSchema>;

export default function HomePage() {
  const { state, reset } = useStore();
  const categoryCount = new Set(
    state.products.filter((p) => p.category !== "Meals").map((p) => p.category)
  ).size;

  // El hero ocupa la primera pantalla completa; conforme se hace scroll
  // dentro de él, el texto se desvanece y baja ligeramente antes de que
  // aparezca la siguiente sección — así nunca se asoma nada de golpe.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(heroProgress, [0, 0.5], [0, 60]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.12]);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { nombre: "", correo: "", mensaje: "" },
  });

  function onSubmitContact(values: ContactFormValues) {
    toast.success("Message sent (demo)", {
      description: `Thanks ${values.nombre}, we'll get back to you at ${values.correo}.`,
    });
    form.reset();
  }

  return (
    <div className="dark relative bg-background text-foreground">
      <ScrollProgress />

      {/* Nav propio del sitio de la empresa */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <BrandMark compact />
          <nav className="hidden items-center gap-1 rounded-lg bg-muted p-1 sm:flex">
            <Link href="/shop">
              <Button variant="ghost" size="sm" className="gap-2">
                <Store className="size-4" />
                Shop
              </Button>
            </Link>
            <Link href="/plans">
              <Button variant="ghost" size="sm" className="gap-2">
                <UtensilsCrossed className="size-4" />
                Meal plans
              </Button>
            </Link>
            <Link href="/pos">
              <Button variant="ghost" size="sm" className="gap-2">
                <ShoppingCart className="size-4" />
                POS
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutDashboard className="size-4" />
                Admin
              </Button>
            </Link>
          </nav>
          <Link href="/shop">
            <Button size="sm" className="gap-2">
              Shop now
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero — foto real a pantalla completa con degradado oscuro y título
          grande alineado a la izquierda. La foto hace un zoom lento conforme
          se hace scroll y el texto se desvanece antes de la siguiente sección. */}
      <section
        ref={heroRef}
        className="relative flex min-h-[calc(100vh-4rem)] items-end overflow-hidden bg-black"
      >
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <Image
            src="/images/hero-striking.jpg"
            alt="Fighter throwing a punch into a coach's focus mitts at the gym"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[60%_35%]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/20 to-transparent" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 pt-32 pb-16 sm:pb-24"
        >
          <motion.span
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-semibold tracking-wide text-white backdrop-blur-sm"
          >
            <MapPin className="size-3.5" />
            Mesa, Arizona
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-5xl leading-[0.9] font-extrabold tracking-tight text-white uppercase sm:text-7xl lg:text-8xl"
          >
            Sports nutrition
            <br />
            selected for <span className="text-primary">performance</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl text-lg text-white/80"
          >
            ATHL8 brings together sports nutrition for fueling, hydration, recovery, and
            performance. Every product is selected with professional expertise and backed by
            current sports nutrition research, so athletes across different sports can find
            trusted options that fit the demands of training and competition, all in one place.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Link href="/shop">
              <Button size="lg" className="gap-2">
                <Store className="size-4" />
                Shop now
              </Button>
            </Link>
            <Link href="/plans">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/40 bg-white/5 text-white hover:bg-white hover:text-black"
              >
                <UtensilsCrossed className="size-4" />
                Get a meal plan
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Franja de cifras bajo el hero */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-border px-4 sm:grid-cols-4 sm:divide-x">
          {[
            { value: String(categoryCount), label: "Categories" },
            { value: String(state.products.length), label: "Products" },
            { value: "2", label: "Online + in-store" },
            { value: "1", label: "Store in Mesa, AZ" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-8 text-center">
              <span className="text-4xl font-extrabold tracking-tight text-primary tabular-nums sm:text-5xl">
                {stat.value}
              </span>
              <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <AthleteSplit />

      <ScrollReveal>
        <CategoriesSection />
      </ScrollReveal>

      {/* Frase de cierre */}
      <ScrollReveal>
        <section className="border-t px-4 py-28">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
            <BrandTriangleDivider />
            <p className="text-3xl font-extrabold tracking-tight uppercase sm:text-5xl">
              Different sports. Different demands.
              <br />
              <span className="text-primary">Products selected to meet them.</span>
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      <ScrollReveal>
        <MealsShowcase />
      </ScrollReveal>

      <ScrollReveal>
        <PlanCta />
      </ScrollReveal>

      <ScrollReveal>
        <AthleteEndorsements />
      </ScrollReveal>

      {/* Historia */}
      <ScrollReveal>
        <section className="border-t bg-muted/20 px-4 py-24">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">Our story</h2>
            <p className="mt-3 text-muted-foreground">
              From a napkin sketch to a single inventory brain for all of our sales channels.
            </p>
          </div>

          <StoryTimeline />
        </section>
      </ScrollReveal>

      {/* Empresas / aliados */}
      <ScrollReveal>
        <section className="border-t px-4 py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">
              Gyms and stores that trust us
            </h2>
            <p className="mt-3 text-muted-foreground">
              We support fitness and nutrition brands across the city with the same inventory
              engine you see in this demo.
            </p>
          </div>

          <PartnerMarquee />
        </section>
      </ScrollReveal>

      {/* Visita — foto real del estante ATHL8 a pantalla completa */}
      <section
        id="visit"
        className="relative flex min-h-[80vh] scroll-mt-16 items-center overflow-hidden border-t bg-black px-4 py-24"
      >
        <Image
          src="/images/store-shelf.jpg"
          alt="The ATHL8 product wall with Energy, Hydrate, Protein and Performance shelves"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/65 to-black/20" />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-5"
        >
          <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
            Visit ATHL8
          </span>
          <h2 className="max-w-2xl text-4xl leading-[0.95] font-extrabold tracking-tight text-white uppercase sm:text-6xl">
            Find our selection in store
          </h2>
          <p className="flex items-center gap-2 text-lg text-white/85">
            <MapPin className="size-5 shrink-0 text-primary" />
            {ADDRESS}
          </p>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              Get directions
              <ArrowRight className="size-4" />
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Contacto */}
      <ScrollReveal>
        <section className="border-t bg-muted/20 px-4 py-24">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div id="contact" className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border bg-card p-8">
                <Mail className="size-7 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight uppercase">Get in touch</h2>
                <p className="text-muted-foreground">
                  Interested in ATHL8 or have an idea you&apos;d like to discuss? Email us at
                </p>
                <p className="text-lg font-semibold break-all">{EMAIL}</p>
                <a href={`mailto:${EMAIL}`} className="mt-auto">
                  <Button className="gap-2">
                    Email us
                    <ArrowRight className="size-4" />
                  </Button>
                </a>
              </div>
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmitContact)}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-8"
            >
              <h2 className="text-2xl font-bold tracking-tight uppercase">Send us a message</h2>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact-nombre">Name</Label>
                <Input id="contact-nombre" {...form.register("nombre")} />
                {form.formState.errors.nombre && (
                  <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact-correo">Email</Label>
                <Input id="contact-correo" type="email" {...form.register("correo")} />
                {form.formState.errors.correo && (
                  <p className="text-xs text-destructive">{form.formState.errors.correo.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact-mensaje">Message</Label>
                <Textarea id="contact-mensaje" rows={5} {...form.register("mensaje")} />
                {form.formState.errors.mensaje && (
                  <p className="text-xs text-destructive">{form.formState.errors.mensaje.message}</p>
                )}
              </div>
              <Button type="submit" className="mt-1 gap-2">
                Send message
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo without a backend — the message isn&apos;t sent anywhere.
              </p>
            </form>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandMark compact />
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/shop" className="hover:text-foreground">
              Shop
            </Link>
            <Link href="/plans" className="hover:text-foreground">
              Meal plans
            </Link>
            <Link href="/pos" className="hover:text-foreground">
              POS
            </Link>
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            <button
              type="button"
              onClick={() => {
                reset();
                toast.success("Demo reset");
              }}
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Reset demo
            </button>
          </nav>
          <p className="text-sm text-muted-foreground">© 2026 ATHL8 — demo project</p>
        </div>
      </footer>
    </div>
  );
}
