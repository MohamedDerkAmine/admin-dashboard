import { createDemoCheckoutSession } from "@/lib/integrations/stripe";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const orderId = typeof body.orderId === "string" ? body.orderId : "DEMO-1001";
  const customerEmail =
    typeof body.customerEmail === "string"
      ? body.customerEmail
      : "customer@example.com";
  const amount = typeof body.amount === "number" ? body.amount : 129;

  const result = await createDemoCheckoutSession({
    amount,
    customerEmail,
    orderId,
  });

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: 400 });
  }

  return Response.json({
    id: result.id,
    url: result.url,
  });
}
