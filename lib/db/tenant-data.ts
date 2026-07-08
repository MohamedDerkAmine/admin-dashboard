import { and, desc, eq } from "drizzle-orm";

import type { Product } from "@/lib/admin-data";

import { getDb } from "./client";
import { products } from "./schema";

export type TenantProduct = Product & {
  tenantId: string;
};

export function listProductsForTenant(tenantId: string): TenantProduct[] {
  return getDb()
    .select()
    .from(products)
    .where(eq(products.tenantId, tenantId))
    .orderBy(desc(products.createdAt))
    .all()
    .map((row) => ({
      tenantId: row.tenantId,
      id: row.id,
      name: row.name,
      sku: row.sku,
      category: row.category,
      price: row.price,
      stock: row.stock,
      status: row.status as Product["status"],
      imageUrl: row.imageUrl,
    }));
}

export function seedProductsForTenant(tenantId: string, entries: Product[]) {
  const now = new Date().toISOString();
  if (entries.length === 0) {
    return;
  }

  getDb()
    .insert(products)
    .values(
      entries.map((entry) => ({
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

export function upsertProductForTenant(tenantId: string, entry: Product) {
  const now = new Date().toISOString();
  getDb()
    .insert(products)
    .values({
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
    })
    .onConflictDoUpdate({
      target: [products.tenantId, products.id],
      set: {
        name: entry.name,
        sku: entry.sku,
        category: entry.category,
        price: entry.price,
        stock: entry.stock,
        status: entry.status,
        imageUrl: entry.imageUrl,
        updatedAt: now,
      },
    })
    .run();
}

export function deleteProductForTenant(tenantId: string, productId: string) {
  getDb()
    .delete(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.id, productId)))
    .run();
}
