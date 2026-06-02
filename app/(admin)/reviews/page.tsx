import { renderAdminPage } from "../_lib/admin-page";

export default function ReviewsPage(props: PageProps<"/reviews">) {
  return renderAdminPage("reviews", props.searchParams);
}
