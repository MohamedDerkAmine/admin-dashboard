import "server-only";

import { render } from "@react-email/render";

import {
  OrderPaymentReceipt,
  type OrderPaymentReceiptProps,
} from "@/emails/order-payment-receipt";
import { getIntegrationEnv } from "@/lib/integrations/env";

export type MailgunResult =
  | {
      ok: true;
      id?: string;
      mode: "sent";
      message: string;
    }
  | {
      ok: true;
      mode: "skipped";
      message: string;
      previewHtml: string;
    }
  | {
      ok: false;
      mode: "failed";
      message: string;
    };

export async function sendDemoPaymentEmail(
  receipt: OrderPaymentReceiptProps,
): Promise<MailgunResult> {
  const { mailgunApiKey, mailgunDomain, mailgunFromEmail } =
    getIntegrationEnv();
  const html = await render(<OrderPaymentReceipt {...receipt} />);

  if (!mailgunApiKey || !mailgunDomain) {
    return {
      ok: true,
      mode: "skipped",
      message:
        "Mailgun is not configured. Add MAILGUN_API_KEY and MAILGUN_DOMAIN to send this email.",
      previewHtml: html,
    };
  }

  const form = new FormData();
  form.set("from", mailgunFromEmail);
  form.set("to", receipt.customerEmail);
  form.set("subject", `Payment received for ${receipt.orderId}`);
  form.set("html", html);

  const response = await fetch(
    `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
    {
      body: form,
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString(
          "base64",
        )}`,
      },
      method: "POST",
    },
  ).catch((error: unknown) => ({
    ok: false,
    json: async () => ({
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach Mailgun.",
    }),
  }));

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };

  if (!response.ok) {
    return {
      ok: false,
      mode: "failed",
      message: payload.message ?? "Mailgun rejected the email request.",
    };
  }

  return {
    ok: true,
    id: payload.id,
    mode: "sent",
    message: payload.message ?? "Mailgun accepted the demo email.",
  };
}
