import { renderAdminPage } from "../_lib/admin-page";

export default function ReportsPage(props: PageProps<"/reports">) {
  return renderAdminPage("reports", props.searchParams);
}
