"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastTone = "default" | "destructive";

export type ToastOptions = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  tone?: ToastTone;
  durationMs?: number;
};

type Toast = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const entry: Toast = { id, ...options };
      setToasts((current) => [...current.slice(-4), entry]);
      const duration = options.durationMs ?? DEFAULT_DURATION_MS;
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach(clearTimeout);
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-3 right-3 z-50 flex w-80 max-w-[calc(100vw-1.5rem)] flex-col gap-2"
      >
        {toasts.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-popover px-3 py-2.5 text-popover-foreground shadow-lg ring-1 ring-foreground/5 animate-in slide-in-from-bottom-2 fade-in duration-200",
              entry.tone === "destructive"
                ? "border-destructive/30"
                : "border-border/80",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{entry.title}</p>
              {entry.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {entry.description}
                </p>
              ) : null}
            </div>
            {entry.action ? (
              <button
                type="button"
                onClick={() => {
                  entry.action?.onClick();
                  dismiss(entry.id);
                }}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              >
                {entry.action.label}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismiss(entry.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}
