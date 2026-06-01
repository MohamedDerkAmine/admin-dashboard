import { notFound } from "next/navigation";

import { initialAuditEvents, initialOrders } from "@/lib/admin-data";
import { OrderDetail } from "@/components/admin/details/order-detail";
import { createClient } from "@/lib/server";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = initialOrders.find((entry) => entry.id === id);

  if (!order) {
    notFound();
  }

  const activity = initialAuditEvents.filter(
    (event) => event.resource === "order" && event.target === order.id,
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <OrderDetail
      order={order}
      activity={activity}
      userEmail={user?.email ?? "you"}
    />
  );
}
