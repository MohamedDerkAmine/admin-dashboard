import "server-only";

import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";

import { getDb, getSqlite } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";

import {
  readSignedSessionToken,
  sessionCookieName,
  sessionCookieOptions,
  sessionMaxAgeSeconds,
  signSessionToken,
} from "./session-cookie";

export type TenantSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  membership: {
    id: string;
    role: string;
    status: string;
  };
};

export async function createSession(userId: string, activeTenantId: string) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + sessionMaxAgeSeconds * 1000,
  ).toISOString();

  getDb()
    .insert(sessions)
    .values({
      tokenHash: hashToken(token),
      userId,
      activeTenantId,
      expiresAt,
      revokedAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    .run();

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookieName,
    signSessionToken(token),
    sessionCookieOptions(),
  );
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = readSignedSessionToken(cookieStore.get(sessionCookieName)?.value);

  if (token) {
    getSqlite()
      .prepare(
        "UPDATE sessions SET revoked_at = ?, updated_at = ? WHERE token_hash = ?",
      )
      .run(new Date().toISOString(), new Date().toISOString(), hashToken(token));
  }

  cookieStore.delete(sessionCookieName);
}

export async function getOptionalTenantSession() {
  const cookieStore = await cookies();
  const token = readSignedSessionToken(cookieStore.get(sessionCookieName)?.value);

  if (!token) {
    return null;
  }

  return getTenantSessionByToken(token);
}

export function getTenantSessionByToken(token: string): TenantSession | null {
  const row = getSqlite()
    .prepare(
      `
        SELECT
          users.id AS user_id,
          users.email AS user_email,
          users.name AS user_name,
          tenants.id AS tenant_id,
          tenants.name AS tenant_name,
          tenants.slug AS tenant_slug,
          memberships.id AS membership_id,
          memberships.role AS membership_role,
          memberships.status AS membership_status
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        JOIN tenants ON tenants.id = sessions.active_tenant_id
        JOIN memberships
          ON memberships.user_id = users.id
         AND memberships.tenant_id = tenants.id
        WHERE sessions.token_hash = ?
          AND sessions.revoked_at IS NULL
          AND sessions.expires_at > ?
          AND memberships.status = 'Active'
        LIMIT 1
      `,
    )
    .get(hashToken(token), new Date().toISOString()) as
    | {
        user_id: string;
        user_email: string;
        user_name: string;
        tenant_id: string;
        tenant_name: string;
        tenant_slug: string;
        membership_id: string;
        membership_role: string;
        membership_status: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    user: {
      id: row.user_id,
      email: row.user_email,
      name: row.user_name,
    },
    tenant: {
      id: row.tenant_id,
      name: row.tenant_name,
      slug: row.tenant_slug,
    },
    membership: {
      id: row.membership_id,
      role: row.membership_role,
      status: row.membership_status,
    },
  };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}
