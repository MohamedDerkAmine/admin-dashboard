"use client";

import { useCallback, useState } from "react";

import {
  initialAuditEvents,
  type AuditAction,
  type AuditEvent,
  type AuditResource,
} from "@/lib/admin-data";
import { persistAdminSnapshot } from "./persistence";

export type LogAuditFn = (
  action: AuditAction,
  resource: AuditResource,
  target: string,
  detail?: string,
) => void;

export function useAuditLog(
  userEmail?: string,
  initialEvents: AuditEvent[] = initialAuditEvents,
) {
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents);

  const log = useCallback<LogAuditFn>(
    (action, resource, target, detail) => {
      const event: AuditEvent = {
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        actor: userEmail ?? "current user",
        action,
        resource,
        target,
        detail,
      };
      setEvents((current) => {
        const next = [event, ...current];
        void persistAdminSnapshot("auditEvents", next).catch(() => undefined);
        return next;
      });
    },
    [userEmail],
  );

  return { events, log };
}
