import { renderAdminPage } from "../_lib/admin-page";

export default function CompliancePage(props: PageProps<"/compliance">) {
  return renderAdminPage("compliance", props.searchParams);
}
