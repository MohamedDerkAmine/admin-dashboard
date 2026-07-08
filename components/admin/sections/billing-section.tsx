"use client";

import { useState } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  CreditCardIcon,
  DownloadIcon,
  ReceiptIcon,
  SparklesIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Plan = {
  id: "starter" | "growth" | "scale";
  name: string;
  price: string;
  cadence: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    cadence: "/mo",
    description: "For solo operators validating a store",
    icon: ZapIcon,
    features: [
      "Up to 1,000 orders / mo",
      "3 team members",
      "Community support",
      "Basic analytics",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$149",
    cadence: "/mo",
    description: "Multi-warehouse operations & audit trail",
    icon: SparklesIcon,
    features: [
      "Up to 25,000 orders / mo",
      "10 team members",
      "Priority support (24h SLA)",
      "Cohort retention + funnels",
      "Webhook & API access",
    ],
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "Custom",
    cadence: "",
    description: "SSO, compliance, dedicated success",
    icon: CreditCardIcon,
    features: [
      "Unlimited orders",
      "Unlimited team members",
      "SSO/SAML + SCIM",
      "SOC 2 & GDPR export",
      "Dedicated success engineer",
    ],
  },
];

type UsageMeter = {
  label: string;
  used: number;
  limit: number;
  suffix?: string;
};

const usage: UsageMeter[] = [
  { label: "Orders processed", used: 8_432, limit: 25_000 },
  { label: "Team seats", used: 6, limit: 10 },
  { label: "API calls this month", used: 74_512, limit: 250_000 },
  { label: "Webhook deliveries", used: 1_204, limit: 10_000 },
];

const invoices = [
  { id: "INV-2026-05", date: "May 01, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-04", date: "Apr 01, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-03", date: "Mar 01, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-02", date: "Feb 01, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-2026-01", date: "Jan 01, 2026", amount: "$149.00", status: "Paid" },
];

export function BillingSection() {
  const [current, setCurrent] = useState<Plan["id"]>("growth");
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="grid gap-3">
      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Plans</h2>
            <p className="text-xs text-muted-foreground">
              Compare tiers · annual billing saves 20%
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 p-0.5 text-xs">
            {(["monthly", "annual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setInterval(option)}
                className={cn(
                  "rounded px-2 py-1 capitalize transition-colors",
                  interval === option
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === current;
            const displayPrice =
              plan.price === "Custom" || interval === "monthly"
                ? plan.price
                : `$${Math.round(parseInt(plan.price.slice(1)) * 12 * 0.8)}`;
            const displayCadence =
              plan.price === "Custom"
                ? ""
                : interval === "monthly"
                  ? "/mo"
                  : "/yr";
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-md border p-4",
                  plan.highlight
                    ? "border-[var(--primary)]/60 bg-[color-mix(in_oklch,var(--primary),transparent_96%)]"
                    : "border-border/60",
                )}
              >
                {plan.highlight ? (
                  <span className="absolute right-3 top-3 rounded-sm bg-[var(--primary)] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Popular
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "grid size-7 place-items-center rounded-md",
                      plan.highlight
                        ? "bg-[var(--primary)] text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <p className="text-sm font-semibold">{plan.name}</p>
                </div>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-semibold tabular-nums">
                    {displayPrice}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {displayCadence}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.description}
                </p>
                <ul className="my-4 grid gap-1.5 border-t border-border/40 pt-3 text-xs">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 size-3 shrink-0 text-[var(--success)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={isCurrent ? "outline" : plan.highlight ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => setCurrent(plan.id)}
                  className="mt-auto w-full justify-center"
                >
                  {isCurrent ? "Current plan" : "Choose"}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <Card className="gap-0 py-0">
          <div className="border-b border-border/50 px-4 py-3">
            <p className="text-sm font-medium">Usage this cycle</p>
            <p className="text-xs text-muted-foreground">
              May 01 – May 31 · resets on the 1st
            </p>
          </div>
          <div className="grid gap-3 p-4">
            {usage.map((meter) => {
              const pct = Math.min(100, (meter.used / meter.limit) * 100);
              const highlight = pct > 80;
              return (
                <div key={meter.label}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="font-medium">{meter.label}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {meter.used.toLocaleString()} /{" "}
                      {meter.limit.toLocaleString()}
                      {meter.suffix ?? ""}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-500",
                        highlight
                          ? "bg-[var(--warning)]"
                          : "bg-[var(--primary)]",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <div className="border-b border-border/50 px-4 py-3">
            <p className="text-sm font-medium">Payment method</p>
            <p className="text-xs text-muted-foreground">
              Charged automatically on the 1st
            </p>
          </div>
          <div className="grid gap-3 p-4">
            <div className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[var(--primary)] text-primary-foreground">
                <CreditCardIcon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Visa ···· 4242</p>
                <p className="text-xs text-muted-foreground">
                  Expires 08 / 2028 · billing@example.com
                </p>
              </div>
              <Button size="xs" variant="outline">
                Update
              </Button>
            </div>
            <div className="grid gap-1.5 rounded-md border border-dashed border-border/70 px-3 py-2 text-xs">
              <p className="font-medium">Next invoice</p>
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Growth · monthly</span>
                <span className="font-mono font-semibold tabular-nums">
                  $149.00
                </span>
              </div>
              <div className="flex items-baseline justify-between text-muted-foreground">
                <span>Estimated tax</span>
                <span className="font-mono tabular-nums">$12.66</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border/40 pt-1.5">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  $161.66
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Due June 01, 2026
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <div className="border-b border-border/50 px-4 py-3">
          <p className="text-sm font-medium">Invoices</p>
          <p className="text-xs text-muted-foreground">
            Last {invoices.length} periods · downloads open the printable PDF
          </p>
        </div>
        <ol className="divide-y divide-border/40">
          {invoices.map((invoice) => (
            <li
              key={invoice.id}
              className="flex items-center gap-3 px-4 py-2.5 text-sm"
            >
              <div className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <ReceiptIcon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-medium">{invoice.id}</p>
                <p className="text-[11px] text-muted-foreground">
                  {invoice.date}
                </p>
              </div>
              <span className="font-mono text-sm tabular-nums">
                {invoice.amount}
              </span>
              <span className="inline-flex items-center gap-1 rounded-sm bg-[color-mix(in_oklch,var(--success),transparent_88%)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--success)]">
                <CheckIcon className="size-3" />
                {invoice.status}
              </span>
              <Button size="xs" variant="outline">
                <DownloadIcon className="size-3" />
                PDF
              </Button>
              <ArrowUpRightIcon className="size-3.5 text-muted-foreground" />
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
