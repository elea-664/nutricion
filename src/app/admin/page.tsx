"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  DollarSign,
  PackageX,
  ShoppingBag,
  Store,
} from "lucide-react";

import { useStore } from "@/lib/store-context";
import { formatDateTime, formatMXN } from "@/lib/format";
import { StockBadge } from "@/components/stock-badge";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function isToday(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const MOVEMENT_LABEL: Record<string, string> = {
  VENTA_FISICA: "Venta física",
  VENTA_ONLINE: "Venta online",
  AJUSTE: "Ajuste",
  ENTRADA: "Entrada",
  CANCELACION: "Cancelación",
  DEVOLUCION: "Devolución",
};

export default function AdminPage() {
  const { state } = useStore();
  const { products, orders, sales, movements } = state;

  const salesToday = useMemo(() => sales.filter((s) => isToday(s.ts)), [sales]);
  const ordersToday = useMemo(() => orders.filter((o) => isToday(o.ts)), [orders]);

  const physicalTotal = salesToday.reduce((s, v) => s + v.total, 0);
  const onlineTotal = ordersToday.reduce((s, v) => s + v.total, 0);
  const combinedTotal = physicalTotal + onlineTotal;

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const outOfStock = products.filter((p) => p.stock === 0);

  const unifiedSales = useMemo(() => {
    const fromOrders = orders.map((o) => ({
      id: o.id,
      channel: "online" as const,
      payment: o.payment,
      pieces: o.items.reduce((s, i) => s + i.qty, 0),
      total: o.total,
      ts: o.ts,
    }));
    const fromSales = sales.map((s) => ({
      id: s.id,
      channel: "fisica" as const,
      payment: s.payment,
      pieces: s.items.reduce((sum, i) => sum + i.qty, 0),
      total: s.total,
      ts: s.ts,
    }));
    return [...fromOrders, ...fromSales].sort((a, b) => b.ts - a.ts);
  }, [orders, sales]);

  const sortedMovements = useMemo(
    () => [...movements].sort((a, b) => b.ts - a.ts),
    [movements]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Vista unificada de inventario, ventas y movimientos de ambos canales.
        </p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="py-4">
              <CardHeader className="px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShoppingBag className="size-4" />
                  Ventas físicas (hoy)
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-2xl font-semibold">{formatMXN(physicalTotal)}</p>
                <p className="text-xs text-muted-foreground">{salesToday.length} venta(s)</p>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardHeader className="px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="size-4" />
                  Ventas online (hoy)
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-2xl font-semibold">{formatMXN(onlineTotal)}</p>
                <p className="text-xs text-muted-foreground">{ordersToday.length} pedido(s)</p>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardHeader className="px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="size-4" />
                  Total combinado (hoy)
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-2xl font-semibold">{formatMXN(combinedTotal)}</p>
                <p className="text-xs text-muted-foreground">
                  {salesToday.length + ordersToday.length} transacción(es)
                </p>
              </CardContent>
            </Card>

            <Card className="py-4">
              <CardHeader className="px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="size-4" />
                  Inventario
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-4 px-4">
                <div>
                  <p className="text-2xl font-semibold text-amber-600">
                    {lowStock.length}
                  </p>
                  <p className="text-xs text-muted-foreground">bajos</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-destructive">{outOfStock.length}</p>
                  <p className="text-xs text-muted-foreground">agotados</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {(lowStock.length > 0 || outOfStock.length > 0) && (
            <Card className="mt-4 py-4">
              <CardHeader className="px-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <PackageX className="size-4" />
                  Requiere atención
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 px-4">
                {[...outOfStock, ...lowStock].map((p) => (
                  <Badge
                    key={p.id}
                    variant="outline"
                    className={cn(
                      p.stock === 0
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-amber-400 bg-amber-100 text-amber-800"
                    )}
                  >
                    {p.emoji} {p.name} · {p.stock} u.
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inventario" className="mt-4">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Canal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="flex items-center gap-2 font-medium">
                      <span aria-hidden>{p.emoji}</span>
                      {p.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-right">{formatMXN(p.price)}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold tabular-nums",
                        p.stock === 0 && "text-destructive",
                        p.stock > 0 && p.stock <= p.minStock && "text-amber-600"
                      )}
                    >
                      {p.stock}
                    </TableCell>
                    <TableCell>
                      <StockBadge product={p} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.channels.includes("fisica") ? "secondary" : "outline"}>
                        {p.channels.includes("fisica") ? "Ambos" : "Solo en línea"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="ventas" className="mt-4">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead className="text-right">Piezas</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unifiedSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-semibold">{s.id}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(s.ts)}</TableCell>
                    <TableCell>
                      <Badge variant={s.channel === "online" ? "secondary" : "outline"}>
                        {s.channel === "online" ? "Online" : "Física"}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.payment}</TableCell>
                    <TableCell className="text-right tabular-nums">{s.pieces}</TableCell>
                    <TableCell className="text-right font-medium">{formatMXN(s.total)}</TableCell>
                  </TableRow>
                ))}
                {unifiedSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Aún no hay ventas registradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="movimientos" className="mt-4">
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Stock antes</TableHead>
                  <TableHead className="text-right">Stock después</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMovements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground">{formatDateTime(m.ts)}</TableCell>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{MOVEMENT_LABEL[m.type] ?? m.type}</Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold tabular-nums",
                        m.qty < 0 ? "text-destructive" : "text-emerald-600"
                      )}
                    >
                      {m.qty > 0 ? `+${m.qty}` : m.qty}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{m.prev}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.next}</TableCell>
                  </TableRow>
                ))}
                {sortedMovements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Aún no hay movimientos de inventario.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
