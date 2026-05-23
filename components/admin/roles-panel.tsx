"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon, ShieldCheckIcon, TrashIcon } from "lucide-react";

import {
  PERMISSIONS,
  builtinRolePermissions,
  type AdminRole,
  type PermissionKey,
} from "@/lib/admin-data";
import { adminRoles } from "@/components/admin/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "admin-custom-roles";

type CustomRole = {
  id: string;
  name: string;
  permissions: PermissionKey[];
};

function readCustomRoles(): CustomRole[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomRole[]) : [];
  } catch {
    return [];
  }
}

function writeCustomRoles(roles: CustomRole[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  } catch {
    // ignore
  }
}

export function RolesPanel({ canManage }: { canManage: boolean }) {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftPerms, setDraftPerms] = useState<Set<PermissionKey>>(new Set());

  useEffect(() => {
    setCustomRoles(readCustomRoles());
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, typeof PERMISSIONS>();
    PERMISSIONS.forEach((permission) => {
      const list = map.get(permission.group) ?? [];
      list.push(permission);
      map.set(permission.group, list);
    });
    return Array.from(map.entries());
  }, []);

  function persist(next: CustomRole[]) {
    writeCustomRoles(next);
    setCustomRoles(next);
  }

  function addRole() {
    const name = draftName.trim();
    if (!name) {
      return;
    }
    const role: CustomRole = {
      id: `role-${Date.now()}`,
      name,
      permissions: Array.from(draftPerms),
    };
    persist([...customRoles, role]);
    setDraftName("");
    setDraftPerms(new Set());
    setAdding(false);
  }

  function removeRole(id: string) {
    persist(customRoles.filter((role) => role.id !== id));
  }

  function togglePerm(key: PermissionKey) {
    setDraftPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function permissionsFor(role: AdminRole | string): PermissionKey[] {
    if ((adminRoles as readonly string[]).includes(role)) {
      return builtinRolePermissions[role as AdminRole];
    }
    return customRoles.find((entry) => entry.name === role)?.permissions ?? [];
  }

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold">Roles</h3>
            <p className="text-xs text-muted-foreground">
              {adminRoles.length} built-in · {customRoles.length} custom
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!canManage || adding}
          onClick={() => setAdding(true)}
        >
          <PlusIcon className="size-4" />
          New role
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <th className="sticky left-0 z-10 bg-muted/20 px-3 py-2">Role</th>
              {groups.map(([group, items]) => (
                <th
                  key={group}
                  colSpan={items.length}
                  className="border-l border-border/40 px-3 py-2 text-center"
                >
                  {group}
                </th>
              ))}
              <th className="w-8" />
            </tr>
            <tr className="border-b border-border/40 text-left text-[10px] text-muted-foreground">
              <th className="sticky left-0 z-10 bg-background px-3 py-1.5" />
              {groups.map(([, items]) =>
                items.map((permission, index) => (
                  <th
                    key={permission.key}
                    className={cn(
                      "px-2 py-1.5 text-center font-normal",
                      index === 0 && "border-l border-border/40",
                    )}
                    title={permission.label}
                  >
                    {permission.label.replace(/^(View|Edit|Delete|Issue|Invite|Manage|Access) /, "")}
                  </th>
                )),
              )}
              <th />
            </tr>
          </thead>
          <tbody>
            {adminRoles.map((role) => {
              const perms = new Set(permissionsFor(role));
              return (
                <tr key={role} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium">
                    {role}
                  </td>
                  {groups.map(([, items]) =>
                    items.map((permission, index) => (
                      <td
                        key={permission.key}
                        className={cn(
                          "px-2 py-2 text-center text-muted-foreground",
                          index === 0 && "border-l border-border/40",
                        )}
                      >
                        {perms.has(permission.key) ? (
                          <span className="text-[var(--success)]">●</span>
                        ) : (
                          <span className="text-muted-foreground/30">○</span>
                        )}
                      </td>
                    )),
                  )}
                  <td />
                </tr>
              );
            })}
            {customRoles.map((role) => {
              const perms = new Set(role.permissions);
              return (
                <tr
                  key={role.id}
                  className="group border-b border-border/30 hover:bg-muted/20"
                >
                  <td className="sticky left-0 z-10 bg-background px-3 py-2 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {role.name}
                      <span className="rounded bg-primary/15 px-1 text-[9px] font-semibold uppercase text-primary">
                        custom
                      </span>
                    </span>
                  </td>
                  {groups.map(([, items]) =>
                    items.map((permission, index) => (
                      <td
                        key={permission.key}
                        className={cn(
                          "px-2 py-2 text-center text-muted-foreground",
                          index === 0 && "border-l border-border/40",
                        )}
                      >
                        {perms.has(permission.key) ? (
                          <span className="text-[var(--success)]">●</span>
                        ) : (
                          <span className="text-muted-foreground/30">○</span>
                        )}
                      </td>
                    )),
                  )}
                  <td className="px-2 text-right">
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => removeRole(role.id)}
                      aria-label={`Delete role ${role.name}`}
                      className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {adding ? (
        <div className="grid gap-3 border-t border-border/40 bg-muted/20 p-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Role name</Label>
            <Input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="e.g. Catalog editor"
              className="max-w-xs"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Permissions</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {groups.map(([group, items]) => (
                <div key={group} className="grid gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </p>
                  {items.map((permission) => (
                    <label
                      key={permission.key}
                      className="flex items-center gap-2 rounded-sm px-1.5 py-1 text-xs hover:bg-muted/60"
                    >
                      <input
                        type="checkbox"
                        checked={draftPerms.has(permission.key)}
                        onChange={() => togglePerm(permission.key)}
                        className="size-3.5 cursor-pointer rounded-[3px] border border-input accent-primary"
                      />
                      {permission.label}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setDraftName("");
                setDraftPerms(new Set());
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={addRole}
              disabled={draftName.trim().length === 0}
            >
              Create role
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
