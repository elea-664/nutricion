# ATHL8

Demo interactivo de venta de productos de nutrición/fitness en **dos canales** —tienda en línea y punto de venta físico (POS)— que comparten **un mismo inventario**.

La tesis del demo: vender un producto en un canal baja el stock del otro al instante.

## Vistas

- **`/tienda`** — catálogo, carrito y checkout online (pago simulado).
- **`/pos`** — punto de venta tipo terminal: escaneo por teclado/clic, ticket, cobro en efectivo (con cambio) o tarjeta.
- **`/admin`** — dashboard, inventario en vivo, historial de ventas (ambos canales) y movimientos de inventario.

Un ticker de **stock en vivo** en el header refleja los cambios de cualquiera de los dos canales al instante, y un botón de **reiniciar demo** vuelve todo al estado semilla.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, Zod + React Hook Form. Todo el estado (`products`, `orders`, `sales`, `movements`) vive en memoria vía React Context — no hay backend ni base de datos.

## Correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).
