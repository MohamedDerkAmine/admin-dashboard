"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("StoreOps Demo");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seedDemoData, setSeedDemoData] = useState(true);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage("");

    const response = await fetch("/api/onboarding", {
      body: JSON.stringify({
        email,
        ownerName,
        password,
        seedDemoData,
        workspaceName,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the onboarding endpoint. Please try again.");
      setIsPending(false);
      return;
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(
        typeof result.message === "string"
          ? result.message
          : "Unable to complete onboarding.",
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
        <h2 className="text-base font-semibold">Set up StoreOps</h2>
        <p className="text-xs text-muted-foreground">
          Create the first workspace and owner account for this local database.
        </p>
      </div>
      <form className="grid gap-3 p-5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <Label
            htmlFor="workspaceName"
            className="text-xs text-muted-foreground"
          >
            Workspace
          </Label>
          <Input
            id="workspaceName"
            name="workspaceName"
            onChange={(event) => setWorkspaceName(event.target.value)}
            required
            value={workspaceName}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ownerName" className="text-xs text-muted-foreground">
            Owner name
          </Label>
          <Input
            id="ownerName"
            name="ownerName"
            autoComplete="name"
            onChange={(event) => setOwnerName(event.target.value)}
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
            placeholder="owner@example.com"
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
            required
            type="password"
            value={password}
          />
        </div>
        <label className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={seedDemoData}
            onChange={(event) => setSeedDemoData(event.target.checked)}
          />
          Seed demo commerce data
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
    </Card>
  );
}
