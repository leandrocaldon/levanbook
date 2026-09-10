export function getInsForgePublicOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function getInsForgeImageHostname(): string | null {
  const origin = getInsForgePublicOrigin();
  if (!origin) return null;
  return new URL(origin).hostname;
}
