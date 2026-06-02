import { initialCategories } from "@/lib/admin-data";
import type { Section } from "@/components/admin/shared/types";

export const sectionPaths: Record<Section, string> = {
  dashboard: "/",
  analytics: "/analytics",
  products: "/products",
  categories: "/categories",
  discounts: "/discounts",
  orders: "/orders",
  returns: "/returns",
  reviews: "/reviews",
  customers: "/customers",
  users: "/users",
  audit: "/audit",
  emails: "/emails",
  reports: "/reports",
  settings: "/settings",
};

export type AdminSearchState = {
  query: string;
  statusFilter: string;
  categoryFilter: string;
  ratingFilter: string;
  page: number;
};

export type AdminSearchParams = Record<
  string,
  string | string[] | undefined
>;

const defaultSearchState: AdminSearchState = {
  query: "",
  statusFilter: "All",
  categoryFilter: "All",
  ratingFilter: "All",
  page: 1,
};

const statusOptions: Partial<Record<Section, string[]>> = {
  products: ["Active", "Draft", "Archived"],
  orders: ["Pending", "Processing", "Shipped", "Delivered", "Refunded"],
  returns: ["Requested", "Approved", "Denied", "Refunded"],
  reviews: ["Pending", "Approved", "Flagged", "Rejected"],
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizePage(value: string | string[] | undefined) {
  const page = Number(firstValue(value));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function normalizeFilter(
  value: string | string[] | undefined,
  allowed?: string[],
) {
  const filter = firstValue(value);
  if (!filter || filter === "All") {
    return "All";
  }
  return allowed?.includes(filter) ? filter : "All";
}

export function parseAdminSearchParams(
  section: Section,
  searchParams: AdminSearchParams,
): AdminSearchState {
  const category = firstValue(searchParams.category);
  const rating = firstValue(searchParams.rating);

  return {
    query: firstValue(searchParams.q)?.trim() ?? "",
    statusFilter: normalizeFilter(searchParams.status, statusOptions[section]),
    categoryFilter:
      section === "products"
        ? normalizeFilter(
            category,
            initialCategories.map((entry) => entry.name),
          )
        : "All",
    ratingFilter:
      section === "reviews" && ["1", "2", "3", "4", "5"].includes(rating ?? "")
        ? rating ?? "All"
        : "All",
    page: normalizePage(searchParams.page),
  };
}

export function buildSectionHref(
  section: Section,
  state: AdminSearchState = defaultSearchState,
) {
  const params = new URLSearchParams();

  if (state.query) {
    params.set("q", state.query);
  }
  if (state.statusFilter !== "All") {
    params.set("status", state.statusFilter);
  }
  if (section === "products" && state.categoryFilter !== "All") {
    params.set("category", state.categoryFilter);
  }
  if (section === "reviews" && state.ratingFilter !== "All") {
    params.set("rating", state.ratingFilter);
  }
  if (state.page > 1) {
    params.set("page", String(state.page));
  }

  const query = params.toString();
  return `${sectionPaths[section]}${query ? `?${query}` : ""}`;
}
