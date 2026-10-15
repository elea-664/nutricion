// Configuración del flujo de planes de comida (estilo suscripción semanal).
// El precio por comida baja conforme se piden más comidas por semana.

export interface PlanOption {
  mealsPerWeek: number;
  pricePerMeal: number;
}

export const PLAN_OPTIONS: PlanOption[] = [
  { mealsPerWeek: 4, pricePerMeal: 13.49 },
  { mealsPerWeek: 6, pricePerMeal: 12.49 },
  { mealsPerWeek: 8, pricePerMeal: 11.99 },
  { mealsPerWeek: 10, pricePerMeal: 11.49 },
  { mealsPerWeek: 12, pricePerMeal: 10.99 },
];

export const DEFAULT_PLAN = PLAN_OPTIONS[1];

export const PLAN_SHIPPING = 5.99;

/** Preferencias = etiquetas de los platillos (mealInfo.tags). */
export const PREFERENCES = [
  { tag: "30g+ Protein", label: "High protein", emoji: "💪" },
  { tag: "Post-Workout", label: "Post-workout", emoji: "🏋️" },
  { tag: "Low Carb", label: "Low carb", emoji: "🥩" },
  { tag: "Vegan", label: "Vegan", emoji: "🌱" },
  { tag: "Quick", label: "Quick & easy", emoji: "⏱️" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;

/**
 * Próximas fechas de entrega disponibles: desde 2 días después de hoy,
 * durante una semana, sin domingos.
 */
export function upcomingDeliveryDates(now = Date.now()): Date[] {
  const start = new Date(now);
  start.setHours(12, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = 2; i < 9; i++) {
    const d = new Date(start.getTime() + i * DAY_MS);
    if (d.getDay() !== 0) dates.push(d);
  }
  return dates;
}

export function weekdayName(ts: number): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(ts));
}

export function formatDeliveryDate(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(ts));
}
