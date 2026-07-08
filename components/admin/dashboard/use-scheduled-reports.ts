"use client";

import { useState } from "react";

import {
  initialScheduledReports,
  type Customer,
  type Order,
  type Product,
  type ReturnRequest,
  type Review,
  type ScheduledReport,
} from "@/lib/admin-data";
import { exportCsv } from "@/components/admin/shared/csv";
import type { ReportFormState } from "@/components/admin/dialogs/report-dialog";
import { useToast } from "@/components/admin/shared/toast";

import type { LogAuditFn } from "./use-audit-log";

export type ReportDatasets = {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  returns: ReturnRequest[];
  reviews: Review[];
};

export function useScheduledReports({
  datasets,
  initialScheduledReports: initialList = initialScheduledReports,
  logAudit,
}: {
  datasets: ReportDatasets;
  initialScheduledReports?: ScheduledReport[];
  logAudit: LogAuditFn;
}) {
  const { toast } = useToast();
  const [list, setList] = useState<ScheduledReport[]>(initialList);
  const [dialogOpen, setDialogOpen] = useState(false);

  function save(form: ReportFormState) {
    const next: ScheduledReport = {
      id: `rpt-${Date.now()}`,
      name: form.name.trim(),
      dataset: form.dataset,
      frequency: form.frequency,
      deliveryEmail: form.deliveryEmail.trim(),
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    setList((current) => [next, ...current]);
    setDialogOpen(false);
    logAudit(
      "created",
      "discount",
      next.name,
      `${next.dataset} · ${next.frequency}`,
    );
    toast({ title: `Scheduled "${next.name}"` });
  }

  function toggle(id: string) {
    setList((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, enabled: !entry.enabled } : entry,
      ),
    );
  }

  function remove(id: string) {
    const removed = list.find((entry) => entry.id === id);
    setList((current) => current.filter((entry) => entry.id !== id));
    if (removed) {
      logAudit("deleted", "discount", removed.name);
      toast({
        title: `Deleted "${removed.name}"`,
        tone: "destructive",
        action: {
          label: "Undo",
          onClick: () => setList((current) => [removed, ...current]),
        },
      });
    }
  }

  function run(id: string) {
    const report = list.find((entry) => entry.id === id);
    if (!report) return;
    const today = new Date().toISOString().slice(0, 10);
    const filename = `${report.dataset}-${today}.csv`;

    if (report.dataset === "products") {
      exportCsv(filename, datasets.products, [
        { header: "ID", accessor: (p) => p.id },
        { header: "Name", accessor: (p) => p.name },
        { header: "SKU", accessor: (p) => p.sku },
        { header: "Category", accessor: (p) => p.category },
        { header: "Status", accessor: (p) => p.status },
        { header: "Price", accessor: (p) => p.price },
        { header: "Stock", accessor: (p) => p.stock },
      ]);
    } else if (report.dataset === "orders") {
      exportCsv(filename, datasets.orders, [
        { header: "ID", accessor: (o) => o.id },
        { header: "Customer", accessor: (o) => o.customer },
        { header: "Email", accessor: (o) => o.email },
        { header: "Status", accessor: (o) => o.status },
        { header: "Items", accessor: (o) => o.items },
        { header: "Total", accessor: (o) => o.total },
        { header: "Date", accessor: (o) => o.date },
      ]);
    } else if (report.dataset === "customers") {
      exportCsv(filename, datasets.customers, [
        { header: "ID", accessor: (c) => c.id },
        { header: "Name", accessor: (c) => c.name },
        { header: "Email", accessor: (c) => c.email },
        { header: "Segment", accessor: (c) => c.segment },
        { header: "Orders", accessor: (c) => c.orders },
        { header: "Spent", accessor: (c) => c.spent },
        { header: "Last order", accessor: (c) => c.lastOrder },
      ]);
    } else if (report.dataset === "returns") {
      exportCsv(filename, datasets.returns, [
        { header: "ID", accessor: (r) => r.id },
        { header: "Order", accessor: (r) => r.orderId },
        { header: "Customer", accessor: (r) => r.customer },
        { header: "Email", accessor: (r) => r.email },
        { header: "Reason", accessor: (r) => r.reason },
        { header: "Status", accessor: (r) => r.status },
        { header: "Requested", accessor: (r) => r.requestedAt },
      ]);
    } else if (report.dataset === "reviews") {
      exportCsv(filename, datasets.reviews, [
        { header: "ID", accessor: (r) => r.id },
        { header: "Product", accessor: (r) => r.productName },
        { header: "Customer", accessor: (r) => r.customer },
        { header: "Rating", accessor: (r) => r.rating },
        { header: "Status", accessor: (r) => r.status },
        { header: "Title", accessor: (r) => r.title },
        { header: "Body", accessor: (r) => r.body },
        { header: "Submitted", accessor: (r) => r.submittedAt },
      ]);
    }

    setList((current) =>
      current.map((entry) =>
        entry.id === id
          ? { ...entry, lastRunAt: new Date().toISOString() }
          : entry,
      ),
    );
    toast({
      title: `Ran "${report.name}"`,
      description: `Sent ${filename} to ${report.deliveryEmail}`,
    });
  }

  return {
    list,
    dialogOpen,
    setDialogOpen,
    save,
    toggle,
    remove,
    run,
  };
}
