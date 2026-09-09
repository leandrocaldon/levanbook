import Link from "next/link";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { getCurrentUser } from "@/lib/insforge/server";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function HomePage() {
  const user = await getCurrentUser();
  const t = getDictionary(await getLocale());

  return (
    <section className="grid flex-1 items-center gap-8 py-2 sm:gap-12 sm:py-8 lg:grid-cols-2">
      <div className="max-w-xl">
        <p className="mb-3 text-[0.65rem] uppercase tracking-[0.24em] text-ink/50 sm:text-xs sm:tracking-[0.28em]">
          {t.home.eyebrow}
        </p>
        <h1 className="font-serif text-[2.15rem] leading-[1.12] text-ink sm:text-5xl sm:leading-tight lg:text-6xl">
          {t.home.title}
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-ink/70 sm:mt-5 sm:text-lg sm:leading-8">
          {t.home.description}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
          <Link href={user ? "/library" : "/signup"} className="btn-primary w-full sm:w-auto">
            {user ? t.home.ctaLibrary : t.home.ctaStart}
          </Link>
          <Link href="/try" className="toolbar-btn w-full px-5 py-3 text-center sm:w-auto">
            {t.home.ctaTry}
          </Link>
        </div>
      </div>
      <LandingMotion />
    </section>
  );
}
