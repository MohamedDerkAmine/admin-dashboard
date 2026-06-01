"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  MailIcon,
  PencilIcon,
  ReceiptIcon,
  TruckIcon,
} from "lucide-react";

import type { AuditEvent, Order } from "@/lib/admin-data";
import { getOrderDetail } from "@/lib/admin-data";
import { CustomFieldsPanel } from "@/components/admin/shared/custom-fields";
import { NotesPanel } from "@/components/admin/shared/notes";
import { StatusDot, toneFor } from "@/components/admin/shared/status-dot";
import { ThemeToggle } from "@/components/admin/navigation/theme-toggle";
import { formatCurrency } from "@/components/admin/shared/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function paymentLabel(payment: ReturnType<typeof getOrderDetail>["payment"]) {
  if (payment.method === "card") {
    return `${payment.brand ?? "Card"} ···· ${payment.last4 ?? "0000"}`;
  }
  if (payment.method === "paypal") return "PayPal";
  if (payment.method === "applepay") return "Apple Pay";
  return "Bank transfer";
}

const toneClass: Record<ReturnType<typeof toneFor>, string> = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-destructive",
  info: "text-[var(--info)]",
  neutral: "text-muted-foreground",
};

export function OrderDetail({
  order,
  activity,
  userEmail,
}: {
  order: Order;
  activity: AuditEvent[];
  userEmail: string;
}) {
  const detail = getOrderDetail(order);
  const tone = toneFor(order.status);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md md:px-4">
        <Link
          href="/"
          aria-label="Back to dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            StoreOps
          </Link>
          <ChevronRightIcon className="size-3 text-muted-foreground/60" />
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Orders
          </Link>
          <ChevronRightIcon className="size-3 text-muted-foreground/60" />
          <span className="truncate font-mono font-medium">{order.id}</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto grid w-full max-w-4xl gap-4 p-3 md:p-6">
        <Card className="gap-0 p-0">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-xl font-semibold">{order.id}</h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-medium",
                    toneClass[tone],
                  )}
                >
                  <StatusDot status={order.status} showLabel={false} />
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed {order.date} ·{" "}
                <Link
                  href={`/customers/${encodeURIComponent(order.email)}`}
                  className="text-foreground hover:underline"
                >
                  {order.customer}
                </Link>{" "}
                <span className="text-muted-foreground/70">·</span>{" "}
                <a
                  href={`mailto:${order.email}`}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  {order.email}
                </a>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/" className={cn(buttonVariants({ size: "sm" }))}>
                  <PencilIcon className="size-4" />
                  Manage in dashboard
                </Link>
                <a
                  href={`mailto:${order.email}?subject=Order ${order.id}`}
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                  )}
                >
                  <MailIcon className="size-4" />
                  Email customer
                </a>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 md:w-[240px]">
              <DetailTile label="Items">
                <p className="font-mono text-lg tabular-nums">{order.items}</p>
              </DetailTile>
              <DetailTile label="Total">
                <p className="font-mono text-lg tabular-nums">
                  {formatCurrency(order.total)}
                </p>
              </DetailTile>
            </div>
          </div>
        </Card>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Line items</h2>
            <p className="text-xs text-muted-foreground">
              {detail.lineItems.length} item
              {detail.lineItems.length === 1 ? "" : "s"} ·{" "}
              {detail.lineItems.reduce((sum, item) => sum + item.qty, 0)} total
              units
            </p>
          </div>
          <ol>
            {detail.lineItems.map((item, index) => (
              <li
                key={`${item.sku}-${index}`}
                className="flex items-center justify-between gap-3 border-b border-border/30 px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  {item.productId ? (
                    <Link
                      href={`/products/${item.productId}`}
                      className="block truncate text-sm font-medium hover:text-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-medium">{item.name}</p>
                  )}
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {item.sku} · qty {item.qty}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm tabular-nums">
                  {formatCurrency(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ol>
          <div className="grid gap-1 border-t border-border/40 px-4 py-3 text-sm">
            <SummaryRow
              label="Subtotal"
              value={formatCurrency(detail.subtotal)}
            />
            <SummaryRow
              label="Shipping"
              value={formatCurrency(detail.shippingCost)}
            />
            <SummaryRow label="Tax" value={formatCurrency(detail.tax)} />
            <SummaryRow
              label="Total"
              value={formatCurrency(order.total)}
              emphasis
            />
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="gap-0 p-0">
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
              <TruckIcon className="size-3.5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Shipping address</h2>
            </div>
            <AddressBlock address={detail.shippingAddress} />
          </Card>
          <Card className="gap-0 p-0">
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
              <ReceiptIcon className="size-3.5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Billing address</h2>
            </div>
            <AddressBlock address={detail.billingAddress} />
          </Card>
        </div>

        <Card className="gap-0 p-0">
          <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
            <CreditCardIcon className="size-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Payment</h2>
          </div>
          <div className="px-4 py-3 text-sm">
            <p className="font-medium">{paymentLabel(detail.payment)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Authorized on {order.date}
            </p>
          </div>
        </Card>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Timeline</h2>
            <p className="text-xs text-muted-foreground">
              Status transitions for this order
            </p>
          </div>
          <ol className="grid gap-0">
            {detail.timeline.map((event, index) => {
              const eventTone = toneFor(event.status);
              return (
                <li
                  key={`${event.status}-${event.at}-${index}`}
                  className="flex items-start gap-3 border-b border-border/30 px-4 py-3 last:border-b-0"
                >
                  <span
                    className={cn(
                      "mt-1 inline-flex size-2 shrink-0 rounded-full",
                      eventTone === "success" && "bg-[var(--success)]",
                      eventTone === "warning" && "bg-[var(--warning)]",
                      eventTone === "danger" && "bg-destructive",
                      eventTone === "info" && "bg-[var(--info)]",
                      eventTone === "neutral" && "bg-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{event.status}</p>
                    {event.note ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.note}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                    {formatTimestamp(event.at)}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Custom fields</h2>
            <p className="text-xs text-muted-foreground">
              Admin-defined metadata
            </p>
          </div>
          <div className="p-4">
            <CustomFieldsPanel resourceType="order" resourceId={order.id} />
          </div>
        </Card>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Notes</h2>
            <p className="text-xs text-muted-foreground">
              Internal context · only visible to admins
            </p>
          </div>
          <div className="p-4">
            <NotesPanel
              resourceType="order"
              resourceId={order.id}
              author={userEmail}
            />
          </div>
        </Card>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Activity</h2>
            <p className="text-xs text-muted-foreground">
              {activity.length} event{activity.length === 1 ? "" : "s"} for this
              order
            </p>
          </div>
          {activity.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No recorded activity for this order yet.
            </p>
          ) : (
            <ol>
              {activity.map((event) => (
                <li
                  key={event.id}
                  className="flex items-start justify-between gap-3 border-b border-border/30 px-4 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{event.actor}</span>{" "}
                      <span className="text-muted-foreground">
                        {event.action.replace("_", " ")} this order
                      </span>
                    </p>
                    {event.detail ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.detail}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </main>
    </div>
  );
}

function DetailTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-1 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </Card>
  );
}

function AddressBlock({
  address,
}: {
  address: ReturnType<typeof getOrderDetail>["shippingAddress"];
}) {
  return (
    <address className="not-italic px-4 py-3 text-sm leading-snug">
      <p>{address.line1}</p>
      {address.line2 ? (
        <p className="text-muted-foreground">{address.line2}</p>
      ) : null}
      <p className="text-muted-foreground">
        {address.city}, {address.region} {address.postalCode}
      </p>
      <p className="text-muted-foreground">{address.country}</p>
    </address>
  );
}

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        emphasis &&
          "mt-1 border-t border-border/40 pt-2 text-base font-semibold",
      )}
    >
      <span className={cn(!emphasis && "text-muted-foreground")}>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}
