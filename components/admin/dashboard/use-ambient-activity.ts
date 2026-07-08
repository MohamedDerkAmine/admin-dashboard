"use client";

import { useEffect, useRef } from "react";

import { useToast } from "@/components/admin/shared/toast";

const events = [
  { title: "Nora Patel refunded ORD-5107", description: "$173.00 · damage claim" },
  { title: "Marco Diaz updated Ribbed Crew Tee", description: "Price $34 → $32" },
  { title: "Amina Clark approved RMA-2401", description: "Nora Patel · Damaged" },
  {
    title: "System auto-generated report",
    description: "Weekly orders snapshot delivered",
  },
  {
    title: "Marco Diaz flagged review",
    description: "Canvas Tote · rating 1",
    tone: "destructive" as const,
  },
  {
    title: "Amina Clark set 3 products to Active",
    description: "Bulk update via saved view",
  },
  {
    title: "Nora Patel started fulfillment",
    description: "ORD-5109 · picking initiated",
  },
];

export function useAmbientActivity({ enabled = true }: { enabled?: boolean } = {}) {
  const { toast } = useToast();
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // First toast fires after a short warm-up so it registers as ambient, not startup noise
    const initial = window.setTimeout(fire, 12_000);
    const interval = window.setInterval(fire, 28_000);

    function fire() {
      const event = events[indexRef.current % events.length];
      indexRef.current += 1;
      toast({
        title: event.title,
        description: event.description,
        tone: (event as { tone?: "destructive" }).tone,
      });
    }

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
