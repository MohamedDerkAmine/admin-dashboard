import { renderAdminPage } from "../_lib/admin-page";

export default function ProductsPage(props: PageProps<"/products">) {
  return renderAdminPage("products", props.searchParams);
}
