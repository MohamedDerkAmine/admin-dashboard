"use client";

import { useEffect, useState } from "react";
import { MessageSquarePlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "admin-notes";

export type Note = {
  id: string;
  resourceType: "product" | "order" | "customer";
  resourceId: string;
  author: string;
  body: string;
  createdAt: string;
};

function readAll(): Note[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

function writeAll(notes: Note[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

export function useNotes(
  resourceType: Note["resourceType"],
  resourceId: string,
) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setNotes(
      readAll().filter(
        (note) =>
          note.resourceType === resourceType && note.resourceId === resourceId,
      ),
    );
  }, [resourceType, resourceId]);

  function persist(updatedForResource: Note[]) {
    const all = readAll();
    const others = all.filter(
      (note) =>
        !(note.resourceType === resourceType && note.resourceId === resourceId),
    );
    writeAll([...others, ...updatedForResource]);
    setNotes(updatedForResource);
  }

  function add(body: string, author: string) {
    const note: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      resourceType,
      resourceId,
      author,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    persist([note, ...notes]);
  }

  function remove(id: string) {
    persist(notes.filter((note) => note.id !== id));
  }

  return { notes, add, remove };
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotesPanel({
  resourceType,
  resourceId,
  author,
}: {
  resourceType: Note["resourceType"];
  resourceId: string;
  author: string;
}) {
  const { notes, add, remove } = useNotes(resourceType, resourceId);
  const [draft, setDraft] = useState("");

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    add(trimmed, author);
    setDraft("");
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (
              (event.metaKey || event.ctrlKey) &&
              event.key === "Enter"
            ) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Add an internal note. Markdown is allowed."
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>⌘ + ↵ to save</span>
          <Button size="sm" onClick={submit} disabled={draft.trim().length === 0}>
            <MessageSquarePlusIcon className="size-4" />
            Add note
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
          No notes yet. Use this space for internal context that should not be
          shown to customers.
        </p>
      ) : (
        <ol className="grid gap-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group rounded-md border border-border/60 bg-muted/30 px-3 py-2"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">
                  {note.author}
                </span>
                <span className="text-muted-foreground">
                  {formatRelativeTime(note.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(note.id)}
                  className="ml-auto rounded px-1.5 py-0.5 text-[11px] text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-snug text-foreground/90">
                {note.body}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
