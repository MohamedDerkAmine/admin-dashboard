import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const memberships = sqliteTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    status: text("status").notNull(),
    lastActive: text("last_active").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [unique().on(table.userId, table.tenantId)],
);

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activeTenantId: text("active_tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  revokedAt: text("revoked_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  acceptedAt: text("accepted_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const categories = sqliteTable(
  "categories",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    name: text("name").notNull(),
    productCount: integer("product_count").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.id] })],
);

export const products = sqliteTable(
  "products",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    category: text("category").notNull(),
    price: real("price").notNull(),
    stock: integer("stock").notNull(),
    status: text("status").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.id] }),
    unique().on(table.tenantId, table.sku),
  ],
);

export const customers = sqliteTable(
  "customers",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    orders: integer("orders").notNull(),
    spent: real("spent").notNull(),
    segment: text("segment").notNull(),
    lastOrder: text("last_order").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.id] })],
);

export const orders = sqliteTable(
  "orders",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    customer: text("customer").notNull(),
    email: text("email").notNull(),
    total: real("total").notNull(),
    status: text("status").notNull(),
    date: text("date").notNull(),
    items: integer("items").notNull(),
    payload: text("payload").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.id] })],
);

export const discountCodes = sqliteTable(
  "discount_codes",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    code: text("code").notNull(),
    kind: text("kind").notNull(),
    value: real("value").notNull(),
    status: text("status").notNull(),
    expiresAt: text("expires_at"),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tenantId, table.id] }),
    unique().on(table.tenantId, table.code),
  ],
);

export const auditEvents = sqliteTable(
  "audit_events",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    timestamp: text("timestamp").notNull(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    target: text("target").notNull(),
    detail: text("detail"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.id] })],
);

export const reviews = sqliteTable(
  "reviews",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    customer: text("customer").notNull(),
    email: text("email").notNull(),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull(),
    submittedAt: text("submitted_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.id] })],
);

export const returnRequests = sqliteTable(
  "return_requests",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    orderId: text("order_id").notNull(),
    customer: text("customer").notNull(),
    email: text("email").notNull(),
    reason: text("reason").notNull(),
    note: text("note"),
    status: text("status").notNull(),
    requestedAt: text("requested_at").notNull(),
    resolvedAt: text("resolved_at"),
    refundAmount: real("refund_amount"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.id] })],
);

export const emailTemplates = sqliteTable(
  "email_templates",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    audience: text("audience").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.key] })],
);

export const scheduledReports = sqliteTable(
  "scheduled_reports",
  {
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    name: text("name").notNull(),
    dataset: text("dataset").notNull(),
    frequency: text("frequency").notNull(),
    deliveryEmail: text("delivery_email").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull(),
    lastRunAt: text("last_run_at"),
    reportCreatedAt: text("report_created_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.tenantId, table.id] })],
);
