"use client";

import {
  PackageIcon,
  PercentIcon,
  ScrollTextIcon,
  ShieldIcon,
  ShoppingCartIcon,
  TagsIcon,
  type LucideIcon,
} from "lucide-react";

import type { AuditAction, AuditEvent, AuditResource } from "@/lib/admin-data";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const resourceIcons: Record<AuditResource, LucideIcon> = {
  product: PackageIcon,
  category: TagsIcon,
  order: ShoppingCartIcon,
  user: ShieldIcon,
  discount: PercentIcon,
};

const actionTone: Record<AuditAction, string> = {
  created: "text-[var(--success)]",
  updated: "text-[var(--info)]",
  status_changed: "text-[var(--warning)]",
  deleted: "text-destructive",
};

const actionLabel: Record<AuditAction, string> = {
  created: "created",
  updated: "updated",
  status_changed: "status changed on",
  deleted: "deleted",
};

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AuditLogSection({ events }: { events: AuditEvent[] }) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Audit log</h2>
          <p className="text-xs text-muted-foreground">
            {events.length} event{events.length === 1 ? "" : "s"} · admin
            mutations across the workspace
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border-t border-border/40 px-3 py-12 text-center">
          <div className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
            <ScrollTextIcon className="size-5" />
          </div>
          <p className="text-sm font-medium">No activity yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Admin actions like creates, edits, and deletes will show up here.
          </p>
        </div>
      ) : (
        <ol className="border-t border-border/40">
          {events.map((event) => {
            const Icon = resourceIcons[event.resource];

            return (
              <li
                key={event.id}
                className="flex items-start gap-3 border-b border-border/30 px-4 py-3 last:border-b-0 hover:bg-muted/30"
              >
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-tight">
                    <span className="font-medium text-foreground">
                      {event.actor}
                    </span>{" "}
                    <span className={cn("font-medium", actionTone[event.action])}>
                      {actionLabel[event.action]}
                    </span>{" "}
                    <span className="text-foreground">{event.resource}</span>{" "}
                    <span className="font-mono text-[13px] text-foreground">
                      {event.target}
                    </span>
                  </p>
                  {event.detail ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {event.detail}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                  {formatTimestamp(event.timestamp)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
