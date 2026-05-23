import { BoxesIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

import { navItems } from "@/components/admin/constants";
import { NavButton } from "@/components/admin/nav-button";
import type { Section } from "@/components/admin/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sections: { label: string; items: typeof navItems }[] = [
  {
    label: "Overview",
    items: navItems.filter((item) => item.id === "dashboard"),
  },
  {
    label: "Catalog",
    items: navItems.filter((item) =>
      ["products", "categories"].includes(item.id),
    ),
  },
  {
    label: "Operations",
    items: navItems.filter((item) =>
      ["orders", "customers"].includes(item.id),
    ),
  },
  {
    label: "Admin",
    items: navItems.filter((item) => item.id === "users"),
  },
];

export function Sidebar({
  collapsed,
  section,
  setCollapsed,
  setSection,
  userEmail,
}: {
  collapsed: boolean;
  section: Section;
  setCollapsed: (collapsed: boolean) => void;
  setSection: (section: Section) => void;
  userEmail?: string;
}) {
  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-150 lg:sticky lg:top-0 lg:flex",
        collapsed ? "w-14" : "w-56",
      )}
    >
      <div
        className={cn(
          "flex h-12 items-center gap-2 border-b border-sidebar-border px-3",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <BoxesIcon className="size-4" />
        </div>
        <div className={cn("min-w-0 flex-1", collapsed && "sr-only")}>
          <p className="truncate text-sm font-semibold leading-tight">StoreOps</p>
          <p className="truncate text-[10px] text-sidebar-foreground/50">
            Commerce admin
          </p>
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto px-2 py-3",
          collapsed && "px-1.5",
        )}
      >
        {sections.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            {!collapsed ? (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            ) : null}
            <div className="grid gap-0.5">
              {group.items.map((item) => {
                const index = navItems.findIndex((nav) => nav.id === item.id);

                return (
                  <NavButton
                    key={item.id}
                    active={section === item.id}
                    collapsed={collapsed}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setSection(item.id)}
                    shortcut={String(index + 1)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "border-t border-sidebar-border p-2",
          collapsed && "px-1.5",
        )}
      >
        {!collapsed && userEmail ? (
          <div className="mb-2 flex items-center gap-2 rounded-md px-2 py-1.5">
            <div className="grid size-6 place-items-center rounded-full bg-sidebar-accent text-[10px] font-semibold uppercase text-sidebar-primary">
              {userEmail.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{userEmail}</p>
              <p className="text-[10px] text-sidebar-foreground/50">Owner</p>
            </div>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="size-4" />
          ) : (
            <PanelLeftCloseIcon className="size-4" />
          )}
          <span className="sr-only">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </Button>
      </div>
    </aside>
  );
}
