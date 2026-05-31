"use client";

import { useState } from "react";

import {
  initialDiscountCodes,
  type DiscountCode,
} from "@/lib/admin-data";
import type { DiscountFormState } from "@/components/admin/discount-dialog";
import { useToast } from "@/components/admin/toast";

import type { LogAuditFn } from "./use-audit-log";

export function useDiscounts({ logAudit }: { logAudit: LogAuditFn }) {
  const { toast } = useToast();
  const [list, setList] = useState<DiscountCode[]>(initialDiscountCodes);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openNew() {
    setDialogOpen(true);
  }

  function save(form: DiscountFormState) {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      return;
    }
    const next: DiscountCode = {
      id: `disc-${Date.now()}`,
      code,
      kind: form.kind,
      value: form.value,
      status: form.status,
      expiresAt: form.expiresAt || undefined,
      maxUses: form.maxUses > 0 ? form.maxUses : undefined,
      usedCount: 0,
    };
    setList((current) => [next, ...current]);
    setDialogOpen(false);
    logAudit(
      "created",
      "discount",
      code,
      form.kind === "percent" ? `${form.value}% off` : `$${form.value} off`,
    );
    toast({ title: `Created code ${code}` });
  }

  function remove(id: string) {
    const removed = list.find((entry) => entry.id === id);
    setList((current) => current.filter((entry) => entry.id !== id));
    if (removed) {
      logAudit("deleted", "discount", removed.code);
      toast({
        title: `Deleted code ${removed.code}`,
        tone: "destructive",
        action: {
          label: "Undo",
          onClick: () => setList((current) => [removed, ...current]),
        },
      });
    }
  }

  return { list, dialogOpen, setDialogOpen, openNew, save, remove };
}
