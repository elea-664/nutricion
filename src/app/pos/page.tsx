"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  ScanLine,
  Trash2,
} from "lucide-react";

import { useStore } from "@/lib/store-context";
import { formatMXN } from "@/lib/format";
import { Product } from "@/lib/types";
import { StockBadge } from "@/components/stock-badge";
import { ProductPhoto } from "@/components/product-photo";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface TicketLine {
  productId: string;
  qty: number;
}

type PaymentMethod = "Efectivo" | "Tarjeta";

export default function PosPage() {
  const { state, sellPos } = useStore();
  const { products } = state;
  // La línea "Comidas" es exclusiva de la tienda en línea: ni el escaneo
  // por clic la muestra (el escaneo por código también la rechaza).
  const posProducts = useMemo(
    () => products.filter((p) => p.channels.includes("fisica")),
    [products]
  );

  const [ticket, setTicket] = useState<TicketLine[]>([]);
  const [scanValue, setScanValue] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Tarjeta");
  const [cashInput, setCashInput] = useState("");

  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scanRef.current?.focus();
  }, []);

  function refocusScan() {
    requestAnimationFrame(() => scanRef.current?.focus());
  }

  const ticketDetailed = useMemo(
    () =>
      ticket
        .map((line) => ({ line, product: products.find((p) => p.id === line.productId) }))
        .filter((x): x is { line: TicketLine; product: Product } => !!x.product),
    [ticket, products]
  );

  const total = ticketDetailed.reduce((s, { line, product }) => s + product.price * line.qty, 0);
  const pieces = ticketDetailed.reduce((s, { line }) => s + line.qty, 0);

  const cash = parseFloat(cashInput);
  const cashValid = !Number.isNaN(cash) && cash >= total;
  const change = cashValid ? cash - total : 0;

  function qtyInTicket(productId: string) {
    return ticket.find((l) => l.productId === productId)?.qty ?? 0;
  }

  function addToTicket(product: Product) {
    if (product.stock === 0) {
      toast.error("Producto agotado", { description: product.name });
      return;
    }
    if (qtyInTicket(product.id) >= product.stock) {
      toast.error("Sin stock suficiente", { description: product.name });
      return;
    }
    setTicket((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { productId: product.id, qty: 1 }];
    });
  }

  function handleScanSubmit(e: FormEvent) {
    e.preventDefault();
    const code = scanValue.trim();
    setScanValue("");
    if (!code) return;
    const product = products.find(
      (p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    );
    if (!product) {
      toast.error("Código no reconocido", { description: code });
      return;
    }
    if (!product.channels.includes("fisica")) {
      toast.error("Exclusivo de la tienda en línea", { description: product.name });
      return;
    }
    addToTicket(product);
  }

  function decrement(productId: string) {
    setTicket((prev) =>
      prev.flatMap((l) => {
        if (l.productId !== productId) return [l];
        return l.qty <= 1 ? [] : [{ ...l, qty: l.qty - 1 }];
      })
    );
  }

  function increment(productId: string, stock: number) {
    setTicket((prev) =>
      prev.map((l) => {
        if (l.productId !== productId) return l;
        if (l.qty >= stock) return l;
        return { ...l, qty: l.qty + 1 };
      })
    );
  }

  function removeLine(productId: string) {
    setTicket((prev) => prev.filter((l) => l.productId !== productId));
  }

  function confirmSale() {
    if (ticketDetailed.length === 0) return;
    if (method === "Efectivo" && !cashValid) return;

    const items = ticketDetailed.map(({ line, product }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: line.qty,
    }));

    const sale =
      method === "Efectivo"
        ? sellPos("Efectivo", items, cash, change)
        : sellPos("Tarjeta", items);

    if (sale) {
      toast.success(`Venta ${sale.id} confirmada`, {
        description: `${pieces} pieza(s) · ${formatMXN(sale.total)} · ${sale.payment}`,
      });
      setTicket([]);
      setCashInput("");
      refocusScan();
    } else {
      toast.error("No hay stock suficiente", {
        description: "El inventario cambió. Ajusta el ticket e intenta de nuevo.",
      });
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Punto de venta</h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Terminal
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Escanea, cobra y confirma — descuenta del mismo inventario que la tienda online.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Escaneo + catálogo */}
          <div className="lg:col-span-2">
            <form onSubmit={handleScanSubmit} className="mb-4">
              <div className="relative">
                <ScanLine className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={scanRef}
                  autoFocus
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  placeholder="Escanea o teclea código de barras / SKU y presiona Enter…"
                  className="h-12 pl-10 text-base font-medium"
                />
              </div>
            </form>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {posProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToTicket(product);
                    refocusScan();
                  }}
                  className="flex flex-col overflow-hidden rounded-2xl border-0 bg-card text-left shadow-sm ring-1 ring-border/60 transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ProductPhoto
                    query={product.photoQuery}
                    category={product.category}
                    emoji={product.emoji}
                    emojiClassName="text-4xl"
                    className="aspect-4/3 w-full"
                  />
                  <div className="flex flex-col gap-1 p-3">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-semibold leading-tight">{product.name}</p>
                      <StockBadge product={product} className="shrink-0 text-[0.65rem]" />
                    </div>
                    <p className="text-sm font-bold text-primary">{formatMXN(product.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ticket + pago */}
          <div>
            <Card className="sticky top-32 gap-3 py-4">
              <CardHeader className="px-4">
                <div className="font-medium">Ticket</div>
              </CardHeader>
              <CardContent className="px-4">
                {ticketDetailed.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Escanea un producto para comenzar.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {ticketDetailed.map(({ line, product }) => (
                      <li key={product.id} className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden>
                          {product.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatMXN(product.price)} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => decrement(product.id)}
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="w-5 text-center text-sm tabular-nums">{line.qty}</span>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            disabled={line.qty >= product.stock}
                            onClick={() => increment(product.id, product.stock)}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeLine(product.id)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>

              <Separator />

              <CardContent className="px-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Total ({pieces} pza)</span>
                  <span className="text-3xl font-bold tabular-nums">
                    {formatMXN(total)}
                  </span>
                </div>
              </CardContent>

              <Separator />

              <CardContent className="flex flex-col gap-3 px-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={method === "Tarjeta" ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setMethod("Tarjeta")}
                  >
                    <CreditCard className="size-4" />
                    Tarjeta
                  </Button>
                  <Button
                    type="button"
                    variant={method === "Efectivo" ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setMethod("Efectivo")}
                  >
                    <Banknote className="size-4" />
                    Efectivo
                  </Button>
                </div>

                {method === "Efectivo" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cash">Recibido</Label>
                    <Input
                      id="cash"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      placeholder="0"
                      value={cashInput}
                      onChange={(e) => setCashInput(e.target.value)}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cambio</span>
                      <span className="font-semibold">
                        {cashInput ? formatMXN(Math.max(0, change)) : "—"}
                      </span>
                    </div>
                    {cashInput && !cashValid && (
                      <p className="text-xs text-destructive">
                        El monto recibido es menor al total.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="px-4">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={
                    ticketDetailed.length === 0 || (method === "Efectivo" && !cashValid)
                  }
                  onClick={confirmSale}
                >
                  Confirmar venta · {formatMXN(total)}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
