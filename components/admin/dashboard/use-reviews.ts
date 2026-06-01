"use client";

import { useState } from "react";

import { initialReviews, type Review } from "@/lib/admin-data";
import { useToast } from "@/components/admin/shared/toast";

export function useReviews({
  initialQuery = "",
  initialStatusFilter = "All",
  initialRatingFilter = "All",
  setUrlQuery,
  setUrlStatusFilter,
  setUrlRatingFilter,
}: {
  initialQuery?: string;
  initialStatusFilter?: string;
  initialRatingFilter?: string;
  setUrlQuery?: (query: string) => void;
  setUrlStatusFilter?: (status: string) => void;
  setUrlRatingFilter?: (rating: string) => void;
} = {}) {
  const { toast } = useToast();
  const [list, setList] = useState<Review[]>(initialReviews);
  const [query, setQueryState] = useState(initialQuery);
  const [statusFilter, setStatusFilterState] = useState(initialStatusFilter);
  const [ratingFilter, setRatingFilterState] = useState(initialRatingFilter);

  function setQuery(query: string) {
    setQueryState(query);
    setUrlQuery?.(query);
  }

  function setStatusFilter(status: string) {
    setStatusFilterState(status);
    setUrlStatusFilter?.(status);
  }

  function setRatingFilter(rating: string) {
    setRatingFilterState(rating);
    setUrlRatingFilter?.(rating);
  }

  function setStatus(id: string, status: Review["status"]) {
    const target = list.find((entry) => entry.id === id);
    if (!target) return;
    setList((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, status } : entry,
      ),
    );
    toast({
      title: `${target.id} → ${status}`,
      description: target.title,
      tone: status === "Rejected" ? "destructive" : undefined,
    });
  }

  return {
    list,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    ratingFilter,
    setRatingFilter,
    setStatus,
  };
}
