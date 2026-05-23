"use client";

import { PlusIcon } from "lucide-react";

import type { Order, OrderStatus } from "@/lib/admin-data";
import { orderStatuses } from "@/components/admin/constants";
import {
  DataTable,
  SortableHead,
  useSortable,
} from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusDot, toneFor } from "@/components/admin/status-dot";
import { FilterSelect, Toolbar } from "@/components/admin/toolbar";
import { formatCurrency } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortField = "id" | "customer" | "total" | "status" | "date";

const toneClass: Record<ReturnType<typeof toneFor>, string> = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-destructive",
  info: "text-[var(--info)]",
  neutral: "text-muted-foreground",
};

export function OrdersSection({
  openNewOrder,
  orders,
  page,
  query,
  setPage,
  setQuery,
  setStatusFilter,
  statusFilter,
  totalCount,
  totalPages,
  updateOrderStatus,
}: {
  openNewOrder: () => void;
  orders: Order[];
  page: number;
  query: string;
  setPage: (page: number) => void;
  setQuery: (query: string) => void;
  setStatusFilter: (value: string) => void;
  statusFilter: string;
  totalCount: number;
  totalPages: number;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}) {
  const { sort, toggle, apply } = useSortable<SortField>();
  const sorted = apply(orders, {
    id: (o) => o.id,
    customer: (o) => o.customer.toLowerCase(),
    total: (o) => o.total,
    status: (o) => o.status,
    date: (o) => o.date,
  });

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Orders</h2>
          <p className="text-xs text-muted-foreground">
            {totalCount} order{totalCount === 1 ? "" : "s"} · update fulfillment
            inline
          </p>
        </div>
        <Button size="sm" onClick={openNewOrder}>
          <PlusIcon className="size-4" />
          Add order
        </Button>
      </div>
      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search by ID, customer, email..."
      >
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          options={["All", ...orderStatuses]}
        />
      </Toolbar>
      <DataTable isEmpty={sorted.length === 0} empty="No orders match.">
        <TableHeader>
          <TableRow>
            <SortableHead field="id" sort={sort} onToggle={toggle}>
              Order
            </SortableHead>
            <SortableHead field="customer" sort={sort} onToggle={toggle}>
              Customer
            </SortableHead>
            <SortableHead field="total" sort={sort} onToggle={toggle} align="right">
              Total
            </SortableHead>
            <SortableHead field="status" sort={sort} onToggle={toggle}>
              Status
            </SortableHead>
            <SortableHead field="date" sort={sort} onToggle={toggle} align="right">
              Date
            </SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((order) => {
            const tone = toneFor(order.status);

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="font-mono text-sm font-medium">{order.id}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {order.items} item{order.items === 1 ? "" : "s"}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{order.customer}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {order.email}
                  </p>
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2">
                    <StatusDot status={order.status} showLabel={false} />
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateOrderStatus(
                          order.id,
                          event.target.value as OrderStatus,
                        )
                      }
                      className={cn(
                        "h-7 cursor-pointer appearance-none rounded-md border border-transparent bg-transparent pr-5 text-sm font-medium outline-none transition-colors hover:border-border focus:border-ring",
                        toneClass[tone],
                      )}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} className="bg-popover text-foreground">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {order.date}
                </TableCell>
              </TableRow>
            );
          })}
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
