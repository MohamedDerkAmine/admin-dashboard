import { ShoppingCartIcon } from "lucide-react";

import type { OrderStatus } from "@/lib/admin-data";
import { orderStatuses } from "@/components/admin/constants";
import type { OrderForm } from "@/components/admin/types";
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

export function OrderDialog({
  form,
  onOpenChange,
  onSave,
  open,
  setForm,
}: {
  form: OrderForm;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  open: boolean;
  setForm: (form: OrderForm) => void;
}) {
  const canSave = form.customer.trim().length > 0 && form.email.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="size-4 text-muted-foreground" />
            Create order
          </DialogTitle>
          <DialogDescription>
            New orders default to today and the Pending fulfillment state.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Customer name">
            <Input
              autoFocus
              placeholder="Jane Doe"
              value={form.customer}
              onChange={(event) =>
                setForm({ ...form, customer: event.target.value })
              }
            />
          </Field>
          <Field label="Customer email">
            <Input
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </Field>
          <Field label="Items">
            <Input
              type="number"
              min={1}
              className="font-mono tabular-nums"
              value={form.items}
              onChange={(event) =>
                setForm({
                  ...form,
                  items: Math.max(1, Number(event.target.value) || 1),
                })
              }
            />
          </Field>
          <Field label="Total (USD)">
            <Input
              type="number"
              min={0}
              className="font-mono tabular-nums"
              value={form.total}
              onChange={(event) =>
                setForm({ ...form, total: Number(event.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Status">
            <select
              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as OrderStatus })
              }
            >
              {orderStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!canSave}>
            Create order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
