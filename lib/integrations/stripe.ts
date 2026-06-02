import "server-only";

import Stripe from "stripe";

import { getIntegrationEnv } from "@/lib/integrations/env";

export type DemoCheckoutInput = {
  amount: number;
  customerEmail: string;
  orderId: string;
};

export function getStripeClient() {
  const { stripeSecretKey } = getIntegrationEnv();

  if (!stripeSecretKey) {
    return null;
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2026-05-27.dahlia",
  });
}

export async function createDemoCheckoutSession({
  amount,
  customerEmail,
  orderId,
}: DemoCheckoutInput) {
  const stripe = getStripeClient();

  if (!stripe) {
    return {
      ok: false as const,
      message: "Stripe is not configured. Add STRIPE_SECRET_KEY to enable checkout.",
    };
  }

  const { appUrl } = getIntegrationEnv();
  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `StoreOps demo order ${orderId}`,
          },
          unit_amount: Math.max(Math.round(amount * 100), 50),
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId,
    },
    mode: "payment",
    success_url: `${appUrl}/orders?stripe=success&order=${encodeURIComponent(orderId)}`,
    cancel_url: `${appUrl}/orders?stripe=cancelled&order=${encodeURIComponent(orderId)}`,
  });

  if (!session.url) {
    return {
      ok: false as const,
      message: "Stripe did not return a checkout URL.",
    };
  }

  return {
    ok: true as const,
    id: session.id,
    url: session.url,
  };
}

export function constructStripeWebhookEvent({
  payload,
  signature,
}: {
  payload: string;
  signature: string | null;
}) {
  const stripe = getStripeClient();
  const { stripeWebhookSecret } = getIntegrationEnv();

  if (!stripe || !stripeWebhookSecret) {
    return {
      ok: false as const,
      message:
        "Stripe webhook verification is not configured. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
    };
  }

  if (!signature) {
    return {
      ok: false as const,
      message: "Missing stripe-signature header.",
    };
  }

  try {
    return {
      ok: true as const,
      event: stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeWebhookSecret,
      ),
    };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify Stripe webhook signature.",
    };
  }
}
