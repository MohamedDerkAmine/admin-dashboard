import { createHmac, timingSafeEqual } from "node:crypto";

export const sessionCookieName = "storeops_session";
export const sessionMaxAgeSeconds = 60 * 60 * 24 * 14;

export function signSessionToken(token: string) {
  return `${token}.${createSignature(token)}`;
}

export function readSignedSessionToken(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [token, signature, extra] = value.split(".");
  if (!token || !signature || extra) {
    return null;
  }

  const expected = createSignature(token);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer) ? token : null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function createSignature(token: string) {
  return createHmac("sha256", getSessionSecret()).update(token).digest("base64url");
}

function getSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }

  return "storeops-local-development-session-secret";
}
