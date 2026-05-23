"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import { Kbd } from "@/components/admin/kbd";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Toolbar({
  query,
  setQuery,
  placeholder = "Search...",
  children,
}: {
  query: string;
  setQuery: (query: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border/50 px-3 py-2 md:flex-row md:items-center">
      <div className="relative min-w-0 flex-1 md:max-w-xs">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-8 pl-8 pr-12"
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60">
          /
        </Kbd>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

type Option = string | { label: string; value: string };

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<Option>;
  onChange: (value: string) => void;
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

  const normalized = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const current = normalized.find((option) => option.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md border border-border/70 bg-muted/40 px-2.5 text-xs transition-colors hover:bg-muted",
          open && "border-ring/60 bg-muted",
        )}
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {current?.label ?? value}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-40 mt-1 grid min-w-40 rounded-md border border-border/70 bg-popover p-1 text-popover-foreground shadow-xl ring-1 ring-foreground/10">
          {normalized.map((option) => {
            const isActive = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted",
                  isActive && "text-foreground",
                  !isActive && "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="flex size-3.5 shrink-0 items-center justify-center text-primary">
                  {isActive ? <CheckIcon className="size-3" /> : null}
                </span>
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
