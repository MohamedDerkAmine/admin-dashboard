import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type OrderPaymentReceiptProps = {
  amount: string;
  customerEmail: string;
  orderId: string;
};

export function OrderPaymentReceipt({
  amount,
  customerEmail,
  orderId,
}: OrderPaymentReceiptProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment received for {orderId}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.eyebrow}>StoreOps</Text>
          <Heading style={styles.heading}>Payment received</Heading>
          <Text style={styles.copy}>
            A demo payment was recorded for order {orderId}.
          </Text>
          <Section style={styles.summary}>
            <Text style={styles.row}>
              <strong>Order:</strong> {orderId}
            </Text>
            <Text style={styles.row}>
              <strong>Amount:</strong> {amount}
            </Text>
            <Text style={styles.row}>
              <strong>Customer:</strong> {customerEmail}
            </Text>
          </Section>
          <Text style={styles.footer}>
            This is a demonstration email generated from the StoreOps admin
            dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f7f9",
    color: "#16181d",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: 0,
  },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    margin: "32px auto",
    padding: "28px",
    width: "520px",
  },
  copy: {
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: "22px",
  },
  eyebrow: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: "0 0 12px",
    textTransform: "uppercase" as const,
  },
  footer: {
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "20px 0 0",
  },
  heading: {
    color: "#111827",
    fontSize: "24px",
    lineHeight: "30px",
    margin: "0 0 12px",
  },
  row: {
    color: "#111827",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0 0 8px",
  },
  summary: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    marginTop: "20px",
    padding: "16px",
  },
};
