"use client";

import { ChevronRightIcon, LogOutIcon, SearchIcon } from "lucide-react";

import type {
  Order,
  Product,
  ReturnRequest,
} from "@/lib/admin-data";
import { DensityToggle } from "@/components/admin/navigation/density-toggle";
import { EnvPill } from "@/components/admin/navigation/env-pill";
import { Kbd } from "@/components/admin/shared/kbd";
import { MobileNav } from "@/components/admin/navigation/mobile-nav";
import { PresenceStack } from "@/components/admin/navigation/presence-stack";
import {
  NotificationsButton,
  buildNotifications,
} from "@/components/admin/navigation/notifications";
import { ThemeToggle } from "@/components/admin/navigation/theme-toggle";
import type { Section } from "@/components/admin/shared/types";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  section,
  sectionLabel,
  switchSection,
  products,
  orders,
  returns,
  setPaletteOpen,
  signOut,
}: {
  section: Section;
  sectionLabel?: string;
  switchSection: (section: Section) => void;
  products: Product[];
  orders: Order[];
  returns: ReturnRequest[];
  setPaletteOpen: (open: boolean) => void;
  signOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md md:px-4">
      <MobileNav section={section} />

      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">StoreOps</span>
        <ChevronRightIcon className="size-3 text-muted-foreground/60" />
        <span className="truncate font-medium">{sectionLabel}</span>
      </div>

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="hidden h-8 items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex md:w-72"
      >
        <SearchIcon className="size-3.5" />
        <span className="flex-1 text-left">Search or jump to...</span>
        <Kbd>⌘K</Kbd>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={() => setPaletteOpen(true)}
      >
        <SearchIcon className="size-4" />
        <span className="sr-only">Open search</span>
      </Button>

      <div className="h-5 w-px bg-border" aria-hidden />

      <EnvPill />
      <PresenceStack />

      <div className="h-5 w-px bg-border" aria-hidden />

      <NotificationsButton
        notifications={buildNotifications({
          products,
          orders,
          returns,
        })}
        onItemSelect={(notification) => {
          if (notification.kind === "low_stock") {
            switchSection("products");
          } else if (notification.kind === "pending_order") {
            switchSection("orders");
          } else if (notification.kind === "return_request") {
            switchSection("returns");
          }
        }}
      />
      <DensityToggle />
      <ThemeToggle />

      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOutIcon className="size-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </header>
  );
}
