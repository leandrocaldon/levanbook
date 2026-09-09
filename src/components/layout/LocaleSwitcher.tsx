"use client";

import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/dictionaries";
import { useLocale } from "./LocaleProvider";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const { t } = useLocale();

  async function switchTo(next: Locale) {
    if (next === locale) return;
    await setLocaleAction(next);
    router.refresh();
  }

  return (
    <div
      className="flex shrink-0 items-center rounded-full border border-ink/15 bg-cream/60 p-0.5 text-xs"
      role="group"
      aria-label={locale === "es" ? t.header.switchToEn : t.header.switchToEs}
    >
      <button
        type="button"
        className={`min-w-8 rounded-full px-2 py-1 transition ${
          locale === "es" ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
        }`}
        aria-pressed={locale === "es"}
        onClick={() => void switchTo("es")}
      >
        ES
      </button>
      <button
        type="button"
        className={`min-w-8 rounded-full px-2 py-1 transition ${
          locale === "en" ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
        }`}
        aria-pressed={locale === "en"}
        onClick={() => void switchTo("en")}
      >
        EN
      </button>
    </div>
  );
}
