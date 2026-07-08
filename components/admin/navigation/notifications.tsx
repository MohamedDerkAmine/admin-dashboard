"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BellIcon,
  BoxesIcon,
  CheckIcon,
  RotateCcwIcon,
  ShoppingCartIcon,
  type LucideIcon,
} from "lucide-react";

import type {
  Order,
  Product,
  ReturnRequest,
} from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const READ_STORAGE_KEY = "admin-notifications-read";

export type Notification = {
  id: string;
  kind: "low_stock" | "pending_order" | "return_request";
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  onSelect?: () => void;
};

const iconForKind: Record<Notification["kind"], LucideIcon> = {
  low_stock: BoxesIcon,
  pending_order: ShoppingCartIcon,
  return_request: RotateCcwIcon,
};

const toneClassForKind: Record<Notification["kind"], string> = {
  low_stock: "bg-[color-mix(in_oklch,var(--warning),transparent_85%)] text-[var(--warning)]",
  pending_order: "bg-[color-mix(in_oklch,var(--info),transparent_85%)] text-[var(--info)]",
  return_request: "bg-destructive/15 text-destructive",
};

function readReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeReadIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(
      READ_STORAGE_KEY,
      JSON.stringify(Array.from(ids)),
    );
  } catch {
    // ignore
  }
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function buildNotifications({
  products,
  orders,
  returns,
  lowStockThreshold = 10,
}: {
  products: Product[];
  orders: Order[];
  returns: ReturnRequest[];
  lowStockThreshold?: number;
}): Notification[] {
  const items: Notification[] = [];

  for (const product of products) {
    if (product.stock <= lowStockThreshold) {
      items.push({
        id: `stock-${product.id}`,
        kind: "low_stock",
        title:
          product.stock === 0
            ? `${product.name} is out of stock`
            : `${product.name} is low (${product.stock} left)`,
        description: product.sku,
        timestamp: new Date().toISOString(),
        href: `/products/${product.id}`,
      });
    }
  }

  for (const order of orders) {
    if (order.status === "Pending") {
      items.push({
        id: `order-${order.id}`,
        kind: "pending_order",
        title: `${order.id} awaiting review`,
        description: `${order.customer} · ${order.items} item${order.items === 1 ? "" : "s"}`,
        timestamp: `${order.date}T09:00:00Z`,
        href: `/orders/${order.id}`,
      });
    }
  }

  for (const entry of returns) {
    if (entry.status === "Requested") {
      items.push({
        id: `rma-${entry.id}`,
        kind: "return_request",
        title: `${entry.id} return requested`,
        description: `${entry.customer} · ${entry.reason}`,
        timestamp: entry.requestedAt,
      });
    }
  }

  return items.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export function NotificationsButton({
  notifications,
  onItemSelect,
}: {
  notifications: Notification[];
  onItemSelect?: (notification: Notification) => void;
}) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReadIds(readReadIds());
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const unread = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)),
    [notifications, readIds],
  );

  function markAllRead() {
    const next = new Set([...readIds, ...notifications.map((n) => n.id)]);
    setReadIds(next);
    writeReadIds(next);
  }

  function markRead(id: string) {
    const next = new Set([...readIds, id]);
    setReadIds(next);
    writeReadIds(next);
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
        className="relative"
      >
        <BellIcon className="size-4" />
        {unread.length > 0 ? (
          <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-1 w-[340px] overflow-hidden rounded-md border border-border/70 bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/10">
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
            <div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-[11px] text-muted-foreground">
                {unread.length} unread · {notifications.length} total
              </p>
            </div>
            <Button
              size="xs"
              variant="ghost"
              onClick={markAllRead}
              disabled={unread.length === 0}
            >
              <CheckIcon className="size-3.5" />
              Mark all read
            </Button>
          </div>
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            <ol className="max-h-[360px] overflow-y-auto">
              {notifications.map((notification) => {
                const Icon = iconForKind[notification.kind];
                const isUnread = !readIds.has(notification.id);
                const body = (
                  <div
                    className={cn(
                      "flex gap-2 px-3 py-2 text-left transition-colors hover:bg-muted",
                      isUnread && "bg-primary/[0.03]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md",
                        toneClassForKind[notification.kind],
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
                        {formatRelativeTime(notification.timestamp)}
                      </p>
                    </div>
                    {isUnread ? (
                      <span className="mt-1 inline-flex size-1.5 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </div>
                );
                return (
                  <li
                    key={notification.id}
                    className="border-b border-border/40 last:border-b-0"
                  >
                    {notification.href ? (
                      <a
                        href={notification.href}
                        onClick={() => {
                          markRead(notification.id);
                          setOpen(false);
                        }}
                        className="block"
                      >
                        {body}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          markRead(notification.id);
                          setOpen(false);
                          onItemSelect?.(notification);
                          notification.onSelect?.();
                        }}
                        className="block w-full"
                      >
                        {body}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      ) : null}
    </div>
  );
}
