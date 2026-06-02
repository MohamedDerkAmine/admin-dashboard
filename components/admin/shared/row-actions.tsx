"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [position, setPosition] = useState({ right: 0, top: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setPosition({
      right: window.innerWidth - rect.right,
      top: rect.bottom + 4,
    });
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

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

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  return (
    <div className="relative flex justify-end">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-sm"
        className="size-7 text-muted-foreground hover:text-foreground"
        onClick={() => {
          updatePosition();
          setOpen((current) => !current);
        }}
        aria-expanded={open}
      >
        <MoreHorizontalIcon className="size-4" />
        <span className="sr-only">Open row actions</span>
      </Button>
      {open
        ? createPortal(
            <div
              ref={ref}
              className="fixed z-50 grid min-w-36 rounded-md border border-border/80 bg-[var(--popover)] bg-clip-padding p-1 text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/10"
              style={{ right: position.right, top: position.top }}
            >
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
                    setOpen(false);
                    action.onSelect();
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
