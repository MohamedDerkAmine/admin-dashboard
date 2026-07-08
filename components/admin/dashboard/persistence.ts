"use client";

import type { PersistableResource } from "@/lib/db/mutations";

export async function persistAdminSnapshot(
  resource: PersistableResource,
  records: unknown[],
) {
  const response = await fetch("/api/admin/mutations", {
    body: JSON.stringify({ records, resource }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "Unable to persist changes.",
    );
  }
}
