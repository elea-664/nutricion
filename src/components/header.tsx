"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  RotateCcw,
  ShoppingCart,
  Store,
  Triangle,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-context";
import { toast } from "sonner";

const NAV = [
  { href: "/shop", label: "Online store", icon: Store },
  { href: "/plans", label: "Meal plans", icon: UtensilsCrossed },
  { href: "/account", label: "My plan", icon: CalendarDays },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
];

export function Header() {
  const pathname = usePathname();
  const { reset } = useStore();

  function handleReset() {
    reset();
    toast.success("Demo reset", {
      description: "Inventory, sales and movements are back to their initial state.",
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-lg font-extrabold tracking-widest uppercase"
        >
          <Triangle className="size-4 fill-primary text-primary" strokeWidth={0} />
          <span>THL8</span>
        </Link>

        <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} aria-label={label}>
                <Button
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  <span className="hidden md:inline">{label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
          <RotateCcw className="size-4" />
          Reset demo
        </Button>
      </div>
    </header>
  );
}
