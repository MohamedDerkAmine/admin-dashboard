import { renderAdminPage } from "../_lib/admin-page";

export default function ReturnsPage(props: PageProps<"/returns">) {
  return renderAdminPage("returns", props.searchParams);
}
