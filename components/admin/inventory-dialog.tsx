"use client";

import { useEffect, useState } from "react";
import { BoxesIcon } from "lucide-react";

import type { Product } from "@/lib/admin-data";
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
import { cn } from "@/lib/utils";

export type InventoryAdjustmentReason =
  | "Restock"
  | "Damage"
  | "Theft/Loss"
  | "Recount"
  | "Return"
  | "Other";

const reasons: InventoryAdjustmentReason[] = [
  "Restock",
  "Damage",
  "Theft/Loss",
  "Recount",
  "Return",
  "Other",
];

export function InventoryDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    productId: string,
    delta: number,
    reason: InventoryAdjustmentReason,
    note: string,
  ) => void;
}) {
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState<InventoryAdjustmentReason>("Restock");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (product) {
      setDelta(0);
      setReason("Restock");
      setNote("");
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const projected = Math.max(0, product.stock + delta);
  const canConfirm = delta !== 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BoxesIcon className="size-4 text-muted-foreground" />
            Adjust stock · {product.name}
          </DialogTitle>
          <DialogDescription>
            Current stock {product.stock}. Adjustments log to the audit trail
            with the reason and an optional note.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="inv-delta">Quantity change</Label>
            <div className="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="outline"
                type="button"
                onClick={() => setDelta((current) => current - 1)}
              >
                −
              </Button>
              <Input
                id="inv-delta"
                type="number"
                step="1"
                className="font-mono tabular-nums"
                value={delta}
                onChange={(event) => setDelta(Number(event.target.value))}
              />
              <Button
                size="icon-sm"
                variant="outline"
                type="button"
                onClick={() => setDelta((current) => current + 1)}
              >
                +
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Projected stock:{" "}
              <span
                className={cn(
                  "font-mono tabular-nums",
                  projected === 0
                    ? "text-destructive"
                    : projected <= 10
                      ? "text-[var(--warning)]"
                      : "text-foreground",
                )}
              >
                {projected}
              </span>
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="inv-reason">Reason</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {reasons.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReason(option)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-xs transition-colors",
                    option === reason
                      ? "border-ring/60 bg-muted text-foreground"
                      : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="inv-note">Note (optional)</Label>
            <Input
              id="inv-note"
              placeholder="e.g. PO #4523 received"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canConfirm}
            onClick={() => onConfirm(product.id, delta, reason, note.trim())}
          >
            <BoxesIcon className="size-4" />
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
