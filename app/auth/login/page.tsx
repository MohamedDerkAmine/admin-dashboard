import { BoxesIcon, CommandIcon, KeyboardIcon, ZapIcon } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Kbd } from "@/components/admin/kbd";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(600px circle at 18% 22%, oklch(0.78 0.13 200 / 12%), transparent 50%), radial-gradient(700px circle at 82% 78%, oklch(0.74 0.16 152 / 8%), transparent 55%)",
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
            Dense operations workspace for{" "}
            <span className="text-primary">modern commerce teams</span>.
          </h1>
          <p className="mt-4 max-w-lg text-sm text-muted-foreground">
            Manage products, orders, customers, and team access from a single
            keyboard-first surface. Sign in with your Supabase credentials.
          </p>
          <ul className="mt-8 grid gap-3 text-sm">
            <Feature icon={CommandIcon} label="Command palette navigation">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </Feature>
            <Feature icon={KeyboardIcon} label="Number-key section jumps">
              <Kbd>1</Kbd>
              <span className="text-muted-foreground">...</span>
              <Kbd>6</Kbd>
            </Feature>
            <Feature icon={ZapIcon} label="Inline edits across every table" />
          </ul>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 text-muted-foreground">
      <span className="flex size-8 items-center justify-center rounded-md border border-border/70 bg-muted/40 text-foreground">
        <Icon className="size-4" />
      </span>
      <span className="flex-1">{label}</span>
      <span className="flex items-center gap-1">{children}</span>
    </li>
  );
}
