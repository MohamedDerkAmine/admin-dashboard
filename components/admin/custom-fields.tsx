"use client";

import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "admin-custom-fields";

export type CustomField = {
  id: string;
  resourceType: "product" | "order" | "customer";
  resourceId: string;
  name: string;
  value: string;
};

function readAll(): CustomField[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomField[]) : [];
  } catch {
    return [];
  }
}

function writeAll(fields: CustomField[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  } catch {
    // ignore
  }
}

function useCustomFields(
  resourceType: CustomField["resourceType"],
  resourceId: string,
) {
  const [fields, setFields] = useState<CustomField[]>([]);

  useEffect(() => {
    setFields(
      readAll().filter(
        (field) =>
          field.resourceType === resourceType &&
          field.resourceId === resourceId,
      ),
    );
  }, [resourceType, resourceId]);

  function persist(updated: CustomField[]) {
    const all = readAll();
    const others = all.filter(
      (field) =>
        !(
          field.resourceType === resourceType &&
          field.resourceId === resourceId
        ),
    );
    writeAll([...others, ...updated]);
    setFields(updated);
  }

  function add(name: string, value: string) {
    const field: CustomField = {
      id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      resourceType,
      resourceId,
      name: name.trim(),
      value: value.trim(),
    };
    persist([...fields, field]);
  }

  function update(id: string, patch: Partial<Pick<CustomField, "name" | "value">>) {
    persist(
      fields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
  }

  function remove(id: string) {
    persist(fields.filter((field) => field.id !== id));
  }

  return { fields, add, update, remove };
}

export function CustomFieldsPanel({
  resourceType,
  resourceId,
}: {
  resourceType: CustomField["resourceType"];
  resourceId: string;
}) {
  const { fields, add, update, remove } = useCustomFields(
    resourceType,
    resourceId,
  );
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftValue, setDraftValue] = useState("");

  function submit() {
    if (!draftName.trim()) {
      return;
    }
    add(draftName, draftValue);
    setDraftName("");
    setDraftValue("");
    setAdding(false);
  }

  return (
    <div className="grid gap-3">
      {fields.length === 0 && !adding ? (
        <p className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
          Track arbitrary metadata. Useful for supplier IDs, internal codes,
          launch dates.
        </p>
      ) : null}

      {fields.length > 0 ? (
        <dl className="grid gap-1.5 sm:grid-cols-[160px_1fr_auto]">
          {fields.map((field) => (
            <div
              key={field.id}
              className="group contents text-sm [&>*]:border-b [&>*]:border-border/30 [&>*]:py-1.5"
            >
              <dt>
                <Input
                  value={field.name}
                  onChange={(event) =>
                    update(field.id, { name: event.target.value })
                  }
                  className="h-7 border-none bg-transparent px-1 text-xs font-medium text-muted-foreground shadow-none focus-visible:bg-muted/30"
                />
              </dt>
              <dd>
                <Input
                  value={field.value}
                  onChange={(event) =>
                    update(field.id, { value: event.target.value })
                  }
                  className="h-7 border-none bg-transparent px-1 shadow-none focus-visible:bg-muted/30"
                />
              </dd>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => remove(field.id)}
                  aria-label={`Remove field ${field.name}`}
                  className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <TrashIcon className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </dl>
      ) : null}

      {adding ? (
        <div className="grid gap-2 rounded-md border border-border/60 bg-muted/20 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">
                Field name
              </Label>
              <Input
                autoFocus
                placeholder="e.g. supplier_id"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">Value</Label>
              <Input
                placeholder="any text"
                value={draftValue}
                onChange={(event) => setDraftValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submit();
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setDraftName("");
                setDraftValue("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={submit}
              disabled={draftName.trim().length === 0}
            >
              Add field
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
          Add field
        </Button>
      )}
    </div>
  );
}
