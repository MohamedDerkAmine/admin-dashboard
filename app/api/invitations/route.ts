import { headers } from "next/headers";

import type { AdminRole } from "@/lib/admin-data";
import { getOptionalTenantSession } from "@/lib/auth/session";
import { createInvitation } from "@/lib/db/invitations";

const inviteRoles = new Set<AdminRole>([
  "Admin",
  "Manager",
  "Support",
  "Viewer",
]);

export async function POST(request: Request) {
  const session = await getOptionalTenantSession();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (
    session.membership.role !== "Owner" &&
    session.membership.role !== "Admin"
  ) {
    return Response.json(
      { message: "Only Owner or Admin can invite users." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const role = body?.role as AdminRole | undefined;

  if (!email || !role || !inviteRoles.has(role)) {
    return Response.json(
      { message: "Provide an email and a valid role." },
      { status: 400 },
    );
  }

  try {
    const { invitation, token } = createInvitation({
      tenantId: session.tenant.id,
      email,
      role,
    });

    const headerList = await headers();
    const origin =
      headerList.get("origin") ??
      (() => {
        const host = headerList.get("host");
        const proto = headerList.get("x-forwarded-proto") ?? "http";
        return host ? `${proto}://${host}` : "";
      })();
    const acceptUrl = `${origin}/invitations/${token}`;

    return Response.json({ invitation, acceptUrl });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to create invitation.",
      },
      { status: 400 },
    );
  }
}
