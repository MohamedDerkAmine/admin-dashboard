export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "Active" | "Draft" | "Archived";
  imageUrl: string;
};

export type Category = {
  id: string;
  name: string;
  productCount: number;
};

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Refunded";

export type Order = {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  segment: "VIP" | "Returning" | "New";
  lastOrder: string;
};

export type AdminRole = "Owner" | "Admin" | "Manager" | "Support" | "Viewer";

export type AdminUserStatus = "Active" | "Invited" | "Suspended";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminUserStatus;
  lastActive: string;
};

export type Invitation = {
  id: string;
  email: string;
  role: AdminRole;
  invitedBy: string;
  expires: string;
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

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Apparel", productCount: 2 },
  { id: "cat-2", name: "Accessories", productCount: 2 },
  { id: "cat-3", name: "Home", productCount: 1 },
  { id: "cat-4", name: "Wellness", productCount: 1 },
];

export const initialProducts: Product[] = [
  {
    id: "prd-1001",
    name: "Linen Overshirt",
    sku: "APP-LIN-001",
    category: "Apparel",
    price: 88,
    stock: 42,
    status: "Active",
    imageUrl: "",
  },
  {
    id: "prd-1002",
    name: "Ribbed Crew Tee",
    sku: "APP-TEE-014",
    category: "Apparel",
    price: 34,
    stock: 128,
    status: "Active",
    imageUrl: "",
  },
  {
    id: "prd-1003",
    name: "Canvas Tote",
    sku: "ACC-TOT-021",
    category: "Accessories",
    price: 46,
    stock: 67,
    status: "Active",
    imageUrl: "",
  },
  {
    id: "prd-1004",
    name: "Ceramic Pour Over",
    sku: "HOM-COF-008",
    category: "Home",
    price: 72,
    stock: 18,
    status: "Draft",
    imageUrl: "",
  },
  {
    id: "prd-1005",
    name: "Recovery Balm",
    sku: "WEL-BAL-032",
    category: "Wellness",
    price: 29,
    stock: 9,
    status: "Active",
    imageUrl: "",
  },
  {
    id: "prd-1006",
    name: "Leather Card Case",
    sku: "ACC-WAL-002",
    category: "Accessories",
    price: 64,
    stock: 0,
    status: "Archived",
    imageUrl: "",
  },
];

export const initialOrders: Order[] = [
  {
    id: "ORD-5109",
    customer: "Amina Clark",
    email: "amina@example.com",
    total: 246,
    status: "Processing",
    date: "2026-05-21",
    items: 3,
  },
  {
    id: "ORD-5108",
    customer: "Marco Diaz",
    email: "marco@example.com",
    total: 88,
    status: "Pending",
    date: "2026-05-21",
    items: 1,
  },
  {
    id: "ORD-5107",
    customer: "Nora Patel",
    email: "nora@example.com",
    total: 173,
    status: "Shipped",
    date: "2026-05-20",
    items: 2,
  },
  {
    id: "ORD-5106",
    customer: "James Lee",
    email: "james@example.com",
    total: 392,
    status: "Delivered",
    date: "2026-05-20",
    items: 5,
  },
  {
    id: "ORD-5105",
    customer: "Sofia Martin",
    email: "sofia@example.com",
    total: 46,
    status: "Refunded",
    date: "2026-05-19",
    items: 1,
  },
  {
    id: "ORD-5104",
    customer: "Ethan Wright",
    email: "ethan@example.com",
    total: 135,
    status: "Delivered",
    date: "2026-05-19",
    items: 2,
  },
];

export const initialCustomers: Customer[] = [
  {
    id: "CUS-1801",
    name: "Amina Clark",
    email: "amina@example.com",
    orders: 12,
    spent: 1840,
    segment: "VIP",
    lastOrder: "2026-05-21",
  },
  {
    id: "CUS-1802",
    name: "Marco Diaz",
    email: "marco@example.com",
    orders: 4,
    spent: 512,
    segment: "Returning",
    lastOrder: "2026-05-21",
  },
  {
    id: "CUS-1803",
    name: "Nora Patel",
    email: "nora@example.com",
    orders: 7,
    spent: 972,
    segment: "Returning",
    lastOrder: "2026-05-20",
  },
  {
    id: "CUS-1804",
    name: "James Lee",
    email: "james@example.com",
    orders: 16,
    spent: 2640,
    segment: "VIP",
    lastOrder: "2026-05-20",
  },
  {
    id: "CUS-1805",
    name: "Sofia Martin",
    email: "sofia@example.com",
    orders: 1,
    spent: 46,
    segment: "New",
    lastOrder: "2026-05-19",
  },
];

export const initialAdminUsers: AdminUser[] = [
  {
    id: "USR-001",
    name: "Mohamed Admin",
    email: "owner@example.com",
    role: "Owner",
    status: "Active",
    lastActive: "Today, 20:18",
  },
  {
    id: "USR-002",
    name: "Nora Patel",
    email: "nora.ops@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "Today, 18:42",
  },
  {
    id: "USR-003",
    name: "Marco Diaz",
    email: "marco.catalog@example.com",
    role: "Manager",
    status: "Active",
    lastActive: "Yesterday",
  },
  {
    id: "USR-004",
    name: "Sofia Martin",
    email: "sofia.support@example.com",
    role: "Support",
    status: "Active",
    lastActive: "May 19, 2026",
  },
  {
    id: "USR-005",
    name: "Read Only",
    email: "viewer@example.com",
    role: "Viewer",
    status: "Suspended",
    lastActive: "May 12, 2026",
  },
];

export const initialInvitations: Invitation[] = [
  {
    id: "INV-881",
    email: "warehouse@example.com",
    role: "Manager",
    invitedBy: "Nora Patel",
    expires: "May 28, 2026",
  },
  {
    id: "INV-882",
    email: "nightshift@example.com",
    role: "Support",
    invitedBy: "Mohamed Admin",
    expires: "May 30, 2026",
  },
];

export const revenueSeries = [
  { label: "Mon", value: 4200 },
  { label: "Tue", value: 5100 },
  { label: "Wed", value: 4600 },
  { label: "Thu", value: 6200 },
  { label: "Fri", value: 7300 },
  { label: "Sat", value: 6900 },
  { label: "Sun", value: 8100 },
];
