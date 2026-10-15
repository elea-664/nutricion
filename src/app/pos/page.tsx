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
import { formatMoney, roundCents } from "@/lib/format";
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

type PaymentMethod = "Cash" | "Card";

export default function PosPage() {
  const { state, sellPos } = useStore();
  const { products } = state;
  // La línea "Meals" es exclusiva de la tienda en línea: ni el escaneo
  // por clic la muestra (el escaneo por código también la rechaza).
  const posProducts = useMemo(
    () => products.filter((p) => p.channels.includes("fisica")),
    [products]
  );

  const [ticket, setTicket] = useState<TicketLine[]>([]);
  const [scanValue, setScanValue] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Card");
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

  const total = roundCents(
    ticketDetailed.reduce((s, { line, product }) => s + product.price * line.qty, 0)
  );
  const pieces = ticketDetailed.reduce((s, { line }) => s + line.qty, 0);

  const cash = parseFloat(cashInput);
  const cashValid = !Number.isNaN(cash) && cash >= total;
  const change = cashValid ? roundCents(cash - total) : 0;

  function qtyInTicket(productId: string) {
    return ticket.find((l) => l.productId === productId)?.qty ?? 0;
  }

  function addToTicket(product: Product) {
    if (product.stock === 0) {
      toast.error("Out of stock", { description: product.name });
      return;
    }
    if (qtyInTicket(product.id) >= product.stock) {
      toast.error("Not enough stock", { description: product.name });
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
      toast.error("Unknown code", { description: code });
      return;
    }
    if (!product.channels.includes("fisica")) {
      toast.error("Online-only product", { description: product.name });
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
    if (method === "Cash" && !cashValid) return;

    const items = ticketDetailed.map(({ line, product }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: line.qty,
    }));

    const sale =
      method === "Cash"
        ? sellPos("Cash", items, cash, change)
        : sellPos("Card", items);

    if (sale) {
      toast.success(`Sale ${sale.id} confirmed`, {
        description: `${pieces} item(s) · ${formatMoney(sale.total)} · ${sale.payment}`,
      });
      setTicket([]);
      setCashInput("");
      refocusScan();
    } else {
      toast.error("No hay stock suficiente", {
        description: "Inventory changed. Adjust the ticket and try again.",
      });
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Point of sale</h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Terminal
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Scan, charge and confirm — sells from the same inventory as the online store.
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
                  placeholder="Scan or type a barcode / SKU and press Enter…"
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
                    <p className="text-sm font-bold text-primary">{formatMoney(product.price)}</p>
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
                    Scan a product to start.
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
                            {formatMoney(product.price)} each
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
                  <span className="text-sm text-muted-foreground">Total ({pieces} items)</span>
                  <span className="text-3xl font-bold tabular-nums">
                    {formatMoney(total)}
                  </span>
                </div>
              </CardContent>

              <Separator />

              <CardContent className="flex flex-col gap-3 px-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={method === "Card" ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setMethod("Card")}
                  >
                    <CreditCard className="size-4" />
                    Card
                  </Button>
                  <Button
                    type="button"
                    variant={method === "Cash" ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => setMethod("Cash")}
                  >
                    <Banknote className="size-4" />
                    Cash
                  </Button>
                </div>

                {method === "Cash" && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cash">Cash received</Label>
                    <Input
                      id="cash"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={cashInput}
                      onChange={(e) => setCashInput(e.target.value)}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Change due</span>
                      <span className="font-semibold">
                        {cashInput ? formatMoney(Math.max(0, change)) : "—"}
                      </span>
                    </div>
                    {cashInput && !cashValid && (
                      <p className="text-xs text-destructive">
                        Cash received is less than the total.
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
                    ticketDetailed.length === 0 || (method === "Cash" && !cashValid)
                  }
                  onClick={confirmSale}
                >
                  Confirm sale · {formatMoney(total)}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
