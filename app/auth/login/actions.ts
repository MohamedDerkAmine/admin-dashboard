"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/server";

export type LoginFormState = {
  message: string;
};

export async function authenticate(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const mode = formData.get("mode") === "signup" ? "signup" : "signin";

  if (!email || !password) {
    return { message: "Enter an email and password." };
  }

  const supabase = await createClient();
  const { error } = await (mode === "signin"
    ? supabase.auth.signInWithPassword({ email, password })
    : supabase.auth.signUp({ email, password })
  ).catch((error: unknown) => ({
    error:
      error instanceof Error
        ? error
        : new Error("Unable to reach Supabase. Please try again."),
  }));

  if (error) {
    return { message: getAuthErrorMessage(error) };
  }

  redirect("/");
}

function getAuthErrorMessage(error: Error) {
  if (
    error.message === "fetch failed" ||
    error.message.includes("ENOTFOUND") ||
    error.message.includes("getaddrinfo")
  ) {
    return "Unable to reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local or try again when the project is reachable.";
  }

  return error.message;
}
