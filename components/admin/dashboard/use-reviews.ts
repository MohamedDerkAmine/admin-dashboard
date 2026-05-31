"use client";

import { useState } from "react";

import { initialReviews, type Review } from "@/lib/admin-data";
import { useToast } from "@/components/admin/toast";

export function useReviews() {
  const { toast } = useToast();
  const [list, setList] = useState<Review[]>(initialReviews);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");

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
