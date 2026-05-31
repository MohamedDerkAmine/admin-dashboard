"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  MailIcon,
  MapPinIcon,
} from "lucide-react";

import type { AuditEvent, Customer, Order } from "@/lib/admin-data";
import { getOrderDetail } from "@/lib/admin-data";
import { CustomFieldsPanel } from "@/components/admin/custom-fields";
import { NotesPanel } from "@/components/admin/notes";
import { StatusDot } from "@/components/admin/status-dot";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { formatCurrency } from "@/components/admin/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function CustomerDetail({
  customer,
  orders,
  activity,
  userEmail,
}: {
  customer: Customer;
  orders: Order[];
  activity: AuditEvent[];
  userEmail: string;
}) {
  const customerOrders = orders.filter(
    (order) => order.email.toLowerCase() === customer.email.toLowerCase(),
  );
  const sortedOrders = [...customerOrders].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
  const latest = sortedOrders[0];
  const address = latest ? getOrderDetail(latest).shippingAddress : null;
  const avgOrderValue =
    customer.orders > 0 ? customer.spent / customer.orders : 0;

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
            Customers
          </Link>
          <ChevronRightIcon className="size-3 text-muted-foreground/60" />
          <span className="truncate font-medium">{customer.name}</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto grid w-full max-w-4xl gap-4 p-3 md:p-6">
        <Card className="gap-0 p-0">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-6">
            <div className="grid size-16 shrink-0 place-items-center rounded-full bg-muted text-base font-semibold uppercase text-muted-foreground">
              {initialsOf(customer.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold">{customer.name}</h1>
                <StatusDot status={customer.segment} />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {customer.id}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                <a
                  href={`mailto:${customer.email}`}
                  className="hover:text-foreground hover:underline"
                >
                  {customer.email}
                </a>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`mailto:${customer.email}`}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  <MailIcon className="size-4" />
                  Email customer
                </a>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <DetailTile label="Lifetime spend">
            <p className="font-mono text-lg tabular-nums">
              {formatCurrency(customer.spent)}
            </p>
          </DetailTile>
          <DetailTile label="Orders">
            <p className="font-mono text-lg tabular-nums">{customer.orders}</p>
          </DetailTile>
          <DetailTile label="Avg. order">
            <p className="font-mono text-lg tabular-nums">
              {formatCurrency(Math.round(avgOrderValue))}
            </p>
          </DetailTile>
          <DetailTile label="Last order">
            <p className="font-mono text-sm tabular-nums">{customer.lastOrder}</p>
          </DetailTile>
        </div>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Order history</h2>
            <p className="text-xs text-muted-foreground">
              {sortedOrders.length} order
              {sortedOrders.length === 1 ? "" : "s"} on file
            </p>
          </div>
          {sortedOrders.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No orders placed by this customer yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-mono text-sm font-medium hover:text-primary hover:underline"
                      >
                        {order.id}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {order.items} item{order.items === 1 ? "" : "s"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusDot status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                      {order.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {address ? (
          <Card className="gap-0 p-0">
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
              <MapPinIcon className="size-3.5 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Last known address</h2>
            </div>
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
          </Card>
        ) : null}

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Custom fields</h2>
            <p className="text-xs text-muted-foreground">
              Admin-defined metadata
            </p>
          </div>
          <div className="p-4">
            <CustomFieldsPanel
              resourceType="customer"
              resourceId={customer.id}
            />
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
              resourceType="customer"
              resourceId={customer.id}
              author={userEmail}
            />
          </div>
        </Card>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Activity</h2>
            <p className="text-xs text-muted-foreground">
              {activity.length} event{activity.length === 1 ? "" : "s"} for this
              customer
            </p>
          </div>
          {activity.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No recorded activity for this customer yet.
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
                        {event.action.replace("_", " ")}
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
