"use client";

import { KeyboardIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/admin/kbd";

type Shortcut = { keys: string[]; label: string };
type Group = { name: string; shortcuts: Shortcut[] };

const groups: Group[] = [
  {
    name: "Global",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["?"], label: "Show this cheatsheet" },
      { keys: ["esc"], label: "Close dialog or palette" },
    ],
  },
  {
    name: "Navigate",
    shortcuts: [
      { keys: ["1"], label: "Dashboard" },
      { keys: ["2"], label: "Products" },
      { keys: ["3"], label: "Categories" },
      { keys: ["4"], label: "Discounts" },
      { keys: ["5"], label: "Orders" },
      { keys: ["6"], label: "Customers" },
      { keys: ["7"], label: "Users & Roles" },
      { keys: ["8"], label: "Audit log" },
    ],
  },
  {
    name: "Command palette",
    shortcuts: [
      { keys: ["↑", "↓"], label: "Move selection" },
      { keys: ["↵"], label: "Run selected command" },
    ],
  },
];

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyboardIcon className="size-4 text-muted-foreground" />
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>
            Every shortcut available across the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <div key={group.name}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.name}
              </p>
              <ul className="grid gap-1.5">
                {group.shortcuts.map((shortcut) => (
                  <li
                    key={shortcut.label}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-foreground/90">{shortcut.label}</span>
                    <span className="flex items-center gap-1">
                      {shortcut.keys.map((key, index) => (
                        <Kbd key={`${shortcut.label}-${index}`}>{key}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
