import { cookies } from "next/headers";
import { getDictionary, type Locale } from "./dictionaries";

export type { Dictionary, Locale } from "./dictionaries";
export { getDictionary };

export const LOCALE_COOKIE = "levanbook_locale";
export const defaultLocale: Locale = "es";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "es";
}
