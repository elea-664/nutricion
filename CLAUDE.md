# Brief: Demo tienda online + POS con inventario único

> **Para el agente:** esto es la especificación completa de lo que hay que construir. Léela entera antes de escribir código. Cuando algo no esté definido aquí, prefiere lo **más simple** que cumpla los criterios de aceptación. Esto es un **demo/prototipo clickeable**, no un sistema de producción.

---

## 1. Objetivo

Construir un **demo interactivo** de un sistema de venta de productos de nutrición/fitness que opera en **dos canales** —tienda en línea y punto de venta físico (POS)— que **comparten un mismo inventario**.

El propósito del demo es **validar el modelo de negocio y el flujo de compra**, no ser una plataforma definitiva. Debe poder mostrarse a un tercero y transmitir la idea en menos de dos minutos.

### El momento que el demo debe vender

Vender un producto en un canal **baja el stock del otro canal al instante**. Esa es toda la tesis. Si el demo hace esto de forma visible y creíble, cumplió su función.

---

## 2. Regla de oro (no negociable)

> **Una sola fuente de verdad para el inventario.**

- Existe **un único** `stock` por producto. **No** hay inventario separado para online y físico.
- Toda venta confirmada (online o física) **descuenta del mismo stock** y genera un **movimiento de inventario**.
- Nunca se puede vender más de lo que hay en stock.

---

## 3. Alcance del demo

### SÍ incluir
- Catálogo de productos con búsqueda y filtro por categoría.
- Carrito y checkout online (pago simulado con un botón).
- POS con "escaneo" simulado, carrito, efectivo (con cálculo de cambio) y tarjeta.
- Panel de administración: dashboard, inventario en vivo, historial de ventas (ambos canales) y movimientos de inventario.
- Un indicador de **stock en vivo** visible en todo momento que refleje los cambios de ambos canales.
- Botón para **reiniciar** el demo a su estado inicial.

### NO incluir (fuera de alcance del demo)
- Base de datos / persistencia real.
- Autenticación real (no hay login; se accede a las tres vistas con un selector).
- Pasarela de pago real (Stripe, Mercado Pago, terminal bancaria).
- Envíos reales, cálculo de logística, facturación electrónica, multi-sucursal.
- Lector de código de barras físico (se simula con teclado/clic).
- Deploy, tests automatizados, backend.

---

## 4. Superficies (vistas)

La app tiene **tres vistas** conmutables desde una barra superior: **Tienda online**, **POS** y **Admin**.

### 4.1 Tienda online (superficie clara)
- **Catálogo** en cuadrícula: imagen/emoji, categoría, nombre, precio, estado de stock (En stock / Últimas N / Agotado) y botón **Agregar**.
- **Búsqueda** por nombre, SKU/código o categoría. **Filtro** por categoría.
- **Carrito**: incrementar, disminuir, eliminar; muestra subtotal, envío fijo y total.
- No se puede agregar por encima del stock disponible (botón deshabilitado al llegar al máximo).
- **Checkout**: formulario con nombre, teléfono, correo y dirección (pueden venir precargados). Botón **Pagar con tarjeta** (simulado).
- Al pagar: se crea un **pedido** con estado `PAGADO`, se descuenta el stock, se genera el movimiento y se muestra confirmación.

### 4.2 POS (superficie oscura, tipo terminal)
- **Entrada de escaneo**: un campo enfocado donde se escribe/pega un código de barras o SKU y con **Enter** se agrega el producto al ticket. Debe soportar que un lector USB/Bluetooth "teclee" el código + Enter.
- **Alternativa de clic**: una cuadrícula de productos que, al tocarlos, simula el escaneo (porque el demo no tiene lector físico).
- **Ticket** con líneas: aumentar/disminuir cantidad, eliminar línea. Muestra el **total** en grande.
- **Pago**:
  - **Efectivo**: se captura el monto recibido y se calcula el **cambio**. No permite confirmar si lo recibido es menor al total.
  - **Tarjeta**: confirma directo (solo registra el método; el demo no cobra).
- Al confirmar: se crea una **venta física**, se descuenta stock, se genera movimiento y se limpia el ticket.

### 4.3 Admin
Con sub-pestañas:
- **Dashboard**: ventas físicas del día ($ y conteo), ventas online ($ y conteo), total combinado, e inventario (productos bajos / agotados).
- **Inventario**: tabla con producto, SKU, precio, stock (coloreado: rojo agotado, ámbar bajo) y estado.
- **Ventas**: historial **unificado** de ventas físicas y online, ordenado por hora, con folio, canal, método de pago, nº de piezas y total.
- **Movimientos**: ledger de movimientos de inventario (producto, tipo, cantidad, stock antes, stock después).

---

## 5. Modelo de datos (en memoria)

```
Product
├── id
├── sku
├── barcode          // código de barras
├── name
├── category
├── emoji            // sustituye a la imagen en el demo
├── price
├── stock            // FUENTE ÚNICA DE VERDAD
└── minStock         // umbral para "stock bajo"

Order (online)
├── id               // folio, p.ej. "#000126"
├── channel = "online"
├── customer         // { nombre, telefono, correo, direccion }
├── payment = "Tarjeta"
├── status = "PAGADO"
├── items[]          // { name, qty, price }  ← precio congelado al momento de la venta
├── total
└── ts               // timestamp

Sale (física)
├── id               // folio, p.ej. "V000126"
├── channel = "fisica"
├── payment          // "Efectivo" | "Tarjeta"
├── cash, change     // solo si es efectivo
├── items[]          // { name, qty, price }
├── total
└── ts

InventoryMovement
├── id
├── productId
├── name
├── type             // "VENTA_FISICA" | "VENTA_ONLINE" | "AJUSTE" | "ENTRADA" | "CANCELACION" | "DEVOLUCION"
├── qty              // negativo en ventas
├── prev             // stock antes
├── next             // stock después
└── ts
```

> **Importante:** el precio se **guarda dentro del detalle** de cada venta/pedido. Cambiar el precio de un producto después **no** debe alterar el histórico.

---

## 6. Reglas de negocio

1. **Sin sobreventa:** no se permite vender una cantidad mayor al stock disponible, en ningún canal.
2. **Venta → movimiento:** toda venta confirmada genera automáticamente su `InventoryMovement` y descuenta el stock, en la misma operación.
3. **Precio congelado:** el detalle de la venta guarda el precio usado; modificar el producto no cambia ventas pasadas.
4. **Fuente única:** ambos canales leen y escriben el mismo `stock`.
5. **Producto agotado** (`stock === 0`): no se puede agregar al carrito online ni al ticket del POS.

---

## 7. Datos semilla

Precargar ~8 productos en varias categorías, incluyendo al menos **uno con stock bajo** y **uno agotado** para que se vean los estados:

| SKU | Nombre | Categoría | Precio | Stock | minStock |
|-----|--------|-----------|-------:|------:|---------:|
| WHEY-CHO | Proteína Whey Chocolate | Proteínas | 650 | 12 | 5 |
| WHEY-VAN | Proteína Whey Vainilla | Proteínas | 650 | 3 | 5 |
| CREA-300 | Creatina Monohidratada | Creatina | 350 | 8 | 5 |
| BAR-PROT | Barra de Proteína | Snacks | 45 | 40 | 10 |
| PRE-BLUE | Pre-Entreno Blue | Suplementos | 520 | 0 | 5 |
| ELEC-500 | Bebida Electrolitos | Bebidas | 38 | 25 | 8 |
| PB-500 | Mantequilla de Maní | Alimentos | 180 | 6 | 5 |
| SHK-700 | Shaker 700ml | Accesorios | 120 | 15 | 5 |

Moneda: **MXN**, formato `es-MX` sin decimales (p. ej. `$650`).

---

## 8. Stack y restricciones técnicas

**Stack:**
- **Next.js** (App Router) + **TypeScript**.
- **Tailwind CSS** para estilos.
- **shadcn/ui** para los componentes de interfaz (Button, Card, Input, Table, Dialog, Badge, Tabs, Sonner/Toast, etc.). Reutilizar estos componentes en vez de crear controles a mano.
- **Zod** + **React Hook Form** para el formulario de checkout.
- Iconos: **lucide-react** (viene con shadcn/ui).

**Estado y datos (demo, sin backend):**
- **Sin base de datos ni API real.** Todos los datos viven **en memoria** durante la sesión.
- Estado global compartido con **React Context** (o Zustand) montado en el `layout` raíz, **por encima de las rutas**, para que el inventario, ventas y movimientos **sobrevivan a la navegación** entre vistas. Este es el punto crítico: si el estado vive dentro de una página, cambiar de vista lo reiniciaría y se rompe la fuente única de verdad.
- Datos comprometidos en el estado global: `products`, `orders`, `sales`, `movements`. Los carritos (online y POS) son estado **local/efímero** de cada vista.
- **No** persistir en base de datos. Persistir en `localStorage` es **opcional** (para sobrevivir un refresh); si no se implementa, el estado arranca siempre desde la semilla. El botón **"reiniciar"** vuelve al estado semilla.

**Estructura sugerida:**
- Vistas como rutas del App Router: `/tienda`, `/pos`, `/admin` (con las sub-pestañas del admin dentro de `/admin`). Un layout raíz con el header, el ticker de stock en vivo y el `Provider` del estado global.
- Los carritos de online y POS son **independientes** (sesiones distintas), pero ambos descuentan del **mismo** stock al confirmar.
- Marcar como Client Components (`"use client"`) los componentes que usan estado/interacción; el demo es prácticamente todo cliente.

---

## 9. Detalles de UX que importan

- **Ticker de "Stock en vivo"** siempre visible (barra bajo el header) con el stock de cada producto. Debe **reaccionar visiblemente** (una animación breve) cuando cambia por una venta de cualquier canal — es el elemento que vende la tesis.
- El **POS oscuro** contrasta con la **tienda clara**: refuerza que son dos mundos con un mismo cerebro.
- El campo de escaneo del POS se mantiene **enfocado** para simular un lector real.
- Confirmaciones breves (toast) tras cada venta.

---

## 10. Criterios de aceptación

El demo está listo cuando:

- [ ] Un cliente puede comprar online: agregar al carrito → checkout → pagar → se crea el pedido.
- [ ] Al pagar online, el **stock baja** y aparece el movimiento `VENTA_ONLINE`.
- [ ] En el POS se puede "escanear" (teclado o clic), ajustar cantidades y ver el total.
- [ ] El POS cobra en **efectivo** (calcula cambio, bloquea si el recibido < total) y en **tarjeta**.
- [ ] Al confirmar en POS, el **stock baja** y aparece el movimiento `VENTA_FISICA`.
- [ ] **Nunca** se puede vender por encima del stock disponible.
- [ ] El **indicador de stock en vivo** refleja los cambios de ambos canales al instante.
- [ ] El admin muestra ventas físicas y online **en el mismo historial** y con el **mismo inventario**.
- [ ] El botón de reinicio devuelve el demo al estado inicial.