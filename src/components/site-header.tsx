"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, GraduationCap, Home, LayoutGrid, Mail, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Nav del sitio de la empresa (marketing). Products / Schools & Teams /
// Contact son anclas dentro de la home ("/#..."), así que funcionan igual
// desde la home que desde otras páginas del sitio como /why-athl8.
// Shop/Meal plans/POS/Admin (el demo funcional) no viven aquí; siguen
// accesibles desde el "Shop now" del hero y el footer.
const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/#products", label: "Products", icon: LayoutGrid },
  { href: "/#schools-teams", label: "Schools & Teams", icon: GraduationCap },
  { href: "/why-athl8", label: "Why ATHL8", icon: ShieldCheck },
  { href: "/#contact", label: "Contact", icon: Mail },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      id="top"
      className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <BrandMark compact />
        <nav className="hidden items-center gap-1 rounded-lg bg-muted p-1 lg:flex">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={(e) => {
                // "Home" estando ya en la home: subir suave en vez de recargar.
                if (href === "/" && pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn("gap-2", pathname === href && href !== "/" && "bg-background")}
              >
                <Icon className="size-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
        <Link href="/#contact">
          <Button size="sm" className="gap-2">
            Get in touch
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
