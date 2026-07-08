import { renderAdminPage } from "../_lib/admin-page";

export default function WebhooksPage(props: PageProps<"/webhooks">) {
  return renderAdminPage("webhooks", props.searchParams);
}
