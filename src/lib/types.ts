// Modelo de datos del demo (ver sección 5 de claude.md).
// Todo vive en memoria: no hay base de datos ni API real.

export type SalesChannel = "online" | "fisica";

/** Info nutricional, solo presente en productos de la línea "Comidas". */
export interface MealInfo {
  calories: number;
  /** Gramos de proteína. */
  protein: number;
  minutes: number;
  tags: string[];
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  emoji: string;
  price: number;
  /** FUENTE ÚNICA DE VERDAD del inventario. */
  stock: number;
  /** Umbral bajo el cual el producto se considera "stock bajo". */
  minStock: number;
  /** Canales donde este producto puede venderse. La mayoría vive en ambos. */
  channels: SalesChannel[];
  /** Solo presente en platillos preparados ("Comidas"), exclusivos de línea. */
  mealInfo?: MealInfo;
  /** Término de búsqueda para la foto de stock (Pexels); en inglés da mejores resultados. */
  photoQuery: string;
}

export interface Customer {
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
}

/** Línea de venta con el precio congelado al momento de la venta. */
export interface SaleItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  channel: "online";
  customer: Customer;
  payment: "Tarjeta";
  status: "PAGADO";
  items: SaleItem[];
  total: number;
  ts: number;
}

export interface Sale {
  id: string;
  channel: "fisica";
  payment: "Efectivo" | "Tarjeta";
  cash?: number;
  change?: number;
  items: SaleItem[];
  total: number;
  ts: number;
}

export type MovementType =
  | "VENTA_FISICA"
  | "VENTA_ONLINE"
  | "AJUSTE"
  | "ENTRADA"
  | "CANCELACION"
  | "DEVOLUCION";

export interface InventoryMovement {
  id: string;
  productId: string;
  name: string;
  type: MovementType;
  /** Negativo en ventas. */
  qty: number;
  prev: number;
  next: number;
  ts: number;
}

/** Línea de carrito/ticket: solo referencia al producto + cantidad (efímero). */
export interface CartLine {
  productId: string;
  qty: number;
}

/** Ítem ya resuelto (con nombre/precio) que se envía al store al confirmar una venta. */
export interface SellItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}
