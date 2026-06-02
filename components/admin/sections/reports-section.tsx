"use client";

import { CalendarClockIcon, PlayIcon, PlusIcon } from "lucide-react";

import type {
  ScheduledReport,
  ScheduledReportFrequency,
} from "@/lib/admin-data";
import {
  DataTable,
  SortableHead,
  useSortable,
} from "@/components/admin/shared/data-table";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { RowActions } from "@/components/admin/shared/row-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SortField = "name" | "dataset" | "frequency" | "lastRunAt";

function frequencyMs(frequency: ScheduledReportFrequency) {
  switch (frequency) {
    case "daily":
      return 24 * 60 * 60 * 1000;
    case "weekly":
      return 7 * 24 * 60 * 60 * 1000;
    case "monthly":
      return 30 * 24 * 60 * 60 * 1000;
  }
}

export function computeNextRun(report: ScheduledReport): Date {
  const base = report.lastRunAt
    ? new Date(report.lastRunAt).getTime()
    : new Date(report.createdAt).getTime();
  return new Date(base + frequencyMs(report.frequency));
}

function formatTimestamp(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReportsSection({
  reports,
  openNewReport,
  onToggle,
  onRunNow,
  onDelete,
}: {
  reports: ScheduledReport[];
  openNewReport: () => void;
  onToggle: (id: string) => void;
  onRunNow: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { sort, toggle, apply } = useSortable<SortField>({
    field: "name",
    direction: "asc",
  });
  const sorted = apply(reports, {
    name: (r) => r.name.toLowerCase(),
    dataset: (r) => r.dataset,
    frequency: (r) => r.frequency,
    lastRunAt: (r) => r.lastRunAt ?? "",
  });

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Scheduled reports</h2>
          <p className="text-xs text-muted-foreground">
            {reports.length} schedule{reports.length === 1 ? "" : "s"} ·{" "}
            {reports.filter((entry) => entry.enabled).length} active
          </p>
        </div>
        <Button size="sm" onClick={openNewReport}>
          <PlusIcon className="size-4" />
          Schedule report
        </Button>
      </div>
      <DataTable
        isEmpty={sorted.length === 0}
        empty={
          <EmptyState
            icon={CalendarClockIcon}
            title="No scheduled reports"
            description="Schedule recurring CSV exports of products, orders, customers, returns or reviews."
            action={{
              label: "Schedule report",
              onClick: openNewReport,
              icon: PlusIcon,
            }}
          />
        }
      >
        <TableHeader>
          <TableRow>
            <SortableHead field="name" sort={sort} onToggle={toggle}>
              Name
            </SortableHead>
            <SortableHead field="dataset" sort={sort} onToggle={toggle}>
              Dataset
            </SortableHead>
            <SortableHead field="frequency" sort={sort} onToggle={toggle}>
              Frequency
            </SortableHead>
            <TableHead>Delivery</TableHead>
            <SortableHead field="lastRunAt" sort={sort} onToggle={toggle} align="right">
              Last run
            </SortableHead>
            <TableHead className="text-right">Next run</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[140px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((report) => {
            const nextRun = computeNextRun(report);
            return (
              <TableRow key={report.id}>
                <TableCell>
                  <p className="text-sm font-medium">{report.name}</p>
                </TableCell>
                <TableCell className="text-sm capitalize text-muted-foreground">
                  {report.dataset}
                </TableCell>
                <TableCell className="text-sm capitalize">
                  {report.frequency}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {report.deliveryEmail}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {formatTimestamp(report.lastRunAt)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono text-xs tabular-nums",
                    report.enabled
                      ? "text-foreground"
                      : "text-muted-foreground line-through",
                  )}
                >
                  {report.enabled ? formatTimestamp(nextRun.toISOString()) : "Paused"}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onToggle(report.id)}
                    role="switch"
                    aria-checked={report.enabled}
                    className={cn(
                      "inline-flex h-5 w-9 items-center rounded-full border border-border/60 transition-colors",
                      report.enabled ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "ml-0.5 inline-block size-4 rounded-full bg-background shadow transition-transform",
                        report.enabled ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onRunNow(report.id)}
                    >
                      <PlayIcon className="size-3.5" />
                      Run now
                    </Button>
                    <RowActions
                      actions={[
                        {
                          label: report.enabled ? "Pause" : "Resume",
                          onSelect: () => onToggle(report.id),
                        },
                        {
                          label: "Delete",
                          onSelect: () => onDelete(report.id),
                          tone: "danger",
                        },
                      ]}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </DataTable>
    </Card>
  );
}
