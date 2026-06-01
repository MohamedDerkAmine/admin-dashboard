import { createClient } from "@/lib/server";

type AuthMode = "signin" | "signup";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const mode: AuthMode = body?.mode === "signup" ? "signup" : "signin";

  if (!email || !password) {
    return Response.json(
      { message: "Enter an email and password." },
      { status: 400 },
    );
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
    return Response.json(
      { message: getAuthErrorMessage(error) },
      { status: 400 },
    );
  }

  return Response.json({ ok: true });
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
