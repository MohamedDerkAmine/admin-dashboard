import { renderAdminPage } from "../_lib/admin-page";

export default function OrdersPage(props: PageProps<"/orders">) {
  return renderAdminPage("orders", props.searchParams);
}
