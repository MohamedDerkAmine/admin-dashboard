import { notFound } from "next/navigation";

import { initialAuditEvents, initialProducts } from "@/lib/admin-data";
import { ProductDetail } from "@/components/admin/product-detail";
import { createClient } from "@/lib/server";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = initialProducts.find((entry) => entry.id === id);

  if (!product) {
    notFound();
  }

  const activity = initialAuditEvents.filter(
    (event) => event.target === product.name,
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ProductDetail
      product={product}
      activity={activity}
      userEmail={user?.email ?? "you"}
    />
  );
}
