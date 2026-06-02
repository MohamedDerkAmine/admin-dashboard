"use client";

import { useEffect } from "react";

import { navItems } from "@/components/admin/shared/constants";
import type { Section } from "@/components/admin/shared/types";

export function useGlobalHotkeys({
  paletteOpen,
  setPaletteOpen,
  setShortcutsOpen,
  switchSection,
}: {
  paletteOpen: boolean;
  setPaletteOpen: (updater: (current: boolean) => boolean) => void;
  setShortcutsOpen: (updater: (current: boolean) => boolean) => void;
  switchSection: (section: Section) => void;
}) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
        return;
      }

      if (!isTyping && !paletteOpen) {
        if (event.key === "?" || (event.shiftKey && event.key === "/")) {
          event.preventDefault();
          setShortcutsOpen((current) => !current);
          return;
        }

        const numberKey = Number(event.key);

        if (
          Number.isInteger(numberKey) &&
          numberKey >= 1 &&
          numberKey <= navItems.length
        ) {
          event.preventDefault();
          switchSection(navItems[numberKey - 1].id);
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [paletteOpen]);
}
