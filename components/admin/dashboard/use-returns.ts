"use client";

import { useState } from "react";

import {
  initialReturnRequests,
  type Order,
  type ReturnRequest,
} from "@/lib/admin-data";
import { useToast } from "@/components/admin/toast";

import type { LogAuditFn } from "./use-audit-log";

export function useReturns({
  orders,
  markOrderRefunded,
  logAudit,
}: {
  orders: Order[];
  markOrderRefunded: (orderId: string) => void;
  logAudit: LogAuditFn;
}) {
  const { toast } = useToast();
  const [list, setList] = useState<ReturnRequest[]>(initialReturnRequests);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  function approve(id: string) {
    const target = list.find((entry) => entry.id === id);
    if (!target) return;
    setList((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: "Approved",
              resolvedAt: new Date().toISOString(),
            }
          : entry,
      ),
    );
    logAudit("status_changed", "order", target.orderId, `RMA ${id} approved`);
    toast({ title: `Approved ${id}`, description: target.customer });
  }

  function deny(id: string) {
    const target = list.find((entry) => entry.id === id);
    if (!target) return;
    setList((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: "Denied",
              resolvedAt: new Date().toISOString(),
            }
          : entry,
      ),
    );
    logAudit("status_changed", "order", target.orderId, `RMA ${id} denied`);
    toast({
      title: `Denied ${id}`,
      description: target.customer,
      tone: "destructive",
    });
  }

  function refund(id: string) {
    const target = list.find((entry) => entry.id === id);
    if (!target) return;
    const order = orders.find((entry) => entry.id === target.orderId);
    const amount = order?.total ?? 0;
    setList((current) =>
      current.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: "Refunded",
              resolvedAt: new Date().toISOString(),
              refundAmount: amount,
            }
          : entry,
      ),
    );
    if (order) {
      markOrderRefunded(order.id);
    }
    logAudit(
      "status_changed",
      "order",
      target.orderId,
      `RMA ${id} refunded · $${amount.toFixed(2)}`,
    );
    toast({
      title: `Refunded ${id}`,
      description: `${target.customer} · $${amount.toFixed(2)}`,
    });
  }

  return {
    list,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    approve,
    deny,
    refund,
  };
}
