import type {
  AdminRole,
  Customer,
  Order,
  OrderStatus,
  Product,
} from "@/lib/admin-data";

export type Section =
  | "dashboard"
  | "analytics"
  | "products"
  | "categories"
  | "discounts"
  | "orders"
  | "customers"
  | "returns"
  | "reviews"
  | "users"
  | "audit"
  | "emails"
  | "reports"
  | "flags"
  | "apikeys"
  | "webhooks"
  | "billing"
  | "compliance"
  | "settings";

export type ProductForm = Omit<Product, "id">;

export type OrderForm = Omit<Order, "id" | "date">;

export type CategoryForm = {
  name: string;
};

export type StatusLike = Product["status"] | OrderStatus | Customer["segment"];

export type InvitationForm = {
  email: string;
  role: AdminRole;
};
