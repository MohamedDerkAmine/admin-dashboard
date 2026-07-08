import { getOptionalTenantSession } from "@/lib/auth/session";
import { revokeInvitation } from "@/lib/db/invitations";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getOptionalTenantSession();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (
    session.membership.role !== "Owner" &&
    session.membership.role !== "Admin"
  ) {
    return Response.json(
      { message: "Only Owner or Admin can revoke invitations." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const removed = revokeInvitation({ tenantId: session.tenant.id, invitationId: id });
  if (!removed) {
    return Response.json({ message: "Invitation not found." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
