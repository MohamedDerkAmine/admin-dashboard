import { notFound } from "next/navigation";

import { OrderDetail } from "@/components/admin/details/order-detail";
import { requireTenantSession } from "@/lib/auth/dal";
import { getTenantAdminData } from "@/lib/db/admin-store";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireTenantSession();
  const data = getTenantAdminData(session.tenant.id);
  const order = data.orders.find((entry) => entry.id === id);

  if (!order) {
    notFound();
  }

  const activity = data.auditEvents.filter(
    (event) => event.resource === "order" && event.target === order.id,
  );

  return (
    <OrderDetail
      order={order}
      activity={activity}
      userEmail={session.user.email}
    />
  );
}
