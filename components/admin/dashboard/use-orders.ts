"use client";

import { useCallback, useState } from "react";

import {
  initialOrders,
  type Order,
  type OrderStatus,
} from "@/lib/admin-data";
import { emptyOrderForm } from "@/components/admin/constants";
import { useToast } from "@/components/admin/toast";
import type { OrderForm } from "@/components/admin/types";
import type { useRecents } from "@/components/admin/recents";

import type { LogAuditFn } from "./use-audit-log";

export function useOrders({
  recents,
  logAudit,
}: {
  recents: ReturnType<typeof useRecents>;
  logAudit: LogAuditFn;
}) {
  const { toast } = useToast();
  const [list, setList] = useState<Order[]>(initialOrders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(emptyOrderForm);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);

  function openNew() {
    setForm(emptyOrderForm);
    setDialogOpen(true);
  }

  function save() {
    if (!form.customer.trim() || !form.email.trim()) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: today,
      ...form,
    };
    setList((current) => [newOrder, ...current]);
    setForm(emptyOrderForm);
    setDialogOpen(false);
    logAudit("created", "order", newOrder.id, `${newOrder.customer}`);
    recents.push({
      type: "order",
      id: newOrder.id,
      label: `${newOrder.id} · ${newOrder.customer}`,
    });
  }

  function openRefund(orderId: string) {
    setRefundOrderId(orderId);
  }

  function confirmRefund(amount: number, reason: string) {
    if (!refundOrderId) {
      return;
    }
    const target = list.find((order) => order.id === refundOrderId);
    if (!target) {
      return;
    }
    const isPartial = amount < target.total;
    setList((current) =>
      current.map((order) =>
        order.id === refundOrderId ? { ...order, status: "Refunded" } : order,
      ),
    );
    const detail = `$${amount.toFixed(2)}${isPartial ? " (partial)" : ""}${reason ? ` · ${reason}` : ""}`;
    logAudit("status_changed", "order", target.id, `Refunded · ${detail}`);
    toast({
      title: `Refunded ${target.id}`,
      description: detail,
    });
    setRefundOrderId(null);
  }

  function updateStatus(orderId: string, status: OrderStatus) {
    setList((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
    logAudit("status_changed", "order", orderId, `→ ${status}`);
  }

  function bulkUpdateStatus(ids: string[], status: OrderStatus) {
    if (ids.length === 0) {
      return;
    }
    setList((current) =>
      current.map((order) =>
        ids.includes(order.id) ? { ...order, status } : order,
      ),
    );
    logAudit(
      "status_changed",
      "order",
      `${ids.length} order${ids.length === 1 ? "" : "s"}`,
      `→ ${status}`,
    );
    toast({
      title: `Set ${ids.length} order${ids.length === 1 ? "" : "s"} to ${status}`,
    });
  }

  const markRefunded = useCallback((orderId: string) => {
    setList((current) =>
      current.map((entry) =>
        entry.id === orderId ? { ...entry, status: "Refunded" } : entry,
      ),
    );
  }, []);

  return {
    list,
    dialogOpen,
    setDialogOpen,
    form,
    setForm,
    refundOrderId,
    setRefundOrderId,
    openNew,
    save,
    openRefund,
    confirmRefund,
    updateStatus,
    bulkUpdateStatus,
    markRefunded,
  };
}
