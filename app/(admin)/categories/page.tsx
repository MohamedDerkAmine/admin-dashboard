import { renderAdminPage } from "../_lib/admin-page";

export default function CategoriesPage(props: PageProps<"/categories">) {
  return renderAdminPage("categories", props.searchParams);
}
