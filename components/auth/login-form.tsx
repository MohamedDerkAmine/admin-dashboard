"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage("");

    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;

    if (error) {
      setMessage(error.message);
      setIsPending(false);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <Card className="w-full gap-0 py-0">
      <div className="border-b border-border/50 px-5 py-4">
        <h2 className="text-base font-semibold">
          {mode === "signin" ? "Sign in to StoreOps" : "Create your account"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {mode === "signin"
            ? "Use your Supabase email and password."
            : "We'll create a Supabase account and sign you in."}
        </p>
      </div>
      <form className="grid gap-3 p-5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="text-xs text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
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
            {mode === "signin" ? (
              <button
                type="button"
                className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Forgot?
              </button>
            ) : null}
          </div>
          <Input
            id="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            minLength={6}
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
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>
      <div className="border-t border-border/50 bg-muted/20 px-5 py-3 text-center text-xs text-muted-foreground">
        {mode === "signin" ? "No account? " : "Already have an account? "}
        <button
          type="button"
          className="font-medium text-primary transition-colors hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </div>
    </Card>
  );
}
