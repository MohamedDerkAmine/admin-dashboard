import {
  initialAuditEvents,
  initialCategories,
  initialCustomers,
  initialDiscountCodes,
  initialEmailTemplates,
  initialOrders,
  initialProducts,
  initialReturnRequests,
  initialReviews,
  initialScheduledReports,
} from "@/lib/admin-data";

import { getDb } from "./client";
import {
  auditEvents,
  categories,
  customers,
  discountCodes,
  emailTemplates,
  orders,
  products,
  returnRequests,
  reviews,
  scheduledReports,
} from "./schema";

type SeedContext = {
  ownerEmail: string;
  ownerName: string;
  ownerUserId: string;
};

export function seedTenantDemoData(tenantId: string, context: SeedContext) {
  const now = new Date().toISOString();
  const db = getDb();

  if (initialCategories.length > 0) {
    db.insert(categories)
      .values(
        initialCategories.map((entry) => ({
          tenantId,
          id: entry.id,
          name: entry.name,
          productCount: entry.productCount,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .onConflictDoNothing()
      .run();
  }

  if (initialProducts.length > 0) {
    db.insert(products)
      .values(
        initialProducts.map((entry) => ({
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
      .onConflictDoNothing()
      .run();
  }

  if (initialCustomers.length > 0) {
    db.insert(customers)
      .values(
        initialCustomers.map((entry) => ({
          tenantId,
          id: entry.id,
          name: entry.name,
          email: entry.email,
          orders: entry.orders,
          spent: entry.spent,
          segment: entry.segment,
          lastOrder: entry.lastOrder,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .onConflictDoNothing()
      .run();
  }

  if (initialOrders.length > 0) {
    db.insert(orders)
      .values(
        initialOrders.map((entry) => ({
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
      .onConflictDoNothing()
      .run();
  }

  if (initialDiscountCodes.length > 0) {
    db.insert(discountCodes)
      .values(
        initialDiscountCodes.map((entry) => ({
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
      .onConflictDoNothing()
      .run();
  }

  if (initialAuditEvents.length > 0) {
    db.insert(auditEvents)
      .values(
        initialAuditEvents.map((entry) => ({
          tenantId,
          id: entry.id,
          timestamp: entry.timestamp,
          actor:
            entry.actor.toLowerCase() === "current user"
              ? context.ownerEmail
              : entry.actor,
          action: entry.action,
          resource: entry.resource,
          target: entry.target,
          detail: entry.detail ?? null,
          createdAt: entry.timestamp,
        })),
      )
      .onConflictDoNothing()
      .run();
  }

  if (initialReviews.length > 0) {
    db.insert(reviews)
      .values(
        initialReviews.map((entry) => ({
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
      .onConflictDoNothing()
      .run();
  }

  if (initialReturnRequests.length > 0) {
    db.insert(returnRequests)
      .values(
        initialReturnRequests.map((entry) => ({
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
      .onConflictDoNothing()
      .run();
  }

  if (initialEmailTemplates.length > 0) {
    db.insert(emailTemplates)
      .values(
        initialEmailTemplates.map((entry) => ({
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
      .onConflictDoNothing()
      .run();
  }

  if (initialScheduledReports.length > 0) {
    db.insert(scheduledReports)
      .values(
        initialScheduledReports.map((entry) => ({
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
      .onConflictDoNothing()
      .run();
  }

  db.insert(auditEvents)
    .values({
      tenantId,
      id: `ev-bootstrap-${context.ownerUserId}`,
      timestamp: now,
      actor: context.ownerEmail,
      action: "created",
      resource: "user",
      target: context.ownerName,
      detail: "Initial owner created during onboarding",
      createdAt: now,
    })
    .onConflictDoNothing()
    .run();
}
