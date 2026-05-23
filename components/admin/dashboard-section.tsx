import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  PackageIcon,
  ShoppingCartIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react";

import {
  revenueSeries,
  type AdminRole,
  type Order,
  type Product,
} from "@/lib/admin-data";
import { AreaChart } from "@/components/admin/area-chart";
import { Sparkline } from "@/components/admin/sparkline";
import { StatusDot } from "@/components/admin/status-dot";
import type { Section } from "@/components/admin/types";
import { formatCurrency } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardSection({
  activeProducts,
  currentRole,
  invitationsCount,
  lowStock,
  orders,
  pendingOrders,
  products,
  revenue,
  setSection,
  usersCount,
}: {
  activeProducts: number;
  currentRole: AdminRole;
  invitationsCount: number;
  lowStock: number;
  orders: Order[];
  pendingOrders: number;
  products: Product[];
  revenue: number;
  setSection: (section: Section) => void;
  usersCount: number;
}) {
  const orderSeries = orders.map((order) => order.total).slice(0, 7);
  const ordersTrend =
    orderSeries.length > 1
      ? Math.round(
          ((orderSeries[0] - orderSeries[orderSeries.length - 1]) /
            Math.max(orderSeries[orderSeries.length - 1], 1)) *
            100,
        )
      : 0;

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = [...products]
    .filter((product) => product.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const stats = [
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      delta: {
        direction: "up" as const,
        value: "+12.4%",
        caption: "vs last week",
      },
      series: revenueSeries.map((point) => point.value),
      color: "var(--chart-cyan)",
    },
    {
      label: "Orders",
      value: String(orders.length),
      delta: {
        direction: ordersTrend >= 0 ? ("up" as const) : ("down" as const),
        value: `${ordersTrend >= 0 ? "+" : ""}${ordersTrend}%`,
        caption: `${pendingOrders} pending`,
      },
      series: orderSeries,
      color: "var(--chart-lime)",
    },
    {
      label: "Products",
      value: String(products.length),
      delta: {
        direction: "up" as const,
        value: `${activeProducts} active`,
        caption: `${lowStock} low stock`,
      },
      series: products.map((product) => product.stock),
      color: "var(--chart-amber)",
    },
    {
      label: "Team",
      value: String(usersCount),
      delta: {
        direction: "up" as const,
        value: currentRole,
        caption: `${invitationsCount} invites open`,
      },
      series: [3, 5, 4, 6, 8, 9, usersCount],
      color: "var(--chart-5)",
    },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <KpiCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        <Card className="gap-0 py-0">
          <div className="flex items-start justify-between border-b border-border/50 p-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Revenue
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {formatCurrency(revenue)}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 text-[var(--success)]">
                  <ArrowUpRightIcon className="size-3" />
                  +12.4%
                </span>
                <span>vs previous 7 days</span>
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 p-0.5 text-xs">
              {(["7D", "30D", "90D"] as const).map((range, index) => (
                <button
                  key={range}
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 transition-colors",
                    index === 0
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="px-2 pb-2">
            <AreaChart
              data={revenueSeries}
              height={240}
              formatValue={(value) => `$${(value / 1000).toFixed(1)}k`}
            />
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between border-b border-border/50 p-4">
            <div>
              <p className="text-sm font-medium">Operational health</p>
              <p className="text-xs text-muted-foreground">Live signals</p>
            </div>
          </div>
          <CardContent className="grid gap-4 p-4">
            <HealthBar
              label="Catalog"
              value={Math.round(
                (activeProducts / Math.max(products.length, 1)) * 100,
              )}
              caption={`${activeProducts} of ${products.length} active · ${lowStock} low`}
              color="var(--chart-cyan)"
            />
            <HealthBar
              label="Fulfillment"
              value={Math.round(
                (orders.filter((order) => order.status === "Delivered").length /
                  Math.max(orders.length, 1)) *
                  100,
              )}
              caption={`${pendingOrders} pending · ${
                orders.filter((order) => order.status === "Shipped").length
              } shipped`}
              color="var(--chart-lime)"
            />
            <HealthBar
              label="Access"
              value={Math.round(
                ((usersCount - invitationsCount) / Math.max(usersCount, 1)) *
                  100,
              )}
              caption={`${usersCount} users · ${invitationsCount} open invites`}
              color="var(--chart-amber)"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        <Card className="gap-0 py-0">
          <SectionHeader
            title="Recent orders"
            action={
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setSection("orders")}
              >
                View all
              </Button>
            }
          />
          <div className="divide-y divide-border/50">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/30"
              >
                <span className="w-20 font-mono text-xs text-muted-foreground">
                  {order.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{order.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.items} items · {order.date}
                  </p>
                </div>
                <StatusDot status={order.status} />
                <span className="w-20 text-right font-mono text-sm tabular-nums">
                  {formatCurrency(order.total)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <SectionHeader
            title="Low stock alerts"
            action={
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setSection("products")}
              >
                Manage
              </Button>
            }
          />
          {lowStockProducts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              All products comfortably stocked.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/30"
                >
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    <PackageIcon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums",
                      product.stock === 0
                        ? "bg-destructive/15 text-destructive"
                        : "bg-[oklch(0.82_0.15_80/15%)] text-[var(--warning)]",
                    )}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ActionTile
          icon={ShoppingCartIcon}
          tone="info"
          title="Fulfillment queue"
          description={`${pendingOrders} pending orders need review`}
          actionLabel="Open orders"
          onAction={() => setSection("orders")}
        />
        <ActionTile
          icon={TriangleAlertIcon}
          tone="warning"
          title="Inventory pressure"
          description={`${lowStock} products at or below threshold`}
          actionLabel="Open products"
          onAction={() => setSection("products")}
        />
        <ActionTile
          icon={UsersIcon}
          tone="success"
          title="Access control"
          description={`${usersCount} active admin users`}
          actionLabel="Manage users"
          onAction={() => setSection("users")}
        />
      </div>
    </>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
      <p className="text-sm font-medium">{title}</p>
      {action}
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  series,
  color,
}: {
  label: string;
  value: string;
  delta: { direction: "up" | "down"; value: string; caption: string };
  series: number[];
  color: string;
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
        <Sparkline values={series} color={color} className="shrink-0" />
      </div>
      <div className="flex items-center gap-1.5 px-4 pb-3 text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-medium",
            delta.direction === "up"
              ? "text-[var(--success)]"
              : "text-destructive",
          )}
        >
          {delta.direction === "up" ? (
            <ArrowUpRightIcon className="size-3" />
          ) : (
            <ArrowDownRightIcon className="size-3" />
          )}
          {delta.value}
        </span>
        <span className="truncate">{delta.caption}</span>
      </div>
    </Card>
  );
}

function HealthBar({
  label,
  value,
  caption,
  color,
}: {
  label: string;
  value: number;
  caption: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {value}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  tone,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "info" | "warning" | "success" | "danger";
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const toneClasses: Record<typeof tone, string> = {
    info: "bg-[oklch(0.78_0.13_230/15%)] text-[var(--info)]",
    warning: "bg-[oklch(0.82_0.15_80/15%)] text-[var(--warning)]",
    success: "bg-[oklch(0.74_0.16_152/15%)] text-[var(--success)]",
    danger: "bg-destructive/15 text-destructive",
  };

  return (
    <Card className="gap-3 py-3">
      <div className="flex items-start gap-3 px-3">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            toneClasses[tone],
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="px-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}
