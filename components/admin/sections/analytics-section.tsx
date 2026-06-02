"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  type LucideIcon,
} from "lucide-react";

import {
  revenueSeries,
  type Customer,
  type Order,
  type OrderStatus,
  type Product,
} from "@/lib/admin-data";
import { AreaChart } from "@/components/admin/shared/area-chart";
import { StatusDot, toneFor } from "@/components/admin/shared/status-dot";
import { formatCurrency } from "@/components/admin/shared/utils";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Range = "7D" | "30D" | "90D";

const orderStatusColors: Record<OrderStatus, string> = {
  Pending: "var(--chart-amber)",
  Processing: "var(--chart-cyan)",
  Shipped: "var(--info)",
  Delivered: "var(--success)",
  Refunded: "var(--destructive)",
};

const toneClass: Record<ReturnType<typeof toneFor>, string> = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-destructive",
  info: "text-[var(--info)]",
  neutral: "text-muted-foreground",
};

export function AnalyticsSection({
  orders,
  products,
  customers,
}: {
  orders: Order[];
  products: Product[];
  customers: Customer[];
}) {
  const [range, setRange] = useState<Range>("7D");

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const aov = orders.length > 0 ? Math.round(revenue / orders.length) : 0;
  const repeatRate =
    customers.length > 0
      ? Math.round(
          (customers.filter((customer) => customer.orders > 1).length /
            customers.length) *
            100,
        )
      : 0;
  const refundRate =
    orders.length > 0
      ? Math.round(
          (orders.filter((order) => order.status === "Refunded").length /
            orders.length) *
            100,
        )
      : 0;

  const statusCounts = useMemo(() => {
    const counts = new Map<OrderStatus, number>();
    for (const order of orders) {
      counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const topProducts = useMemo(() => {
    const productById = new Map(
      products.map((product) => [product.id, product]),
    );
    const revenueByProduct = new Map<string, { revenue: number; units: number }>();
    for (const order of orders) {
      const lineItems = order.lineItems;
      if (!lineItems) continue;
      for (const item of lineItems) {
        if (!item.productId) continue;
        const entry = revenueByProduct.get(item.productId) ?? {
          revenue: 0,
          units: 0,
        };
        entry.revenue += item.price * item.qty;
        entry.units += item.qty;
        revenueByProduct.set(item.productId, entry);
      }
    }
    return Array.from(revenueByProduct.entries())
      .map(([id, stats]) => ({
        product: productById.get(id),
        ...stats,
      }))
      .filter(
        (entry): entry is { product: Product; revenue: number; units: number } =>
          Boolean(entry.product),
      )
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, products]);

  const segmentBreakdown = useMemo(() => {
    const counts = new Map<Customer["segment"], number>();
    for (const customer of customers) {
      counts.set(customer.segment, (counts.get(customer.segment) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [customers]);

  const totalOrders = orders.length || 1;
  const totalCustomers = customers.length || 1;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Revenue"
          value={formatCurrency(revenue)}
          delta="+12.4%"
          trend="up"
          caption="vs previous period"
        />
        <KpiTile
          label="Avg. order value"
          value={formatCurrency(aov)}
          delta="+3.1%"
          trend="up"
          caption={`${orders.length} orders`}
        />
        <KpiTile
          label="Repeat rate"
          value={`${repeatRate}%`}
          delta="+1.8%"
          trend="up"
          caption={`${customers.filter((c) => c.orders > 1).length} repeat buyers`}
        />
        <KpiTile
          label="Refund rate"
          value={`${refundRate}%`}
          delta={refundRate > 5 ? "+0.6%" : "-0.4%"}
          trend={refundRate > 5 ? "down" : "up"}
          caption={`${orders.filter((o) => o.status === "Refunded").length} refunded`}
        />
      </div>

      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between border-b border-border/50 p-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Revenue trend
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatCurrency(revenue)}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 p-0.5 text-xs">
            {(["7D", "30D", "90D"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                className={cn(
                  "rounded px-2 py-1 transition-colors",
                  range === option
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="px-2 pb-2">
          <AreaChart
            data={revenueSeries}
            height={260}
            formatValue={(value) => `$${(value / 1000).toFixed(1)}k`}
          />
        </div>
      </Card>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="gap-0 py-0">
          <div className="border-b border-border/50 px-4 py-3">
            <p className="text-sm font-medium">Order status breakdown</p>
            <p className="text-xs text-muted-foreground">
              Distribution across {orders.length} order
              {orders.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid gap-3 p-4">
            {statusCounts.map(([status, count]) => {
              const percent = Math.round((count / totalOrders) * 100);
              return (
                <div key={status}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <StatusDot status={status} showLabel={false} />
                      <span className={cn("font-medium", toneClass[toneFor(status)])}>
                        {status}
                      </span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {count} · {percent}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${percent}%`,
                        background: orderStatusColors[status],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <div className="border-b border-border/50 px-4 py-3">
            <p className="text-sm font-medium">Customer segments</p>
            <p className="text-xs text-muted-foreground">
              {customers.length} customer{customers.length === 1 ? "" : "s"} on
              file
            </p>
          </div>
          <div className="grid gap-3 p-4">
            {segmentBreakdown.map(([segment, count]) => {
              const percent = Math.round((count / totalCustomers) * 100);
              return (
                <div key={segment}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <StatusDot status={segment} showLabel={false} />
                      <span className="font-medium">{segment}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {count} · {percent}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-[width] duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Top products by revenue</p>
            <p className="text-xs text-muted-foreground">
              Computed from order line items
            </p>
          </div>
        </div>
        {topProducts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No line item data yet — top products will appear once orders contain
            itemized data.
          </p>
        ) : (
          <ol className="divide-y divide-border/40">
            {topProducts.map((entry, index) => {
              const percent =
                topProducts[0].revenue > 0
                  ? Math.round(
                      (entry.revenue / topProducts[0].revenue) * 100,
                    )
                  : 0;
              return (
                <li
                  key={entry.product.id}
                  className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-4 py-3"
                >
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {entry.product.name}
                    </p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-[width] duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium tabular-nums">
                      {formatCurrency(entry.revenue)}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      {entry.units} units
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </>
  );
}

function KpiTile({
  label,
  value,
  delta,
  trend,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  caption: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-semibold tabular-nums">
            {value}
          </p>
        </div>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </div>
      <div className="flex items-center gap-1.5 px-4 pb-3 text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-medium",
            trend === "up" ? "text-[var(--success)]" : "text-destructive",
          )}
        >
          {trend === "up" ? (
            <ArrowUpRightIcon className="size-3" />
          ) : (
            <ArrowDownRightIcon className="size-3" />
          )}
          {delta}
        </span>
        <span className="truncate">{caption}</span>
      </div>
    </Card>
  );
}
