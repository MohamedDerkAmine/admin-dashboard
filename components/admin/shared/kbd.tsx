import { cn } from "@/lib/utils";

export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border/80 bg-muted/60 px-1 font-mono text-[10px] font-medium text-muted-foreground shadow-[inset_0_-1px_0_oklch(1_0_0/4%)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
