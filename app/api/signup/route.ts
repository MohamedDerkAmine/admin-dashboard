import { createPublicSignup } from "@/lib/auth/service";
import { createSession, getOptionalTenantSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const existing = await getOptionalTenantSession();
  if (existing) {
    return Response.json(
      { message: "You are already signed in." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const workspaceName =
    typeof body?.workspaceName === "string" ? body.workspaceName.trim() : "";
  const ownerName =
    typeof body?.ownerName === "string" ? body.ownerName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const seedDemoData = body?.seedDemoData !== false;

  if (!workspaceName || !ownerName || !email || password.length < 8) {
    return Response.json(
      {
        message:
          "Enter a workspace, your name, a valid email, and a password with at least 8 characters.",
      },
      { status: 400 },
    );
  }

  try {
    const { tenant, user } = await createPublicSignup({
      ownerEmail: email,
      ownerName,
      password,
      seedDemoData,
      tenantName: workspaceName,
    });
    await createSession(user.id, tenant.id);
    return Response.json({
      ok: true,
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to create workspace.",
      },
      { status: 400 },
    );
  }
}
