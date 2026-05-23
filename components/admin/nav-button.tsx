import type { LucideIcon } from "lucide-react";

import { Kbd } from "@/components/admin/kbd";
import { cn } from "@/lib/utils";

export function NavButton({
  active,
  collapsed = false,
  icon: Icon,
  label,
  onClick,
  shortcut,
}: {
  active: boolean;
  collapsed?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        "group/nav relative flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-sidebar-foreground/70 transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active &&
          "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-r-full before:bg-sidebar-primary",
        collapsed && "justify-center",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          active ? "text-sidebar-primary" : "text-sidebar-foreground/60",
        )}
      />
      <span className={cn("flex-1 truncate text-left", collapsed && "sr-only")}>
        {label}
      </span>
      {shortcut && !collapsed ? (
        <Kbd className="opacity-0 transition-opacity group-hover/nav:opacity-100">
          {shortcut}
        </Kbd>
      ) : null}
    </button>
  );
}
