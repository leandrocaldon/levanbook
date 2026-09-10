import { notFound } from "next/navigation";
import { BookViewer } from "@/components/flipbook/BookViewer";
import { createInsForgeAdminClient } from "@/lib/insforge/admin";
import { getDictionary, getLocale } from "@/lib/i18n";
import { isShareSlug } from "@/lib/share";

export default async function PublicBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isShareSlug(slug)) notFound();

  const t = getDictionary(await getLocale());
  const admin = createInsForgeAdminClient();
  const { data, error } = await admin.database
    .from("books")
    .select("title")
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data?.title) notFound();

  return (
    <section className="flex flex-col gap-5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-ink/45">{t.publicRead.eyebrow}</p>
        <h1 className="font-serif text-2xl break-words text-ink sm:text-4xl">{data.title}</h1>
      </div>
      <BookViewer title={data.title} publicSlug={slug} />
    </section>
  );
}
