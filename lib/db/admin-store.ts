import { asc, desc, eq } from "drizzle-orm";

import type {
  AdminRole,
  AdminUser,
  AdminUserStatus,
  AuditAction,
  AuditEvent,
  AuditResource,
  Category,
  Customer,
  DiscountCode,
  DiscountKind,
  DiscountStatus,
  EmailTemplate,
  EmailTemplateKey,
  Invitation,
  Order,
  OrderStatus,
  ReturnReason,
  ReturnRequest,
  ReturnStatus,
  Review,
  ReviewStatus,
  ScheduledReport,
  ScheduledReportDataset,
  ScheduledReportFrequency,
} from "@/lib/admin-data";

import { getDb, getSqlite } from "./client";
import {
  auditEvents,
  categories,
  customers,
  discountCodes,
  emailTemplates,
  orders,
  returnRequests,
  reviews,
  scheduledReports,
} from "./schema";
import { listProductsForTenant, type TenantProduct } from "./tenant-data";

export type TenantAdminData = {
  adminUsers: AdminUser[];
  auditEvents: AuditEvent[];
  categories: Category[];
  customers: Customer[];
  discounts: DiscountCode[];
  emailTemplates: EmailTemplate[];
  invitations: Invitation[];
  orders: Order[];
  products: TenantProduct[];
  returnRequests: ReturnRequest[];
  reviews: Review[];
  scheduledReports: ScheduledReport[];
};

export function getTenantAdminData(tenantId: string): TenantAdminData {
  return {
    adminUsers: listAdminUsersForTenant(tenantId),
    auditEvents: listAuditEventsForTenant(tenantId),
    categories: listCategoriesForTenant(tenantId),
    customers: listCustomersForTenant(tenantId),
    discounts: listDiscountsForTenant(tenantId),
    emailTemplates: listEmailTemplatesForTenant(tenantId),
    invitations: listInvitationsForTenant(tenantId),
    orders: listOrdersForTenant(tenantId),
    products: listProductsForTenant(tenantId),
    returnRequests: listReturnRequestsForTenant(tenantId),
    reviews: listReviewsForTenant(tenantId),
    scheduledReports: listScheduledReportsForTenant(tenantId),
  };
}

export function listCategoriesForTenant(tenantId: string): Category[] {
  return getDb()
    .select()
    .from(categories)
    .where(eq(categories.tenantId, tenantId))
    .orderBy(asc(categories.name))
    .all()
    .map((row) => ({
      id: row.id,
      name: row.name,
      productCount: row.productCount,
    }));
}

export function listCustomersForTenant(tenantId: string): Customer[] {
  return getDb()
    .select()
    .from(customers)
    .where(eq(customers.tenantId, tenantId))
    .orderBy(asc(customers.name))
    .all()
    .map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      orders: row.orders,
      spent: row.spent,
      segment: row.segment as Customer["segment"],
      lastOrder: row.lastOrder,
    }));
}

export function listOrdersForTenant(tenantId: string): Order[] {
  return getDb()
    .select()
    .from(orders)
    .where(eq(orders.tenantId, tenantId))
    .orderBy(desc(orders.date))
    .all()
    .map((row) => ({
      ...safeJson<Order>(row.payload, {
        id: row.id,
        customer: row.customer,
        email: row.email,
        total: row.total,
        status: row.status as OrderStatus,
        date: row.date,
        items: row.items,
      }),
      id: row.id,
      customer: row.customer,
      email: row.email,
      total: row.total,
      status: row.status as OrderStatus,
      date: row.date,
      items: row.items,
    }));
}

export function listDiscountsForTenant(tenantId: string): DiscountCode[] {
  return getDb()
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.tenantId, tenantId))
    .orderBy(desc(discountCodes.createdAt))
    .all()
    .map((row) => ({
      id: row.id,
      code: row.code,
      kind: row.kind as DiscountKind,
      value: row.value,
      status: row.status as DiscountStatus,
      expiresAt: row.expiresAt ?? undefined,
      maxUses: row.maxUses ?? undefined,
      usedCount: row.usedCount,
    }));
}

export function listAuditEventsForTenant(tenantId: string): AuditEvent[] {
  return getDb()
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.tenantId, tenantId))
    .orderBy(desc(auditEvents.timestamp))
    .all()
    .map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      actor: row.actor,
      action: row.action as AuditAction,
      resource: row.resource as AuditResource,
      target: row.target,
      detail: row.detail ?? undefined,
    }));
}

export function listReviewsForTenant(tenantId: string): Review[] {
  return getDb()
    .select()
    .from(reviews)
    .where(eq(reviews.tenantId, tenantId))
    .orderBy(desc(reviews.submittedAt))
    .all()
    .map((row) => ({
      id: row.id,
      productId: row.productId,
      productName: row.productName,
      customer: row.customer,
      email: row.email,
      rating: row.rating,
      title: row.title,
      body: row.body,
      status: row.status as ReviewStatus,
      submittedAt: row.submittedAt,
    }));
}

export function listReturnRequestsForTenant(tenantId: string): ReturnRequest[] {
  return getDb()
    .select()
    .from(returnRequests)
    .where(eq(returnRequests.tenantId, tenantId))
    .orderBy(desc(returnRequests.requestedAt))
    .all()
    .map((row) => ({
      id: row.id,
      orderId: row.orderId,
      customer: row.customer,
      email: row.email,
      reason: row.reason as ReturnReason,
      note: row.note ?? undefined,
      status: row.status as ReturnStatus,
      requestedAt: row.requestedAt,
      resolvedAt: row.resolvedAt ?? undefined,
      refundAmount: row.refundAmount ?? undefined,
    }));
}

export function listEmailTemplatesForTenant(tenantId: string): EmailTemplate[] {
  return getDb()
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.tenantId, tenantId))
    .orderBy(asc(emailTemplates.name))
    .all()
    .map((row) => ({
      key: row.key as EmailTemplateKey,
      name: row.name,
      description: row.description,
      audience: row.audience as EmailTemplate["audience"],
      subject: row.subject,
      body: row.body,
    }));
}

export function listScheduledReportsForTenant(
  tenantId: string,
): ScheduledReport[] {
  return getDb()
    .select()
    .from(scheduledReports)
    .where(eq(scheduledReports.tenantId, tenantId))
    .orderBy(desc(scheduledReports.createdAt))
    .all()
    .map((row) => ({
      id: row.id,
      name: row.name,
      dataset: row.dataset as ScheduledReportDataset,
      frequency: row.frequency as ScheduledReportFrequency,
      deliveryEmail: row.deliveryEmail,
      enabled: row.enabled,
      lastRunAt: row.lastRunAt ?? undefined,
      createdAt: row.reportCreatedAt,
    }));
}

export function listAdminUsersForTenant(tenantId: string): AdminUser[] {
  return getSqlite()
    .prepare(
      `
        SELECT
          users.id,
          users.name,
          users.email,
          memberships.role,
          memberships.status,
          memberships.last_active
        FROM memberships
        JOIN users ON users.id = memberships.user_id
        WHERE memberships.tenant_id = ?
        ORDER BY
          CASE memberships.role
            WHEN 'Owner' THEN 0
            WHEN 'Admin' THEN 1
            WHEN 'Manager' THEN 2
            WHEN 'Support' THEN 3
            ELSE 4
          END,
          users.name
      `,
    )
    .all(tenantId)
    .map((row) => {
      const user = row as {
        email: string;
        id: string;
        last_active: string;
        name: string;
        role: AdminRole;
        status: AdminUserStatus;
      };
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastActive: user.last_active,
      };
    });
}

export function listInvitationsForTenant(tenantId: string): Invitation[] {
  return getSqlite()
    .prepare(
      `
        SELECT id, email, role, expires_at
        FROM invitations
        WHERE tenant_id = ? AND accepted_at IS NULL
        ORDER BY created_at DESC
      `,
    )
    .all(tenantId)
    .map((row) => {
      const invitation = row as {
        email: string;
        expires_at: string;
        id: string;
        role: AdminRole;
      };
      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitedBy: "Workspace owner",
        expires: formatInvitationExpiry(invitation.expires_at),
      };
    });
}

function safeJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatInvitationExpiry(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  return days === 1 ? "1 day" : `${days} days`;
}
