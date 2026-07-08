import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getOptionalTenantSession } from "./session";

export const getCachedTenantSession = cache(getOptionalTenantSession);

export async function requireTenantSession() {
  const session = await getCachedTenantSession();

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}
