"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays, Pause, Play, SkipForward, Undo2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { useStore } from "@/lib/store-context";
import { formatMoney, roundCents } from "@/lib/format";
import { PLAN_SHIPPING, PREFERENCES, WEEK_MS, formatDeliveryDate } from "@/lib/plans";
import { Subscription } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const UPCOMING_WEEKS = 4;

const STATUS_STYLE: Record<Subscription["status"], string> = {
  ACTIVE: "border-emerald-400 bg-emerald-100 text-emerald-800",
  PAUSED: "border-amber-400 bg-amber-100 text-amber-800",
  CANCELLED: "border-destructive/40 bg-destructive/10 text-destructive",
};

const STATUS_LABEL: Record<Subscription["status"], string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
};

function preferenceLabel(tag: string) {
  return PREFERENCES.find((p) => p.tag === tag)?.label ?? tag;
}

export default function AccountPage() {
  const { state, updateSubscription } = useStore();
  const subscriptions = [...state.subscriptions].sort((a, b) => b.ts - a.ts);
  const [cancelId, setCancelId] = useState<string | null>(null);

  function toggleSkip(sub: Subscription, week: number) {
    const skipped = sub.skippedWeeks.includes(week);
    updateSubscription(sub.id, {
      skippedWeeks: skipped
        ? sub.skippedWeeks.filter((w) => w !== week)
        : [...sub.skippedWeeks, week],
    });
    toast.success(skipped ? "Delivery restored" : "Week skipped", {
      description: formatDeliveryDate(sub.firstDelivery + week * WEEK_MS),
    });
  }

  function setStatus(sub: Subscription, status: Subscription["status"]) {
    updateSubscription(sub.id, { status });
    toast.success(
      status === "PAUSED" ? "Plan paused" : status === "ACTIVE" ? "Plan resumed" : "Plan cancelled",
      { description: sub.id }
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My meal plan</h1>
        <p className="text-sm text-muted-foreground">
          Manage upcoming deliveries: skip a week, pause or cancel anytime.
        </p>
      </div>

      {subscriptions.length === 0 && (
        <Card className="items-center gap-3 py-12 text-center">
          <CalendarDays className="size-10 text-muted-foreground" />
          <p className="font-medium">You don&apos;t have a meal plan yet.</p>
          <Link href="/plans">
            <Button className="gap-2">
              Build your plan
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        {subscriptions.map((sub) => {
          const weekly = roundCents(sub.mealsPerWeek * sub.pricePerMeal + PLAN_SHIPPING);
          const cancelled = sub.status === "CANCELLED";
          return (
            <Card key={sub.id} className={cn("gap-4 py-5", cancelled && "opacity-70")}>
              <CardHeader className="flex flex-col gap-3 px-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{sub.id}</p>
                    <Badge variant="outline" className={STATUS_STYLE[sub.status]}>
                      {STATUS_LABEL[sub.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sub.mealsPerWeek} meals/week · {formatMoney(sub.pricePerMeal)}/meal ·{" "}
                    {formatMoney(weekly)}/week incl. shipping
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Every {sub.deliveryDay} · {sub.customer.direccion}
                  </p>
                  {sub.preferences.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {sub.preferences.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {preferenceLabel(t)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!cancelled && (
                  <div className="flex gap-2">
                    {sub.status === "ACTIVE" ? (
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setStatus(sub, "PAUSED")}>
                        <Pause className="size-3.5" />
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-1.5" onClick={() => setStatus(sub, "ACTIVE")}>
                        <Play className="size-3.5" />
                        Resume
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-destructive"
                      onClick={() => setCancelId(sub.id)}
                    >
                      <XCircle className="size-3.5" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="px-5">
                <p className="mb-2 text-sm font-medium">Upcoming deliveries</p>
                <ul className="divide-y rounded-xl border">
                  {Array.from({ length: UPCOMING_WEEKS }, (_, week) => {
                    const ts = sub.firstDelivery + week * WEEK_MS;
                    const isFirst = week === 0;
                    const skipped = sub.skippedWeeks.includes(week);
                    let label: string;
                    let tone: string;
                    if (isFirst) {
                      label = `Paid · order ${sub.firstOrderId}`;
                      tone = "text-emerald-700";
                    } else if (cancelled) {
                      label = "Cancelled";
                      tone = "text-destructive";
                    } else if (sub.status === "PAUSED") {
                      label = "Paused";
                      tone = "text-amber-700";
                    } else if (skipped) {
                      label = "Skipped";
                      tone = "text-muted-foreground line-through";
                    } else {
                      label = `Scheduled · ${formatMoney(weekly)}`;
                      tone = "text-foreground";
                    }
                    const canSkip = !isFirst && sub.status === "ACTIVE";
                    return (
                      <li key={week} className="flex items-center gap-3 px-4 py-3 text-sm">
                        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                        <span className="w-28 shrink-0 font-medium">{formatDeliveryDate(ts)}</span>
                        <span className={cn("flex-1", tone)}>{label}</span>
                        {canSkip && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => toggleSkip(sub, week)}
                          >
                            {skipped ? (
                              <>
                                <Undo2 className="size-3.5" />
                                Unskip
                              </>
                            ) : (
                              <>
                                <SkipForward className="size-3.5" />
                                Skip
                              </>
                            )}
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel {cancelId}?</DialogTitle>
            <DialogDescription>
              Your already-paid first box will still be delivered. No future boxes will be sent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)}>
              Keep my plan
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const sub = state.subscriptions.find((s) => s.id === cancelId);
                if (sub) setStatus(sub, "CANCELLED");
                setCancelId(null);
              }}
            >
              Cancel plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
