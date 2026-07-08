"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutInline() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.refresh();
    router.push(window.location.pathname);
  }

  return (
    <Button size="sm" variant="outline" onClick={signOut} disabled={pending}>
      <LogOutIcon className="size-4" />
      {pending ? "Signing out..." : "Sign out & try again"}
    </Button>
  );
}
