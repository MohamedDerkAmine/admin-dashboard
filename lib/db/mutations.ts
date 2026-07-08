import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";

import type {
  AdminUser,
  AuditEvent,
  Category,
  DiscountCode,
  EmailTemplate,
  Invitation,
  Order,
  Product,
  ReturnRequest,
  Review,
  ScheduledReport,
} from "@/lib/admin-data";
import { hashToken } from "@/lib/auth/session";

import { getDb, getSqlite } from "./client";
import {
  auditEvents,
  categories,
  discountCodes,
  emailTemplates,
  invitations,
  memberships,
  orders,
  products,
  returnRequests,
  reviews,
  scheduledReports,
} from "./schema";

export type PersistableResource =
  | "adminUsers"
  | "auditEvents"
  | "categories"
  | "discounts"
  | "emailTemplates"
  | "invitations"
  | "orders"
  | "products"
  | "returns"
  | "reviews"
  | "scheduledReports";

export function replaceTenantResource(
  tenantId: string,
  resource: PersistableResource,
  records: unknown,
) {
  const transaction = getSqlite().transaction(() => {
    if (resource === "products") {
      replaceProducts(tenantId, records as Product[]);
    } else if (resource === "categories") {
      replaceCategories(tenantId, records as Category[]);
    } else if (resource === "orders") {
      replaceOrders(tenantId, records as Order[]);
    } else if (resource === "discounts") {
      replaceDiscounts(tenantId, records as DiscountCode[]);
    } else if (resource === "auditEvents") {
      replaceAuditEvents(tenantId, records as AuditEvent[]);
    } else if (resource === "reviews") {
      replaceReviews(tenantId, records as Review[]);
    } else if (resource === "returns") {
      replaceReturns(tenantId, records as ReturnRequest[]);
    } else if (resource === "emailTemplates") {
      replaceEmailTemplates(tenantId, records as EmailTemplate[]);
    } else if (resource === "scheduledReports") {
      replaceScheduledReports(tenantId, records as ScheduledReport[]);
    } else if (resource === "invitations") {
      replaceInvitations(tenantId, records as Invitation[]);
    } else if (resource === "adminUsers") {
      updateAdminUsers(tenantId, records as AdminUser[]);
    } else {
      throw new Error(`Unsupported resource: ${resource}`);
    }
  });

  transaction();
}

function replaceProducts(tenantId: string, records: Product[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(products).where(eq(products.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(products)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        name: entry.name,
        sku: entry.sku,
        category: entry.category,
        price: entry.price,
        stock: entry.stock,
        status: entry.status,
        imageUrl: entry.imageUrl,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function replaceCategories(tenantId: string, records: Category[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(categories).where(eq(categories.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(categories)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        name: entry.name,
        productCount: entry.productCount,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function replaceOrders(tenantId: string, records: Order[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(orders).where(eq(orders.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(orders)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        customer: entry.customer,
        email: entry.email,
        total: entry.total,
        status: entry.status,
        date: entry.date,
        items: entry.items,
        payload: JSON.stringify(entry),
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function replaceDiscounts(tenantId: string, records: DiscountCode[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(discountCodes).where(eq(discountCodes.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(discountCodes)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        code: entry.code,
        kind: entry.kind,
        value: entry.value,
        status: entry.status,
        expiresAt: entry.expiresAt ?? null,
        maxUses: entry.maxUses ?? null,
        usedCount: entry.usedCount,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function replaceAuditEvents(tenantId: string, records: AuditEvent[]) {
  const db = getDb();
  db.delete(auditEvents).where(eq(auditEvents.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(auditEvents)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        timestamp: entry.timestamp,
        actor: entry.actor,
        action: entry.action,
        resource: entry.resource,
        target: entry.target,
        detail: entry.detail ?? null,
        createdAt: entry.timestamp,
      })),
    )
    .run();
}

function replaceReviews(tenantId: string, records: Review[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(reviews).where(eq(reviews.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(reviews)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        productId: entry.productId,
        productName: entry.productName,
        customer: entry.customer,
        email: entry.email,
        rating: entry.rating,
        title: entry.title,
        body: entry.body,
        status: entry.status,
        submittedAt: entry.submittedAt,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function replaceReturns(tenantId: string, records: ReturnRequest[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(returnRequests).where(eq(returnRequests.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(returnRequests)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        orderId: entry.orderId,
        customer: entry.customer,
        email: entry.email,
        reason: entry.reason,
        note: entry.note ?? null,
        status: entry.status,
        requestedAt: entry.requestedAt,
        resolvedAt: entry.resolvedAt ?? null,
        refundAmount: entry.refundAmount ?? null,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function replaceEmailTemplates(tenantId: string, records: EmailTemplate[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(emailTemplates).where(eq(emailTemplates.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(emailTemplates)
    .values(
      records.map((entry) => ({
        tenantId,
        key: entry.key,
        name: entry.name,
        description: entry.description,
        audience: entry.audience,
        subject: entry.subject,
        body: entry.body,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function replaceScheduledReports(tenantId: string, records: ScheduledReport[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(scheduledReports)
    .where(eq(scheduledReports.tenantId, tenantId))
    .run();
  if (records.length === 0) return;
  db.insert(scheduledReports)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        name: entry.name,
        dataset: entry.dataset,
        frequency: entry.frequency,
        deliveryEmail: entry.deliveryEmail,
        enabled: entry.enabled,
        lastRunAt: entry.lastRunAt ?? null,
        reportCreatedAt: entry.createdAt,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function replaceInvitations(tenantId: string, records: Invitation[]) {
  const now = new Date().toISOString();
  const db = getDb();
  db.delete(invitations).where(eq(invitations.tenantId, tenantId)).run();
  if (records.length === 0) return;
  db.insert(invitations)
    .values(
      records.map((entry) => ({
        tenantId,
        id: entry.id,
        email: entry.email,
        role: entry.role,
        tokenHash: hashToken(randomUUID()),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        acceptedAt: null,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .run();
}

function updateAdminUsers(tenantId: string, records: AdminUser[]) {
  const now = new Date().toISOString();
  const db = getDb();
  for (const entry of records) {
    db.update(memberships)
      .set({
        role: entry.role,
        status: entry.status,
        lastActive: entry.lastActive,
        updatedAt: now,
      })
      .where(
        and(
          eq(memberships.tenantId, tenantId),
          eq(memberships.userId, entry.id),
        ),
      )
      .run();
  }
}
