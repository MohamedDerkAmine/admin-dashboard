"use client";

import Link from "next/link";
import {
  CheckIcon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";

import type { ReturnRequest, ReturnStatus } from "@/lib/admin-data";
import {
  DataTable,
  SortableHead,
  useSortable,
} from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusDot, toneFor } from "@/components/admin/status-dot";
import { FilterSelect, Toolbar } from "@/components/admin/toolbar";
import { filterByQuery, formatCurrency } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const returnStatuses: ReturnStatus[] = [
  "Requested",
  "Approved",
  "Denied",
  "Refunded",
];

const toneClass: Record<ReturnType<typeof toneFor>, string> = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-destructive",
  info: "text-[var(--info)]",
  neutral: "text-muted-foreground",
};

type SortField = "id" | "customer" | "status" | "requestedAt";

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

export function ReturnsSection({
  returns,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  onApprove,
  onDeny,
  onRefund,
}: {
  returns: ReturnRequest[];
  query: string;
  setQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  onRefund: (id: string) => void;
}) {
  const { sort, toggle, apply } = useSortable<SortField>({
    field: "requestedAt",
    direction: "desc",
  });

  const filtered = filterByQuery(
    returns,
    query,
    (entry) =>
      `${entry.id} ${entry.orderId} ${entry.customer} ${entry.email} ${entry.reason}`,
  ).filter((entry) => statusFilter === "All" || entry.status === statusFilter);

  const sorted = apply(filtered, {
    id: (r) => r.id,
    customer: (r) => r.customer.toLowerCase(),
    status: (r) => r.status,
    requestedAt: (r) => r.requestedAt,
  });

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Returns</h2>
          <p className="text-xs text-muted-foreground">
            {returns.length} request{returns.length === 1 ? "" : "s"} ·{" "}
            {returns.filter((entry) => entry.status === "Requested").length}{" "}
            pending review
          </p>
        </div>
      </div>
      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search by RMA, order, customer..."
      >
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["All", ...returnStatuses]}
        />
      </Toolbar>
      <DataTable
        isEmpty={sorted.length === 0}
        empty={
          <EmptyState
            icon={RotateCcwIcon}
            title="No return requests"
            description="Customer-initiated returns will appear here for review."
          />
        }
      >
        <TableHeader>
          <TableRow>
            <SortableHead field="id" sort={sort} onToggle={toggle}>
              RMA
            </SortableHead>
            <TableHead>Order</TableHead>
            <SortableHead field="customer" sort={sort} onToggle={toggle}>
              Customer
            </SortableHead>
            <TableHead>Reason</TableHead>
            <SortableHead field="status" sort={sort} onToggle={toggle}>
              Status
            </SortableHead>
            <SortableHead
              field="requestedAt"
              sort={sort}
              onToggle={toggle}
              align="right"
            >
              Requested
            </SortableHead>
            <TableHead className="w-[180px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((entry) => {
            const tone = toneFor(entry.status);
            return (
              <TableRow key={entry.id}>
                <TableCell>
                  <p className="font-mono text-sm font-medium">{entry.id}</p>
                  {entry.refundAmount ? (
                    <p className="font-mono text-[11px] text-muted-foreground">
                      refunded {formatCurrency(entry.refundAmount)}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/orders/${entry.orderId}`}
                    className="font-mono text-sm hover:text-primary hover:underline"
                  >
                    {entry.orderId}
                  </Link>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{entry.customer}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {entry.email}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{entry.reason}</p>
                  {entry.note ? (
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">
                      {entry.note}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-sm font-medium",
                      toneClass[tone],
                    )}
                  >
                    <StatusDot status={entry.status} showLabel={false} />
                    {entry.status}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {formatTimestamp(entry.requestedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    {entry.status === "Requested" ? (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => onApprove(entry.id)}
                        >
                          <CheckIcon className="size-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => onDeny(entry.id)}
                        >
                          <XIcon className="size-3.5" />
                          Deny
                        </Button>
                      </>
                    ) : null}
                    {entry.status === "Approved" ? (
                      <Button size="xs" onClick={() => onRefund(entry.id)}>
                        <RotateCcwIcon className="size-3.5" />
                        Refund
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </DataTable>
    </Card>
  );
}
