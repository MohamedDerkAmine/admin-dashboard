import { renderAdminPage } from "../_lib/admin-page";

export default function UsersPage(props: PageProps<"/users">) {
  return renderAdminPage("users", props.searchParams);
}
