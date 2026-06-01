import { renderAdminPage } from "../_lib/admin-page";

export default function CustomersPage(props: PageProps<"/customers">) {
  return renderAdminPage("customers", props.searchParams);
}
