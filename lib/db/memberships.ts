import "server-only";

import { and, eq } from "drizzle-orm";

import type { AdminRole } from "@/lib/admin-data";

import { getDb, getSqlite } from "./client";
import { memberships } from "./schema";

export type UserMembership = {
  membershipId: string;
  role: AdminRole;
  status: string;
  lastActive: string;
  tenant: { id: string; name: string; slug: string };
};

export function listMembershipsForUser(userId: string): UserMembership[] {
  return getSqlite()
    .prepare(
      `
        SELECT
          memberships.id AS membership_id,
          memberships.role AS role,
          memberships.status AS status,
          memberships.last_active AS last_active,
          tenants.id AS tenant_id,
          tenants.name AS tenant_name,
          tenants.slug AS tenant_slug
        FROM memberships
        JOIN tenants ON tenants.id = memberships.tenant_id
        WHERE memberships.user_id = ?
          AND memberships.status = 'Active'
        ORDER BY memberships.last_active DESC, tenants.name
      `,
    )
    .all(userId)
    .map((row) => {
      const entry = row as {
        membership_id: string;
        role: AdminRole;
        status: string;
        last_active: string;
        tenant_id: string;
        tenant_name: string;
        tenant_slug: string;
      };
      return {
        membershipId: entry.membership_id,
        role: entry.role,
        status: entry.status,
        lastActive: entry.last_active,
        tenant: {
          id: entry.tenant_id,
          name: entry.tenant_name,
          slug: entry.tenant_slug,
        },
      };
    });
}

export function hasActiveMembership({
  userId,
  tenantId,
}: {
  userId: string;
  tenantId: string;
}): boolean {
  const row = getDb()
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.tenantId, tenantId),
        eq(memberships.status, "Active"),
      ),
    )
    .limit(1)
    .all()[0];
  return Boolean(row);
}

export function touchMembershipLastActive({
  userId,
  tenantId,
}: {
  userId: string;
  tenantId: string;
}) {
  const now = new Date().toISOString();
  getDb()
    .update(memberships)
    .set({ lastActive: now, updatedAt: now })
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.tenantId, tenantId),
      ),
    )
    .run();
}
