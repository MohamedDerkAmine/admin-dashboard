"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, ServerIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Env = "prod" | "staging" | "dev";

const envMeta: Record<Env, { label: string; tone: string; hint: string }> = {
  prod: {
    label: "prod",
    tone: "text-[var(--success)] border-[var(--success)]/40 bg-[color-mix(in_oklch,var(--success),transparent_92%)]",
    hint: "Live production data",
  },
  staging: {
    label: "staging",
    tone: "text-[var(--warning)] border-[var(--warning)]/40 bg-[color-mix(in_oklch,var(--warning),transparent_92%)]",
    hint: "Pre-release testing",
  },
  dev: {
    label: "dev",
    tone: "text-[var(--info)] border-[var(--info)]/40 bg-[color-mix(in_oklch,var(--info),transparent_92%)]",
    hint: "Sandbox / seed data",
  },
};

export function EnvPill() {
  const [env, setEnv] = useState<Env>("prod");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = envMeta[env];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors hover:brightness-95",
          active.tone,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ServerIcon className="size-3" />
        {active.label}
        <ChevronDownIcon
          className={cn("size-3 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute right-0 top-full z-40 mt-1 w-52 overflow-hidden rounded-md border border-border/70 bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/10"
        >
          {(["prod", "staging", "dev"] as const).map((option) => {
            const meta = envMeta[option];
            const isActive = env === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setEnv(option);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2 px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                  isActive && "bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 inline-block size-2 shrink-0 rounded-full",
                    option === "prod" && "bg-[var(--success)]",
                    option === "staging" && "bg-[var(--warning)]",
                    option === "dev" && "bg-[var(--info)]",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-xs font-semibold uppercase tracking-wider">
                    {meta.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {meta.hint}
                  </span>
                </span>
                {isActive ? (
                  <CheckIcon className="size-3.5 text-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
