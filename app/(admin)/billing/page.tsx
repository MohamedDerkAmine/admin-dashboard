import { renderAdminPage } from "../_lib/admin-page";

export default function BillingPage(props: PageProps<"/billing">) {
  return renderAdminPage("billing", props.searchParams);
}
