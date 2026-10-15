"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  CreditCard,
  Flame,
  Minus,
  Plus,
  Sparkles,
  Timer,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/lib/store-context";
import { DEFAULT_CUSTOMER } from "@/lib/seed";
import { formatMoney, roundCents } from "@/lib/format";
import {
  DEFAULT_PLAN,
  PLAN_OPTIONS,
  PLAN_SHIPPING,
  PREFERENCES,
  PlanOption,
  formatDeliveryDate,
  upcomingDeliveryDates,
  weekdayName,
} from "@/lib/plans";
import { Customer, Order, Product, Subscription } from "@/lib/types";
import { ProductPhoto } from "@/components/product-photo";
import { StockBadge } from "@/components/stock-badge";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STEPS = ["Plan", "Delivery", "Meals", "Checkout"] as const;
const ALL_TAG = "All";

const customerSchema = z.object({
  nombre: z.string().min(2, "Enter a name"),
  telefono: z.string().min(7, "Enter a valid phone number"),
  correo: z.email("Invalid email"),
  direccion: z.string().min(5, "Enter an address"),
});
type CustomerFormValues = z.infer<typeof customerSchema>;

type Qty = Record<string, number>;

function sumQty(q: Qty) {
  return Object.values(q).reduce((s, n) => s + n, 0);
}

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2 overflow-x-auto">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <li key={label} className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full text-xs font-bold",
                done && "bg-primary text-primary-foreground",
                active && "bg-foreground text-background",
                !done && !active && "bg-muted text-muted-foreground"
              )}
            >
              {done ? <Check className="size-4" /> : n}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {n < STEPS.length && <span className="mx-1 h-px w-6 bg-border sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}

function QtyControl({
  qty,
  onMinus,
  onPlus,
  plusDisabled,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
  plusDisabled: boolean;
}) {
  if (qty === 0) {
    return (
      <Button size="sm" className="w-full gap-1.5 rounded-full" disabled={plusDisabled} onClick={onPlus}>
        <Plus className="size-4" />
        Add
      </Button>
    );
  }
  return (
    <div className="flex w-full items-center justify-between rounded-full bg-primary/10 p-1">
      <Button variant="ghost" size="icon-sm" className="rounded-full" onClick={onMinus}>
        <Minus className="size-3.5" />
      </Button>
      <span className="text-sm font-bold tabular-nums">{qty}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-full"
        disabled={plusDisabled}
        onClick={onPlus}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}

export default function PlansPage() {
  const { state, subscribe } = useStore();
  const { products } = state;

  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState<PlanOption>(DEFAULT_PLAN);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [customer, setCustomer] = useState<Customer>(DEFAULT_CUSTOMER);
  const deliveryDates = useMemo(() => upcomingDeliveryDates(), []);
  const [deliveryTs, setDeliveryTs] = useState(() => deliveryDates[0].getTime());
  const [meals, setMeals] = useState<Qty>({});
  const [addOns, setAddOns] = useState<Qty>({});
  const [filterTag, setFilterTag] = useState(ALL_TAG);
  const [result, setResult] = useState<{ order: Order; subscription: Subscription } | null>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: DEFAULT_CUSTOMER,
  });

  const mealProducts = useMemo(
    () => products.filter((p) => p.category === "Meals" && p.mealInfo),
    [products]
  );
  const addOnProducts = useMemo(
    () => products.filter((p) => p.category !== "Meals" && p.channels.includes("online")),
    [products]
  );

  // Recomendados primero: platillos que coinciden con alguna preferencia.
  const isRecommended = (p: Product) =>
    preferences.some((tag) => p.mealInfo?.tags.includes(tag));
  const visibleMeals = [
    ...(filterTag === ALL_TAG
      ? mealProducts
      : mealProducts.filter((p) => p.mealInfo?.tags.includes(filterTag))),
  ].sort((a, b) => Number(isRecommended(b)) - Number(isRecommended(a)));

  const mealCount = sumQty(meals);
  const mealsFull = mealCount === plan.mealsPerWeek;
  const mealsSubtotal = roundCents(plan.mealsPerWeek * plan.pricePerMeal);
  const addOnsSubtotal = roundCents(
    Object.entries(addOns).reduce(
      (s, [id, qty]) => s + (products.find((p) => p.id === id)?.price ?? 0) * qty,
      0
    )
  );
  const weeklyTotal = roundCents(mealsSubtotal + PLAN_SHIPPING);
  const firstBoxTotal = roundCents(weeklyTotal + addOnsSubtotal);

  function choosePlan(option: PlanOption) {
    setPlan(option);
    // Si ya había más platillos elegidos de los que permite el nuevo plan, se reinicia la selección.
    if (mealCount > option.mealsPerWeek) setMeals({});
  }

  function togglePreference(tag: string) {
    setPreferences((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function changeQty(setter: typeof setMeals, id: string, delta: number) {
    setter((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + delta };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  function onDeliverySubmit(values: CustomerFormValues) {
    setCustomer(values);
    setStep(3);
  }

  function placeOrder() {
    const mealItems = Object.entries(meals).map(([id, qty]) => {
      const p = products.find((x) => x.id === id)!;
      return { productId: id, name: p.name, price: plan.pricePerMeal, qty };
    });
    const addOnItems = Object.entries(addOns).map(([id, qty]) => {
      const p = products.find((x) => x.id === id)!;
      return { productId: id, name: p.name, price: p.price, qty };
    });
    const res = subscribe({
      customer,
      items: [...mealItems, ...addOnItems],
      mealsPerWeek: plan.mealsPerWeek,
      pricePerMeal: plan.pricePerMeal,
      preferences,
      firstDelivery: deliveryTs,
    });
    if (res) {
      toast.success(`Meal plan ${res.subscription.id} created`, {
        description: `First box ${res.order.id} · ${formatMoney(firstBoxTotal)}`,
      });
      setResult(res);
    } else {
      toast.error("Not enough stock", {
        description: "Some meals or add-ons just sold out. Adjust your box and try again.",
      });
      setStep(3);
    }
  }

  function startOver() {
    setResult(null);
    setMeals({});
    setAddOns({});
    setStep(1);
  }

  // ── Confirmación ──────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
        <CircleCheck className="size-14 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set!</h1>
        <p className="text-muted-foreground">
          Your first box ({result.order.id}) arrives{" "}
          <span className="font-semibold text-foreground">
            {formatDeliveryDate(result.subscription.firstDelivery)}
          </span>
          . After that, a new box every {result.subscription.deliveryDay} — skip, pause or
          cancel anytime.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/account">
            <Button size="lg" className="gap-2">
              Manage my plan
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={startOver}>
            Build another plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-32">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Weekly meal plans</h1>
        <p className="text-sm text-muted-foreground">
          Chef-prepared meals delivered weekly. Heat in minutes, skip or cancel anytime.
        </p>
      </div>

      <StepIndicator step={step} />

      {/* ── Paso 1: plan ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section>
              <h2 className="text-lg font-semibold">1. What are your goals?</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Select all that apply — we&apos;ll recommend meals that match.
              </p>
              <div className="flex flex-wrap gap-2">
                {PREFERENCES.map((pref) => {
                  const active = preferences.includes(pref.tag);
                  return (
                    <button
                      key={pref.tag}
                      type="button"
                      onClick={() => togglePreference(pref.tag)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border hover:border-foreground/40"
                      )}
                    >
                      <span aria-hidden>{pref.emoji}</span>
                      {pref.label}
                      {active && <Check className="size-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold">2. How many meals per week?</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                The more meals, the lower the price per meal.
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {PLAN_OPTIONS.map((option) => {
                  const active = option.mealsPerWeek === plan.mealsPerWeek;
                  return (
                    <button
                      key={option.mealsPerWeek}
                      type="button"
                      onClick={() => choosePlan(option)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-xl border px-3 py-4 transition-colors",
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-foreground/40"
                      )}
                    >
                      <span className="text-2xl font-bold">{option.mealsPerWeek}</span>
                      <span className="text-xs text-muted-foreground">meals</span>
                      <span className="mt-1 text-xs font-semibold text-primary">
                        {formatMoney(option.pricePerMeal)}/meal
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <Card className="h-fit gap-3 py-5 lg:sticky lg:top-32">
            <CardHeader className="px-5">
              <p className="font-semibold">Your plan</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 px-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {plan.mealsPerWeek} meals × {formatMoney(plan.pricePerMeal)}
                </span>
                <span>{formatMoney(mealsSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatMoney(PLAN_SHIPPING)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-semibold">
                <span>Weekly total</span>
                <span>{formatMoney(weeklyTotal)}</span>
              </div>
              <Button className="mt-3 w-full gap-2" size="lg" onClick={() => setStep(2)}>
                Select this plan
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Skip a week, pause or cancel anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Paso 2: entrega ──────────────────────────────────────────── */}
      {step === 2 && (
        <form
          onSubmit={form.handleSubmit(onDeliverySubmit)}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <Card className="gap-4 py-5">
            <CardHeader className="px-5">
              <p className="font-semibold">Delivery details</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-5">
              {(
                [
                  ["nombre", "Name", "text"],
                  ["telefono", "Phone", "text"],
                  ["correo", "Email", "email"],
                  ["direccion", "Delivery address", "text"],
                ] as const
              ).map(([field, label, type]) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <Label htmlFor={`plan-${field}`}>{label}</Label>
                  <Input id={`plan-${field}`} type={type} {...form.register(field)} />
                  {form.formState.errors[field] && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="gap-4 py-5">
            <CardHeader className="px-5">
              <p className="flex items-center gap-2 font-semibold">
                <Truck className="size-4" />
                Pick your first delivery day
              </p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll get a new box on the same weekday every week.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 px-5 sm:grid-cols-3">
              {deliveryDates.map((d) => {
                const ts = d.getTime();
                const active = ts === deliveryTs;
                return (
                  <button
                    key={ts}
                    type="button"
                    onClick={() => setDeliveryTs(ts)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    {formatDeliveryDate(ts)}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-between lg:col-span-2">
            <Button type="button" variant="outline" className="gap-2" onClick={() => setStep(1)}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button type="submit" className="gap-2">
              Choose meals
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      )}

      {/* ── Paso 3: platillos + add-ons ──────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-10">
          <section>
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold">
                Choose {plan.mealsPerWeek} meals for {formatDeliveryDate(deliveryTs)}
              </h2>
              <p className="text-sm text-muted-foreground">
                You can pick the same meal more than once.
              </p>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {[ALL_TAG, ...PREFERENCES.map((p) => p.tag)].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFilterTag(tag)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    filterTag === tag
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleMeals.map((meal) => {
                const qty = meals[meal.id] ?? 0;
                return (
                  <Card
                    key={meal.id}
                    className={cn(
                      "gap-0 overflow-hidden rounded-2xl border-0 py-0 shadow-sm ring-1 ring-border/60",
                      qty > 0 && "ring-2 ring-primary"
                    )}
                  >
                    <div className="relative">
                      <ProductPhoto
                        query={meal.photoQuery}
                        category={meal.category}
                        emoji={meal.emoji}
                        className="aspect-4/3 w-full"
                      />
                      <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                        {isRecommended(meal) && (
                          <Badge className="gap-1">
                            <Sparkles className="size-3" />
                            Recommended
                          </Badge>
                        )}
                        {meal.stock <= meal.minStock && <StockBadge product={meal} />}
                      </div>
                    </div>
                    <CardContent className="flex flex-1 flex-col gap-2 p-4">
                      <h3 className="font-semibold leading-tight">{meal.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="size-3.5 text-primary" />
                          {meal.mealInfo?.calories} kcal
                        </span>
                        <span>•</span>
                        <span>{meal.mealInfo?.protein}g protein</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Timer className="size-3.5" />
                          {meal.mealInfo?.minutes} min
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meal.mealInfo?.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto pt-2">
                        <QtyControl
                          qty={qty}
                          onMinus={() => changeQty(setMeals, meal.id, -1)}
                          onPlus={() => changeQty(setMeals, meal.id, 1)}
                          plusDisabled={mealsFull || qty >= meal.stock}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Boost your box</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Optional add-ons from the ATHL8 selection, delivered with your first box.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {addOnProducts.map((p) => {
                const qty = addOns[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/60",
                      qty > 0 && "ring-2 ring-primary",
                      p.stock === 0 && "opacity-50"
                    )}
                  >
                    <ProductPhoto
                      query={p.photoQuery}
                      category={p.category}
                      emoji={p.emoji}
                      emojiClassName="text-4xl"
                      className="aspect-square w-full"
                    />
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                      <p className="text-sm font-semibold leading-tight">{p.name}</p>
                      <p className="text-sm font-bold text-primary">{formatMoney(p.price)}</p>
                      <div className="mt-auto pt-1">
                        <QtyControl
                          qty={qty}
                          onMinus={() => changeQty(setAddOns, p.id, -1)}
                          onPlus={() => changeQty(setAddOns, p.id, 1)}
                          plusDisabled={qty >= p.stock}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Barra fija con el progreso de la caja */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
              <Button variant="outline" size="icon" onClick={() => setStep(2)} aria-label="Back">
                <ArrowLeft className="size-4" />
              </Button>
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-sm font-medium">
                  {mealCount} of {plan.mealsPerWeek} meals selected
                  {addOnsSubtotal > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      · add-ons {formatMoney(addOnsSubtotal)}
                    </span>
                  )}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(mealCount / plan.mealsPerWeek) * 100}%` }}
                  />
                </div>
              </div>
              <Button className="gap-2" disabled={!mealsFull} onClick={() => setStep(4)}>
                {mealsFull ? "Continue" : `Add ${plan.mealsPerWeek - mealCount} more`}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Paso 4: checkout ─────────────────────────────────────────── */}
      {step === 4 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card className="gap-2 py-5">
              <CardHeader className="flex flex-row items-center justify-between px-5">
                <p className="font-semibold">Delivery</p>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="px-5 text-sm">
                <p className="font-medium">{customer.nombre}</p>
                <p className="text-muted-foreground">{customer.direccion}</p>
                <p className="text-muted-foreground">
                  {customer.correo} · {customer.telefono}
                </p>
                <p className="mt-2">
                  First delivery:{" "}
                  <span className="font-semibold">{formatDeliveryDate(deliveryTs)}</span>, then
                  every {weekdayName(deliveryTs)}.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-2 py-5">
              <CardHeader className="flex flex-row items-center justify-between px-5">
                <p className="font-semibold">Your first box</p>
                <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="px-5">
                <ul className="flex flex-col gap-2 text-sm">
                  {Object.entries(meals).map(([id, qty]) => {
                    const p = products.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <li key={id} className="flex items-center gap-2">
                        <span aria-hidden>{p.emoji}</span>
                        <span className="flex-1">{p.name}</span>
                        <span className="text-muted-foreground">× {qty}</span>
                      </li>
                    );
                  })}
                  {Object.entries(addOns).map(([id, qty]) => {
                    const p = products.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <li key={id} className="flex items-center gap-2">
                        <span aria-hidden>{p.emoji}</span>
                        <span className="flex-1">
                          {p.name}{" "}
                          <span className="text-xs text-muted-foreground">(add-on)</span>
                        </span>
                        <span className="text-muted-foreground">
                          × {qty} · {formatMoney(p.price * qty)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit gap-3 py-5 lg:sticky lg:top-32">
            <CardHeader className="px-5">
              <p className="font-semibold">Order summary</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 px-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {plan.mealsPerWeek} meals × {formatMoney(plan.pricePerMeal)}
                </span>
                <span>{formatMoney(mealsSubtotal)}</span>
              </div>
              {addOnsSubtotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span>{formatMoney(addOnsSubtotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatMoney(PLAN_SHIPPING)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-semibold">
                <span>Due today</span>
                <span>{formatMoney(firstBoxTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Then {formatMoney(weeklyTotal)}/week. Skip, pause or cancel anytime.
              </p>
              <Button className="mt-3 w-full gap-2" size="lg" onClick={placeOrder}>
                <CreditCard className="size-4" />
                Pay with card · {formatMoney(firstBoxTotal)}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo — no real payment is made.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
