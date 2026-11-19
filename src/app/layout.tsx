import type { Metadata } from "next";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
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

// Fuente "display" para titulares grandes del inicio (hero, cifras,
// "Shop by your goal"), en prueba por el mockup del cliente: más
// condensada y pesada que la sans base. Se usa con la clase font-display.
const montserrat = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ATHL8 — Sports nutrition selected for performance",
  description:
    "Sports nutrition for fueling, hydration, recovery, and performance. Visit ATHL8 in Mesa, AZ or shop online.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <AppChrome>{children}</AppChrome>
          <Toaster richColors position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}
