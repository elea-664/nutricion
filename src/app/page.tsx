"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mail, MapPin, Store, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { ScrollProgress } from "@/components/scroll-progress";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CategoriesSection } from "@/components/categories-section";
import { SchoolsTeamsSection } from "@/components/schools-teams-section";
import { AthleteEndorsements } from "@/components/athlete-endorsements";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BrandTriangleDivider } from "@/components/brand-mark";
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

      <SiteHeader />

      {/* Hero — foto real a pantalla completa con degradado oscuro y título
          grande alineado a la izquierda. La foto hace un zoom lento conforme
          se hace scroll y el texto se desvanece antes de la siguiente sección. */}
      <section
        ref={heroRef}
        className="relative flex min-h-[70vh] items-end overflow-hidden bg-black"
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
        {/* Degradados para legibilidad: el izquierdo es más denso y se
            extiende más, así el texto siempre queda sobre fondo oscuro. */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 via-45% to-transparent" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-4 pt-24 pb-12 sm:pb-16"
        >
          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl font-display text-5xl leading-[0.95] font-black tracking-tight text-white uppercase sm:text-6xl lg:text-7xl"
          >
            Sports nutrition
            <br />
            selected for <span className="text-primary">performance</span>
          </motion.h1>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex max-w-xl flex-col gap-4 text-lg leading-relaxed font-medium text-white/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.6)]"
          >
            <p>
              Expert-selected sports nutrition backed by science, designed to meet the demands
              of training and competition across all sports. Trusted products to help athletes
              prepare, perform, and recover at their best.
            </p>
            <p>
              We also offer school-compliant products for students and tailored options for
              student-athletes, sports clubs, and organizations.
            </p>
          </motion.div>

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

      {/* Franja de cifras bajo el hero, en tarjeta como en el mockup; la
          sigue de inmediato "Shop by your goal" (mismo bloque visual). */}
      <section className="bg-background px-4 pt-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 rounded-xl border border-border bg-card sm:grid-cols-4 sm:divide-x sm:divide-border">
          {[
            { value: "1,500+", label: "Athletes" },
            { value: "50+", label: "Champions" },
            { value: "10+", label: "Years" },
            { value: "100+", label: "Products" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-5 text-center">
              <span className="font-display text-3xl font-extrabold tracking-tight text-primary tabular-nums sm:text-4xl">
                {stat.value}
              </span>
              <span className="text-xs font-bold tracking-[0.15em] text-white uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <CategoriesSection />

      <SchoolsTeamsSection />

      {/* Visita — banner bajo. La foto del estante ocupa la parte derecha
          (en escritorio) y se funde a negro hacia el texto, así se alcanzan
          a ver el logo ATHL8 y las cuatro categorías aunque se recorte. */}
      <section
        id="visit"
        className="relative flex items-center overflow-hidden border-t bg-black px-4 py-16 md:min-h-120"
      >
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
          <Image
            src="/images/store-shelf.jpg"
            alt="The ATHL8 product wall with Energy, Hydrate, Protein and Performance shelves"
            fill
            sizes="(max-width: 768px) 100vw, 62vw"
            className="object-cover object-[50%_35%]"
          />
        </div>
        {/* Móvil: velo parejo sobre toda la foto. Escritorio: solo el
            borde izquierdo de la foto se funde con el fondo negro. */}
        <div className="absolute inset-0 bg-black/70 md:hidden" />
        <div className="absolute inset-y-0 right-0 hidden w-[62%] bg-linear-to-r from-black via-black/0 via-25% to-transparent md:block" />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-4"
        >
          <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">
            Visit ATHL8
          </span>
          <h2 className="max-w-md font-display text-4xl leading-[0.95] font-black tracking-tight text-white uppercase sm:text-5xl">
            Explore Our Selection In Person
          </h2>
          <p className="max-w-sm text-base text-white/80 sm:text-lg">
            Find ATHL8 products at our retail location. Explore our selection of sports
            nutrition products to support your training, competition, and recovery.
          </p>
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
        <AthleteEndorsements />
      </ScrollReveal>

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

      <SiteFooter />
    </div>
  );
}
