"use client";

import { useState } from "react";

import {
  initialProducts,
  type Category,
  type Product,
} from "@/lib/admin-data";
import { emptyProductForm } from "@/components/admin/constants";
import type { InventoryAdjustmentReason } from "@/components/admin/inventory-dialog";
import { useToast } from "@/components/admin/toast";
import type { ProductForm } from "@/components/admin/types";
import type { useRecents } from "@/components/admin/recents";

import type { LogAuditFn } from "./use-audit-log";

export function useProducts({
  categories,
  recents,
  logAudit,
}: {
  categories: Category[];
  recents: ReturnType<typeof useRecents>;
  logAudit: LogAuditFn;
}) {
  const { toast } = useToast();
  const [list, setList] = useState(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [inventoryProductId, setInventoryProductId] = useState<string | null>(
    null,
  );

  function openNew() {
    setEditingId(null);
    setForm({
      ...emptyProductForm,
      category: categories[0]?.name ?? "Uncategorized",
    });
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      imageUrl: product.imageUrl,
    });
    setDialogOpen(true);
    recents.push({ type: "product", id: product.id, label: product.name });
  }

  function save() {
    if (!form.name.trim() || !form.sku.trim()) {
      return;
    }

    if (editingId) {
      setList((current) =>
        current.map((product) =>
          product.id === editingId
            ? { ...product, ...form }
            : product,
        ),
      );
      logAudit("updated", "product", form.name);
    } else {
      const created = {
        id: `prd-${Date.now()}`,
        ...form,
      };
      setList((current) => [created, ...current]);
      logAudit("created", "product", form.name);
    }

    setDialogOpen(false);
  }

  function bulkDelete(ids: string[]) {
    if (ids.length === 0) {
      return;
    }
    const removed = list.filter((product) => ids.includes(product.id));
    setList((current) =>
      current.filter((product) => !ids.includes(product.id)),
    );
    logAudit(
      "deleted",
      "product",
      `${removed.length} product${removed.length === 1 ? "" : "s"}`,
    );
    toast({
      title: `Deleted ${removed.length} product${removed.length === 1 ? "" : "s"}`,
      tone: "destructive",
      action: {
        label: "Undo",
        onClick: () => {
          setList((current) => [...removed, ...current]);
        },
      },
    });
  }

  function bulkUpdateStatus(ids: string[], status: Product["status"]) {
    if (ids.length === 0) {
      return;
    }
    setList((current) =>
      current.map((product) =>
        ids.includes(product.id) ? { ...product, status } : product,
      ),
    );
    logAudit(
      "status_changed",
      "product",
      `${ids.length} product${ids.length === 1 ? "" : "s"}`,
      `→ ${status}`,
    );
    toast({
      title: `Set ${ids.length} product${ids.length === 1 ? "" : "s"} to ${status}`,
    });
  }

  function remove(productId: string) {
    const removed = list.find((product) => product.id === productId);
    const index = list.findIndex((product) => product.id === productId);
    setList((current) =>
      current.filter((product) => product.id !== productId),
    );
    if (removed) {
      logAudit("deleted", "product", removed.name);
      toast({
        title: `Deleted "${removed.name}"`,
        description: "Product removed from the catalog.",
        tone: "destructive",
        action: {
          label: "Undo",
          onClick: () => {
            setList((current) => {
              const next = [...current];
              next.splice(Math.min(index, next.length), 0, removed);
              return next;
            });
          },
        },
      });
    }
  }

  function openInventoryAdjustment(productId: string) {
    setInventoryProductId(productId);
  }

  function applyInventoryAdjustment(
    productId: string,
    delta: number,
    reason: InventoryAdjustmentReason,
    note: string,
  ) {
    const target = list.find((product) => product.id === productId);
    if (!target) {
      return;
    }
    const nextStock = Math.max(0, target.stock + delta);
    setList((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, stock: nextStock } : product,
      ),
    );
    const sign = delta > 0 ? "+" : "";
    const detail = `${target.stock} → ${nextStock} (${sign}${delta} · ${reason}${note ? ` · ${note}` : ""})`;
    logAudit("updated", "product", target.name, detail);
    toast({
      title: `Stock ${sign}${delta} on ${target.name}`,
      description: `${target.stock} → ${nextStock}`,
    });
    setInventoryProductId(null);
  }

  return {
    list,
    dialogOpen,
    setDialogOpen,
    editingId,
    form,
    setForm,
    inventoryProductId,
    setInventoryProductId,
    openNew,
    openEdit,
    save,
    bulkDelete,
    bulkUpdateStatus,
    remove,
    openInventoryAdjustment,
    applyInventoryAdjustment,
  };
}
