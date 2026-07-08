"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  initialEmail = "",
  nextPath = "/",
}: {
  initialEmail?: string;
  nextPath?: string;
} = {}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage("");

    const response = await fetch("/api/auth", {
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the auth server. Please try again.");
      setIsPending(false);
      return;
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(
        typeof result.message === "string"
          ? result.message
          : "Unable to authenticate. Please try again.",
      );
      setIsPending(false);
      return;
    }

    router.refresh();
    router.push(nextPath);
  }

  return (
    <Card className="w-full gap-0 py-0">
      <div className="border-b border-border/50 px-5 py-4">
        <h2 className="text-base font-semibold">Sign in to StoreOps</h2>
        <p className="text-xs text-muted-foreground">
          Use the local owner or workspace member account.
        </p>
      </div>
      <form className="grid gap-3 p-5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-xs text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
            type="email"
            value={email}
          />
        </div>
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs text-muted-foreground"
            >
              Password
            </Label>
            <button
              type="button"
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot?
            </button>
          </div>
          <Input
            id="password"
            name="password"
            autoComplete="current-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
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
          Sign in
        </Button>
      </form>
      <div className="border-t border-border/50 bg-muted/20 px-5 py-3 text-center text-xs text-muted-foreground">
        Need a new workspace?{" "}
        <Link href="/signup" className="text-foreground hover:underline">
          Sign up
        </Link>
      </div>
    </Card>
  );
}
