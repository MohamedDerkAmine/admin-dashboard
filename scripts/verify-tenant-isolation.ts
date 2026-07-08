import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createTenantWithOwnerForTest,
  listProductsForTenant,
  seedProductsForTenant,
  withDatabasePathForTest,
} from "../lib/db/testing";

const tempDir = mkdtempSync(join(tmpdir(), "storeops-tenant-test-"));
const dbPath = join(tempDir, "storeops.sqlite");

try {
  withDatabasePathForTest(dbPath, () => {
    const alpha = createTenantWithOwnerForTest({
      tenantName: "Alpha Outfitters",
      ownerName: "Alpha Owner",
      ownerEmail: "owner@alpha.test",
      password: "correct horse battery staple",
    });
    const beta = createTenantWithOwnerForTest({
      tenantName: "Beta Outfitters",
      ownerName: "Beta Owner",
      ownerEmail: "owner@beta.test",
      password: "correct horse battery staple",
    });

    seedProductsForTenant(alpha.tenant.id, [
      {
        id: "prd-shared",
        name: "Shared Catalog Item",
        sku: "ALPHA-SHARED",
        category: "Apparel",
        price: 49,
        stock: 12,
        status: "Active",
        imageUrl: "/window.svg",
      },
    ]);
    seedProductsForTenant(beta.tenant.id, [
      {
        id: "prd-shared",
        name: "Shared Catalog Item",
        sku: "BETA-SHARED",
        category: "Apparel",
        price: 59,
        stock: 3,
        status: "Draft",
        imageUrl: "/window.svg",
      },
    ]);

    const alphaProducts = listProductsForTenant(alpha.tenant.id);
    const betaProducts = listProductsForTenant(beta.tenant.id);

    assert.equal(alphaProducts.length, 1);
    assert.equal(betaProducts.length, 1);
    assert.equal(alphaProducts[0]?.sku, "ALPHA-SHARED");
    assert.equal(betaProducts[0]?.sku, "BETA-SHARED");
    assert.notEqual(alphaProducts[0]?.tenantId, betaProducts[0]?.tenantId);
  });
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
