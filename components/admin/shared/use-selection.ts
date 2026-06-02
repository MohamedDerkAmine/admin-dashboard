"use client";

import { useEffect, useState } from "react";

export function useSelection<T extends { id: string }>(items: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected((prev) => {
      if (prev.size === 0) {
        return prev;
      }
      const visible = new Set(items.map((item) => item.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visible.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [items]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const allVisibleSelected =
        items.length > 0 && items.every((item) => prev.has(item.id));
      const next = new Set(prev);
      if (allVisibleSelected) {
        items.forEach((item) => next.delete(item.id));
      } else {
        items.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }

  function clear() {
    setSelected(new Set());
  }

  const allSelected =
    items.length > 0 && items.every((item) => selected.has(item.id));
  const someSelected =
    items.some((item) => selected.has(item.id)) && !allSelected;

  return {
    selected,
    toggle,
    toggleAll,
    clear,
    allSelected,
    someSelected,
    size: selected.size,
    ids: Array.from(selected),
  };
}
