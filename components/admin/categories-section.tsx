"use client";

import { PlusIcon, TagsIcon } from "lucide-react";

import type { Category } from "@/lib/admin-data";
import {
  DataTable,
  SortableHead,
  useSortable,
} from "@/components/admin/data-table";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortField = "name" | "productCount";

export function CategoriesSection({
  categories,
  deleteCategory,
  openNewCategory,
}: {
  categories: Category[];
  deleteCategory: (categoryId: string) => void;
  openNewCategory: () => void;
}) {
  const { sort, toggle, apply } = useSortable<SortField>({
    field: "name",
    direction: "asc",
  });
  const sorted = apply(categories, {
    name: (c) => c.name.toLowerCase(),
    productCount: (c) => c.productCount,
  });

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Categories</h2>
          <p className="text-xs text-muted-foreground">
            {categories.length} group{categories.length === 1 ? "" : "s"} ·
            create, edit, delete catalog buckets
          </p>
        </div>
        <Button size="sm" onClick={openNewCategory}>
          <PlusIcon className="size-4" />
          Add category
        </Button>
      </div>
      <DataTable
        isEmpty={sorted.length === 0}
        empty="No categories yet. Click Add category to create one."
      >
        <TableHeader>
          <TableRow>
            <SortableHead field="name" sort={sort} onToggle={toggle}>
              Name
            </SortableHead>
            <SortableHead
              field="productCount"
              sort={sort}
              onToggle={toggle}
              align="right"
            >
              Products
            </SortableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <TagsIcon className="size-3.5" />
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {category.productCount}
              </TableCell>
              <TableCell>
                <RowActions
                  actions={[
                    {
                      label: "Delete",
                      onSelect: () => deleteCategory(category.id),
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
