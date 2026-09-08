import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import type { AuthUser } from "@/types/book";

export async function createInsForgeServerClient() {
  return createServerClient({
    cookies: await cookies(),
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const client = await createInsForgeServerClient();
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) return null;

  const user = data.user as { id?: string; email?: string; name?: string };
  if (!user.id) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
  };
}
