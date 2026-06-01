"use client";

import { useState } from "react";
import { CreditCardIcon, MailIcon } from "lucide-react";

import type { Order } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";

type DemoStatus =
  | {
      tone: "danger" | "success" | "warning";
      message: string;
    }
  | undefined;

export function IntegrationsDemo({ order }: { order?: Order }) {
  const [status, setStatus] = useState<DemoStatus>();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const demoOrder = order ?? {
    customer: "Demo Customer",
    email: "customer@example.com",
    id: "DEMO-1001",
    total: 129,
  };

  async function startCheckout() {
    setIsCheckingOut(true);
    setStatus(undefined);

    const response = await fetch("/api/stripe/checkout", {
      body: JSON.stringify({
        amount: demoOrder.total,
        customerEmail: demoOrder.email,
        orderId: demoOrder.id,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setStatus({
        tone: "danger",
        message: "Unable to reach the Stripe checkout route.",
      });
      setIsCheckingOut(false);
      return;
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || typeof payload.url !== "string") {
      setStatus({
        tone: "warning",
        message:
          typeof payload.message === "string"
            ? payload.message
            : "Stripe checkout could not be started.",
      });
      setIsCheckingOut(false);
      return;
    }

    window.location.href = payload.url;
  }

  async function sendDemoEmail() {
    setIsSendingEmail(true);
    setStatus(undefined);

    const response = await fetch("/api/email/demo", {
      body: JSON.stringify({
        amount: new Intl.NumberFormat("en-US", {
          currency: "USD",
          style: "currency",
        }).format(demoOrder.total),
        customerEmail: demoOrder.email,
        orderId: demoOrder.id,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setStatus({
        tone: "danger",
        message: "Unable to reach the Mailgun demo route.",
      });
      setIsSendingEmail(false);
      return;
    }

    const payload = await response.json().catch(() => ({}));
    setStatus({
      tone: response.ok && payload.mode === "sent" ? "success" : "warning",
      message:
        typeof payload.message === "string"
          ? payload.message
          : "Demo email request completed.",
    });
    setIsSendingEmail(false);
  }

  return (
    <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">
            Payments and email demo
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sample order {demoOrder.id} uses Stripe Checkout and a React Email
            receipt with optional Mailgun delivery.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={isCheckingOut}
            onClick={startCheckout}
          >
            <CreditCardIcon className="size-4" />
            {isCheckingOut ? "Opening..." : "Checkout"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isSendingEmail}
            onClick={sendDemoEmail}
          >
            <MailIcon className="size-4" />
            {isSendingEmail ? "Sending..." : "Email"}
          </Button>
        </div>
      </div>
      {status ? (
        <p className={statusClassName[status.tone]}>{status.message}</p>
      ) : null}
    </div>
  );
}

const statusClassName: Record<NonNullable<DemoStatus>["tone"], string> = {
  danger: "mt-2 text-xs text-destructive",
  success: "mt-2 text-xs text-[var(--success)]",
  warning: "mt-2 text-xs text-[var(--warning)]",
};
