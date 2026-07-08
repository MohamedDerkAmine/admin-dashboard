"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CheckIcon,
  MailIcon,
  TriangleAlertIcon,
} from "lucide-react";

import type { AdminRole } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AcceptInvitationCard({
  token,
  invitation,
}: {
  token: string;
  invitation: {
    email: string;
    role: AdminRole;
    tenantName: string;
    alreadyMember: boolean;
  };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function accept() {
    setStatus("pending");
    setErrorMessage(null);
    try {
      const response = await fetch(
        `/api/invitations/accept/${encodeURIComponent(token)}`,
        { method: "POST" },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          typeof body?.message === "string"
            ? body.message
            : "Unable to accept invitation.",
        );
        return;
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Network error.",
      );
    }
  }

  return (
    <Card className="w-full max-w-md gap-0 py-0">
      <div className="border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
            <MailIcon className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace invitation
            </p>
            <h1 className="truncate text-base font-semibold leading-tight">
              Join {invitation.tenantName}
            </h1>
          </div>
        </div>
      </div>

      <dl className="grid gap-2.5 px-5 py-4 text-sm">
        <Field label="Workspace" value={invitation.tenantName} />
        <Field label="Role" value={invitation.role} />
        <Field label="Email" value={invitation.email} mono />
        {invitation.alreadyMember ? (
          <p className="mt-1 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            You&apos;re already a member — accepting will update your role to{" "}
            <span className="font-medium text-foreground">
              {invitation.role}
            </span>
            .
          </p>
        ) : null}
      </dl>

      {errorMessage ? (
        <div className="mx-5 mb-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="border-t border-border/50 px-5 py-3">
        <Button
          className="w-full justify-center"
          onClick={accept}
          disabled={status === "pending"}
        >
          {status === "pending" ? (
            <>
              <CheckIcon className="size-4 animate-pulse" />
              Joining {invitation.tenantName}...
            </>
          ) : (
            <>
              Accept and continue
              <ArrowRightIcon className="size-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`min-w-0 truncate text-right text-sm font-medium ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
