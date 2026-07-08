import { ProductCreateWorkspace } from "@/components/products/product-create-workspace";
import { requireTenantSession } from "@/lib/auth/dal";

export default async function NewProductPage() {
  await requireTenantSession();
  return <ProductCreateWorkspace />;
}
