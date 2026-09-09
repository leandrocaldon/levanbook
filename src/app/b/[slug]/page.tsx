import { notFound } from "next/navigation";
import { BookViewer } from "@/components/flipbook/BookViewer";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import type { Book } from "@/types/book";

export default async function PublicBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await createInsForgeServerClient();
  const { data, error } = await client.database
    .from("books")
    .select(
      "id, owner_id, title, storage_key, storage_url, cover_key, cover_url, page_count, file_size, share_slug, is_public, created_at",
    )
    .eq("share_slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) notFound();
  const book = data as Book;

  return (
    <section className="flex flex-col gap-5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Lectura compartida</p>
        <h1 className="font-serif text-2xl break-words text-ink sm:text-4xl">{book.title}</h1>
      </div>
      <BookViewer storageKey={book.storage_key} title={book.title} publicSlug={slug} />
    </section>
  );
}
