"use client";

import { useState } from "react";
import {
  CheckIcon,
  PlusIcon,
  RadioIcon,
  RefreshCcwIcon,
  XIcon,
  ZapIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Endpoint = {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  successRate: number;
  lastDelivery: string;
};

type Delivery = {
  id: string;
  endpointId: string;
  event: string;
  status: "success" | "failed" | "retry";
  code: number;
  latencyMs: number;
  at: string;
};

const initialEndpoints: Endpoint[] = [
  {
    id: "wh_1",
    url: "https://ops.example.com/hooks/orders",
    events: ["order.created", "order.updated", "order.refunded"],
    enabled: true,
    successRate: 99.4,
    lastDelivery: "2m ago",
  },
  {
    id: "wh_2",
    url: "https://warehouse.internal/notify",
    events: ["order.shipped", "inventory.low"],
    enabled: true,
    successRate: 96.1,
    lastDelivery: "17m ago",
  },
  {
    id: "wh_3",
    url: "https://legacy.zapier-hooks.com/x/9f2a",
    events: ["review.submitted"],
    enabled: false,
    successRate: 72.5,
    lastDelivery: "3d ago",
  },
];

const initialDeliveries: Delivery[] = [
  { id: "d1", endpointId: "wh_1", event: "order.updated", status: "success", code: 200, latencyMs: 142, at: "12:04:22" },
  { id: "d2", endpointId: "wh_1", event: "order.created", status: "success", code: 200, latencyMs: 118, at: "12:03:58" },
  { id: "d3", endpointId: "wh_2", event: "inventory.low", status: "retry", code: 503, latencyMs: 5000, at: "12:02:44" },
  { id: "d4", endpointId: "wh_1", event: "order.refunded", status: "success", code: 200, latencyMs: 96, at: "12:01:12" },
  { id: "d5", endpointId: "wh_3", event: "review.submitted", status: "failed", code: 404, latencyMs: 812, at: "12:00:04" },
  { id: "d6", endpointId: "wh_2", event: "order.shipped", status: "success", code: 200, latencyMs: 132, at: "11:59:31" },
  { id: "d7", endpointId: "wh_1", event: "order.created", status: "success", code: 200, latencyMs: 104, at: "11:58:19" },
];

const statusStyle: Record<Delivery["status"], string> = {
  success:
    "border-[var(--success)]/40 bg-[color-mix(in_oklch,var(--success),transparent_88%)] text-[var(--success)]",
  failed: "border-destructive/40 bg-destructive/10 text-destructive",
  retry:
    "border-[var(--warning)]/40 bg-[color-mix(in_oklch,var(--warning),transparent_88%)] text-[var(--warning)]",
};

export function WebhooksSection() {
  const [endpoints, setEndpoints] = useState(initialEndpoints);
  const [deliveries, setDeliveries] = useState(initialDeliveries);

  function toggle(id: string) {
    setEndpoints((current) =>
      current.map((endpoint) =>
        endpoint.id === id
          ? { ...endpoint, enabled: !endpoint.enabled }
          : endpoint,
      ),
    );
  }

  function retry(id: string) {
    setDeliveries((current) =>
      current.map((delivery) =>
        delivery.id === id
          ? { ...delivery, status: "success", code: 200, latencyMs: 128 }
          : delivery,
      ),
    );
  }

  return (
    <div className="grid gap-3">
      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Webhook endpoints</h2>
            <p className="text-xs text-muted-foreground">
              {endpoints.length} subscribed · signed with HMAC-SHA256
            </p>
          </div>
          <Button size="sm">
            <PlusIcon className="size-4" />
            Add endpoint
          </Button>
        </div>
        <ol className="divide-y divide-border/40">
          {endpoints.map((endpoint) => (
            <li key={endpoint.id} className="grid gap-1.5 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                      <RadioIcon className="size-3.5" />
                    </div>
                    <p className="truncate font-mono text-sm">{endpoint.url}</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {endpoint.events.map((event) => (
                      <span
                        key={event}
                        className="rounded-sm border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-right">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold tabular-nums">
                      {endpoint.successRate.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      last {endpoint.lastDelivery}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={endpoint.enabled}
                    onClick={() => toggle(endpoint.id)}
                    className={cn(
                      "inline-flex h-5 w-9 items-center rounded-full border border-border/60 transition-colors",
                      endpoint.enabled ? "bg-[var(--success)]" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "ml-0.5 inline-block size-4 rounded-full bg-background shadow transition-transform",
                        endpoint.enabled ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="gap-0 py-0">
        <div className="border-b border-border/50 px-4 py-3">
          <p className="text-sm font-medium">Delivery log</p>
          <p className="text-xs text-muted-foreground">
            Last {deliveries.length} attempts · retries preserve payload + signature
          </p>
        </div>
        <ol className="divide-y divide-border/30">
          {deliveries.map((delivery) => {
            const endpoint = endpoints.find(
              (endpoint) => endpoint.id === delivery.endpointId,
            );
            return (
              <li
                key={delivery.id}
                className="grid grid-cols-[80px_1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5 text-xs"
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                    statusStyle[delivery.status],
                  )}
                >
                  {delivery.status === "success" ? (
                    <CheckIcon className="size-2.5" />
                  ) : delivery.status === "failed" ? (
                    <XIcon className="size-2.5" />
                  ) : (
                    <RefreshCcwIcon className="size-2.5" />
                  )}
                  {delivery.status}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono">
                    <span className="text-muted-foreground">{delivery.event}</span>
                    <span className="mx-1.5 text-muted-foreground/60">→</span>
                    <span className="truncate">{endpoint?.url}</span>
                  </p>
                </div>
                <span className="font-mono tabular-nums text-muted-foreground">
                  HTTP {delivery.code}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {delivery.latencyMs}ms
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {delivery.at}
                  </span>
                  {delivery.status !== "success" ? (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => retry(delivery.id)}
                    >
                      <ZapIcon className="size-3" />
                      Retry
                    </Button>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
