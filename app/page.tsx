import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { createClient } from "@/lib/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AdminDashboard userEmail={user?.email} />;
}
