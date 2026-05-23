import { cn } from "@/lib/utils";

import type { StatusLike } from "@/components/admin/types";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneStyles: Record<Tone, { dot: string; text: string }> = {
  success: { dot: "bg-[var(--success)] shadow-[0_0_0_3px_oklch(0.74_0.16_152/15%)]", text: "text-foreground" },
  warning: { dot: "bg-[var(--warning)] shadow-[0_0_0_3px_oklch(0.82_0.15_80/15%)]", text: "text-foreground" },
  danger: { dot: "bg-destructive shadow-[0_0_0_3px_oklch(0.7_0.21_22/15%)]", text: "text-foreground" },
  info: { dot: "bg-[var(--info)] shadow-[0_0_0_3px_oklch(0.78_0.13_230/15%)]", text: "text-foreground" },
  neutral: { dot: "bg-muted-foreground/70", text: "text-muted-foreground" },
};

export function toneFor(status: StatusLike | string): Tone {
  switch (status) {
    case "Active":
    case "Delivered":
    case "VIP":
      return "success";
    case "Processing":
    case "Shipped":
    case "Returning":
    case "Scheduled":
      return "info";
    case "Pending":
    case "Draft":
    case "Invited":
    case "New":
      return "warning";
    case "Refunded":
    case "Archived":
    case "Suspended":
    case "Expired":
      return "danger";
    default:
      return "neutral";
  }
}

export function StatusDot({
  status,
  className,
  showLabel = true,
}: {
  status: StatusLike | string;
  className?: string;
  showLabel?: boolean;
}) {
  const tone = toneFor(status);
  const styles = toneStyles[tone];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("size-2 rounded-full", styles.dot)} aria-hidden />
      {showLabel ? (
        <span className={cn("text-sm", styles.text)}>{status}</span>
      ) : null}
    </span>
  );
}
