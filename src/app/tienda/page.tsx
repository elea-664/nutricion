"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flame, Info, Minus, Plus, Search, ShoppingCart, Timer, Trash2, Wifi } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/lib/store-context";
import { DEFAULT_CUSTOMER, SHIPPING_COST } from "@/lib/seed";
import { formatMXN } from "@/lib/format";
import { Product } from "@/lib/types";
import { StockBadge } from "@/components/stock-badge";
import { InfoChip } from "@/components/info-chip";
import { ProductPhoto } from "@/components/product-photo";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ALL_CATEGORIES = "Todas";

const customerSchema = z.object({
  nombre: z.string().min(2, "Ingresa un nombre"),
  telefono: z.string().min(7, "Ingresa un teléfono válido"),
  correo: z.email("Correo inválido"),
  direccion: z.string().min(5, "Ingresa una dirección"),
});
type CustomerFormValues = z.infer<typeof customerSchema>;

interface CartLine {
  productId: string;
  qty: number;
}

export default function TiendaPage() {
  const { state, sellOnline } = useStore();
  const { products } = state;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Permite llegar aquí con una categoría preseleccionada, p.ej. desde el
  // botón "Explorar comidas" de la home (/tienda?categoria=Comidas).
  // `window` no existe en el render de servidor, así que esta sincronización
  // única con la URL solo puede resolverse en un efecto de montaje.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoria = params.get("categoria");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de la URL en el montaje, no derivable en el render (SSR sin `window`)
    if (categoria) setCategory(categoria);
  }, []);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: DEFAULT_CUSTOMER,
  });

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === ALL_CATEGORIES || p.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, search, category]);

  const cartDetailed = useMemo(
    () =>
      cart
        .map((line) => ({ line, product: products.find((p) => p.id === line.productId) }))
        .filter((x): x is { line: CartLine; product: Product } => !!x.product),
    [cart, products]
  );

  const subtotal = cartDetailed.reduce((s, { line, product }) => s + product.price * line.qty, 0);
  const shipping = cartDetailed.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  function qtyInCart(productId: string) {
    return cart.find((l) => l.productId === productId)?.qty ?? 0;
  }

  function addToCart(product: Product) {
    if (qtyInCart(product.id) >= product.stock) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { productId: product.id, qty: 1 }];
    });
  }

  function decrement(productId: string) {
    setCart((prev) =>
      prev.flatMap((l) => {
        if (l.productId !== productId) return [l];
        return l.qty <= 1 ? [] : [{ ...l, qty: l.qty - 1 }];
      })
    );
  }

  function increment(productId: string, stock: number) {
    setCart((prev) =>
      prev.map((l) => {
        if (l.productId !== productId) return l;
        if (l.qty >= stock) return l;
        return { ...l, qty: l.qty + 1 };
      })
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }

  function onSubmit(values: CustomerFormValues) {
    if (cartDetailed.length === 0) return;
    const items = cartDetailed.map(({ line, product }) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: line.qty,
    }));
    const order = sellOnline(values, items);
    if (order) {
      toast.success(`Pedido ${order.id} pagado`, {
        description: `${items.reduce((s, i) => s + i.qty, 0)} artículo(s) · ${formatMXN(order.total)}`,
      });
      setCart([]);
      setCheckoutOpen(false);
      form.reset(DEFAULT_CUSTOMER);
    } else {
      toast.error("No hay stock suficiente", {
        description: "Alguien más se llevó existencias. Ajusta tu carrito e intenta de nuevo.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tienda online</h1>
        <p className="text-sm text-muted-foreground">
          Mismo inventario que el punto de venta físico. La línea Comidas es exclusiva de la
          tienda en línea.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Catálogo */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU o categoría…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value ?? ALL_CATEGORIES)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => {
              const inCart = qtyInCart(product.id);
              const atMax = inCart >= product.stock;
              return (
                <Card
                  key={product.id}
                  className="gap-0 overflow-hidden rounded-2xl border-0 py-0 shadow-sm ring-1 ring-border/60 transition-shadow hover:shadow-md"
                >
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDetailProduct(product)}
                      className="block w-full"
                    >
                      <ProductPhoto
                        query={product.photoQuery}
                        category={product.category}
                        emoji={product.emoji}
                        className="aspect-4/3 w-full"
                      />
                    </button>
                    <div className="absolute left-2 top-2">
                      <StockBadge product={product} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailProduct(product)}
                      aria-label={`Ver detalle de ${product.name}`}
                      className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border/60 hover:text-foreground"
                    >
                      <Info className="size-4" />
                    </button>
                  </div>

                  <CardContent className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h3 className="font-semibold leading-tight">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                        {!product.channels.includes("fisica") && (
                          <span className="ml-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
                            <Wifi className="size-3" />
                            Solo en línea
                          </span>
                        )}
                      </p>
                    </div>

                    {product.mealInfo && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="size-3.5 text-primary" />
                          {product.mealInfo.calories} kcal
                        </span>
                        <span>•</span>
                        <span>{product.mealInfo.protein}g proteína</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Timer className="size-3.5" />
                          {product.mealInfo.minutes} min
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <InfoChip label="Precio" value={formatMXN(product.price)} tone="blue" />
                      <InfoChip label="SKU" value={product.sku} tone="violet" />
                    </div>

                    <Button
                      className="mt-auto w-full gap-2 rounded-full"
                      disabled={product.stock === 0 || atMax}
                      onClick={() => addToCart(product)}
                    >
                      <Plus className="size-4" />
                      {product.stock === 0 ? "Agotado" : atMax ? "Máximo en carrito" : "Agregar"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                No se encontraron productos.
              </p>
            )}
          </div>
        </div>

        {/* Carrito */}
        <div>
          <Card className="sticky top-32 gap-3 py-4">
            <CardHeader className="px-4">
              <div className="flex items-center gap-2 font-medium">
                <ShoppingCart className="size-4" />
                Tu carrito
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {cartDetailed.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Tu carrito está vacío.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {cartDetailed.map(({ line, product }) => (
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
            <CardContent className="flex flex-col gap-1 px-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMXN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span>{shipping > 0 ? formatMXN(shipping) : "—"}</span>
              </div>
              <div className="mt-1 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatMXN(total)}</span>
              </div>
            </CardContent>
            <CardFooter className="px-4">
              <Button
                className="w-full"
                disabled={cartDetailed.length === 0}
                onClick={() => setCheckoutOpen(true)}
              >
                Ir a pagar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Total a pagar: <span className="font-semibold text-foreground">{formatMXN(total)}</span>
            </DialogDescription>
          </DialogHeader>

          <form
            className="flex flex-col gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...form.register("nombre")} />
              {form.formState.errors.nombre && (
                <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...form.register("telefono")} />
              {form.formState.errors.telefono && (
                <p className="text-xs text-destructive">{form.formState.errors.telefono.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="correo">Correo</Label>
              <Input id="correo" type="email" {...form.register("correo")} />
              {form.formState.errors.correo && (
                <p className="text-xs text-destructive">{form.formState.errors.correo.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...form.register("direccion")} />
              {form.formState.errors.direccion && (
                <p className="text-xs text-destructive">{form.formState.errors.direccion.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" className="gap-2">
                Pagar con tarjeta · {formatMXN(total)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!detailProduct}
        onOpenChange={(open) => !open && setDetailProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          {detailProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{detailProduct.name}</DialogTitle>
                <DialogDescription>
                  {detailProduct.category}
                  {!detailProduct.channels.includes("fisica") && (
                    <span className="ml-1.5 inline-flex items-center gap-1 font-medium text-primary">
                      <Wifi className="size-3" />
                      Solo en línea
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <ProductPhoto
                query={detailProduct.photoQuery}
                category={detailProduct.category}
                emoji={detailProduct.emoji}
                emojiClassName="text-8xl"
                className="aspect-4/3 rounded-xl"
              />

              <div className="grid grid-cols-3 gap-2">
                <InfoChip label="Precio" value={formatMXN(detailProduct.price)} tone="blue" />
                <InfoChip label="SKU" value={detailProduct.sku} tone="violet" />
                <InfoChip
                  label="Stock"
                  value={detailProduct.stock === 0 ? "Agotado" : `${detailProduct.stock} u.`}
                  tone={
                    detailProduct.stock === 0
                      ? "rose"
                      : detailProduct.stock <= detailProduct.minStock
                        ? "amber"
                        : "emerald"
                  }
                />
              </div>

              {detailProduct.mealInfo && (
                <div className="grid grid-cols-3 gap-2">
                  <InfoChip
                    label="Calorías"
                    value={`${detailProduct.mealInfo.calories} kcal`}
                    tone="amber"
                  />
                  <InfoChip
                    label="Proteína"
                    value={`${detailProduct.mealInfo.protein} g`}
                    tone="emerald"
                  />
                  <InfoChip label="Listo en" value={`${detailProduct.mealInfo.minutes} min`} tone="blue" />
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Código de barras {detailProduct.barcode} ·{" "}
                {detailProduct.channels.includes("fisica")
                  ? "mismo inventario que el punto de venta físico."
                  : "exclusivo de la tienda en línea, no disponible en el POS."}
              </p>

              <DialogFooter>
                <Button
                  className="gap-2 rounded-full"
                  disabled={
                    detailProduct.stock === 0 ||
                    qtyInCart(detailProduct.id) >= detailProduct.stock
                  }
                  onClick={() => {
                    addToCart(detailProduct);
                    setDetailProduct(null);
                  }}
                >
                  <Plus className="size-4" />
                  Agregar al carrito
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
