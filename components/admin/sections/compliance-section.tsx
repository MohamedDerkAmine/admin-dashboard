"use client";

import { useState } from "react";
import {
  DownloadIcon,
  FileArchiveIcon,
  ScaleIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const badges = [
  { label: "SOC 2 Type II", note: "Report available on request" },
  { label: "GDPR", note: "EU data residency + DPA" },
  { label: "CCPA", note: "California resident data rights" },
  { label: "PCI DSS", note: "Level 1 via payment processor" },
];

const retentionPolicies = [
  { resource: "Orders", days: 730, editable: true },
  { resource: "Customers (inactive)", days: 365, editable: true },
  { resource: "Audit log", days: 1_095, editable: false },
  { resource: "Session tokens", days: 30, editable: false },
];

export function ComplianceSection() {
  const [policies, setPolicies] = useState(retentionPolicies);
  const [exportEmail, setExportEmail] = useState("");
  const [exportStarted, setExportStarted] = useState<string | null>(null);

  function updateDays(resource: string, days: number) {
    setPolicies((current) =>
      current.map((policy) =>
        policy.resource === resource ? { ...policy, days } : policy,
      ),
    );
  }

  function requestExport() {
    if (!exportEmail.trim()) return;
    setExportStarted(exportEmail.trim());
    setExportEmail("");
  }

  return (
    <div className="grid gap-3">
      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Compliance posture</h2>
            <p className="text-xs text-muted-foreground">
              Framework attestations · valid through 2026-12-31
            </p>
          </div>
          <Button size="sm" variant="outline">
            <DownloadIcon className="size-4" />
            Download reports pack
          </Button>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5"
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-md bg-[color-mix(in_oklch,var(--success),transparent_88%)] text-[var(--success)]">
                <ShieldCheckIcon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{badge.label}</p>
                <p className="text-[11px] text-muted-foreground">{badge.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <Card className="gap-0 py-0">
          <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
            <ScaleIcon className="size-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Data retention</p>
              <p className="text-xs text-muted-foreground">
                Rows older than the threshold are archived nightly
              </p>
            </div>
          </div>
          <div className="grid gap-3 p-4">
            {policies.map((policy) => (
              <div
                key={policy.resource}
                className="grid grid-cols-[1fr_auto_60px] items-center gap-3"
              >
                <span className="text-sm font-medium">{policy.resource}</span>
                <input
                  type="range"
                  min={30}
                  max={1_460}
                  step={30}
                  disabled={!policy.editable}
                  value={policy.days}
                  onChange={(event) =>
                    updateDays(policy.resource, Number(event.target.value))
                  }
                  className={cn(
                    "w-40 accent-[var(--primary)]",
                    !policy.editable && "opacity-40",
                  )}
                />
                <span className="text-right font-mono text-xs tabular-nums">
                  {policy.days}d
                </span>
              </div>
            ))}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Locked policies are enforced by compliance framework requirements
              and cannot be shortened.
            </p>
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
            <FileArchiveIcon className="size-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium">GDPR data export</p>
              <p className="text-xs text-muted-foreground">
                Request a bundle of every row associated with an email address
              </p>
            </div>
          </div>
          <div className="grid gap-3 p-4">
            <div className="grid gap-1.5">
              <Label htmlFor="export-email">Subject email</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="export-email"
                  type="email"
                  placeholder="customer@example.com"
                  value={exportEmail}
                  onChange={(event) => setExportEmail(event.target.value)}
                />
                <Button
                  size="sm"
                  onClick={requestExport}
                  disabled={!exportEmail.trim()}
                >
                  Request
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Includes: orders, customer record, notes, audit entries, and
                consent history.
              </p>
            </div>
            {exportStarted ? (
              <div className="flex items-start gap-2 rounded-md border border-[var(--success)]/30 bg-[color-mix(in_oklch,var(--success),transparent_90%)] px-3 py-2 text-xs">
                <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-[var(--success)]" />
                <div className="min-w-0">
                  <p className="font-medium">Export queued</p>
                  <p className="text-muted-foreground">
                    A signed ZIP will arrive at{" "}
                    <span className="font-mono text-foreground">
                      {exportStarted}
                    </span>{" "}
                    within 24h.
                  </p>
                </div>
              </div>
            ) : null}
            <div className="rounded-md border border-dashed border-border/70 px-3 py-2.5">
              <p className="flex items-center gap-2 text-xs font-medium">
                <Trash2Icon className="size-3.5 text-destructive" />
                Right to erasure
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Erasure requests are queued for a 30-day cooling period before
                permanent deletion. Ongoing legal holds pause the timer.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
