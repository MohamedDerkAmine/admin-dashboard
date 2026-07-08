"use client";

import { useState } from "react";
import {
  CheckIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsed: string;
  createdBy: string;
  createdAt: string;
};

const scopeOptions = [
  "products:read",
  "products:write",
  "orders:read",
  "orders:write",
  "customers:read",
  "webhooks:manage",
] as const;

type Scope = (typeof scopeOptions)[number];

const initialKeys: ApiKey[] = [
  {
    id: "key_1",
    name: "Shopify sync integration",
    prefix: "sk_live_4a2e",
    scopes: ["products:read", "products:write", "orders:read"],
    lastUsed: "4 minutes ago",
    createdBy: "owner@example.com",
    createdAt: "Jan 12, 2026",
  },
  {
    id: "key_2",
    name: "Warehouse fulfillment webhook",
    prefix: "sk_live_9b1c",
    scopes: ["orders:read", "orders:write", "webhooks:manage"],
    lastUsed: "2 hours ago",
    createdBy: "nora@example.com",
    createdAt: "Feb 03, 2026",
  },
  {
    id: "key_3",
    name: "BI dashboard read-only",
    prefix: "sk_live_c7d0",
    scopes: ["products:read", "orders:read", "customers:read"],
    lastUsed: "yesterday",
    createdBy: "amina@example.com",
    createdAt: "Mar 18, 2026",
  },
  {
    id: "key_4",
    name: "Deprecated Zapier connector",
    prefix: "sk_live_1f8a",
    scopes: ["orders:read"],
    lastUsed: "3 months ago",
    createdBy: "marco@example.com",
    createdAt: "Nov 22, 2025",
  },
];

function generateKey() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let body = "";
  for (let i = 0; i < 32; i++) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const prefix = `sk_live_${body.slice(0, 4)}`;
  return { prefix, token: `${prefix}_${body}` };
}

export function ApiKeysSection() {
  const [keys, setKeys] = useState(initialKeys);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<Scope[]>([
    "products:read",
    "orders:read",
  ]);
  const [newlyCreated, setNewlyCreated] = useState<{
    token: string;
    prefix: string;
  } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  function reset() {
    setOpen(false);
    setName("");
    setSelectedScopes(["products:read", "orders:read"]);
    setNewlyCreated(null);
    setRevealed(false);
    setCopied(false);
  }

  function create() {
    if (!name.trim()) return;
    const { prefix, token } = generateKey();
    const key: ApiKey = {
      id: `key_${Date.now()}`,
      name: name.trim(),
      prefix,
      scopes: selectedScopes,
      lastUsed: "never",
      createdBy: "you",
      createdAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };
    setKeys((current) => [key, ...current]);
    setNewlyCreated({ token, prefix });
    setRevealed(true);
  }

  async function copyToken() {
    if (!newlyCreated) return;
    try {
      await navigator.clipboard.writeText(newlyCreated.token);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  function revoke(id: string) {
    setKeys((current) => current.filter((k) => k.id !== id));
  }

  function toggleScope(scope: Scope) {
    setSelectedScopes((current) =>
      current.includes(scope)
        ? current.filter((s) => s !== scope)
        : [...current, scope],
    );
  }

  return (
    <>
      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">API keys</h2>
            <p className="text-xs text-muted-foreground">
              {keys.length} active key{keys.length === 1 ? "" : "s"} · rotate
              regularly and scope to least privilege
            </p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <PlusIcon className="size-4" />
            Create key
          </Button>
        </div>

        <ol className="divide-y divide-border/40">
          {keys.map((key) => (
            <li key={key.id} className="grid gap-1.5 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                      <KeyIcon className="size-3.5" />
                    </div>
                    <p className="truncate text-sm font-medium">{key.name}</p>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {key.prefix}
                    <span className="ml-1 text-muted-foreground/60">
                      ···· ···· ···· ····
                    </span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {key.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded-sm border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    used {key.lastUsed}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    created {key.createdAt} by {key.createdBy}
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => revoke(key.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : reset())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newlyCreated ? "Copy your secret key" : "Create API key"}
            </DialogTitle>
            <DialogDescription>
              {newlyCreated
                ? "This is the only time the full secret will be shown. Store it somewhere safe."
                : "Choose a name and the scopes this key can access."}
            </DialogDescription>
          </DialogHeader>

          {newlyCreated ? (
            <div className="grid gap-3">
              <div className="flex items-start gap-2 rounded-md border border-[var(--warning)]/40 bg-[color-mix(in_oklch,var(--warning),transparent_90%)] px-3 py-2 text-xs">
                <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-[var(--warning)]" />
                <span>Secret keys cannot be retrieved after this dialog closes.</span>
              </div>
              <div className="grid gap-1.5">
                <Label>Secret key</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    readOnly
                    className={cn(
                      "font-mono text-xs",
                      !revealed && "tracking-[0.4em]",
                    )}
                    value={
                      revealed
                        ? newlyCreated.token
                        : `${newlyCreated.prefix} •••••••••••••••••••••••••••••`
                    }
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => setRevealed((v) => !v)}
                  >
                    {revealed ? (
                      <EyeOffIcon className="size-3.5" />
                    ) : (
                      <EyeIcon className="size-3.5" />
                    )}
                    <span className="sr-only">Toggle reveal</span>
                  </Button>
                  <Button size="icon-sm" variant="outline" onClick={copyToken}>
                    {copied ? (
                      <CheckIcon className="size-3.5" />
                    ) : (
                      <ClipboardIcon className="size-3.5" />
                    )}
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Segment integration"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Scopes</Label>
                <div className="grid gap-1.5 rounded-md border border-border/70 bg-muted/20 p-2">
                  {scopeOptions.map((scope) => {
                    const active = selectedScopes.includes(scope);
                    return (
                      <label
                        key={scope}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-xs transition-colors hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          className="size-3.5 accent-[var(--primary)]"
                          checked={active}
                          onChange={() => toggleScope(scope)}
                        />
                        <span className="font-mono">{scope}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {newlyCreated ? (
              <Button onClick={reset}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={reset}>
                  Cancel
                </Button>
                <Button
                  onClick={create}
                  disabled={!name.trim() || selectedScopes.length === 0}
                >
                  <KeyIcon className="size-4" />
                  Generate key
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
