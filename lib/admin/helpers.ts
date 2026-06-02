import type { Address, Order, OrderPayment, OrderStatus } from "./types";
import { initialProducts } from "./mock-data";

const sampleAddresses: Address[] = [
  {
    line1: "248 Bowery",
    city: "New York",
    region: "NY",
    postalCode: "10012",
    country: "US",
  },
  {
    line1: "1411 Folsom St",
    city: "San Francisco",
    region: "CA",
    postalCode: "94103",
    country: "US",
  },
  {
    line1: "650 W Randolph St",
    city: "Chicago",
    region: "IL",
    postalCode: "60661",
    country: "US",
  },
  {
    line1: "1900 W Sunset Blvd",
    city: "Los Angeles",
    region: "CA",
    postalCode: "90026",
    country: "US",
  },
];

const samplePayments: OrderPayment[] = [
  { method: "card", brand: "Visa", last4: "4242" },
  { method: "card", brand: "Mastercard", last4: "5556" },
  { method: "card", brand: "Amex", last4: "0005" },
  { method: "paypal" },
  { method: "applepay" },
];

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getOrderDetail(order: Order): Required<
  Pick<Order, "subtotal" | "shippingCost" | "tax" | "lineItems" | "timeline" | "shippingAddress" | "billingAddress" | "payment">
> {
  const seed = hashSeed(order.id);
  const address = order.shippingAddress ?? sampleAddresses[seed % sampleAddresses.length];
  const payment = order.payment ?? samplePayments[seed % samplePayments.length];

  let lineItems = order.lineItems;
  if (!lineItems || lineItems.length === 0) {
    const pool = initialProducts.filter((product) => product.status === "Active");
    const count = Math.max(1, Math.min(order.items, 4));
    lineItems = Array.from({ length: count }, (_, index) => {
      const product = pool[(seed + index) % pool.length];
      const qty = index === 0 ? Math.max(1, order.items - (count - 1)) : 1;
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        qty,
        price: product.price,
      };
    });
  }

  const itemsSubtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const subtotal = order.subtotal ?? itemsSubtotal;
  const shippingCost = order.shippingCost ?? Math.max(0, order.total - subtotal - (order.tax ?? 0));
  const tax = order.tax ?? Math.max(0, order.total - subtotal - shippingCost);

  const statusOrder: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];
  const stopIndex =
    order.status === "Refunded"
      ? statusOrder.length
      : Math.max(0, statusOrder.indexOf(order.status));
  const baseTime = new Date(order.date).getTime();
  const timeline =
    order.timeline ??
    statusOrder.slice(0, stopIndex + 1).map((status, index) => ({
      status,
      at: new Date(baseTime + index * 6 * 60 * 60 * 1000).toISOString(),
    }));

  if (order.status === "Refunded" && timeline[timeline.length - 1]?.status !== "Refunded") {
    timeline.push({
      status: "Refunded",
      at: new Date(baseTime + statusOrder.length * 6 * 60 * 60 * 1000).toISOString(),
    });
  }

  return {
    subtotal,
    shippingCost,
    tax,
    lineItems,
    timeline,
    shippingAddress: address,
    billingAddress: order.billingAddress ?? address,
    payment,
  };
}
