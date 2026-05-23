"use client";

import { FilterXIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";

import type { Order, OrderStatus } from "@/lib/admin-data";
import {
  BulkActionBar,
  SelectionCheckbox,
} from "@/components/admin/bulk-action-bar";
import { orderStatuses } from "@/components/admin/constants";
import {
  DataTable,
  SortableHead,
  useSortable,
} from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Pagination } from "@/components/admin/pagination";
import { RowActions } from "@/components/admin/row-actions";
import { SavedViews, useSavedViews } from "@/components/admin/saved-views";
import { StatusDot, toneFor } from "@/components/admin/status-dot";
import { FilterSelect, Toolbar } from "@/components/admin/toolbar";
import { useSelection } from "@/components/admin/use-selection";
import { formatCurrency } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  TableBody,
  TableCell,
  TableHead,
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
  bulkUpdateOrderStatus,
  openNewOrder,
  openRefund,
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
  bulkUpdateOrderStatus: (ids: string[], status: OrderStatus) => void;
  openNewOrder: () => void;
  openRefund: (orderId: string) => void;
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
  const savedViews = useSavedViews("orders");
  const sorted = apply(orders, {
    id: (o) => o.id,
    customer: (o) => o.customer.toLowerCase(),
    total: (o) => o.total,
    status: (o) => o.status,
    date: (o) => o.date,
  });
  const selection = useSelection(sorted);

  function handleBulkStatus(status: OrderStatus) {
    bulkUpdateOrderStatus(selection.ids, status);
    selection.clear();
  }

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
      <SavedViews
        views={savedViews.views}
        currentFilters={{ query, statusFilter }}
        onApply={(filters) => {
          setQuery(filters.query);
          setStatusFilter(filters.statusFilter);
          setPage(1);
        }}
        onSave={(name) => savedViews.add(name, { query, statusFilter })}
        onDelete={savedViews.remove}
      />
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
      <BulkActionBar count={selection.size} onClear={selection.clear}>
        <Select onValueChange={(value) => handleBulkStatus(value as OrderStatus)}>
          <SelectTrigger className="h-6 px-2 text-xs">
            <span>Set status</span>
          </SelectTrigger>
          <SelectContent>
            {orderStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </BulkActionBar>
      <DataTable
        isEmpty={sorted.length === 0}
        empty={
          query !== "" || statusFilter !== "All" ? (
            <EmptyState
              icon={FilterXIcon}
              title="No orders match your filters"
              description="Try a different search or clear the filters."
              action={{
                label: "Clear filters",
                onClick: () => {
                  setQuery("");
                  setStatusFilter("All");
                  setPage(1);
                },
              }}
            />
          ) : (
            <EmptyState
              icon={ShoppingCartIcon}
              title="No orders yet"
              description="Orders will appear here as customers place them."
              action={{
                label: "Create order",
                onClick: openNewOrder,
                icon: PlusIcon,
              }}
            />
          )
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead className="w-9">
              <SelectionCheckbox
                checked={selection.allSelected}
                indeterminate={selection.someSelected}
                onChange={selection.toggleAll}
                label="Select all visible orders"
              />
            </TableHead>
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
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((order) => {
            const tone = toneFor(order.status);

            return (
              <TableRow
                key={order.id}
                data-state={selection.selected.has(order.id) ? "selected" : undefined}
              >
                <TableCell>
                  <SelectionCheckbox
                    checked={selection.selected.has(order.id)}
                    onChange={() => selection.toggle(order.id)}
                    label={`Select order ${order.id}`}
                  />
                </TableCell>
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
                <TableCell>
                  <RowActions
                    actions={[
                      {
                        label:
                          order.status === "Refunded"
                            ? "Already refunded"
                            : "Refund order",
                        onSelect: () => openRefund(order.id),
                        tone: order.status === "Refunded" ? "default" : "danger",
                      },
                    ]}
                  />
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
