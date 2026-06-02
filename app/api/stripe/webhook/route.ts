import type Stripe from "stripe";

import { sendDemoPaymentEmail } from "@/lib/integrations/mailgun";
import { constructStripeWebhookEvent } from "@/lib/integrations/stripe";

export async function POST(request: Request) {
  const payload = await request.text();
  const verification = constructStripeWebhookEvent({
    payload,
    signature: request.headers.get("stripe-signature"),
  });

  if (!verification.ok) {
    return Response.json({ message: verification.message }, { status: 400 });
  }

  if (verification.event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(verification.event.data.object);
  }

  return Response.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? undefined;

  if (!customerEmail) {
    return;
  }

  await sendDemoPaymentEmail({
    amount: formatStripeAmount(session.amount_total, session.currency),
    customerEmail,
    orderId: session.metadata?.orderId ?? session.id,
  });
}

function formatStripeAmount(amount: number | null, currency: string | null) {
  const resolvedCurrency = currency?.toUpperCase() ?? "USD";

  if (amount === null) {
    return resolvedCurrency;
  }

  return new Intl.NumberFormat("en-US", {
    currency: resolvedCurrency,
    style: "currency",
  }).format(amount / 100);
}
