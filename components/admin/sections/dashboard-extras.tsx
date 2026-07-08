"use client";

import { useState } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronRightIcon,
  RocketIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import type { Order } from "@/lib/admin-data";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChecklistStep = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
};

export function GettingStartedCard({
  steps,
  onDismiss,
}: {
  steps: ChecklistStep[];
  onDismiss?: () => void;
}) {
  const done = steps.filter((step) => step.done).length;
  const pct = Math.round((done / Math.max(steps.length, 1)) * 100);
  const circumference = 2 * Math.PI * 18;
  const dash = (circumference * pct) / 100;

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative grid size-11 place-items-center">
            <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="var(--border)"
                strokeWidth="3"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                className="transition-[stroke-dasharray] duration-500"
              />
            </svg>
            <span className="absolute font-mono text-[10px] font-semibold tabular-nums">
              {pct}%
            </span>
          </div>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <RocketIcon className="size-3" />
              Getting started
            </p>
            <p className="text-sm font-semibold">
              {done} of {steps.length} steps complete
            </p>
          </div>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <XIcon className="size-3.5" />
          </button>
        ) : null}
      </div>
      <ol className="divide-y divide-border/40">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-center gap-3 px-4 py-2.5 text-sm"
          >
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full border",
                step.done
                  ? "border-transparent bg-[var(--success)] text-white"
                  : "border-border/70 bg-background text-muted-foreground",
              )}
            >
              {step.done ? <CheckIcon className="size-3" /> : null}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate font-medium",
                  step.done && "text-muted-foreground line-through",
                )}
              >
                {step.label}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {step.hint}
              </p>
            </div>
            {!step.done ? (
              <ChevronRightIcon className="size-3.5 text-muted-foreground/60" />
            ) : null}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function AnomalyBanner({ orders }: { orders: Order[] }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const refunded = orders.filter((o) => o.status === "Refunded").length;
  const total = orders.length;
  if (total === 0) return null;
  const rate = refunded / total;
  // Threshold: > 15% refund rate for a 7-order window flags as anomaly
  if (rate < 0.15) return null;

  const delta = ((rate - 0.05) * 100).toFixed(1);

  return (
    <div className="flex items-start gap-3 rounded-md border border-[var(--warning)]/40 bg-[color-mix(in_oklch,var(--warning),transparent_90%)] px-4 py-2.5">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--warning)]/20 text-[var(--warning)]">
        <TriangleAlertIcon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          Refund rate is elevated ({Math.round(rate * 100)}%){" "}
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--warning)]">
            <ArrowUpRightIcon className="size-3" />+{delta}pp vs baseline
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {refunded} of the last {total} orders were refunded. Review recent
          fulfillment issues or damage reports.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss anomaly"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}
