"use client";

import { useState } from "react";

import { initialCategories } from "@/lib/admin-data";
import { emptyCategoryForm } from "@/components/admin/shared/constants";
import { useToast } from "@/components/admin/shared/toast";
import type { CategoryForm } from "@/components/admin/shared/types";
import type { useRecents } from "@/components/admin/shared/recents";

import type { LogAuditFn } from "./use-audit-log";
import { persistAdminSnapshot } from "./persistence";

export function useCategories({
  initialCategories: initialList = initialCategories,
  recents,
  logAudit,
}: {
  initialCategories?: typeof initialCategories;
  recents: ReturnType<typeof useRecents>;
  logAudit: LogAuditFn;
}) {
  const { toast } = useToast();
  const [list, setList] = useState(initialList);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyCategoryForm);

  function openNew() {
    setForm(emptyCategoryForm);
    setDialogOpen(true);
  }

  function save() {
    const name = form.name.trim();

    if (!name) {
      return;
    }

    const newCategory = { id: `cat-${Date.now()}`, name, productCount: 0 };
    const next = [...list, newCategory];
    setList(next);
    void persistAdminSnapshot("categories", next).catch(() => undefined);
    setForm(emptyCategoryForm);
    setDialogOpen(false);
    logAudit("created", "category", name);
    recents.push({
      type: "category",
      id: newCategory.id,
      label: newCategory.name,
    });
  }

  function remove(categoryId: string) {
    const removed = list.find((category) => category.id === categoryId);
    const index = list.findIndex((category) => category.id === categoryId);
    const next = list.filter((category) => category.id !== categoryId);
    setList(next);
    void persistAdminSnapshot("categories", next).catch(() => undefined);
    if (removed) {
      logAudit("deleted", "category", removed.name);
      toast({
        title: `Deleted "${removed.name}"`,
        tone: "destructive",
        action: {
          label: "Undo",
          onClick: () => {
            const restored = [...next];
            restored.splice(Math.min(index, restored.length), 0, removed);
            setList(restored);
            void persistAdminSnapshot("categories", restored).catch(
              () => undefined,
            );
          },
        },
      });
    }
  }

  return { list, dialogOpen, setDialogOpen, form, setForm, openNew, save, remove };
}
