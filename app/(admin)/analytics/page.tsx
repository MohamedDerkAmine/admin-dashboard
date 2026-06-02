import { renderAdminPage } from "../_lib/admin-page";

export default function AnalyticsPage(props: PageProps<"/analytics">) {
  return renderAdminPage("analytics", props.searchParams);
}
