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

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export type OrderLineItem = {
  productId?: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
};

export type OrderTimelineEvent = {
  status: OrderStatus;
  at: string;
  note?: string;
};

export type OrderPayment = {
  method: "card" | "paypal" | "applepay" | "transfer";
  brand?: string;
  last4?: string;
};

export type Order = {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
  shippingAddress?: Address;
  billingAddress?: Address;
  payment?: OrderPayment;
  lineItems?: OrderLineItem[];
  timeline?: OrderTimelineEvent[];
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
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

export type PermissionKey =
  | "products.view"
  | "products.edit"
  | "products.delete"
  | "orders.view"
  | "orders.edit"
  | "orders.refund"
  | "customers.view"
  | "users.invite"
  | "users.manage"
  | "billing.access";

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
    subtotal: 226,
    shippingCost: 8,
    tax: 12,
    shippingAddress: {
      line1: "812 Mission St",
      line2: "Apt 4B",
      city: "San Francisco",
      region: "CA",
      postalCode: "94103",
      country: "US",
    },
    billingAddress: {
      line1: "812 Mission St",
      line2: "Apt 4B",
      city: "San Francisco",
      region: "CA",
      postalCode: "94103",
      country: "US",
    },
    payment: { method: "card", brand: "Visa", last4: "4242" },
    lineItems: [
      {
        productId: "prd-1001",
        name: "Linen Overshirt",
        sku: "APP-LIN-001",
        qty: 1,
        price: 88,
      },
      {
        productId: "prd-1003",
        name: "Canvas Tote",
        sku: "ACC-TOT-021",
        qty: 2,
        price: 46,
      },
      {
        productId: "prd-1005",
        name: "Recovery Balm",
        sku: "WEL-BAL-032",
        qty: 1,
        price: 46,
      },
    ],
    timeline: [
      { status: "Pending", at: "2026-05-21T09:14:00Z" },
      { status: "Processing", at: "2026-05-21T11:02:00Z", note: "Picked from warehouse A" },
    ],
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

const sampleAddresses: Address[] = [
  {
    line1: "248 Bowery",
    city: "New York",
    region: "NY",
    postalCode: "10012",
    country: "US",
  },
  {
    line1: "1411 Folsom St",
    city: "San Francisco",
    region: "CA",
    postalCode: "94103",
    country: "US",
  },
  {
    line1: "650 W Randolph St",
    city: "Chicago",
    region: "IL",
    postalCode: "60661",
    country: "US",
  },
  {
    line1: "1900 W Sunset Blvd",
    city: "Los Angeles",
    region: "CA",
    postalCode: "90026",
    country: "US",
  },
];

const samplePayments: OrderPayment[] = [
  { method: "card", brand: "Visa", last4: "4242" },
  { method: "card", brand: "Mastercard", last4: "5556" },
  { method: "card", brand: "Amex", last4: "0005" },
  { method: "paypal" },
  { method: "applepay" },
];

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getOrderDetail(order: Order): Required<
  Pick<Order, "subtotal" | "shippingCost" | "tax" | "lineItems" | "timeline" | "shippingAddress" | "billingAddress" | "payment">
> {
  const seed = hashSeed(order.id);
  const address = order.shippingAddress ?? sampleAddresses[seed % sampleAddresses.length];
  const payment = order.payment ?? samplePayments[seed % samplePayments.length];

  let lineItems = order.lineItems;
  if (!lineItems || lineItems.length === 0) {
    const pool = initialProducts.filter((product) => product.status === "Active");
    const count = Math.max(1, Math.min(order.items, 4));
    lineItems = Array.from({ length: count }, (_, index) => {
      const product = pool[(seed + index) % pool.length];
      const qty = index === 0 ? Math.max(1, order.items - (count - 1)) : 1;
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        qty,
        price: product.price,
      };
    });
  }

  const itemsSubtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const subtotal = order.subtotal ?? itemsSubtotal;
  const shippingCost = order.shippingCost ?? Math.max(0, order.total - subtotal - (order.tax ?? 0));
  const tax = order.tax ?? Math.max(0, order.total - subtotal - shippingCost);

  const statusOrder: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];
  const stopIndex =
    order.status === "Refunded"
      ? statusOrder.length
      : Math.max(0, statusOrder.indexOf(order.status));
  const baseTime = new Date(order.date).getTime();
  const timeline =
    order.timeline ??
    statusOrder.slice(0, stopIndex + 1).map((status, index) => ({
      status,
      at: new Date(baseTime + index * 6 * 60 * 60 * 1000).toISOString(),
    }));

  if (order.status === "Refunded" && timeline[timeline.length - 1]?.status !== "Refunded") {
    timeline.push({
      status: "Refunded",
      at: new Date(baseTime + statusOrder.length * 6 * 60 * 60 * 1000).toISOString(),
    });
  }

  return {
    subtotal,
    shippingCost,
    tax,
    lineItems,
    timeline,
    shippingAddress: address,
    billingAddress: order.billingAddress ?? address,
    payment,
  };
}

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

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed";

export type AuditResource =
  | "product"
  | "category"
  | "order"
  | "user"
  | "discount";

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  action: AuditAction;
  resource: AuditResource;
  target: string;
  detail?: string;
};

export const initialAuditEvents: AuditEvent[] = [
  {
    id: "ev-1",
    timestamp: "2026-05-23T11:42:00Z",
    actor: "alex@example.com",
    action: "updated",
    resource: "product",
    target: "Aurora Wool Beanie",
    detail: "Stock 14 → 22",
  },
  {
    id: "ev-2",
    timestamp: "2026-05-23T10:18:00Z",
    actor: "mira@example.com",
    action: "status_changed",
    resource: "order",
    target: "ORD-4821",
    detail: "Pending → Shipped",
  },
  {
    id: "ev-3",
    timestamp: "2026-05-23T09:05:00Z",
    actor: "alex@example.com",
    action: "created",
    resource: "product",
    target: "Coastal Linen Tote",
  },
  {
    id: "ev-4",
    timestamp: "2026-05-22T16:48:00Z",
    actor: "system",
    action: "updated",
    resource: "user",
    target: "kira@example.com",
    detail: "Role Editor → Admin",
  },
  {
    id: "ev-5",
    timestamp: "2026-05-22T15:20:00Z",
    actor: "alex@example.com",
    action: "deleted",
    resource: "category",
    target: "Accessories (legacy)",
  },
  {
    id: "ev-6",
    timestamp: "2026-05-22T11:02:00Z",
    actor: "mira@example.com",
    action: "status_changed",
    resource: "order",
    target: "ORD-4795",
    detail: "Shipped → Delivered",
  },
  {
    id: "ev-7",
    timestamp: "2026-05-21T17:33:00Z",
    actor: "alex@example.com",
    action: "updated",
    resource: "product",
    target: "Harbor Knit Sweater",
    detail: "Price $89 → $79",
  },
  {
    id: "ev-8",
    timestamp: "2026-05-21T14:11:00Z",
    actor: "system",
    action: "created",
    resource: "user",
    target: "noah@example.com",
    detail: "Invitation accepted",
  },
];

export type DiscountStatus = "Active" | "Scheduled" | "Expired";
export type DiscountKind = "percent" | "fixed";

export type DiscountCode = {
  id: string;
  code: string;
  kind: DiscountKind;
  value: number;
  status: DiscountStatus;
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
};

export type EmailTemplateKey =
  | "order_confirmation"
  | "order_shipped"
  | "order_refunded"
  | "return_approved"
  | "low_stock_alert";

export type EmailTemplate = {
  key: EmailTemplateKey;
  name: string;
  description: string;
  audience: "Customer" | "Admin";
  subject: string;
  body: string;
};

export const initialEmailTemplates: EmailTemplate[] = [
  {
    key: "order_confirmation",
    name: "Order confirmation",
    description: "Sent when a customer places an order",
    audience: "Customer",
    subject: "Thanks for your order {{order.id}}",
    body: "Hi {{customer.name}},\n\nWe've received your order {{order.id}} for {{order.total}}. We'll let you know when it ships.\n\n— {{store.name}}",
  },
  {
    key: "order_shipped",
    name: "Order shipped",
    description: "Sent when an order's status changes to Shipped",
    audience: "Customer",
    subject: "Your order {{order.id}} is on the way",
    body: "Hi {{customer.name}},\n\nGood news — order {{order.id}} ({{order.items}} items, {{order.total}}) just left our warehouse.\n\nTrack it any time from your account.\n\n— {{store.name}}",
  },
  {
    key: "order_refunded",
    name: "Order refunded",
    description: "Sent when an order is refunded",
    audience: "Customer",
    subject: "Refund issued for {{order.id}}",
    body: "Hi {{customer.name}},\n\nWe've refunded {{order.total}} for order {{order.id}}. The funds should appear on your statement within 5–10 business days.\n\n— {{store.name}}",
  },
  {
    key: "return_approved",
    name: "Return approved",
    description: "Sent when a return request is approved",
    audience: "Customer",
    subject: "Your return for {{order.id}} is approved",
    body: "Hi {{customer.name}},\n\nWe've approved your return for {{order.id}}. Print the prepaid label from your account and drop the package off any time in the next 14 days.\n\n— {{store.name}}",
  },
  {
    key: "low_stock_alert",
    name: "Low stock alert",
    description: "Sent to the team when a product falls below threshold",
    audience: "Admin",
    subject: "Low stock: {{product.name}}",
    body: "{{product.name}} ({{product.sku}}) is down to {{product.stock}} units. Reorder before it sells out.",
  },
];

export type ScheduledReportDataset =
  | "products"
  | "orders"
  | "customers"
  | "returns"
  | "reviews";

export type ScheduledReportFrequency = "daily" | "weekly" | "monthly";

export type ScheduledReport = {
  id: string;
  name: string;
  dataset: ScheduledReportDataset;
  frequency: ScheduledReportFrequency;
  deliveryEmail: string;
  enabled: boolean;
  lastRunAt?: string;
  createdAt: string;
};

export const initialScheduledReports: ScheduledReport[] = [
  {
    id: "rpt-1",
    name: "Weekly orders snapshot",
    dataset: "orders",
    frequency: "weekly",
    deliveryEmail: "ops@example.com",
    enabled: true,
    lastRunAt: "2026-05-17T08:00:00Z",
    createdAt: "2026-03-04T10:00:00Z",
  },
  {
    id: "rpt-2",
    name: "Monthly customer roster",
    dataset: "customers",
    frequency: "monthly",
    deliveryEmail: "marketing@example.com",
    enabled: true,
    lastRunAt: "2026-05-01T08:00:00Z",
    createdAt: "2026-01-12T14:30:00Z",
  },
  {
    id: "rpt-3",
    name: "Daily low-stock digest",
    dataset: "products",
    frequency: "daily",
    deliveryEmail: "warehouse@example.com",
    enabled: false,
    lastRunAt: "2026-05-22T08:00:00Z",
    createdAt: "2026-04-19T09:15:00Z",
  },
];

export type ReviewStatus = "Pending" | "Approved" | "Flagged" | "Rejected";

export type Review = {
  id: string;
  productId: string;
  productName: string;
  customer: string;
  email: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  submittedAt: string;
};

export const initialReviews: Review[] = [
  {
    id: "rev-1",
    productId: "prd-1001",
    productName: "Linen Overshirt",
    customer: "Amina Clark",
    email: "amina@example.com",
    rating: 5,
    title: "Perfect fit and weight",
    body: "Hangs beautifully and feels substantial. The linen has a nice texture without being scratchy.",
    status: "Pending",
    submittedAt: "2026-05-22T18:42:00Z",
  },
  {
    id: "rev-2",
    productId: "prd-1002",
    productName: "Ribbed Crew Tee",
    customer: "Marco Diaz",
    email: "marco@example.com",
    rating: 4,
    title: "Great basic, slightly small",
    body: "Quality is excellent but I'd recommend sizing up. The neck holds its shape after washing.",
    status: "Approved",
    submittedAt: "2026-05-21T11:30:00Z",
  },
  {
    id: "rev-3",
    productId: "prd-1004",
    productName: "Ceramic Pour Over",
    customer: "Nora Patel",
    email: "nora@example.com",
    rating: 2,
    title: "Cracked in shipping",
    body: "Disappointed — the box was fine but the cone arrived with a hairline crack. Customer service was helpful though.",
    status: "Flagged",
    submittedAt: "2026-05-20T08:14:00Z",
  },
  {
    id: "rev-4",
    productId: "prd-1005",
    productName: "Recovery Balm",
    customer: "Sofia Martin",
    email: "sofia@example.com",
    rating: 5,
    title: "Best balm I've tried",
    body: "Light enough to layer under sunscreen, calming for my eczema flare-ups.",
    status: "Approved",
    submittedAt: "2026-05-19T22:00:00Z",
  },
  {
    id: "rev-5",
    productId: "prd-1003",
    productName: "Canvas Tote",
    customer: "Ethan Wright",
    email: "ethan@example.com",
    rating: 1,
    title: "DO NOT BUY!!!",
    body: "Total scam. Stitching fell apart after one trip to the store. Never shopping here again.",
    status: "Pending",
    submittedAt: "2026-05-22T16:00:00Z",
  },
];

export type ReturnStatus = "Requested" | "Approved" | "Denied" | "Refunded";

export type ReturnReason =
  | "Damaged"
  | "Wrong item"
  | "Did not fit"
  | "Changed mind"
  | "Other";

export type ReturnRequest = {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  reason: ReturnReason;
  note?: string;
  status: ReturnStatus;
  requestedAt: string;
  resolvedAt?: string;
  refundAmount?: number;
};

export const initialReturnRequests: ReturnRequest[] = [
  {
    id: "RMA-2401",
    orderId: "ORD-5107",
    customer: "Nora Patel",
    email: "nora@example.com",
    reason: "Damaged",
    note: "Arrived with a cracked handle",
    status: "Requested",
    requestedAt: "2026-05-22T14:08:00Z",
  },
  {
    id: "RMA-2402",
    orderId: "ORD-5106",
    customer: "James Lee",
    email: "james@example.com",
    reason: "Did not fit",
    status: "Approved",
    requestedAt: "2026-05-22T09:14:00Z",
    resolvedAt: "2026-05-22T12:30:00Z",
  },
  {
    id: "RMA-2403",
    orderId: "ORD-5105",
    customer: "Sofia Martin",
    email: "sofia@example.com",
    reason: "Changed mind",
    status: "Refunded",
    requestedAt: "2026-05-19T18:00:00Z",
    resolvedAt: "2026-05-20T11:00:00Z",
    refundAmount: 46,
  },
  {
    id: "RMA-2404",
    orderId: "ORD-5104",
    customer: "Ethan Wright",
    email: "ethan@example.com",
    reason: "Wrong item",
    status: "Denied",
    requestedAt: "2026-05-21T08:12:00Z",
    resolvedAt: "2026-05-21T10:00:00Z",
    note: "Outside 14-day window",
  },
];

export const initialDiscountCodes: DiscountCode[] = [
  {
    id: "disc-1",
    code: "WELCOME10",
    kind: "percent",
    value: 10,
    status: "Active",
    expiresAt: "2026-12-31",
    maxUses: 1000,
    usedCount: 184,
  },
  {
    id: "disc-2",
    code: "FREESHIP",
    kind: "fixed",
    value: 8,
    status: "Active",
    expiresAt: "2026-08-31",
    maxUses: 5000,
    usedCount: 2341,
  },
  {
    id: "disc-3",
    code: "SUMMER25",
    kind: "percent",
    value: 25,
    status: "Scheduled",
    expiresAt: "2026-08-31",
    maxUses: 500,
    usedCount: 0,
  },
  {
    id: "disc-4",
    code: "VIP50",
    kind: "fixed",
    value: 50,
    status: "Active",
    maxUses: 200,
    usedCount: 67,
  },
  {
    id: "disc-5",
    code: "SPRING2025",
    kind: "percent",
    value: 15,
    status: "Expired",
    expiresAt: "2026-05-15",
    maxUses: 800,
    usedCount: 612,
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
