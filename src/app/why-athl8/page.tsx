import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AthleteSplit } from "@/components/athlete-split";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why ATHL8 — Sports nutrition selected for performance",
  description:
    "Sports nutrition selected by professionals and backed by current research, for athletes across every discipline.",
};

// Página "Why ATHL8": los bloques foto/texto (Built for athletes /
// Selected by professionals) que antes vivían en la home.
export default function WhyAthl8Page() {
  return (
    <div className="dark relative bg-background text-foreground">
      <SiteHeader />

      <section className="px-4 pt-20 pb-4">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-5xl font-black tracking-tight uppercase sm:text-6xl">
            Why <span className="text-primary">ATHL8</span>
          </h1>
        </div>
      </section>

      <AthleteSplit />

      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            Have questions?
          </h2>
          <p className="text-lg text-muted-foreground">
            Tell us about your sport and goals, and we&apos;ll help you find the right options.
          </p>
          <Link href="/#contact">
            <Button size="lg" className="gap-2">
              Get in touch
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
