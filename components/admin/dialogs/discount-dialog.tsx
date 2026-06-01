"use client";

import { useEffect, useState } from "react";
import { PercentIcon } from "lucide-react";

import type {
  DiscountCode,
  DiscountKind,
  DiscountStatus,
} from "@/lib/admin-data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DiscountFormState = {
  code: string;
  kind: DiscountKind;
  value: number;
  status: DiscountStatus;
  expiresAt: string;
  maxUses: number;
};

const empty: DiscountFormState = {
  code: "",
  kind: "percent",
  value: 10,
  status: "Active",
  expiresAt: "",
  maxUses: 0,
};

export function DiscountDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: DiscountFormState) => void;
}) {
  const [form, setForm] = useState<DiscountFormState>(empty);

  useEffect(() => {
    if (open) {
      setForm(empty);
    }
  }, [open]);

  const canSave = form.code.trim().length > 0 && form.value > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PercentIcon className="size-4 text-muted-foreground" />
            Create discount code
          </DialogTitle>
          <DialogDescription>
            Codes are case-insensitive at checkout but stored uppercase here.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="disc-code">Code</Label>
            <Input
              id="disc-code"
              autoFocus
              className="font-mono uppercase"
              placeholder="e.g. WELCOME10"
              value={form.code}
              onChange={(event) =>
                setForm({ ...form, code: event.target.value.toUpperCase() })
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Kind</Label>
            <Select
              value={form.kind}
              onValueChange={(value) =>
                setForm({ ...form, kind: value as DiscountKind })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent off</SelectItem>
                <SelectItem value="fixed">Fixed amount off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="disc-value">
              Value {form.kind === "percent" ? "(%)" : "($)"}
            </Label>
            <Input
              id="disc-value"
              type="number"
              min={0}
              className="font-mono tabular-nums"
              value={form.value}
              onChange={(event) =>
                setForm({ ...form, value: Number(event.target.value) })
              }
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm({ ...form, status: value as DiscountStatus })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="disc-uses">Max uses (0 = unlimited)</Label>
            <Input
              id="disc-uses"
              type="number"
              min={0}
              className="font-mono tabular-nums"
              value={form.maxUses}
              onChange={(event) =>
                setForm({ ...form, maxUses: Number(event.target.value) })
              }
            />
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="disc-expires">Expires (optional)</Label>
            <Input
              id="disc-expires"
              type="date"
              value={form.expiresAt}
              onChange={(event) =>
                setForm({ ...form, expiresAt: event.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSave} onClick={() => onSave(form)}>
            Create code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
