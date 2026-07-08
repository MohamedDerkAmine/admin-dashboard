"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  FlagIcon,
  UsersIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Environment = "prod" | "staging" | "dev";

type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  owner: string;
  updatedAt: string;
  rollout: Record<Environment, { enabled: boolean; percent: number }>;
};

const initialFlags: FeatureFlag[] = [
  {
    key: "checkout.express_apple_pay",
    label: "Express Apple Pay checkout",
    description: "Skip cart page for Apple Pay eligible sessions.",
    owner: "checkout-team",
    updatedAt: "2 days ago",
    rollout: {
      prod: { enabled: true, percent: 100 },
      staging: { enabled: true, percent: 100 },
      dev: { enabled: true, percent: 100 },
    },
  },
  {
    key: "orders.async_fulfillment_queue",
    description:
      "Move fulfillment to background workers with retryable state machine.",
    label: "Async fulfillment queue",
    owner: "orders-platform",
    updatedAt: "5 hours ago",
    rollout: {
      prod: { enabled: false, percent: 0 },
      staging: { enabled: true, percent: 100 },
      dev: { enabled: true, percent: 100 },
    },
  },
  {
    key: "inventory.smart_reorder",
    label: "Smart reorder suggestions",
    description: "ML-driven reorder thresholds shown in low-stock alerts.",
    owner: "growth-experiments",
    updatedAt: "yesterday",
    rollout: {
      prod: { enabled: true, percent: 25 },
      staging: { enabled: true, percent: 100 },
      dev: { enabled: true, percent: 100 },
    },
  },
  {
    key: "reviews.ai_moderation",
    label: "AI review moderation",
    description: "Auto-flag toxicity + off-topic language on new reviews.",
    owner: "trust-safety",
    updatedAt: "1 week ago",
    rollout: {
      prod: { enabled: true, percent: 50 },
      staging: { enabled: true, percent: 100 },
      dev: { enabled: true, percent: 100 },
    },
  },
  {
    key: "billing.multi_currency",
    label: "Multi-currency display",
    description: "Show localized currency on storefront and admin views.",
    owner: "internationalization",
    updatedAt: "3 weeks ago",
    rollout: {
      prod: { enabled: false, percent: 0 },
      staging: { enabled: false, percent: 0 },
      dev: { enabled: true, percent: 100 },
    },
  },
  {
    key: "search.vector_typeahead",
    label: "Vector typeahead search",
    description: "Semantic search index for products and orders.",
    owner: "search-platform",
    updatedAt: "40 minutes ago",
    rollout: {
      prod: { enabled: false, percent: 0 },
      staging: { enabled: true, percent: 100 },
      dev: { enabled: true, percent: 100 },
    },
  },
];

const environments: Environment[] = ["dev", "staging", "prod"];

export function FeatureFlagsSection() {
  const [flags, setFlags] = useState(initialFlags);
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(key: string, env: Environment) {
    setFlags((current) =>
      current.map((flag) =>
        flag.key === key
          ? {
              ...flag,
              updatedAt: "just now",
              rollout: {
                ...flag.rollout,
                [env]: {
                  ...flag.rollout[env],
                  enabled: !flag.rollout[env].enabled,
                  percent: !flag.rollout[env].enabled
                    ? flag.rollout[env].percent || 100
                    : flag.rollout[env].percent,
                },
              },
            }
          : flag,
      ),
    );
  }

  function setPercent(key: string, env: Environment, percent: number) {
    setFlags((current) =>
      current.map((flag) =>
        flag.key === key
          ? {
              ...flag,
              updatedAt: "just now",
              rollout: {
                ...flag.rollout,
                [env]: { ...flag.rollout[env], percent, enabled: percent > 0 },
              },
            }
          : flag,
      ),
    );
  }

  const enabledProd = flags.filter((flag) => flag.rollout.prod.enabled).length;

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Feature flags</h2>
          <p className="text-xs text-muted-foreground">
            {flags.length} flag{flags.length === 1 ? "" : "s"} · {enabledProd}{" "}
            enabled in prod
          </p>
        </div>
      </div>
      <ol className="divide-y divide-border/40">
        {flags.map((flag) => {
          const isOpen = expanded === flag.key;
          return (
            <li key={flag.key}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : flag.key)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
              >
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <FlagIcon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{flag.label}</p>
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {flag.key}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {flag.description}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <UsersIcon className="size-3" />
                      {flag.owner}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      updated {flag.updatedAt}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {environments.map((env) => {
                    const r = flag.rollout[env];
                    return (
                      <span
                        key={env}
                        title={`${env}: ${r.enabled ? `${r.percent}%` : "off"}`}
                        className={cn(
                          "inline-flex h-5 items-center gap-1 rounded-sm border px-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                          r.enabled
                            ? "border-[var(--success)]/40 bg-[color-mix(in_oklch,var(--success),transparent_92%)] text-[var(--success)]"
                            : "border-border/60 bg-muted/40 text-muted-foreground",
                        )}
                      >
                        {env}
                        <span className="tabular-nums">
                          {r.enabled ? `${r.percent}` : "off"}
                        </span>
                      </span>
                    );
                  })}
                  <ChevronDownIcon
                    className={cn(
                      "ml-1 size-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </div>
              </button>
              {isOpen ? (
                <div className="grid gap-3 border-t border-border/40 bg-muted/20 px-4 py-3">
                  {environments.map((env) => {
                    const r = flag.rollout[env];
                    return (
                      <div
                        key={env}
                        className="grid grid-cols-[80px_auto_1fr_60px] items-center gap-3"
                      >
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {env}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggle(flag.key, env)}
                          role="switch"
                          aria-checked={r.enabled}
                          className={cn(
                            "inline-flex h-5 w-9 items-center rounded-full border border-border/60 transition-colors",
                            r.enabled ? "bg-[var(--success)]" : "bg-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "ml-0.5 inline-block size-4 rounded-full bg-background shadow transition-transform",
                              r.enabled ? "translate-x-4" : "translate-x-0",
                            )}
                          />
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          disabled={!r.enabled}
                          value={r.percent}
                          onChange={(event) =>
                            setPercent(flag.key, env, Number(event.target.value))
                          }
                          className="w-full accent-[var(--primary)] disabled:opacity-40"
                        />
                        <span className="text-right font-mono text-xs tabular-nums">
                          {r.enabled ? `${r.percent}%` : "off"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
