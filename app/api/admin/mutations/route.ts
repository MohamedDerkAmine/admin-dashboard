import { getOptionalTenantSession } from "@/lib/auth/session";
import {
  replaceTenantResource,
  type PersistableResource,
} from "@/lib/db/mutations";

const resources = new Set<PersistableResource>([
  "adminUsers",
  "auditEvents",
  "categories",
  "discounts",
  "emailTemplates",
  "orders",
  "products",
  "returns",
  "reviews",
  "scheduledReports",
]);

export async function POST(request: Request) {
  const session = await getOptionalTenantSession();
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const resource = body?.resource as PersistableResource | undefined;

  if (!resource || !resources.has(resource) || !Array.isArray(body?.records)) {
    return Response.json({ message: "Invalid mutation payload." }, { status: 400 });
  }

  try {
    replaceTenantResource(session.tenant.id, resource, body.records);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error ? error.message : "Unable to persist mutation.",
      },
      { status: 400 },
    );
  }
}
