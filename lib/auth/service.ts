import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import type { AdminRole } from "@/lib/admin-data";
import { getDb, getSqlite } from "@/lib/db/client";
import { memberships, tenants, users } from "@/lib/db/schema";
import { seedTenantDemoData } from "@/lib/db/seed";

import { hashPassword, verifyPassword } from "./password";

type BootstrapInput = {
  ownerEmail: string;
  ownerName: string;
  password: string;
  seedDemoData: boolean;
  tenantName: string;
};

type SignupInput = {
  ownerEmail: string;
  ownerName: string;
  password: string;
  seedDemoData: boolean;
  tenantName: string;
};

export function isBootstrapped() {
  const row = getSqlite()
    .prepare(
      "SELECT (SELECT COUNT(*) FROM tenants) AS tenants_count, (SELECT COUNT(*) FROM users) AS users_count",
    )
    .get() as { tenants_count: number; users_count: number };

  return row.tenants_count > 0 && row.users_count > 0;
}

export async function createBootstrapTenantOwner(input: BootstrapInput) {
  if (isBootstrapped()) {
    throw new Error("Onboarding is already complete.");
  }

  return createTenantWithOwner(input);
}

export async function createPublicSignup(input: SignupInput) {
  const email = normalizeEmail(input.ownerEmail);
  const existing = getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .all()[0];

  if (existing) {
    throw new Error(
      "An account already exists for that email. Sign in to create another workspace.",
    );
  }

  return createTenantWithOwner(input);
}

async function createTenantWithOwner(input: SignupInput) {
  const email = normalizeEmail(input.ownerEmail);
  const passwordHash = await hashPassword(input.password);
  const now = new Date().toISOString();
  const tenant = {
    id: randomUUID(),
    slug: uniqueSlug(input.tenantName),
    name: input.tenantName.trim(),
    createdAt: now,
    updatedAt: now,
  };
  const user = {
    id: randomUUID(),
    name: input.ownerName.trim(),
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };
  const membership = {
    id: randomUUID(),
    userId: user.id,
    tenantId: tenant.id,
    role: "Owner" satisfies AdminRole,
    status: "Active",
    lastActive: now,
    createdAt: now,
    updatedAt: now,
  };

  const sqlite = getSqlite();
  const create = sqlite.transaction(() => {
    getDb().insert(tenants).values(tenant).run();
    getDb().insert(users).values(user).run();
    getDb().insert(memberships).values(membership).run();
    if (input.seedDemoData) {
      seedTenantDemoData(tenant.id, {
        ownerEmail: user.email,
        ownerName: user.name,
        ownerUserId: user.id,
      });
    }
  });
  create();

  return { membership, tenant, user };
}

export async function authenticateUser(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  const user = getDb()
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .all()[0];

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  const activeMembership = getDb()
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, user.id),
        eq(memberships.status, "Active"),
      ),
    )
    .orderBy(desc(memberships.lastActive))
    .limit(1)
    .all()[0];

  if (!activeMembership) {
    return null;
  }

  return {
    activeTenantId: activeMembership.tenantId,
    userId: user.id,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function uniqueSlug(name: string) {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "workspace";

  let slug = base;
  let suffix = 2;
  while (
    getDb().select().from(tenants).where(eq(tenants.slug, slug)).limit(1).all()
      .length > 0
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}
