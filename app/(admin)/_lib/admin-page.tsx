import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
  type AdminSearchParams,
  parseAdminSearchParams,
} from "@/components/admin/dashboard/routing";
import type { Section } from "@/components/admin/shared/types";
import { createClient } from "@/lib/server";

export async function renderAdminPage(
  section: Section,
  searchParams: Promise<AdminSearchParams>,
) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminDashboard
      key={`${section}:${JSON.stringify(params)}`}
      section={section}
      searchState={parseAdminSearchParams(section, params)}
      userEmail={user?.email}
    />
  );
}
