"use client";

import { useEffect, useState } from "react";
import { Rows2Icon, Rows3Icon, Rows4Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Density = "comfortable" | "compact" | "dense";

const ORDER: Density[] = ["comfortable", "compact", "dense"];

function applyDensity(density: Density) {
  if (density === "comfortable") {
    document.documentElement.removeAttribute("data-density");
  } else {
    document.documentElement.setAttribute("data-density", density);
  }
}

export function DensityToggle() {
  const [density, setDensity] = useState<Density>("comfortable");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("density") as Density | null;
    if (stored === "compact" || stored === "dense") {
      setDensity(stored);
    }
    setMounted(true);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(density) + 1) % ORDER.length];
    setDensity(next);
    localStorage.setItem("density", next);
    applyDensity(next);
  }

  const Icon =
    density === "comfortable"
      ? Rows2Icon
      : density === "compact"
        ? Rows3Icon
        : Rows4Icon;
  const label = `Density: ${density}. Click to cycle.`;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="text-muted-foreground hover:text-foreground"
    >
      {mounted ? <Icon className="size-4" /> : <Rows2Icon className="size-4 opacity-0" />}
    </Button>
  );
}
