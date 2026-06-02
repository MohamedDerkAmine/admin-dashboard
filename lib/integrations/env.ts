export type IntegrationEnv = {
  appUrl: string;
  mailgunApiKey?: string;
  mailgunDomain?: string;
  mailgunFromEmail: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
};

export function getIntegrationEnv(): IntegrationEnv {
  return {
    appUrl: normalizeAppUrl(
      process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL,
    ),
    mailgunApiKey: process.env.MAILGUN_API_KEY,
    mailgunDomain: process.env.MAILGUN_DOMAIN,
    mailgunFromEmail:
      process.env.MAILGUN_FROM_EMAIL ?? "StoreOps <demo@example.com>",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  };
}

function normalizeAppUrl(value?: string) {
  if (!value) {
    return "http://localhost:3000";
  }

  return value.startsWith("http") ? value : `https://${value}`;
}
