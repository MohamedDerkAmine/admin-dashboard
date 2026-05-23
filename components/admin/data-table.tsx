"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon } from "lucide-react";

import { Table, TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function DataTable({
  children,
  empty,
  isEmpty,
}: {
  children: React.ReactNode;
  empty?: React.ReactNode;
  isEmpty?: boolean;
}) {
  return (
    <div className="overflow-x-auto animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
      <Table className="[&_tbody_tr]:h-[var(--table-row-h)] [&_tbody_tr]:border-border/40 [&_tbody_tr:hover]:bg-muted/30 [&_th]:h-[var(--table-head-h)] [&_th]:bg-muted/20 [&_th]:px-[var(--table-cell-px)] [&_th]:text-[11px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground [&_td]:px-[var(--table-cell-px)]">
        {children}
      </Table>
      {isEmpty ? (
        typeof empty === "string" || empty == null ? (
          <div className="border-t border-border/40 px-3 py-10 text-center text-sm text-muted-foreground">
            {empty ?? "No results."}
          </div>
        ) : (
          empty
        )
      ) : null}
    </div>
  );
}

export type SortDirection = "asc" | "desc";

export type SortState<TField extends string> = {
  field: TField | null;
  direction: SortDirection;
};

export function useSortable<TField extends string>(initial?: SortState<TField>) {
  const [sort, setSort] = useState<SortState<TField>>(
    initial ?? { field: null, direction: "asc" },
  );

  function toggle(field: TField) {
    setSort((current) => {
      if (current.field !== field) {
        return { field, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { field, direction: "desc" };
      }

      return { field: null, direction: "asc" };
    });
  }

  function apply<T>(items: T[], accessors: Record<TField, (item: T) => string | number>) {
    if (!sort.field) {
      return items;
    }

    const accessor = accessors[sort.field];

    return [...items].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);

      if (av === bv) return 0;
      const isLess = av < bv ? -1 : 1;
      return sort.direction === "asc" ? isLess : -isLess;
    });
  }

  return { sort, toggle, apply };
}

export function SortableHead<TField extends string>({
  field,
  sort,
  onToggle,
  children,
  align = "left",
  className,
}: {
  field: TField;
  sort: SortState<TField>;
  onToggle: (field: TField) => void;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort.field === field;
  const Icon = !active
    ? ChevronsUpDownIcon
    : sort.direction === "asc"
      ? ChevronUpIcon
      : ChevronDownIcon;

  return (
    <TableHead className={cn(align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={() => onToggle(field)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          align === "right" && "ml-auto",
          active && "text-foreground",
        )}
      >
        {children}
        <Icon
          className={cn(
            "size-3",
            active ? "opacity-100" : "opacity-40",
          )}
        />
      </button>
    </TableHead>
  );
}
