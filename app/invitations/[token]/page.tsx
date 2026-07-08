import Link from "next/link";
import { redirect } from "next/navigation";
import { BoxesIcon, MailXIcon, UserXIcon } from "lucide-react";

import { AcceptInvitationCard } from "@/components/invitations/accept-invitation-card";
import { SignOutInline } from "@/components/invitations/sign-out-inline";
import { getOptionalTenantSession } from "@/lib/auth/session";
import { getInvitationByToken } from "@/lib/db/invitations";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function InvitationLandingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = getInvitationByToken(token);

  if (!invitation) {
    return (
      <StatusShell
        icon={<MailXIcon className="size-4" />}
        tone="muted"
        eyebrow="Invitation"
        title="This link isn't valid"
        description="It may have expired, been revoked, or already been used. Ask the person who invited you for a new link."
        cta={
          <Link
            href="/auth/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Return to sign in
          </Link>
        }
      />
    );
  }

  const session = await getOptionalTenantSession();

  if (!session) {
    redirect(
      `/auth/login?next=${encodeURIComponent(`/invitations/${token}`)}&email=${encodeURIComponent(invitation.email)}`,
    );
  }

  if (session.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <StatusShell
        icon={<UserXIcon className="size-4" />}
        tone="danger"
        eyebrow="Wrong account"
        title="This invitation is for a different email"
        description={
          <>
            Sent to{" "}
            <span className="font-mono text-foreground">
              {invitation.email}
            </span>
            . You&apos;re signed in as{" "}
            <span className="font-mono text-foreground">
              {session.user.email}
            </span>
            . Sign out and back in with the invited account to accept.
          </>
        }
        cta={<SignOutInline />}
      />
    );
  }

  return (
    <Layout>
      <AcceptInvitationCard
        token={token}
        invitation={{
          email: invitation.email,
          role: invitation.role,
          tenantName: invitation.tenant.name,
          alreadyMember: invitation.alreadyMember,
        }}
      />
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(600px circle at 18% 22%, color-mix(in oklch, var(--primary), transparent 88%), transparent 50%), radial-gradient(700px circle at 82% 78%, color-mix(in oklch, var(--info), transparent 92%), transparent 55%)",
        }}
      />
      <div className="relative flex w-full max-w-md flex-col items-stretch gap-4">
        <div className="inline-flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BoxesIcon className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">StoreOps</span>
        </div>
        {children}
      </div>
    </main>
  );
}

function StatusShell({
  icon,
  tone,
  eyebrow,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  tone: "muted" | "danger";
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  cta: React.ReactNode;
}) {
  const toneClasses =
    tone === "danger"
      ? "bg-destructive/15 text-destructive"
      : "bg-muted text-muted-foreground";

  return (
    <Layout>
      <Card className="gap-0 py-0">
        <div className="border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-md",
                toneClasses,
              )}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="truncate text-base font-semibold leading-tight">
                {title}
              </h1>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 text-sm text-muted-foreground">
          {description}
        </div>
        <div className="border-t border-border/50 px-5 py-3">{cta}</div>
      </Card>
    </Layout>
  );
}
