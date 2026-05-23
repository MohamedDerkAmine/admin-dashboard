import { pageSize } from "@/components/admin/constants";
import type { StatusLike } from "@/components/admin/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function statusVariant(status: StatusLike) {
  if (status === "Active" || status === "Delivered" || status === "VIP") {
    return "default";
  }

  if (status === "Refunded" || status === "Archived") {
    return "destructive";
  }

  if (status === "Draft" || status === "Pending" || status === "New") {
    return "outline";
  }

  return "secondary";
}

export function filterByQuery<T>(
  items: T[],
  query: string,
  getText: (item: T) => string
) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items.filter((item) => getText(item).toLowerCase().includes(normalized));
}

export function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
  };
}
