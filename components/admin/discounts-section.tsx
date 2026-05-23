"use client";

import { PercentIcon, PlusIcon } from "lucide-react";

import type { DiscountCode } from "@/lib/admin-data";
import {
  DataTable,
  SortableHead,
  useSortable,
} from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { RowActions } from "@/components/admin/row-actions";
import { StatusDot } from "@/components/admin/status-dot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortField = "code" | "kind" | "value" | "status" | "used" | "expires";

export function DiscountsSection({
  discounts,
  openNewDiscount,
  deleteDiscount,
}: {
  discounts: DiscountCode[];
  openNewDiscount: () => void;
  deleteDiscount: (id: string) => void;
}) {
  const { sort, toggle, apply } = useSortable<SortField>();
  const sorted = apply(discounts, {
    code: (d) => d.code,
    kind: (d) => d.kind,
    value: (d) => d.value,
    status: (d) => d.status,
    used: (d) => d.usedCount,
    expires: (d) => d.expiresAt ?? "",
  });

  function formatValue(discount: DiscountCode) {
    return discount.kind === "percent"
      ? `${discount.value}%`
      : `$${discount.value.toFixed(2)}`;
  }

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Discounts</h2>
          <p className="text-xs text-muted-foreground">
            {discounts.length} code{discounts.length === 1 ? "" : "s"} ·
            percent / fixed-amount promotions
          </p>
        </div>
        <Button size="sm" onClick={openNewDiscount}>
          <PlusIcon className="size-4" />
          New code
        </Button>
      </div>

      <DataTable
        isEmpty={sorted.length === 0}
        empty={
          <EmptyState
            icon={PercentIcon}
            title="No discount codes yet"
            description="Create a code to offer a promotion or perk to your customers."
            action={{
              label: "Create code",
              onClick: openNewDiscount,
              icon: PlusIcon,
            }}
          />
        }
      >
        <TableHeader>
          <TableRow>
            <SortableHead field="code" sort={sort} onToggle={toggle}>
              Code
            </SortableHead>
            <SortableHead field="kind" sort={sort} onToggle={toggle}>
              Kind
            </SortableHead>
            <SortableHead field="value" sort={sort} onToggle={toggle} align="right">
              Value
            </SortableHead>
            <SortableHead field="status" sort={sort} onToggle={toggle}>
              Status
            </SortableHead>
            <SortableHead field="used" sort={sort} onToggle={toggle} align="right">
              Used / Max
            </SortableHead>
            <SortableHead field="expires" sort={sort} onToggle={toggle} align="right">
              Expires
            </SortableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((discount) => (
            <TableRow key={discount.id}>
              <TableCell>
                <span className="rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-xs font-medium">
                  {discount.code}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {discount.kind === "percent" ? "Percent off" : "Fixed amount"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatValue(discount)}
              </TableCell>
              <TableCell>
                <StatusDot status={discount.status} />
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                {discount.usedCount}
                {discount.maxUses ? ` / ${discount.maxUses}` : " / ∞"}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                {discount.expiresAt ?? "—"}
              </TableCell>
              <TableCell>
                <RowActions
                  actions={[
                    {
                      label: "Delete",
                      onSelect: () => deleteDiscount(discount.id),
                      tone: "danger",
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    </Card>
  );
}
