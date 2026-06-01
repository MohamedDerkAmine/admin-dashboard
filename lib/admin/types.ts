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
