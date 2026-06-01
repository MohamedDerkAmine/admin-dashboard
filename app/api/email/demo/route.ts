import { sendDemoPaymentEmail } from "@/lib/integrations/mailgun";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const customerEmail =
    typeof body.customerEmail === "string"
      ? body.customerEmail
      : "customer@example.com";
  const orderId = typeof body.orderId === "string" ? body.orderId : "DEMO-1001";
  const amount = typeof body.amount === "string" ? body.amount : "$129.00";

  const result = await sendDemoPaymentEmail({
    amount,
    customerEmail,
    orderId,
  });

  return Response.json(result, { status: result.ok ? 200 : 400 });
}
