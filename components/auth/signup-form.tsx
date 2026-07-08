"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workspace"
  );
}

export function SignupForm() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seedDemoData, setSeedDemoData] = useState(true);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const slugPreview = slugify(workspaceName);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage("");

    const response = await fetch("/api/signup", {
      body: JSON.stringify({
        workspaceName,
        ownerName,
        email,
        password,
        seedDemoData,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the signup server. Please try again.");
      setIsPending(false);
      return;
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(
        typeof result.message === "string"
          ? result.message
          : "Unable to create workspace. Please try again.",
      );
      setIsPending(false);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <Card className="w-full gap-0 py-0">
      <div className="border-b border-border/50 px-5 py-4">
        <h2 className="text-base font-semibold">Create your workspace</h2>
        <p className="text-xs text-muted-foreground">
          You&apos;ll be the Owner. Invite the rest of your team from Users &
          Roles.
        </p>
      </div>
      <form className="grid gap-3 p-5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <Label htmlFor="workspace" className="text-xs text-muted-foreground">
            Workspace name
          </Label>
          <Input
            id="workspace"
            name="workspace"
            onChange={(event) => setWorkspaceName(event.target.value)}
            placeholder="Acme Commerce"
            required
            value={workspaceName}
          />
          <p className="min-h-4 text-[11px] text-muted-foreground">
            {workspaceName ? (
              <>
                URL slug:{" "}
                <span className="font-mono text-foreground">{slugPreview}</span>
                <span className="ml-1 text-muted-foreground/70">
                  (adjusted if taken)
                </span>
              </>
            ) : null}
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ownerName" className="text-xs text-muted-foreground">
            Your name
          </Label>
          <Input
            id="ownerName"
            name="ownerName"
            autoComplete="name"
            onChange={(event) => setOwnerName(event.target.value)}
            placeholder="Jane Doe"
            required
            value={ownerName}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-xs text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password" className="text-xs text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            type="password"
            value={password}
          />
        </div>
        <label className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/40">
          <input
            type="checkbox"
            className="size-3.5 accent-primary"
            checked={seedDemoData}
            onChange={(event) => setSeedDemoData(event.target.checked)}
          />
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-foreground">
              Include sample data
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Products, orders, customers, templates — good for a test drive
            </span>
          </span>
        </label>
        {message ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
            <span>{message}</span>
          </div>
        ) : null}
        <Button
          className="w-full justify-center"
          disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : null}
          Create workspace
        </Button>
      </form>
      <div className="border-t border-border/50 bg-muted/20 px-5 py-3 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </div>
    </Card>
  );
}
