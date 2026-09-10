"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";

const GENERIC_AUTH_ERROR = "AUTH_GENERIC";
const INVALID_CREDENTIALS = "AUTH_INVALID";

async function auth() {
  return createAuthActions({ cookies: await cookies() });
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const { data, error } = await (
    await auth()
  ).signUp({
    email,
    password,
    name: name || undefined,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (error) {
    return { ok: false, error: GENERIC_AUTH_ERROR, needsVerification: false };
  }

  if (data && "requireEmailVerification" in data && data.requireEmailVerification) {
    return { ok: false, error: null, needsVerification: true, email };
  }

  redirect("/library");
}

export async function verifyEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();

  const { error } = await (await auth()).verifyEmail({ email, otp });
  if (error) {
    return { ok: false, error: GENERIC_AUTH_ERROR };
  }

  redirect("/library");
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await (await auth()).signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  redirect("/library");
}

export async function signOutAction() {
  await (await auth()).signOut();
  redirect("/");
}

export async function resendVerificationAction(email: string) {
  try {
    const client = (await import("@/lib/insforge/server")).createInsForgeServerClient;
    const insforge = await client();
    await insforge.auth.resendVerificationEmail({
      email,
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    });
  } catch {
    // Avoid leaking whether the address exists or if InsForge rate-limited the request.
  }
  return { ok: true };
}
