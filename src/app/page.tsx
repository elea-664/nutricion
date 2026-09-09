"use client";

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
  Phone,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/lib/store-context";
import { ScrollProgress } from "@/components/scroll-progress";
import { StoryTimeline } from "@/components/story-timeline";
import { PartnerMarquee } from "@/components/partner-marquee";
import { MealsShowcase } from "@/components/meals-showcase";
import { RingStat } from "@/components/ring-stat";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const contactSchema = z.object({
  nombre: z.string().min(2, "Ingresa un nombre"),
  correo: z.email("Correo inválido"),
  mensaje: z.string().min(10, "Cuéntanos un poco más (mín. 10 caracteres)"),
});
type ContactFormValues = z.infer<typeof contactSchema>;

export default function HomePage() {
  const { state, reset } = useStore();

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

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { nombre: "", correo: "", mensaje: "" },
  });

  function onSubmitContact(values: ContactFormValues) {
    toast.success("Mensaje enviado (demo)", {
      description: `Gracias ${values.nombre}, te contactaremos a ${values.correo}.`,
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
            <Link href="/tienda">
              <Button variant="ghost" size="sm" className="gap-2">
                <Store className="size-4" />
                Tienda
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
          <Link href="/tienda">
            <Button size="sm" className="gap-2">
              Entrar a la tienda
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero — pantalla completa; nada de la siguiente sección se asoma
          hasta que se hace scroll. Fondo oscuro con textura de chevrones y
          un resplandor verde, en la línea del empaque de referencia. */}
      <section
        ref={heroRef}
        className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-background"
      >
        <div className="chevron-texture absolute inset-0 -z-20" />
        <div
          className="absolute top-1/2 left-1/2 -z-10 h-144 w-144 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]"
          aria-hidden
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-24 left-[8%] text-6xl opacity-70 sm:text-7xl"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          🥤
        </motion.span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-40 right-[10%] text-5xl opacity-70 sm:text-6xl"
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          🏋️
        </motion.span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-16 left-[18%] text-5xl opacity-60 sm:text-6xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          🍫
        </motion.span>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center"
        >
          <motion.span
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-semibold tracking-wide text-primary"
          >
            <Sparkles className="size-3.5" />
            Un mismo inventario, dos canales
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight uppercase sm:text-6xl"
          >
            Nutrición y fuerza,
            <br />
            <span className="text-primary">sin fricción</span> entre canales.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl text-lg text-muted-foreground"
          >
            NutriDemo vende suplementos y nutrición deportiva en tienda en línea y en
            mostrador físico — con un solo inventario detrás de los dos. Vende en un canal
            y el stock del otro baja al instante.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Link href="/tienda">
              <Button size="lg" className="gap-2">
                <Store className="size-4" />
                Ir a la tienda
              </Button>
            </Link>
            <Link href="/pos">
              <Button size="lg" variant="outline" className="gap-2">
                <ShoppingCart className="size-4" />
                Abrir el POS
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="gap-2">
                <LayoutDashboard className="size-4" />
                Panel admin
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-10"
          >
            <RingStat value={String(state.products.length)} label="Productos" percent={80} delay={0} />
            <RingStat value="1" label="Inventario" percent={100} delay={0.15} />
            <RingStat value="2" label="Canales" percent={55} delay={0.3} />
          </motion.div>
        </motion.div>
      </section>

      <MealsShowcase />

      {/* Historia */}
      <section className="border-t bg-muted/20 px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">Nuestra historia</h2>
          <p className="mt-3 text-muted-foreground">
            De una servilleta garabateada a un solo cerebro de inventario para todos
            nuestros canales de venta.
          </p>
        </motion.div>

        <StoryTimeline />
      </section>

      {/* Empresas / aliados */}
      <section className="border-t px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">
            Gimnasios y tiendas que confían en nosotros
          </h2>
          <p className="mt-3 text-muted-foreground">
            Asistimos a marcas de fitness y nutrición de toda la ciudad con el mismo
            motor de inventario que ves en esta demo.
          </p>
        </motion.div>

        <PartnerMarquee />
      </section>

      {/* Contacto */}
      <section className="border-t bg-muted/20 px-4 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl">Contacto</h2>
          <p className="mt-3 text-muted-foreground">
            ¿Quieres llevar NutriDemo a tu gimnasio o tienda? Escríbenos.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Mail className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Correo</p>
                <p className="text-sm text-muted-foreground">hola@nutridemo.mx</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <Phone className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Teléfono</p>
                <p className="text-sm text-muted-foreground">+52 55 0000 0000</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <MapPin className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Oficina</p>
                <p className="text-sm text-muted-foreground">Ciudad de México, México</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmitContact)}
            className="flex flex-col gap-3 rounded-xl border bg-card p-5"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-nombre">Nombre</Label>
              <Input id="contact-nombre" {...form.register("nombre")} />
              {form.formState.errors.nombre && (
                <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-correo">Correo</Label>
              <Input id="contact-correo" type="email" {...form.register("correo")} />
              {form.formState.errors.correo && (
                <p className="text-xs text-destructive">{form.formState.errors.correo.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact-mensaje">Mensaje</Label>
              <Textarea id="contact-mensaje" rows={3} {...form.register("mensaje")} />
              {form.formState.errors.mensaje && (
                <p className="text-xs text-destructive">{form.formState.errors.mensaje.message}</p>
              )}
            </div>
            <Button type="submit" className="mt-1 gap-2">
              Enviar mensaje
              <ArrowRight className="size-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo sin backend — el mensaje no se envía a ningún lado.
            </p>
          </form>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandMark compact />
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/tienda" className="hover:text-foreground">
              Tienda
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
                toast.success("Demo reiniciado");
              }}
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Reiniciar demo
            </button>
          </nav>
          <p className="text-sm text-muted-foreground">© 2026 NutriDemo — proyecto demo</p>
        </div>
      </footer>
    </div>
  );
}
