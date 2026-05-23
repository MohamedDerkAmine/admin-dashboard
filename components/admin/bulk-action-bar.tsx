"use client";

import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SelectionCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      aria-label={label}
      ref={(node) => {
        if (node) {
          node.indeterminate = Boolean(indeterminate);
        }
      }}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      className="size-3.5 cursor-pointer rounded-[3px] border border-input bg-transparent accent-primary"
    />
  );
}

export function BulkActionBar({
  count,
  onClear,
  children,
  className,
}: {
  count: number;
  onClear: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-primary/20 bg-primary/8 px-3 py-1.5 text-xs animate-in fade-in slide-in-from-top-1 duration-150",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear selection"
        className="flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <XIcon className="size-3" />
      </button>
      <span className="font-medium text-foreground">
        {count} selected
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-1">{children}</div>
    </div>
  );
}
