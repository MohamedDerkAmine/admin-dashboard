"use client";

import { useState } from "react";
import { BoxesIcon, MenuIcon } from "lucide-react";

import { navItems } from "@/components/admin/shared/constants";
import { sectionPaths } from "@/components/admin/dashboard/routing";
import { NavButton } from "@/components/admin/navigation/nav-button";
import type { Section } from "@/components/admin/shared/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav({
  section,
}: {
  section: Section;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden text-muted-foreground hover:text-foreground"
          />
        }
      >
        <MenuIcon />
        <span className="sr-only">Open navigation</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0">
        <SheetHeader className="flex-row items-center gap-2 border-b border-sidebar-border px-3 py-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <BoxesIcon className="size-4" />
          </div>
          <div>
            <SheetTitle className="text-sm font-semibold leading-tight">
              StoreOps
            </SheetTitle>
            <SheetDescription className="text-[10px] text-sidebar-foreground/50">
              Commerce admin
            </SheetDescription>
          </div>
        </SheetHeader>
        <nav className="grid gap-0.5 p-2">
          {navItems.map((item, index) => (
            <NavButton
              key={item.id}
              active={section === item.id}
              href={sectionPaths[item.id]}
              icon={item.icon}
              label={item.label}
              shortcut={String(index + 1)}
              onClick={() => {
                setOpen(false);
              }}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
