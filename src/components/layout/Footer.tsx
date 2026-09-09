import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

const LEVAN_SOLUTION_URL = "https://levansolution.com/";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ink/10 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-5">
        <p className="text-center text-xs leading-relaxed text-ink/45">
          © {year} · {t.footer.madeByPrefix}{" "}
          <a
            href={LEVAN_SOLUTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink/60 underline decoration-ink/25 underline-offset-2 transition hover:text-ink hover:decoration-ink/50"
          >
            {t.footer.brand}
          </a>{" "}
          · {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
