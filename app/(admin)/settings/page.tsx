import { renderAdminPage } from "../_lib/admin-page";

export default function SettingsPage(props: PageProps<"/settings">) {
  return renderAdminPage("settings", props.searchParams);
}
