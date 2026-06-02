"use client";

import { useState } from "react";

import { initialCategories } from "@/lib/admin-data";
import { emptyCategoryForm } from "@/components/admin/shared/constants";
import { useToast } from "@/components/admin/shared/toast";
import type { CategoryForm } from "@/components/admin/shared/types";
import type { useRecents } from "@/components/admin/shared/recents";

import type { LogAuditFn } from "./use-audit-log";

export function useCategories({
  recents,
  logAudit,
}: {
  recents: ReturnType<typeof useRecents>;
  logAudit: LogAuditFn;
}) {
  const { toast } = useToast();
  const [list, setList] = useState(initialCategories);
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
    setList((current) => [...current, newCategory]);
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
    setList((current) =>
      current.filter((category) => category.id !== categoryId),
    );
    if (removed) {
      logAudit("deleted", "category", removed.name);
      toast({
        title: `Deleted "${removed.name}"`,
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

  return { list, dialogOpen, setDialogOpen, form, setForm, openNew, save, remove };
}
