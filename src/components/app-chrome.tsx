"use client";

// Las páginas del sitio de la empresa ("/" y "/why-athl8") traen su propia
// barra de navegación (SiteHeader). El resto de rutas (Shop/POS/Admin) son
// la app operativa y usan el header + ticker de stock en vivo. Este wrapper
// decide cuál mostrar según la ruta, sin duplicar el <StoreProvider>.

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Header } from "@/components/header";
import { StockTicker } from "@/components/stock-ticker";

const SITE_ROUTES = ["/", "/why-athl8"];

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (SITE_ROUTES.includes(pathname)) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <StockTicker />
      <main className="flex-1">{children}</main>
    </>
  );
}
