import { renderAdminPage } from "../_lib/admin-page";

export default function EmailsPage(props: PageProps<"/emails">) {
  return renderAdminPage("emails", props.searchParams);
}
