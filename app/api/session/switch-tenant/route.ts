import {
  clearSession,
  createSession,
  getOptionalTenantSession,
} from "@/lib/auth/session";
import {
  hasActiveMembership,
  touchMembershipLastActive,
} from "@/lib/db/memberships";

export async function POST(request: Request) {
  const session = await getOptionalTenantSession();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const targetTenantId =
    typeof body?.tenantId === "string" ? body.tenantId : "";

  if (!targetTenantId) {
    return Response.json(
      { message: "Provide a tenantId." },
      { status: 400 },
    );
  }

  if (targetTenantId === session.tenant.id) {
    return Response.json({ ok: true, tenantId: targetTenantId });
  }

  const allowed = hasActiveMembership({
    userId: session.user.id,
    tenantId: targetTenantId,
  });

  if (!allowed) {
    return Response.json(
      { message: "You are not a member of that workspace." },
      { status: 403 },
    );
  }

  await clearSession();
  await createSession(session.user.id, targetTenantId);
  touchMembershipLastActive({
    userId: session.user.id,
    tenantId: targetTenantId,
  });

  return Response.json({ ok: true, tenantId: targetTenantId });
}
