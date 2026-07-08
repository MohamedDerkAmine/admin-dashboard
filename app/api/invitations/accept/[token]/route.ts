import { getOptionalTenantSession } from "@/lib/auth/session";
import { acceptInvitation } from "@/lib/db/invitations";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const session = await getOptionalTenantSession();
  if (!session) {
    return Response.json(
      { message: "Sign in to accept an invitation." },
      { status: 401 },
    );
  }

  const { token } = await params;

  try {
    const result = acceptInvitation({ token, userId: session.user.id });
    if (!result) {
      return Response.json(
        { message: "This invitation is no longer valid." },
        { status: 400 },
      );
    }
    return Response.json({ ok: true, tenantId: result.tenantId });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to accept invitation.",
      },
      { status: 400 },
    );
  }
}
