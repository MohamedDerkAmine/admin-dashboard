"use client";

import { useEffect, useState } from "react";
import { CalendarClockIcon } from "lucide-react";

import type {
  ScheduledReportDataset,
  ScheduledReportFrequency,
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

export type ReportFormState = {
  name: string;
  dataset: ScheduledReportDataset;
  frequency: ScheduledReportFrequency;
  deliveryEmail: string;
};

const empty: ReportFormState = {
  name: "",
  dataset: "orders",
  frequency: "weekly",
  deliveryEmail: "",
};

const datasetOptions: { value: ScheduledReportDataset; label: string }[] = [
  { value: "products", label: "Products" },
  { value: "orders", label: "Orders" },
  { value: "customers", label: "Customers" },
  { value: "returns", label: "Returns" },
  { value: "reviews", label: "Reviews" },
];

export function ReportDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: ReportFormState) => void;
}) {
  const [form, setForm] = useState<ReportFormState>(empty);

  useEffect(() => {
    if (open) {
      setForm(empty);
    }
  }, [open]);

  const canSave =
    form.name.trim().length > 0 && form.deliveryEmail.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClockIcon className="size-4 text-muted-foreground" />
            Schedule a report
          </DialogTitle>
          <DialogDescription>
            CSV exports run on the chosen cadence and email the recipient.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="rpt-name">Report name</Label>
            <Input
              id="rpt-name"
              autoFocus
              placeholder="e.g. Weekly orders snapshot"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Dataset</Label>
            <Select
              value={form.dataset}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  dataset: value as ScheduledReportDataset,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {datasetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Frequency</Label>
            <Select
              value={form.frequency}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  frequency: value as ScheduledReportFrequency,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="rpt-email">Delivery email</Label>
            <Input
              id="rpt-email"
              type="email"
              placeholder="ops@example.com"
              value={form.deliveryEmail}
              onChange={(event) =>
                setForm({ ...form, deliveryEmail: event.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSave} onClick={() => onSave(form)}>
            Schedule report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
