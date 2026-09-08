"use client";

// La home ("/") es el sitio de la empresa: tiene su propia barra de
// navegación dentro del hero. El resto de rutas (Tienda/POS/Admin) son la
// app operativa y usan el header + ticker de stock en vivo. Este wrapper
// decide cuál mostrar según la ruta, sin duplicar el <StoreProvider>.

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Header } from "@/components/header";
import { StockTicker } from "@/components/stock-ticker";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
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
