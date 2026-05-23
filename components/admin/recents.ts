"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "admin-recents";
const MAX_ITEMS = 6;

export type RecentItem = {
  type: "product" | "order" | "category";
  id: string;
  label: string;
};

function read(): RecentItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: RecentItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota / disabled
  }
}

export function useRecents() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  function push(item: RecentItem) {
    setItems((current) => {
      const next = [
        item,
        ...current.filter(
          (entry) => !(entry.type === item.type && entry.id === item.id),
        ),
      ].slice(0, MAX_ITEMS);
      write(next);
      return next;
    });
  }

  function remove(type: RecentItem["type"], id: string) {
    setItems((current) => {
      const next = current.filter(
        (entry) => !(entry.type === type && entry.id === id),
      );
      write(next);
      return next;
    });
  }

  return { items, push, remove };
}
