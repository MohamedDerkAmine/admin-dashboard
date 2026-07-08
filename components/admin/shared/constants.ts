import {
  BarChart3Icon,
  CalendarClockIcon,
  CreditCardIcon,
  FileArchiveIcon,
  FlagIcon,
  KeyIcon,
  LayoutDashboardIcon,
  RadioIcon,
  MailIcon,
  MessageSquareIcon,
  PackageIcon,
  PercentIcon,
  RotateCcwIcon,
  ScrollTextIcon,
  SettingsIcon,
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
} from "@/components/admin/shared/types";

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
  { id: "analytics", label: "Analytics", icon: BarChart3Icon },
  { id: "products", label: "Products", icon: PackageIcon },
  { id: "categories", label: "Categories", icon: TagsIcon },
  { id: "discounts", label: "Discounts", icon: PercentIcon },
  { id: "orders", label: "Orders", icon: ShoppingCartIcon },
  { id: "returns", label: "Returns", icon: RotateCcwIcon },
  { id: "reviews", label: "Reviews", icon: MessageSquareIcon },
  { id: "customers", label: "Customers", icon: UsersIcon },
  { id: "users", label: "Users & Roles", icon: ShieldIcon },
  { id: "audit", label: "Audit log", icon: ScrollTextIcon },
  { id: "emails", label: "Email templates", icon: MailIcon },
  { id: "reports", label: "Reports", icon: CalendarClockIcon },
  { id: "flags", label: "Feature flags", icon: FlagIcon },
  { id: "apikeys", label: "API keys", icon: KeyIcon },
  { id: "webhooks", label: "Webhooks", icon: RadioIcon },
  { id: "billing", label: "Billing", icon: CreditCardIcon },
  { id: "compliance", label: "Compliance", icon: FileArchiveIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
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
