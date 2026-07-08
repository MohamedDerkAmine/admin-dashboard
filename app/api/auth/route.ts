import { authenticateUser } from "@/lib/auth/service";
import { clearSession, createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json(
      { message: "Enter an email and password." },
      { status: 400 },
    );
  }

  const authResult = await authenticateUser(email, password);

  if (!authResult) {
    return Response.json(
      { message: "Invalid email or password." },
      { status: 400 },
    );
  }

  await createSession(authResult.userId, authResult.activeTenantId);

  return Response.json({ ok: true });
}

export async function DELETE() {
  await clearSession();
  return Response.json({ ok: true });
}
