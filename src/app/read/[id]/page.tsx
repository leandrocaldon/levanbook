import { notFound, redirect } from "next/navigation";
import { BookViewer } from "@/components/flipbook/BookViewer";
import { ShareControls } from "@/components/library/ShareControls";
import { createInsForgeServerClient, getCurrentUser } from "@/lib/insforge/server";
import type { Book } from "@/types/book";

export default async function ReadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const client = await createInsForgeServerClient();
  const { data, error } = await client.database
    .from("books")
    .select(
      "id, owner_id, title, storage_key, storage_url, cover_key, cover_url, page_count, file_size, share_slug, is_public, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const book = data as Book;
  if (book.owner_id !== user.id) notFound();

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Lectura</p>
          <h1 className="font-serif text-2xl break-words text-ink sm:text-4xl">{book.title}</h1>
        </div>
        <ShareControls book={book} />
      </div>
      <BookViewer storageKey={book.storage_key} title={book.title} />
    </section>
  );
}
