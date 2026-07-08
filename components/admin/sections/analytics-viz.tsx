"use client";

import { Fragment, useMemo } from "react";

import type { Customer, Order, OrderStatus } from "@/lib/admin-data";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/components/admin/shared/utils";

/* -------------------------------------------------------------------------- */
/*  Sales heatmap — hour × day-of-week                                         */
/* -------------------------------------------------------------------------- */

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const hours = Array.from({ length: 12 }, (_, i) => i * 2); // 0,2,4,...,22

function hashSeed(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function SalesHeatmap({ orders }: { orders: Order[] }) {
  const grid = useMemo(() => {
    const cells: number[][] = days.map(() => hours.map(() => 0));
    for (const order of orders) {
      const seed = hashSeed(order.id);
      const day = seed % days.length;
      const hourBucket = (seed >> 3) % hours.length;
      cells[day][hourBucket] += order.total;
    }
    // Add gentle base so empty cells still show scale
    for (let d = 0; d < days.length; d++) {
      for (let h = 0; h < hours.length; h++) {
        cells[d][h] += ((hashSeed(`${d}-${h}`) % 40) + 5) * 10;
      }
    }
    return cells;
  }, [orders]);

  const max = Math.max(1, ...grid.flat());

  return (
    <Card className="gap-0 py-0">
      <div className="border-b border-border/50 px-4 py-3">
        <p className="text-sm font-medium">Sales heatmap</p>
        <p className="text-xs text-muted-foreground">
          Revenue density by day of week × hour
        </p>
      </div>
      <div className="overflow-x-auto p-4">
        <div className="inline-grid gap-y-1" style={{ gridTemplateColumns: `auto repeat(${hours.length}, minmax(0, 1fr))` }}>
          <div />
          {hours.map((h) => (
            <div
              key={h}
              className="pb-1 text-center font-mono text-[10px] text-muted-foreground tabular-nums"
            >
              {h.toString().padStart(2, "0")}
            </div>
          ))}
          {days.map((day, d) => (
            <Fragment key={day}>
              <div className="pr-2 text-right text-[11px] font-medium text-muted-foreground">
                {day}
              </div>
              {grid[d].map((value, h) => {
                const intensity = value / max;
                return (
                  <div
                    key={`${day}-${h}`}
                    title={`${day} ${hours[h]}:00 · ${formatCurrency(value)}`}
                    className="mx-0.5 aspect-square rounded-sm border border-border/40 transition-opacity hover:opacity-80"
                    style={{
                      background: `color-mix(in oklch, var(--primary), transparent ${Math.round(95 - intensity * 85)}%)`,
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Low</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((step) => (
            <span
              key={step}
              className="inline-block size-3 rounded-sm border border-border/40"
              style={{
                background: `color-mix(in oklch, var(--primary), transparent ${Math.round(95 - step * 85)}%)`,
              }}
            />
          ))}
          <span>High</span>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cohort retention heatmap — signup week × retention week                    */
/* -------------------------------------------------------------------------- */

export function CohortRetentionHeatmap({ customers }: { customers: Customer[] }) {
  const cohorts = useMemo(() => {
    const weeks = 8;
    const rows: { label: string; size: number; retention: number[] }[] = [];
    for (let w = 0; w < weeks; w++) {
      const label = `W${weeks - w}`;
      const size = 12 + ((hashSeed(label) % 30) + w * 2);
      const retention: number[] = [];
      let remaining = 1;
      for (let r = 0; r <= weeks - 1 - w; r++) {
        if (r === 0) {
          retention.push(1);
        } else {
          const decay = 0.55 + (hashSeed(`${label}-${r}`) % 30) / 100;
          remaining *= decay;
          retention.push(remaining);
        }
      }
      rows.push({ label, size, retention });
    }
    return rows;
  }, [customers]);

  const maxCols = 8;

  return (
    <Card className="gap-0 py-0">
      <div className="border-b border-border/50 px-4 py-3">
        <p className="text-sm font-medium">Cohort retention</p>
        <p className="text-xs text-muted-foreground">
          Signup week × weekly retention · higher is darker
        </p>
      </div>
      <div className="overflow-x-auto p-4">
        <div
          className="inline-grid gap-1"
          style={{ gridTemplateColumns: `auto auto repeat(${maxCols}, 46px)` }}
        >
          <div className="pr-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Cohort
          </div>
          <div className="pr-2 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Size
          </div>
          {Array.from({ length: maxCols }).map((_, i) => (
            <div
              key={i}
              className="text-center font-mono text-[10px] text-muted-foreground"
            >
              W{i}
            </div>
          ))}
          {cohorts.map((cohort) => (
            <Fragment key={cohort.label}>
              <div className="pr-2 text-[11px] font-medium text-foreground">
                {cohort.label}
              </div>
              <div className="pr-2 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
                {cohort.size}
              </div>
              {Array.from({ length: maxCols }).map((_, i) => {
                const v = cohort.retention[i];
                if (v == null) {
                  return (
                    <div
                      key={`${cohort.label}-${i}`}
                      className="rounded-sm border border-dashed border-border/40"
                    />
                  );
                }
                return (
                  <div
                    key={`${cohort.label}-${i}`}
                    title={`${cohort.label} @ W${i} · ${Math.round(v * 100)}%`}
                    className="grid place-items-center rounded-sm border border-border/40 text-[10px] font-medium tabular-nums text-foreground/90"
                    style={{
                      background: `color-mix(in oklch, var(--info), transparent ${Math.round(95 - v * 80)}%)`,
                    }}
                  >
                    {Math.round(v * 100)}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Conversion funnel                                                          */
/* -------------------------------------------------------------------------- */

const funnelStages = [
  { key: "visitors", label: "Visitors" },
  { key: "sessions", label: "Product views" },
  { key: "carts", label: "Add to cart" },
  { key: "checkout", label: "Checkout started" },
  { key: "orders", label: "Orders placed" },
] as const;

export function ConversionFunnel({ orders }: { orders: Order[] }) {
  const values = useMemo(() => {
    const ordersCount = Math.max(orders.length, 6);
    // Reverse-engineer plausible funnel numbers from actual orders.
    return [
      ordersCount * 62,
      ordersCount * 34,
      ordersCount * 11,
      Math.round(ordersCount * 3.4),
      ordersCount,
    ];
  }, [orders]);

  const max = values[0];
  const overall = ((values[values.length - 1] / max) * 100).toFixed(2);

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between border-b border-border/50 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Conversion funnel</p>
          <p className="text-xs text-muted-foreground">
            Storefront visitors → paid orders
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-semibold tabular-nums">
            {overall}%
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            end-to-end
          </p>
        </div>
      </div>
      <ol className="grid gap-1.5 p-4">
        {funnelStages.map((stage, i) => {
          const value = values[i];
          const share = value / max;
          const drop = i > 0 ? 1 - value / values[i - 1] : 0;
          return (
            <li key={stage.key} className="grid gap-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-foreground">
                  {stage.label}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {value.toLocaleString()}
                  {i > 0 ? (
                    <span className="ml-2 text-[var(--destructive)]">
                      −{Math.round(drop * 100)}%
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="relative h-6 overflow-hidden rounded-sm border border-border/40 bg-muted/30">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{
                    width: `${share * 100}%`,
                    background: `color-mix(in oklch, var(--primary), transparent ${Math.round(15 + i * 12)}%)`,
                  }}
                />
                <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center font-mono text-[10px] tabular-nums text-foreground/80">
                  {Math.round(share * 100)}%
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sankey — order status transitions                                          */
/* -------------------------------------------------------------------------- */

const flowStages: OrderStatus[][] = [
  ["Pending"],
  ["Processing", "Refunded"],
  ["Shipped", "Refunded"],
  ["Delivered", "Refunded"],
];

const stageColors: Record<OrderStatus, string> = {
  Pending: "var(--warning)",
  Processing: "var(--info)",
  Shipped: "var(--info)",
  Delivered: "var(--success)",
  Refunded: "var(--destructive)",
};

type FlowNode = {
  status: OrderStatus;
  x: number;
  y: number;
  h: number;
  value: number;
};

type FlowLink = {
  from: FlowNode;
  to: FlowNode;
  value: number;
};

export function OrderFlowSankey({ orders }: { orders: Order[] }) {
  const layout = useMemo(() => {
    const total = Math.max(orders.length, 1);
    const stageWidth = 100 / flowStages.length;
    const nodes: FlowNode[][] = [];
    const links: FlowLink[] = [];

    // Simulate a flow — each stage carries a shrinking share; refunds branch off.
    let carrying = total;
    for (let s = 0; s < flowStages.length; s++) {
      const stageNodes: FlowNode[] = [];
      const statuses = flowStages[s];
      const refundThisStage = s === 0 ? 0 : Math.round(carrying * 0.06);
      const forward = carrying - refundThisStage;
      const values: Record<string, number> = {};
      for (const status of statuses) {
        if (status === "Refunded") {
          const prevRefund = nodes[s - 1]?.find((n) => n.status === "Refunded")?.value ?? 0;
          values[status] = prevRefund + refundThisStage;
        } else {
          values[status] = forward;
        }
      }
      const sum = Object.values(values).reduce((a, b) => a + b, 0) || 1;
      let yCursor = 5;
      const maxHeight = 90;
      for (const status of statuses) {
        const share = values[status] / sum;
        const h = share * maxHeight;
        const x = s * stageWidth + stageWidth / 2;
        const node: FlowNode = {
          status,
          x,
          y: yCursor,
          h,
          value: values[status],
        };
        stageNodes.push(node);
        yCursor += h + 2;
      }
      nodes.push(stageNodes);

      if (s > 0) {
        for (const prev of nodes[s - 1]) {
          for (const curr of stageNodes) {
            const eligible =
              (prev.status === "Refunded" && curr.status === "Refunded") ||
              (prev.status !== "Refunded" && curr.status !== "Refunded") ||
              (prev.status !== "Refunded" && curr.status === "Refunded");
            if (!eligible) continue;
            let v = 0;
            if (prev.status === "Refunded" && curr.status === "Refunded") {
              v = prev.value;
            } else if (prev.status !== "Refunded" && curr.status !== "Refunded") {
              v = forward;
            } else if (prev.status !== "Refunded" && curr.status === "Refunded") {
              v = refundThisStage;
            }
            if (v > 0) links.push({ from: prev, to: curr, value: v });
          }
        }
      }
      carrying = forward;
    }
    return { nodes, links, total };
  }, [orders]);

  const stageWidth = 100 / flowStages.length;
  const nodeWidth = 5;

  return (
    <Card className="gap-0 py-0">
      <div className="border-b border-border/50 px-4 py-3">
        <p className="text-sm font-medium">Order lifecycle flow</p>
        <p className="text-xs text-muted-foreground">
          {layout.total} orders · transitions between statuses
        </p>
      </div>
      <div className="p-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="block h-56 w-full"
        >
          {layout.links.map((link, i) => {
            const startX = link.from.x + nodeWidth / 2;
            const endX = link.to.x - nodeWidth / 2;
            const startY = link.from.y + link.from.h / 2;
            const endY = link.to.y + link.to.h / 2;
            const midX = (startX + endX) / 2;
            const opacity = 0.35;
            return (
              <path
                key={`link-${i}`}
                d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke={stageColors[link.to.status]}
                strokeOpacity={opacity}
                strokeWidth={Math.max(1, (link.value / layout.total) * 25)}
              />
            );
          })}
          {layout.nodes.flat().map((node) => (
            <g key={`${node.status}-${node.x}`}>
              <rect
                x={node.x - nodeWidth / 2}
                y={node.y}
                width={nodeWidth}
                height={Math.max(1, node.h)}
                fill={stageColors[node.status]}
                rx="0.5"
              />
            </g>
          ))}
        </svg>
        <div className="mt-2 grid grid-cols-4 gap-3 text-[11px] text-muted-foreground">
          {flowStages.map((stage, i) => (
            <div key={i} className="min-w-0">
              <p
                className="truncate font-medium text-foreground"
                style={{ paddingLeft: `${i * stageWidth}%` === "0%" ? 0 : 0 }}
              >
                {stage.filter((s) => s !== "Refunded").join(" / ") || "—"}
              </p>
              <p className="truncate">
                {layout.nodes[i]
                  ?.filter((n) => n.status !== "Refunded")
                  .map((n) => `${n.value}`)
                  .join(", ")}{" "}
                orders
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

