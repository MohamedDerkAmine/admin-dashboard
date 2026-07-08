import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
  type AdminSearchParams,
  parseAdminSearchParams,
} from "@/components/admin/dashboard/routing";
import type { Section } from "@/components/admin/shared/types";
import { requireTenantSession } from "@/lib/auth/dal";
import { getTenantAdminData } from "@/lib/db/admin-store";
import { listMembershipsForUser } from "@/lib/db/memberships";

export async function renderAdminPage(
  section: Section,
  searchParams: Promise<AdminSearchParams>,
) {
  const params = await searchParams;
  const session = await requireTenantSession();
  const data = getTenantAdminData(session.tenant.id);
  const memberships = listMembershipsForUser(session.user.id).map((m) => ({
    tenantId: m.tenant.id,
    tenantName: m.tenant.name,
    tenantSlug: m.tenant.slug,
    role: m.role,
  }));

  return (
    <AdminDashboard
      key={`${section}:${JSON.stringify(params)}`}
      section={section}
      searchState={parseAdminSearchParams(section, params)}
      activeTenantId={session.tenant.id}
      memberships={memberships}
      tenantName={session.tenant.name}
      userEmail={session.user.email}
      userRole={session.membership.role}
      initialData={data}
    />
  );
}
