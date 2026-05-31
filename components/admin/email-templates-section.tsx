"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EyeIcon, MailIcon, RotateCcwIcon, SaveIcon } from "lucide-react";

import {
  initialEmailTemplates,
  type Customer,
  type EmailTemplate,
  type EmailTemplateKey,
  type Order,
  type Product,
} from "@/lib/admin-data";
import { useToast } from "@/components/admin/toast";
import { formatCurrency } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "admin-email-templates";

function readOverrides(): Partial<Record<EmailTemplateKey, EmailTemplate>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(
  overrides: Partial<Record<EmailTemplateKey, EmailTemplate>>,
) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

const mergeTags = [
  "customer.name",
  "customer.email",
  "order.id",
  "order.items",
  "order.total",
  "product.name",
  "product.sku",
  "product.stock",
  "store.name",
];

function resolveTags(
  text: string,
  context: {
    customer?: Customer;
    order?: Order;
    product?: Product;
    storeName: string;
  },
) {
  const { customer, order, product, storeName } = context;
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    switch (key) {
      case "customer.name":
        return customer?.name ?? "Friend";
      case "customer.email":
        return customer?.email ?? "customer@example.com";
      case "order.id":
        return order?.id ?? "ORD-0000";
      case "order.items":
        return String(order?.items ?? 0);
      case "order.total":
        return order ? formatCurrency(order.total) : "$0";
      case "product.name":
        return product?.name ?? "Product";
      case "product.sku":
        return product?.sku ?? "SKU-0000";
      case "product.stock":
        return String(product?.stock ?? 0);
      case "store.name":
        return storeName;
      default:
        return `{{${key}}}`;
    }
  });
}

export function EmailTemplatesSection({
  customers,
  orders,
  products,
  storeName,
}: {
  customers: Customer[];
  orders: Order[];
  products: Product[];
  storeName: string;
}) {
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<
    Partial<Record<EmailTemplateKey, EmailTemplate>>
  >({});
  const [selectedKey, setSelectedKey] =
    useState<EmailTemplateKey>("order_confirmation");
  const [draft, setDraft] = useState<EmailTemplate | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setOverrides(readOverrides());
  }, []);

  const templates = useMemo(
    () =>
      initialEmailTemplates.map(
        (template) => overrides[template.key] ?? template,
      ),
    [overrides],
  );

  const current = templates.find((template) => template.key === selectedKey);
  const isDirty =
    !!draft &&
    !!current &&
    (draft.subject !== current.subject || draft.body !== current.body);

  useEffect(() => {
    if (current) {
      setDraft(current);
    }
  }, [selectedKey, overrides]);

  function save() {
    if (!draft) return;
    const next = { ...overrides, [draft.key]: draft };
    writeOverrides(next);
    setOverrides(next);
    toast({ title: `${draft.name} saved` });
  }

  function reset() {
    const builtin = initialEmailTemplates.find(
      (template) => template.key === selectedKey,
    );
    if (!builtin) return;
    const next = { ...overrides };
    delete next[selectedKey];
    writeOverrides(next);
    setOverrides(next);
    setDraft(builtin);
    toast({ title: `${builtin.name} reset to default` });
  }

  function insertTag(tag: string) {
    if (!draft) return;
    const textarea = bodyRef.current;
    const snippet = `{{${tag}}}`;
    if (!textarea) {
      setDraft({ ...draft, body: draft.body + snippet });
      return;
    }
    const start = textarea.selectionStart ?? draft.body.length;
    const end = textarea.selectionEnd ?? draft.body.length;
    const next = draft.body.slice(0, start) + snippet + draft.body.slice(end);
    setDraft({ ...draft, body: next });
    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  }

  const context = {
    customer: customers[0],
    order: orders[0],
    product: products[0],
    storeName,
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
      <Card className="gap-0 py-0">
        <div className="border-b border-border/50 px-3 py-2.5">
          <p className="text-sm font-semibold">Templates</p>
          <p className="text-xs text-muted-foreground">
            {initialEmailTemplates.length} transactional emails
          </p>
        </div>
        <ol>
          {templates.map((template) => {
            const overridden = !!overrides[template.key];
            return (
              <li key={template.key}>
                <button
                  type="button"
                  onClick={() => setSelectedKey(template.key)}
                  className={cn(
                    "block w-full border-b border-border/30 px-3 py-2.5 text-left transition-colors hover:bg-muted last:border-b-0",
                    selectedKey === template.key && "bg-muted",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MailIcon className="size-3.5 text-muted-foreground" />
                    <p className="truncate text-sm font-medium">
                      {template.name}
                    </p>
                    {overridden ? (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        edited
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {template.description}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      {draft && current ? (
        <div className="grid gap-3">
          <Card className="gap-0 py-0">
            <div className="flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{current.name}</p>
                <p className="text-xs text-muted-foreground">
                  {current.audience} · {current.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={reset}
                  disabled={!overrides[current.key] && !isDirty}
                >
                  <RotateCcwIcon className="size-4" />
                  Reset
                </Button>
                <Button size="sm" onClick={save} disabled={!isDirty}>
                  <SaveIcon className="size-4" />
                  Save
                </Button>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={draft.subject}
                  onChange={(event) =>
                    setDraft({ ...draft, subject: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email-body">Body</Label>
                <textarea
                  id="email-body"
                  ref={bodyRef}
                  value={draft.body}
                  onChange={(event) =>
                    setDraft({ ...draft, body: event.target.value })
                  }
                  rows={10}
                  className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Merge tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {mergeTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {`{{${tag}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="gap-0 py-0">
            <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
              <EyeIcon className="size-3.5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Preview</p>
                <p className="text-[11px] text-muted-foreground">
                  Resolved with sample data
                </p>
              </div>
            </div>
            <div className="grid gap-2 p-4 text-sm">
              <div className="flex items-baseline gap-2 border-b border-border/40 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Subject
                </span>
                <span className="font-medium">
                  {resolveTags(draft.subject, context)}
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {resolveTags(draft.body, context)}
              </pre>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
