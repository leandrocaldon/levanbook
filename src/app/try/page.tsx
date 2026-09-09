import { LocalViewer } from "@/components/flipbook/LocalViewer";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function TryPage() {
  const t = getDictionary(await getLocale());

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-ink/45">{t.try.eyebrow}</p>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">{t.try.title}</h1>
        <p className="mt-2 max-w-xl text-ink/65">{t.try.description}</p>
      </div>
      <LocalViewer />
    </section>
  );
}
