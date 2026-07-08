import { renderAdminPage } from "../_lib/admin-page";

export default function ApiKeysPage(props: PageProps<"/apikeys">) {
  return renderAdminPage("apikeys", props.searchParams);
}
