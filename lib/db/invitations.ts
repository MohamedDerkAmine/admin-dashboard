import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";

import type { AdminRole, Invitation } from "@/lib/admin-data";
import { hashToken } from "@/lib/auth/session";

import { getDb, getSqlite } from "./client";
import { invitations, memberships, tenants, users } from "./schema";

export type InvitationPreview = {
  invitationId: string;
  email: string;
  role: AdminRole;
  expiresAt: string;
  tenant: { id: string; name: string; slug: string };
  alreadyMember: boolean;
};

export function createInvitation({
  tenantId,
  email,
  role,
  expiresInDays = 7,
}: {
  tenantId: string;
  email: string;
  role: AdminRole;
  expiresInDays?: number;
}): { invitation: Invitation; token: string } {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }
  if (role === "Owner") {
    throw new Error("Owners cannot be added via invitation.");
  }

  // Reject if the email already has an active membership on this tenant
  const existingMembership = getSqlite()
    .prepare(
      `
        SELECT memberships.id
        FROM memberships
        JOIN users ON users.id = memberships.user_id
        WHERE memberships.tenant_id = ?
          AND lower(users.email) = ?
        LIMIT 1
      `,
    )
    .get(tenantId, normalizedEmail) as { id: string } | undefined;

  if (existingMembership) {
    throw new Error("This email already belongs to the workspace.");
  }

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + expiresInDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const token = randomBytes(24).toString("base64url");
  const id = randomUUID();

  getDb()
    .insert(invitations)
    .values({
      id,
      tenantId,
      email: normalizedEmail,
      role,
      tokenHash: hashToken(token),
      expiresAt,
      acceptedAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    .run();

  return {
    invitation: {
      id,
      email: normalizedEmail,
      role,
      invitedBy: "Workspace owner",
      expires: formatExpiry(expiresAt),
    },
    token,
  };
}

export function revokeInvitation({
  tenantId,
  invitationId,
}: {
  tenantId: string;
  invitationId: string;
}): boolean {
  const result = getDb()
    .delete(invitations)
    .where(
      and(
        eq(invitations.tenantId, tenantId),
        eq(invitations.id, invitationId),
      ),
    )
    .run();
  return result.changes > 0;
}

export function getInvitationByToken(
  token: string,
): InvitationPreview | null {
  const tokenHash = hashToken(token);
  const row = getSqlite()
    .prepare(
      `
        SELECT
          invitations.id AS invitation_id,
          invitations.email AS email,
          invitations.role AS role,
          invitations.expires_at AS expires_at,
          invitations.accepted_at AS accepted_at,
          tenants.id AS tenant_id,
          tenants.name AS tenant_name,
          tenants.slug AS tenant_slug
        FROM invitations
        JOIN tenants ON tenants.id = invitations.tenant_id
        WHERE invitations.token_hash = ?
        LIMIT 1
      `,
    )
    .get(tokenHash) as
    | {
        invitation_id: string;
        email: string;
        role: string;
        expires_at: string;
        accepted_at: string | null;
        tenant_id: string;
        tenant_name: string;
        tenant_slug: string;
      }
    | undefined;

  if (!row) return null;
  if (row.accepted_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  const existingMembership = getSqlite()
    .prepare(
      `
        SELECT memberships.id
        FROM memberships
        JOIN users ON users.id = memberships.user_id
        WHERE memberships.tenant_id = ?
          AND lower(users.email) = ?
        LIMIT 1
      `,
    )
    .get(row.tenant_id, row.email.toLowerCase()) as { id: string } | undefined;

  return {
    invitationId: row.invitation_id,
    email: row.email,
    role: row.role as AdminRole,
    expiresAt: row.expires_at,
    tenant: {
      id: row.tenant_id,
      name: row.tenant_name,
      slug: row.tenant_slug,
    },
    alreadyMember: Boolean(existingMembership),
  };
}

export function acceptInvitation({
  token,
  userId,
}: {
  token: string;
  userId: string;
}): { tenantId: string; membershipId: string } | null {
  const tokenHash = hashToken(token);
  const invitation = getDb()
    .select()
    .from(invitations)
    .where(eq(invitations.tokenHash, tokenHash))
    .limit(1)
    .all()[0];

  if (!invitation) return null;
  if (invitation.acceptedAt) return null;
  if (new Date(invitation.expiresAt).getTime() < Date.now()) return null;

  const user = getDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .all()[0];

  if (!user) return null;

  // Reject if the invitation email doesn't match the signed-in user
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("This invitation is for a different email address.");
  }

  const now = new Date().toISOString();
  const membershipId = randomUUID();

  const sqlite = getSqlite();
  const runTx = sqlite.transaction(() => {
    // Upsert membership (idempotent if user is already a member)
    const existing = getDb()
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.tenantId, invitation.tenantId),
        ),
      )
      .limit(1)
      .all()[0];

    if (existing) {
      getDb()
        .update(memberships)
        .set({
          role: invitation.role,
          status: "Active",
          lastActive: now,
          updatedAt: now,
        })
        .where(eq(memberships.id, existing.id))
        .run();
    } else {
      getDb()
        .insert(memberships)
        .values({
          id: membershipId,
          userId,
          tenantId: invitation.tenantId,
          role: invitation.role,
          status: "Active",
          lastActive: now,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    getDb()
      .update(invitations)
      .set({ acceptedAt: now, updatedAt: now })
      .where(eq(invitations.id, invitation.id))
      .run();
  });

  runTx();

  return {
    tenantId: invitation.tenantId,
    membershipId: membershipId,
  };
}

export function tenantExists(tenantId: string): boolean {
  return (
    getDb()
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1)
      .all().length > 0
  );
}

function formatExpiry(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  return days === 1 ? "1 day" : `${days} days`;
}
