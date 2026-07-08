import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/admin/details/product-detail";
import { requireTenantSession } from "@/lib/auth/dal";
import { getTenantAdminData } from "@/lib/db/admin-store";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireTenantSession();
  const data = getTenantAdminData(session.tenant.id);
  const product = data.products.find((entry) => entry.id === id);

  if (!product) {
    notFound();
  }

  const activity = data.auditEvents.filter(
    (event) => event.target === product.name,
  );

  return (
    <ProductDetail
      product={product}
      activity={activity}
      userEmail={session.user.email}
    />
  );
}
