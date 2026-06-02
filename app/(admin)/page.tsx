import { renderAdminPage } from "./_lib/admin-page";

export default function Home(props: PageProps<"/">) {
  return renderAdminPage("dashboard", props.searchParams);
}
