import { BoxesIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/onboarding-form";
import { isBootstrapped } from "@/lib/auth/service";

export default function OnboardingPage() {
  if (isBootstrapped()) {
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
      <div className="relative grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
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
            Bootstrap the local workspace.
          </h1>
          <p className="mt-4 max-w-lg text-sm text-muted-foreground">
            This setup creates the first tenant, owner account, and optional
            demo catalog in SQLite. Onboarding is disabled after this step.
          </p>
        </section>
        <OnboardingForm />
      </div>
    </main>
  );
}
