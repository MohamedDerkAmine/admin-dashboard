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

const actionDotBg: Record<AuditAction, string> = {
  created: "bg-[var(--success)]",
  updated: "bg-[var(--info)]",
  status_changed: "bg-[var(--warning)]",
  deleted: "bg-destructive",
};

const actionLabel: Record<AuditAction, string> = {
  created: "created",
  updated: "updated",
  status_changed: "status changed on",
  deleted: "deleted",
};

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function AuditLogSection({ events }: { events: AuditEvent[] }) {
  const grouped = events.reduce<Record<string, AuditEvent[]>>((acc, event) => {
    const key = dayKey(event.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped);

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Audit log</h2>
          <p className="text-xs text-muted-foreground">
            {events.length} event{events.length === 1 ? "" : "s"} across{" "}
            {groupKeys.length} day{groupKeys.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-3 py-12 text-center">
          <div className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
            <ScrollTextIcon className="size-5" />
          </div>
          <p className="text-sm font-medium">No activity yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Admin actions like creates, edits, and deletes will show up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 p-4">
          {groupKeys.map((key) => {
            const dayEvents = grouped[key];
            return (
              <section key={key}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {formatDay(dayEvents[0].timestamp)}
                  </span>
                  <span className="h-px flex-1 bg-border/50" />
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                    {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ol className="relative ml-2 grid gap-3 border-l border-border/60 pl-5">
                  {dayEvents.map((event) => {
                    const Icon = resourceIcons[event.resource];
                    return (
                      <li
                        key={event.id}
                        className="relative grid gap-1 rounded-md border border-transparent px-2 py-1.5 transition-colors hover:border-border/40 hover:bg-muted/30"
                      >
                        <span
                          className={cn(
                            "absolute -left-[calc(1.25rem+0.5rem)] top-2 grid size-4 place-items-center rounded-full ring-4 ring-card",
                            actionDotBg[event.action],
                          )}
                        >
                          <Icon className="size-2.5 text-white" />
                        </span>
                        <p className="text-sm leading-tight">
                          <span className="font-medium text-foreground">
                            {event.actor}
                          </span>{" "}
                          <span
                            className={cn(
                              "font-medium",
                              actionTone[event.action],
                            )}
                          >
                            {actionLabel[event.action]}
                          </span>{" "}
                          <span className="text-foreground">
                            {event.resource}
                          </span>{" "}
                          <span className="font-mono text-[13px] text-foreground">
                            {event.target}
                          </span>
                          <span className="ml-2 font-mono text-[11px] text-muted-foreground tabular-nums">
                            {formatTime(event.timestamp)}
                          </span>
                        </p>
                        {event.detail ? (
                          <p className="text-xs text-muted-foreground">
                            {event.detail}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </Card>
  );
}
