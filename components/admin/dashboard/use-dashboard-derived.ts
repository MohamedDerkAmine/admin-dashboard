"use client";

import { useMemo } from "react";

import type {
  Customer,
  Order,
  Product,
} from "@/lib/admin-data";
import { filterByQuery, paginate } from "@/components/admin/utils";

export function useDashboardDerived({
  products,
  orders,
  customers,
  query,
  statusFilter,
  categoryFilter,
  page,
}: {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  query: string;
  statusFilter: string;
  categoryFilter: string;
  page: number;
}) {
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeProducts = products.filter(
    (product) => product.status === "Active",
  ).length;
  const lowStock = products.filter((product) => product.stock <= 10).length;
  const pendingOrders = orders.filter(
    (order) => order.status === "Pending",
  ).length;

  const filteredProducts = useMemo(() => {
    const bySearch = filterByQuery(
      products,
      query,
      (product) =>
        `${product.name} ${product.sku} ${product.category} ${product.status}`,
    );

    return bySearch.filter((product) => {
      const matchesStatus =
        statusFilter === "All" || product.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      return matchesStatus && matchesCategory;
    });
  }, [products, query, statusFilter, categoryFilter]);

  const filteredOrders = useMemo(() => {
    const bySearch = filterByQuery(
      orders,
      query,
      (order) => `${order.id} ${order.customer} ${order.email} ${order.status}`,
    );

    return bySearch.filter(
      (order) => statusFilter === "All" || order.status === statusFilter,
    );
  }, [orders, query, statusFilter]);

  const filteredCustomers = useMemo(
    () =>
      filterByQuery(
        customers,
        query,
        (customer) => `${customer.name} ${customer.email} ${customer.segment}`,
      ),
    [customers, query],
  );

  const productPage = paginate(filteredProducts, page);
  const orderPage = paginate(filteredOrders, page);
  const customerPage = paginate(filteredCustomers, page);

  return {
    revenue,
    activeProducts,
    lowStock,
    pendingOrders,
    filteredProducts,
    filteredOrders,
    filteredCustomers,
    productPage,
    orderPage,
    customerPage,
  };
}
