import { createAdminClient } from "@insforge/sdk";

export function createInsForgeAdminClient() {
  const baseUrl = process.env.INSFORGE_URL ?? process.env.NEXT_PUBLIC_INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Faltan INSFORGE_URL e INSFORGE_API_KEY en el servidor.");
  }

  return createAdminClient({ baseUrl, apiKey });
}
