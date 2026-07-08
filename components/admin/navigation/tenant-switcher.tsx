"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";

import type { AdminRole } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export type SwitcherMembership = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: AdminRole;
};

export function TenantSwitcher({
  activeTenantId,
  memberships,
  collapsed = false,
}: {
  activeTenantId: string;
  memberships: SwitcherMembership[];
  collapsed?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingTenantId, setPendingTenantId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const active = memberships.find(
    (membership) => membership.tenantId === activeTenantId,
  );

  async function switchTo(tenantId: string) {
    if (tenantId === activeTenantId) {
      setOpen(false);
      return;
    }
    setPendingTenantId(tenantId);
    try {
      const response = await fetch("/api/session/switch-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      if (response.ok) {
        setOpen(false);
        router.refresh();
        router.push("/");
      }
    } finally {
      setPendingTenantId(null);
    }
  }

  const canSwitch = memberships.length > 1;
  const label = active?.tenantName ?? "Workspace";
  const initials = initialsOf(label);

  if (collapsed) {
    return (
      <div
        className="grid size-7 place-items-center rounded-md bg-sidebar-primary text-[10px] font-semibold uppercase tracking-wide text-sidebar-primary-foreground"
        title={label}
      >
        {initials}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => canSwitch && setOpen((current) => !current)}
        disabled={!canSwitch}
        className={cn(
          "group flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors",
          canSwitch && "hover:bg-sidebar-accent/40",
        )}
        aria-haspopup={canSwitch ? "listbox" : undefined}
        aria-expanded={canSwitch ? open : undefined}
      >
        <div className="grid size-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-[10px] font-semibold uppercase tracking-wide text-sidebar-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">
            {label}
          </p>
          <p className="truncate text-[10px] text-sidebar-foreground/50">
            {canSwitch
              ? `${memberships.length} workspaces · ${active?.role ?? ""}`
              : (active?.role ?? "Commerce admin")}
          </p>
        </div>
        {canSwitch ? (
          <ChevronsUpDownIcon className="size-3.5 shrink-0 text-sidebar-foreground/50 transition-colors group-hover:text-sidebar-foreground" />
        ) : null}
      </button>

      {open && canSwitch ? (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 w-full min-w-56 overflow-hidden rounded-md border border-sidebar-border bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/10"
        >
          <p className="border-b border-border/50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspaces
          </p>
          <ol className="max-h-[300px] overflow-y-auto">
            {memberships.map((membership) => {
              const isActive = membership.tenantId === activeTenantId;
              const isPending = pendingTenantId === membership.tenantId;
              return (
                <li key={membership.tenantId}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => switchTo(membership.tenantId)}
                    disabled={pendingTenantId !== null}
                    className={cn(
                      "flex w-full items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                      isActive && "bg-muted/60",
                    )}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/15 text-[10px] font-semibold uppercase text-primary">
                      {initialsOf(membership.tenantName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {membership.tenantName}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted-foreground">
                        {membership.tenantSlug} · {membership.role}
                      </span>
                    </span>
                    {isActive ? (
                      <CheckIcon className="size-3.5 text-primary" />
                    ) : isPending ? (
                      <span className="text-[10px] text-muted-foreground">
                        Switching...
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <Link
            href="/signup"
            className="flex items-center gap-2 border-t border-border/50 px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <PlusIcon className="size-3.5" />
            Create workspace
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function initialsOf(name: string) {
  const parts = name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "WS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
