import { notFound } from "next/navigation";

import {
  initialAuditEvents,
  initialCustomers,
  initialOrders,
} from "@/lib/admin-data";
import { CustomerDetail } from "@/components/admin/details/customer-detail";
import { createClient } from "@/lib/server";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const customer = initialCustomers.find(
    (entry) =>
      entry.id === decoded ||
      entry.email.toLowerCase() === decoded.toLowerCase(),
  );

  if (!customer) {
    notFound();
  }

  const activity = initialAuditEvents.filter(
    (event) =>
      event.target === customer.email || event.target === customer.name,
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <CustomerDetail
      customer={customer}
      orders={initialOrders}
      activity={activity}
      userEmail={user?.email ?? "you"}
    />
  );
}
