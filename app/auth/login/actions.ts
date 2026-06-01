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
  const { error } =
    mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

  if (error) {
    return { message: error.message };
  }

  redirect("/");
}
