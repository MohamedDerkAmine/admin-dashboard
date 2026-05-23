import {
  LayoutDashboardIcon,
  PackageIcon,
  PercentIcon,
  ScrollTextIcon,
  ShieldIcon,
  ShoppingCartIcon,
  TagsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import type { AdminRole, OrderStatus } from "@/lib/admin-data";
import type {
  CategoryForm,
  InvitationForm,
  OrderForm,
  ProductForm,
  Section,
} from "@/components/admin/types";

export const pageSize = 4;

export const orderStatuses: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Refunded",
];

export const adminRoles: AdminRole[] = [
  "Owner",
  "Admin",
  "Manager",
  "Support",
  "Viewer",
];

export const navItems: Array<{
  id: Section;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { id: "products", label: "Products", icon: PackageIcon },
  { id: "categories", label: "Categories", icon: TagsIcon },
  { id: "discounts", label: "Discounts", icon: PercentIcon },
  { id: "orders", label: "Orders", icon: ShoppingCartIcon },
  { id: "customers", label: "Customers", icon: UsersIcon },
  { id: "users", label: "Users & Roles", icon: ShieldIcon },
  { id: "audit", label: "Audit log", icon: ScrollTextIcon },
];

export const emptyProductForm: ProductForm = {
  name: "",
  sku: "",
  category: "Apparel",
  price: 0,
  stock: 0,
  status: "Draft",
  imageUrl: "",
};

export const emptyInvitationForm: InvitationForm = {
  email: "",
  role: "Viewer",
};

export const emptyOrderForm: OrderForm = {
  customer: "",
  email: "",
  total: 0,
  items: 1,
  status: "Pending",
};

export const emptyCategoryForm: CategoryForm = {
  name: "",
};
