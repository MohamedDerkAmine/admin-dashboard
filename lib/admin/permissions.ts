import type { AdminRole, PermissionKey } from "./types";

export const PERMISSIONS: { key: PermissionKey; label: string; group: string }[] = [
  { key: "products.view", label: "View products", group: "Products" },
  { key: "products.edit", label: "Edit products", group: "Products" },
  { key: "products.delete", label: "Delete products", group: "Products" },
  { key: "orders.view", label: "View orders", group: "Orders" },
  { key: "orders.edit", label: "Edit orders", group: "Orders" },
  { key: "orders.refund", label: "Issue refunds", group: "Orders" },
  { key: "customers.view", label: "View customers", group: "Customers" },
  { key: "users.invite", label: "Invite users", group: "Admin" },
  { key: "users.manage", label: "Manage roles", group: "Admin" },
  { key: "billing.access", label: "Access billing", group: "Admin" },
];

const ALL_PERMISSIONS = PERMISSIONS.map((p) => p.key);

export const builtinRolePermissions: Record<AdminRole, PermissionKey[]> = {
  Owner: ALL_PERMISSIONS,
  Admin: ALL_PERMISSIONS.filter((key) => key !== "billing.access"),
  Manager: [
    "products.view",
    "products.edit",
    "orders.view",
    "orders.edit",
    "customers.view",
    "users.invite",
  ],
  Support: ["orders.view", "orders.edit", "customers.view"],
  Viewer: ["products.view", "orders.view", "customers.view"],
};

export const rolePermissions: Record<AdminRole, string[]> = {
  Owner: [
    "Full dashboard access",
    "Manage billing and integrations",
    "Invite users and assign every role",
    "Delete products and categories",
  ],
  Admin: [
    "Manage catalog, orders, customers, and users",
    "Invite managers, support, and viewers",
    "Edit role assignments below owner",
  ],
  Manager: [
    "Manage products, categories, and orders",
    "View customers and revenue",
    "Invite support users",
  ],
  Support: [
    "View customers and orders",
    "Update order statuses",
    "No product deletion access",
  ],
  Viewer: [
    "Read-only dashboard access",
    "No mutation or invitation access",
  ],
};
