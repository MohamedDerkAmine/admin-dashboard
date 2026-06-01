import { renderAdminPage } from "../_lib/admin-page";

export default function DiscountsPage(props: PageProps<"/discounts">) {
  return renderAdminPage("discounts", props.searchParams);
}
