"use client";

import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";

import { formatCurrency } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "admin-variants";

export type Variant = {
  id: string;
  productId: string;
  label: string;
  sku: string;
  price: number;
  stock: number;
};

function readAll(): Variant[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Variant[]) : [];
  } catch {
    return [];
  }
}

function writeAll(variants: Variant[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(variants));
  } catch {
    // ignore
  }
}

function useVariants(productId: string) {
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    setVariants(readAll().filter((v) => v.productId === productId));
  }, [productId]);

  function persist(updated: Variant[]) {
    const all = readAll();
    const others = all.filter((v) => v.productId !== productId);
    writeAll([...others, ...updated]);
    setVariants(updated);
  }

  function add(input: Omit<Variant, "id" | "productId">) {
    const variant: Variant = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId,
      ...input,
    };
    persist([...variants, variant]);
  }

  function remove(id: string) {
    persist(variants.filter((v) => v.id !== id));
  }

  return { variants, add, remove };
}

export function VariantsPanel({
  productId,
  fallbackSku,
  fallbackPrice,
}: {
  productId: string;
  fallbackSku: string;
  fallbackPrice: number;
}) {
  const { variants, add, remove } = useVariants(productId);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    label: "",
    sku: "",
    price: fallbackPrice,
    stock: 0,
  });

  function submit() {
    const label = draft.label.trim();
    const sku = draft.sku.trim() || `${fallbackSku}-${variants.length + 1}`;
    if (!label) {
      return;
    }
    add({ label, sku, price: draft.price, stock: draft.stock });
    setDraft({ label: "", sku: "", price: fallbackPrice, stock: 0 });
    setAdding(false);
  }

  return (
    <div className="grid gap-3">
      {variants.length === 0 && !adding ? (
        <p className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
          No variants. Add sizes, colors, or material options to track stock per
          variation.
        </p>
      ) : null}

      {variants.length > 0 ? (
        <ol className="grid gap-1.5">
          {variants.map((variant) => (
            <li
              key={variant.id}
              className="group flex items-center gap-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{variant.label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {variant.sku}
                </p>
              </div>
              <span className="font-mono text-sm tabular-nums">
                {formatCurrency(variant.price)}
              </span>
              <span className="w-14 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {variant.stock} in stock
              </span>
              <button
                type="button"
                onClick={() => remove(variant.id)}
                aria-label={`Delete variant ${variant.label}`}
                className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <TrashIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      {adding ? (
        <div className="grid gap-2 rounded-md border border-border/60 bg-muted/20 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-xs text-muted-foreground">
              Label
              <Input
                autoFocus
                placeholder="e.g. Size: M / Color: Blue"
                value={draft.label}
                onChange={(event) =>
                  setDraft({ ...draft, label: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              SKU
              <Input
                placeholder={`${fallbackSku}-${variants.length + 1}`}
                className="font-mono text-xs"
                value={draft.sku}
                onChange={(event) =>
                  setDraft({ ...draft, sku: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              Price
              <Input
                type="number"
                min={0}
                className="font-mono tabular-nums"
                value={draft.price}
                onChange={(event) =>
                  setDraft({ ...draft, price: Number(event.target.value) })
                }
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              Stock
              <Input
                type="number"
                min={0}
                className="font-mono tabular-nums"
                value={draft.stock}
                onChange={(event) =>
                  setDraft({ ...draft, stock: Number(event.target.value) })
                }
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={submit}
              disabled={draft.label.trim().length === 0}
            >
              Add variant
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdding(true)}
          className="justify-center"
        >
          <PlusIcon className="size-4" />
          Add variant
        </Button>
      )}
    </div>
  );
}
