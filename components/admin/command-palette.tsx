"use client";

import { useEffect, useMemo, useState } from "react";
import { CornerDownLeftIcon, SearchIcon } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Kbd } from "@/components/admin/kbd";
import { navItems } from "@/components/admin/constants";
import type { Section } from "@/components/admin/types";
import { cn } from "@/lib/utils";

type Action = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  onSelect: () => void;
  shortcut?: string;
};

export function CommandPalette({
  open,
  onOpenChange,
  setSection,
  onSignOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setSection: (section: Section) => void;
  onSignOut: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const actions = useMemo<Action[]>(() => {
    const navActions: Action[] = navItems.map((item, index) => ({
      id: `nav-${item.id}`,
      label: `Go to ${item.label}`,
      hint: index < 9 ? `Press ${index + 1}` : undefined,
      icon: item.icon,
      group: "Navigate",
      onSelect: () => {
        setSection(item.id);
        onOpenChange(false);
      },
      shortcut: index < 9 ? String(index + 1) : undefined,
    }));

    const sessionActions: Action[] = [
      {
        id: "sign-out",
        label: "Sign out",
        icon: navItems[0].icon,
        group: "Session",
        onSelect: () => {
          onOpenChange(false);
          onSignOut();
        },
      },
    ];

    return [...navActions, ...sessionActions];
  }, [setSection, onOpenChange, onSignOut]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return actions;
    }

    return actions.filter((action) =>
      action.label.toLowerCase().includes(term),
    );
  }, [actions, query]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      filtered[active]?.onSelect();
    }
  }

  const groups = useMemo(() => {
    const map = new Map<string, Action[]>();
    filtered.forEach((action) => {
      const items = map.get(action.group) ?? [];
      items.push(action);
      map.set(action.group, items);
    });

    return Array.from(map.entries());
  }, [filtered]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[20vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
          <SearchIcon className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Kbd>esc</Kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {groups.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches for &quot;{query}&quot;.
            </p>
          ) : null}

          {groups.map(([group, items]) => (
            <div key={group} className="py-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              {items.map((action) => {
                const isActive = filtered[active]?.id === action.id;
                const Icon = action.icon;

                return (
                  <button
                    key={action.id}
                    type="button"
                    onMouseEnter={() =>
                      setActive(filtered.findIndex((a) => a.id === action.id))
                    }
                    onClick={action.onSelect}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-accent/15 text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="flex-1">{action.label}</span>
                    {action.shortcut ? <Kbd>{action.shortcut}</Kbd> : null}
                    {isActive ? (
                      <CornerDownLeftIcon className="size-3 text-muted-foreground" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span>navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            <span>select</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>esc</Kbd>
            <span>close</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
