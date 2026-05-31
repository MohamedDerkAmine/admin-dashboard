"use client";

import { useCallback, useState } from "react";

import type { Section } from "@/components/admin/types";

export function useSectionState() {
  const [section, setSection] = useState<Section>("dashboard");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);

  const switchSection = useCallback((next: Section) => {
    setSection(next);
    setQuery("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setPage(1);
  }, []);

  return {
    section,
    setSection,
    switchSection,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
  };
}
