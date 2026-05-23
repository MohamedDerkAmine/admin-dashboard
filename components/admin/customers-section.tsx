"use client";

import { FilterXIcon, UsersIcon } from "lucide-react";

import type { Customer } from "@/lib/admin-data";
import {
  DataTable,
  SortableHead,
  useSortable,
} from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Pagination } from "@/components/admin/pagination";
import { StatusDot } from "@/components/admin/status-dot";
import { Toolbar } from "@/components/admin/toolbar";
import { formatCurrency } from "@/components/admin/utils";
import { Card } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortField = "name" | "segment" | "orders" | "spent" | "lastOrder";

export function CustomersSection({
  customers,
  page,
  query,
  setPage,
  setQuery,
  totalCount,
  totalPages,
}: {
  customers: Customer[];
  page: number;
  query: string;
  setPage: (page: number) => void;
  setQuery: (query: string) => void;
  totalCount: number;
  totalPages: number;
}) {
  const { sort, toggle, apply } = useSortable<SortField>();
  const sorted = apply(customers, {
    name: (c) => c.name.toLowerCase(),
    segment: (c) => c.segment,
    orders: (c) => c.orders,
    spent: (c) => c.spent,
    lastOrder: (c) => c.lastOrder,
  });

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Customers</h2>
          <p className="text-xs text-muted-foreground">
            {totalCount} customer{totalCount === 1 ? "" : "s"} · segments &
            lifetime spend
          </p>
        </div>
      </div>
      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search name, email, segment..."
      />
      <DataTable
        isEmpty={sorted.length === 0}
        empty={
          query !== "" ? (
            <EmptyState
              icon={FilterXIcon}
              title="No customers match your search"
              description="Try a different name, email, or segment."
              action={{
                label: "Clear search",
                onClick: () => {
                  setQuery("");
                  setPage(1);
                },
              }}
            />
          ) : (
            <EmptyState
              icon={UsersIcon}
              title="No customers yet"
              description="Customers will appear here once they sign up or place an order."
            />
          )
        }
      >
        <TableHeader>
          <TableRow>
            <SortableHead field="name" sort={sort} onToggle={toggle}>
              Customer
            </SortableHead>
            <SortableHead field="segment" sort={sort} onToggle={toggle}>
              Segment
            </SortableHead>
            <SortableHead field="orders" sort={sort} onToggle={toggle} align="right">
              Orders
            </SortableHead>
            <SortableHead field="spent" sort={sort} onToggle={toggle} align="right">
              Spent
            </SortableHead>
            <SortableHead field="lastOrder" sort={sort} onToggle={toggle} align="right">
              Last order
            </SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
                    {customer.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {customer.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {customer.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusDot status={customer.segment} />
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {customer.orders}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatCurrency(customer.spent)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                {customer.lastOrder}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        setPage={setPage}
      />
    </Card>
  );
}
