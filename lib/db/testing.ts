import { randomUUID } from "node:crypto";

import { getDb, withDatabasePathForTest } from "./client";
import { memberships, tenants, users } from "./schema";
import {
  listProductsForTenant,
  seedProductsForTenant,
} from "./tenant-data";

export {
  listProductsForTenant,
  seedProductsForTenant,
  withDatabasePathForTest,
};

export function createTenantWithOwnerForTest({
  ownerEmail,
  ownerName,
  password,
  tenantName,
}: {
  ownerEmail: string;
  ownerName: string;
  password: string;
  tenantName: string;
}) {
  const now = new Date().toISOString();
  const tenant = {
    id: randomUUID(),
    slug: slugify(tenantName),
    name: tenantName,
    createdAt: now,
    updatedAt: now,
  };
  const user = {
    id: randomUUID(),
    name: ownerName,
    email: ownerEmail.toLowerCase(),
    passwordHash: `test:${password}`,
    createdAt: now,
    updatedAt: now,
  };
  const membership = {
    id: randomUUID(),
    userId: user.id,
    tenantId: tenant.id,
    role: "Owner",
    status: "Active",
    lastActive: now,
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  db.insert(tenants).values(tenant).run();
  db.insert(users).values(user).run();
  db.insert(memberships).values(membership).run();

  return { membership, tenant, user };
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
