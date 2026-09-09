import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function NotFound() {
  const t = getDictionary(await getLocale());

  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-4 py-16">
      <h1 className="font-serif text-4xl text-ink">{t.notFound.title}</h1>
      <p className="text-ink/65">{t.notFound.description}</p>
      <Link href="/" className="btn-primary">
        {t.notFound.back}
      </Link>
    </div>
  );
}
