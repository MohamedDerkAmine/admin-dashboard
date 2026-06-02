"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import {
  type AdminSearchState,
  buildSectionHref,
  sectionPaths,
} from "@/components/admin/dashboard/routing";
import type { Section } from "@/components/admin/shared/types";

export function useSectionState({
  section,
  searchState,
}: {
  section: Section;
  searchState: AdminSearchState;
}) {
  const router = useRouter();
  const [query, setQueryState] = useState(searchState.query);
  const [statusFilter, setStatusFilterState] = useState(
    searchState.statusFilter,
  );
  const [categoryFilter, setCategoryFilterState] = useState(
    searchState.categoryFilter,
  );
  const [ratingFilter, setRatingFilterState] = useState(
    searchState.ratingFilter,
  );
  const [page, setPageState] = useState(searchState.page);

  const replaceSearch = useCallback(
    (next: Partial<AdminSearchState>) => {
      const merged = {
        query,
        statusFilter,
        categoryFilter,
        ratingFilter,
        page,
        ...next,
      };
      router.replace(buildSectionHref(section, merged), { scroll: false });
    },
    [
      categoryFilter,
      page,
      query,
      ratingFilter,
      router,
      section,
      statusFilter,
    ],
  );

  const switchSection = useCallback((next: Section) => {
    router.push(sectionPaths[next]);
  }, [router]);

  const setQuery = useCallback(
    (next: string) => {
      setQueryState(next);
      setPageState(1);
      replaceSearch({ query: next, page: 1 });
    },
    [replaceSearch],
  );

  const setStatusFilter = useCallback(
    (next: string) => {
      setStatusFilterState(next);
      setPageState(1);
      replaceSearch({ statusFilter: next, page: 1 });
    },
    [replaceSearch],
  );

  const setCategoryFilter = useCallback(
    (next: string) => {
      setCategoryFilterState(next);
      setPageState(1);
      replaceSearch({ categoryFilter: next, page: 1 });
    },
    [replaceSearch],
  );

  const setPage = useCallback(
    (next: number) => {
      setPageState(next);
      replaceSearch({ page: next });
    },
    [replaceSearch],
  );

  const setRatingFilter = useCallback(
    (next: string) => {
      setRatingFilterState(next);
      setPageState(1);
      replaceSearch({ ratingFilter: next, page: 1 });
    },
    [replaceSearch],
  );

  return {
    section,
    switchSection,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    ratingFilter,
    setRatingFilter,
    page,
    setPage,
  };
}
