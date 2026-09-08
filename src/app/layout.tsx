import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";
import { AppChrome } from "@/components/app-chrome";
import { Toaster } from "@/components/ui/sonner";

// Sans-serif redondeada y geométrica, cercana a la tipografía de la
// referencia visual del catálogo (títulos con peso, chips de info).
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NutriDemo — Tienda + POS con inventario único",
  description:
    "Demo interactivo de venta de productos de nutrición en dos canales (tienda online y POS) que comparten un mismo inventario.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <AppChrome>{children}</AppChrome>
          <Toaster richColors position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}
