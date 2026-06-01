"use client";

import { useEffect, useState } from "react";
import { CheckIcon, SettingsIcon } from "lucide-react";

import { useToast } from "@/components/admin/shared/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "admin-store-settings";

export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  currency: Currency;
  taxRate: number;
  defaultShipping: number;
  lowStockThreshold: number;
  weightUnit: "lb" | "kg";
};

export const defaultSettings: StoreSettings = {
  storeName: "StoreOps",
  supportEmail: "support@example.com",
  currency: "USD",
  taxRate: 8.5,
  defaultShipping: 8,
  lowStockThreshold: 10,
  weightUnit: "lb",
};

function readSettings(): StoreSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<StoreSettings>) };
  } catch {
    return defaultSettings;
  }
}

function writeSettings(settings: StoreSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const currencyOptions: { value: Currency; label: string }[] = [
  { value: "USD", label: "USD · US Dollar" },
  { value: "EUR", label: "EUR · Euro" },
  { value: "GBP", label: "GBP · British Pound" },
  { value: "CAD", label: "CAD · Canadian Dollar" },
  { value: "AUD", label: "AUD · Australian Dollar" },
];

export function SettingsSection() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [draft, setDraft] = useState<StoreSettings>(defaultSettings);

  useEffect(() => {
    const initial = readSettings();
    setSettings(initial);
    setDraft(initial);
  }, []);

  const dirty = JSON.stringify(settings) !== JSON.stringify(draft);

  function save() {
    writeSettings(draft);
    setSettings(draft);
    toast({ title: "Settings saved", description: "Applied to this store." });
  }

  function reset() {
    setDraft(settings);
  }

  function update<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Store</h2>
            <p className="text-xs text-muted-foreground">
              Identity & contact details
            </p>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <Field label="Store name" htmlFor="store-name">
            <Input
              id="store-name"
              value={draft.storeName}
              onChange={(event) => update("storeName", event.target.value)}
            />
          </Field>
          <Field label="Support email" htmlFor="support-email">
            <Input
              id="support-email"
              type="email"
              value={draft.supportEmail}
              onChange={(event) => update("supportEmail", event.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Commerce</h2>
            <p className="text-xs text-muted-foreground">
              Currency, tax & shipping defaults
            </p>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <Field label="Currency" htmlFor="currency">
            <div className="grid grid-cols-5 gap-1.5">
              {currencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update("currency", option.value)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                    option.value === draft.currency
                      ? "border-ring/60 bg-muted text-foreground"
                      : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted",
                  )}
                  title={option.label}
                >
                  {option.value}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Tax rate (%)" htmlFor="tax-rate">
            <Input
              id="tax-rate"
              type="number"
              step="0.01"
              min={0}
              className="font-mono tabular-nums"
              value={draft.taxRate}
              onChange={(event) => update("taxRate", Number(event.target.value))}
            />
          </Field>
          <Field label="Default shipping" htmlFor="shipping">
            <Input
              id="shipping"
              type="number"
              step="0.01"
              min={0}
              className="font-mono tabular-nums"
              value={draft.defaultShipping}
              onChange={(event) =>
                update("defaultShipping", Number(event.target.value))
              }
            />
          </Field>
          <Field label="Weight unit" htmlFor="weight-unit">
            <div className="grid grid-cols-2 gap-1.5">
              {(["lb", "kg"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update("weightUnit", option)}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                    option === draft.weightUnit
                      ? "border-ring/60 bg-muted text-foreground"
                      : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      <Card className="gap-0 py-0">
        <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Inventory</h2>
            <p className="text-xs text-muted-foreground">
              Threshold for low-stock alerts
            </p>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          <Field label="Low-stock threshold" htmlFor="low-stock">
            <Input
              id="low-stock"
              type="number"
              step="1"
              min={0}
              className="font-mono tabular-nums"
              value={draft.lowStockThreshold}
              onChange={(event) =>
                update("lowStockThreshold", Number(event.target.value))
              }
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <SettingsIcon className="size-3.5" />
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={reset} disabled={!dirty}>
            Discard
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty}>
            <CheckIcon className="size-4" />
            Save changes
          </Button>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
