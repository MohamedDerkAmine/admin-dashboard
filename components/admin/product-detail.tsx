"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  PackageIcon,
  PencilIcon,
} from "lucide-react";

import type { AuditEvent, Product } from "@/lib/admin-data";
import { CustomFieldsPanel } from "@/components/admin/custom-fields";
import { NotesPanel } from "@/components/admin/notes";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { StatusDot } from "@/components/admin/status-dot";
import { formatCurrency } from "@/components/admin/utils";
import { VariantsPanel } from "@/components/admin/variants";
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

export function ProductDetail({
  product,
  activity,
  userEmail,
}: {
  product: Product;
  activity: AuditEvent[];
  userEmail: string;
}) {
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
            Products
          </Link>
          <ChevronRightIcon className="size-3 text-muted-foreground/60" />
          <span className="truncate font-medium">{product.name}</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto grid w-full max-w-4xl gap-4 p-3 md:p-6">
        <Card className="gap-0 p-0">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-6">
            <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted text-muted-foreground">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <PackageIcon className="size-10" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold">{product.name}</h1>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {product.sku}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <StatusDot status={product.status} />
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{product.category}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  <PencilIcon className="size-4" />
                  Edit in dashboard
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <DetailTile label="Price">
            <p className="font-mono text-lg tabular-nums">
              {formatCurrency(product.price)}
            </p>
          </DetailTile>
          <DetailTile label="Stock">
            <p
              className={cn(
                "font-mono text-lg tabular-nums",
                product.stock === 0
                  ? "text-destructive"
                  : product.stock <= 10
                    ? "text-[var(--warning)]"
                    : "text-foreground",
              )}
            >
              {product.stock}
            </p>
          </DetailTile>
          <DetailTile label="Status">
            <p className="text-lg font-medium">{product.status}</p>
          </DetailTile>
        </div>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Variants</h2>
            <p className="text-xs text-muted-foreground">
              Per-variation SKU, price, and stock
            </p>
          </div>
          <div className="p-4">
            <VariantsPanel
              productId={product.id}
              fallbackSku={product.sku}
              fallbackPrice={product.price}
            />
          </div>
        </Card>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Custom fields</h2>
            <p className="text-xs text-muted-foreground">
              Admin-defined metadata
            </p>
          </div>
          <div className="p-4">
            <CustomFieldsPanel
              resourceType="product"
              resourceId={product.id}
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
              resourceType="product"
              resourceId={product.id}
              author={userEmail}
            />
          </div>
        </Card>

        <Card className="gap-0 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold">Activity</h2>
            <p className="text-xs text-muted-foreground">
              {activity.length} event{activity.length === 1 ? "" : "s"} for this
              product
            </p>
          </div>
          {activity.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No recorded activity for this product yet.
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
                        {event.action.replace("_", " ")} this product
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
