import { notFound } from "next/navigation";

import { CustomerDetail } from "@/components/admin/details/customer-detail";
import { requireTenantSession } from "@/lib/auth/dal";
import { getTenantAdminData } from "@/lib/db/admin-store";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const session = await requireTenantSession();
  const data = getTenantAdminData(session.tenant.id);
  const customer = data.customers.find(
    (entry) =>
      entry.id === decoded ||
      entry.email.toLowerCase() === decoded.toLowerCase(),
  );

  if (!customer) {
    notFound();
  }

  const activity = data.auditEvents.filter(
    (event) =>
      event.target === customer.email || event.target === customer.name,
  );

  return (
    <CustomerDetail
      customer={customer}
      orders={data.orders}
      activity={activity}
      userEmail={session.user.email}
    />
  );
}
