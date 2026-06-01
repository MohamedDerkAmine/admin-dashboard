import { renderAdminPage } from "../_lib/admin-page";

export default function AuditPage(props: PageProps<"/audit">) {
  return renderAdminPage("audit", props.searchParams);
}
