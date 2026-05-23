"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RowActions({
  actions,
}: {
  actions: Array<{
    label: string;
    onSelect: () => void;
    tone?: "default" | "danger";
  }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-end">
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <MoreHorizontalIcon className="size-4" />
        <span className="sr-only">Open row actions</span>
      </Button>
      {open ? (
        <div className="absolute right-0 top-8 z-30 grid min-w-36 rounded-md border border-border/70 bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/5">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={cn(
                "rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted",
                action.tone === "danger" &&
                  "text-destructive hover:bg-destructive/10",
              )}
              onClick={() => {
                action.onSelect();
                setOpen(false);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
