"use client";

import { useEffect, useRef, useState } from "react";
import { BookmarkPlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "admin-views";

export type SavedView = {
  id: string;
  section: string;
  name: string;
  query: string;
  statusFilter: string;
  categoryFilter?: string;
};

export type ViewFilters = Pick<
  SavedView,
  "query" | "statusFilter" | "categoryFilter"
>;

function readAll(): SavedView[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}

function writeAll(views: SavedView[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {
    // localStorage quota or disabled — silently ignore
  }
}

export function useSavedViews(section: string) {
  const [views, setViews] = useState<SavedView[]>([]);

  useEffect(() => {
    setViews(readAll().filter((view) => view.section === section));
  }, [section]);

  function persist(updatedForSection: SavedView[]) {
    const all = readAll();
    const others = all.filter((view) => view.section !== section);
    writeAll([...others, ...updatedForSection]);
    setViews(updatedForSection);
  }

  function add(name: string, filters: ViewFilters) {
    const view: SavedView = {
      id: `view-${Date.now()}`,
      section,
      name,
      ...filters,
    };
    persist([...views, view]);
  }

  function remove(id: string) {
    persist(views.filter((view) => view.id !== id));
  }

  return { views, add, remove };
}

function viewMatchesFilters(view: SavedView, filters: ViewFilters) {
  return (
    view.query === filters.query &&
    view.statusFilter === filters.statusFilter &&
    (view.categoryFilter ?? "All") === (filters.categoryFilter ?? "All")
  );
}

export function SavedViews({
  views,
  currentFilters,
  onApply,
  onSave,
  onDelete,
}: {
  views: SavedView[];
  currentFilters: ViewFilters;
  onApply: (filters: ViewFilters) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [naming, setNaming] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (naming) {
      inputRef.current?.focus();
    }
  }, [naming]);

  function commit() {
    const name = draft.trim();
    if (name) {
      onSave(name);
    }
    setDraft("");
    setNaming(false);
  }

  const filtersDirty =
    currentFilters.query !== "" ||
    currentFilters.statusFilter !== "All" ||
    (currentFilters.categoryFilter ?? "All") !== "All";

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 px-3 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Views
      </span>
      {views.length === 0 ? (
        <span className="text-xs text-muted-foreground/70">
          No saved views yet.
        </span>
      ) : (
        views.map((view) => {
          const active = viewMatchesFilters(view, currentFilters);

          return (
            <span
              key={view.id}
              className={cn(
                "group inline-flex h-6 items-center gap-1 rounded-full border px-2 text-xs transition-colors",
                active
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-border/70 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  onApply({
                    query: view.query,
                    statusFilter: view.statusFilter,
                    categoryFilter: view.categoryFilter,
                  })
                }
                className="cursor-pointer outline-none"
              >
                {view.name}
              </button>
              <button
                type="button"
                onClick={() => onDelete(view.id)}
                aria-label={`Delete view ${view.name}`}
                className="flex size-3.5 items-center justify-center rounded-full text-muted-foreground opacity-60 transition hover:bg-destructive/15 hover:text-destructive hover:opacity-100"
              >
                <XIcon className="size-2.5" />
              </button>
            </span>
          );
        })
      )}

      {naming ? (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              } else if (event.key === "Escape") {
                setDraft("");
                setNaming(false);
              }
            }}
            placeholder="View name"
            className="h-6 w-32 px-2 text-xs"
          />
          <Button size="icon-sm" variant="ghost" onClick={commit}>
            <BookmarkPlusIcon className="size-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={!filtersDirty}
          onClick={() => setNaming(true)}
          className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
          title={
            filtersDirty
              ? "Save the current filters as a named view"
              : "Apply at least one filter before saving"
          }
        >
          <BookmarkPlusIcon className="size-3" />
          Save view
        </Button>
      )}
    </div>
  );
}
