"use client";

import { useEffect, useState } from "react";
import { RotateCcwIcon } from "lucide-react";

import type { Order } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RefundDialog({
  order,
  open,
  onOpenChange,
  onConfirm,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number, reason: string) => void;
}) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (order) {
      setAmount(order.total);
      setReason("");
    }
  }, [order]);

  if (!order) {
    return null;
  }

  const canConfirm = amount > 0 && amount <= order.total;
  const isPartial = amount < order.total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcwIcon className="size-4 text-muted-foreground" />
            Refund {order.id}
          </DialogTitle>
          <DialogDescription>
            {order.customer} · charged ${order.total.toFixed(2)}. Refunds set the
            order status to Refunded and log to the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="refund-amount">Amount (USD)</Label>
            <Input
              id="refund-amount"
              type="number"
              min={0}
              max={order.total}
              step="0.01"
              className="font-mono tabular-nums"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {isPartial ? "Partial refund" : "Full refund"}
              </span>
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => setAmount(order.total)}
              >
                Set to full (${order.total.toFixed(2)})
              </button>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="refund-reason">Reason (optional)</Label>
            <Input
              id="refund-reason"
              placeholder="e.g. customer requested return"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!canConfirm}
            onClick={() => onConfirm(amount, reason.trim())}
          >
            <RotateCcwIcon className="size-4" />
            Issue refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
