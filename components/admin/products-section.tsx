"use client";

import { PackageIcon, PlusIcon } from "lucide-react";

import type { Category, Product } from "@/lib/admin-data";
import {
  DataTable,
  SortableHead,
  useSortable,
} from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { RowActions } from "@/components/admin/row-actions";
import { StatusDot } from "@/components/admin/status-dot";
import { FilterSelect, Toolbar } from "@/components/admin/toolbar";
import { formatCurrency } from "@/components/admin/utils";
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

type SortField = "name" | "category" | "status" | "price" | "stock";

export function ProductsSection({
  categories,
  categoryFilter,
  deleteProduct,
  openEditProduct,
  openNewProduct,
  page,
  products,
  query,
  setCategoryFilter,
  setPage,
  setQuery,
  setStatusFilter,
  statusFilter,
  totalCount,
  totalPages,
}: {
  categories: Category[];
  categoryFilter: string;
  deleteProduct: (productId: string) => void;
  openEditProduct: (product: Product) => void;
  openNewProduct: () => void;
  page: number;
  products: Product[];
  query: string;
  setCategoryFilter: (value: string) => void;
  setPage: (page: number) => void;
  setQuery: (query: string) => void;
  setStatusFilter: (value: string) => void;
  statusFilter: string;
  totalCount: number;
  totalPages: number;
}) {
  const { sort, toggle, apply } = useSortable<SortField>();
  const sorted = apply(products, {
    name: (p) => p.name.toLowerCase(),
    category: (p) => p.category.toLowerCase(),
    status: (p) => p.status,
    price: (p) => p.price,
    stock: (p) => p.stock,
  });

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Products</h2>
          <p className="text-xs text-muted-foreground">
            {totalCount} item{totalCount === 1 ? "" : "s"} · CRUD catalog with
            image preview
          </p>
        </div>
        <Button size="sm" onClick={openNewProduct}>
          <PlusIcon className="size-4" />
          Add product
        </Button>
      </div>
      <Toolbar
        query={query}
        setQuery={setQuery}
        placeholder="Search name, SKU, category..."
      >
        <FilterSelect
          label="Category"
          value={categoryFilter}
          onChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
          options={["All", ...categories.map((category) => category.name)]}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          options={["All", "Active", "Draft", "Archived"]}
        />
      </Toolbar>
      <DataTable isEmpty={sorted.length === 0} empty="No products match.">
        <TableHeader>
          <TableRow>
            <SortableHead field="name" sort={sort} onToggle={toggle}>
              Product
            </SortableHead>
            <SortableHead field="category" sort={sort} onToggle={toggle}>
              Category
            </SortableHead>
            <SortableHead field="status" sort={sort} onToggle={toggle}>
              Status
            </SortableHead>
            <SortableHead field="price" sort={sort} onToggle={toggle} align="right">
              Price
            </SortableHead>
            <SortableHead field="stock" sort={sort} onToggle={toggle} align="right">
              Stock
            </SortableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted text-xs">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PackageIcon className="size-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {product.category}
              </TableCell>
              <TableCell>
                <StatusDot status={product.status} />
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono text-sm tabular-nums",
                  product.stock === 0
                    ? "text-destructive"
                    : product.stock <= 10
                      ? "text-[var(--warning)]"
                      : "text-foreground",
                )}
              >
                {product.stock}
              </TableCell>
              <TableCell>
                <RowActions
                  actions={[
                    { label: "Edit", onSelect: () => openEditProduct(product) },
                    {
                      label: "Delete",
                      onSelect: () => deleteProduct(product.id),
                      tone: "danger",
                    },
                  ]}
                />
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
