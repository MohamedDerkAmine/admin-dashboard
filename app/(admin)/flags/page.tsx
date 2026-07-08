import { renderAdminPage } from "../_lib/admin-page";

export default function FlagsPage(props: PageProps<"/flags">) {
  return renderAdminPage("flags", props.searchParams);
}
