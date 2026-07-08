import {
  BoxesIcon,
  DatabaseIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { isBootstrapped } from "@/lib/auth/service";
import { getOptionalTenantSession } from "@/lib/auth/session";

export default async function SignupPage() {
  if (!isBootstrapped()) {
    redirect("/onboarding");
  }

  const session = await getOptionalTenantSession();
  if (session) {
    redirect("/");
  }

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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px]"
      />

      <div className="relative grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_400px] lg:items-center">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BoxesIcon className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              StoreOps
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Spin up a{" "}
            <span className="text-primary">commerce operations workspace</span>{" "}
            in under a minute.
          </h1>
          <p className="mt-4 max-w-lg text-sm text-muted-foreground">
            Every workspace is isolated end-to-end — products, orders, users,
            and audit trails never cross tenants.
          </p>
          <ul className="mt-8 grid gap-3 text-sm">
            <Feature
              icon={DatabaseIcon}
              label="Row-level tenant isolation"
              hint="Every table filtered by tenant"
            />
            <Feature
              icon={UsersIcon}
              label="Per-workspace roles & invitations"
              hint="Owner, Admin, Manager, Support, Viewer"
            />
            <Feature
              icon={ShieldIcon}
              label="Isolated audit trail per tenant"
              hint="Every mutation logged, only visible to that workspace"
            />
          </ul>
        </section>
        <SignupForm />
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <li className="flex items-start gap-3 text-muted-foreground">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/40 text-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </li>
  );
}
