"use client";

// Estado global de la demo, montado en el layout raíz (por encima de las rutas)
// para que sobreviva a la navegación entre Shop / Plans / POS / Admin.
//
// Regla de oro: una sola fuente de verdad para `stock`. Ambos canales
// (online y físico) descuentan del mismo arreglo `products` a través de
// `applyStockAndMovements`, que además genera el InventoryMovement
// correspondiente en la misma operación.

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from "react";
import {
  Customer,
  InventoryMovement,
  MovementType,
  Order,
  Product,
  Sale,
  SellItem,
  Subscription,
} from "./types";
import { SEED_PRODUCTS } from "./seed";
import { roundCents } from "./format";
import { weekdayName } from "./plans";

interface State {
  products: Product[];
  orders: Order[];
  sales: Sale[];
  movements: InventoryMovement[];
  subscriptions: Subscription[];
}

function makeInitialState(): State {
  return {
    products: SEED_PRODUCTS.map((p) => ({ ...p })),
    orders: [],
    sales: [],
    movements: [],
    subscriptions: [],
  };
}

type Action =
  | { type: "COMMIT_ONLINE"; order: Order; nextProducts: Product[]; newMovements: InventoryMovement[] }
  | { type: "COMMIT_POS"; sale: Sale; nextProducts: Product[]; newMovements: InventoryMovement[] }
  | {
      type: "COMMIT_SUBSCRIPTION";
      order: Order;
      subscription: Subscription;
      nextProducts: Product[];
      newMovements: InventoryMovement[];
    }
  | { type: "UPDATE_SUBSCRIPTION"; id: string; patch: SubscriptionPatch }
  | { type: "RESET" };

type SubscriptionPatch = Partial<Pick<Subscription, "status" | "skippedWeeks">>;

export interface SubscribeInput {
  customer: Customer;
  /** Platillos (al precio del plan) + add-ons (a su precio de catálogo). */
  items: SellItem[];
  mealsPerWeek: number;
  pricePerMeal: number;
  preferences: string[];
  firstDelivery: number;
}

/** ¿Hay stock suficiente para vender todos los items pedidos? */
function hasEnoughStock(products: Product[], items: SellItem[]): boolean {
  return items.every((it) => {
    const p = products.find((p) => p.id === it.productId);
    return !!p && it.qty > 0 && p.stock >= it.qty;
  });
}

/**
 * ¿Todos los items pueden venderse en este canal? La línea "Meals" es
 * exclusiva de la tienda en línea y nunca debe salir por el POS, aunque
 * la UI ya lo filtre — esta es la segunda barrera, en el store.
 */
function allSellableInChannel(
  products: Product[],
  items: SellItem[],
  channel: "online" | "fisica"
): boolean {
  return items.every((it) => {
    const p = products.find((p) => p.id === it.productId);
    return !!p && p.channels.includes(channel);
  });
}

/** Descuenta stock y genera los InventoryMovement de una venta, en una sola pasada. */
function applyStockAndMovements(
  products: Product[],
  movementsSoFar: number,
  items: SellItem[],
  type: Extract<MovementType, "VENTA_ONLINE" | "VENTA_FISICA">
): { nextProducts: Product[]; newMovements: InventoryMovement[] } {
  const ts = Date.now();
  const newMovements: InventoryMovement[] = [];
  const nextProducts = products.map((p) => {
    const it = items.find((i) => i.productId === p.id);
    if (!it) return p;
    const prev = p.stock;
    const next = Math.max(0, prev - it.qty);
    newMovements.push({
      id: `M${String(movementsSoFar + newMovements.length + 1).padStart(6, "0")}`,
      productId: p.id,
      name: p.name,
      type,
      qty: -it.qty,
      prev,
      next,
      ts,
    });
    return { ...p, stock: next };
  });
  return { nextProducts, newMovements };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "COMMIT_ONLINE":
      return {
        ...state,
        products: action.nextProducts,
        orders: [...state.orders, action.order],
        movements: [...state.movements, ...action.newMovements],
      };

    case "COMMIT_POS":
      return {
        ...state,
        products: action.nextProducts,
        sales: [...state.sales, action.sale],
        movements: [...state.movements, ...action.newMovements],
      };

    case "COMMIT_SUBSCRIPTION":
      return {
        ...state,
        products: action.nextProducts,
        orders: [...state.orders, action.order],
        movements: [...state.movements, ...action.newMovements],
        subscriptions: [...state.subscriptions, action.subscription],
      };

    case "UPDATE_SUBSCRIPTION":
      return {
        ...state,
        subscriptions: state.subscriptions.map((s) =>
          s.id === action.id ? { ...s, ...action.patch } : s
        ),
      };

    case "RESET":
      return makeInitialState();

    default:
      return state;
  }
}

interface StoreContextValue {
  state: State;
  /** Devuelve el pedido creado, o null si algún item excede el stock disponible. */
  sellOnline: (customer: Customer, items: SellItem[]) => Order | null;
  /** Devuelve la venta creada, o null si algún item excede el stock disponible. */
  sellPos: (
    payment: "Cash" | "Card",
    items: SellItem[],
    cash?: number,
    change?: number
  ) => Sale | null;
  /**
   * Crea un plan de comidas: cobra el primer envío como pedido online
   * (descuenta stock + movimientos) y registra la suscripción, todo en una
   * sola operación. Devuelve null si algún item excede el stock.
   */
  subscribe: (input: SubscribeInput) => { order: Order; subscription: Subscription } | null;
  updateSubscription: (id: string, patch: SubscriptionPatch) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  const sellOnline = useCallback(
    (customer: Customer, items: SellItem[]): Order | null => {
      if (
        items.length === 0 ||
        !hasEnoughStock(state.products, items) ||
        !allSellableInChannel(state.products, items, "online")
      )
        return null;

      const { nextProducts, newMovements } = applyStockAndMovements(
        state.products,
        state.movements.length,
        items,
        "VENTA_ONLINE"
      );
      const total = roundCents(items.reduce((s, i) => s + i.price * i.qty, 0));
      const order: Order = {
        id: `#${String(126 + state.orders.length).padStart(6, "0")}`,
        channel: "online",
        customer,
        payment: "Card",
        status: "PAID",
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
        ts: Date.now(),
      };
      dispatch({ type: "COMMIT_ONLINE", order, nextProducts, newMovements });
      return order;
    },
    [state.products, state.movements.length, state.orders.length]
  );

  const sellPos = useCallback(
    (
      payment: "Cash" | "Card",
      items: SellItem[],
      cash?: number,
      change?: number
    ): Sale | null => {
      if (
        items.length === 0 ||
        !hasEnoughStock(state.products, items) ||
        !allSellableInChannel(state.products, items, "fisica")
      )
        return null;

      const { nextProducts, newMovements } = applyStockAndMovements(
        state.products,
        state.movements.length,
        items,
        "VENTA_FISICA"
      );
      const total = roundCents(items.reduce((s, i) => s + i.price * i.qty, 0));
      const sale: Sale = {
        id: `S${String(126 + state.sales.length).padStart(6, "0")}`,
        channel: "fisica",
        payment,
        cash,
        change,
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
        ts: Date.now(),
      };
      dispatch({ type: "COMMIT_POS", sale, nextProducts, newMovements });
      return sale;
    },
    [state.products, state.movements.length, state.sales.length]
  );

  const subscribe = useCallback(
    (input: SubscribeInput): { order: Order; subscription: Subscription } | null => {
      const { items } = input;
      if (
        items.length === 0 ||
        !hasEnoughStock(state.products, items) ||
        !allSellableInChannel(state.products, items, "online")
      )
        return null;

      const { nextProducts, newMovements } = applyStockAndMovements(
        state.products,
        state.movements.length,
        items,
        "VENTA_ONLINE"
      );
      const ts = Date.now();
      const subscriptionId = `SUB-${String(1001 + state.subscriptions.length)}`;
      const order: Order = {
        id: `#${String(126 + state.orders.length).padStart(6, "0")}`,
        channel: "online",
        customer: input.customer,
        payment: "Card",
        subscriptionId,
        status: "PAID",
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        total: roundCents(items.reduce((s, i) => s + i.price * i.qty, 0)),
        ts,
      };
      const subscription: Subscription = {
        id: subscriptionId,
        customer: input.customer,
        mealsPerWeek: input.mealsPerWeek,
        pricePerMeal: input.pricePerMeal,
        preferences: input.preferences,
        deliveryDay: weekdayName(input.firstDelivery),
        firstDelivery: input.firstDelivery,
        skippedWeeks: [],
        status: "ACTIVE",
        firstOrderId: order.id,
        ts,
      };
      dispatch({ type: "COMMIT_SUBSCRIPTION", order, subscription, nextProducts, newMovements });
      return { order, subscription };
    },
    [state.products, state.movements.length, state.orders.length, state.subscriptions.length]
  );

  const updateSubscription = useCallback(
    (id: string, patch: SubscriptionPatch) => dispatch({ type: "UPDATE_SUBSCRIPTION", id, patch }),
    []
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return (
    <StoreContext.Provider value={{ state, sellOnline, sellPos, subscribe, updateSubscription, reset }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
