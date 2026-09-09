import { redirect } from "next/navigation";
import { BookCard } from "@/components/library/BookCard";
import { UploadBook } from "@/components/library/UploadBook";
import { createInsForgeServerClient, getCurrentUser } from "@/lib/insforge/server";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Book } from "@/types/book";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = getDictionary(await getLocale());
  const client = await createInsForgeServerClient();
  const { data, error } = await client.database
    .from("books")
    .select(
      "id, owner_id, title, storage_key, storage_url, cover_key, cover_url, page_count, file_size, share_slug, is_public, created_at",
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const books = (data ?? []) as Book[];

  return (
    <section className="flex flex-col gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-ink/45">{t.library.eyebrow}</p>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">{t.library.title}</h1>
        <p className="mt-2 text-ink/65">{t.library.greeting(user.name)}</p>
      </div>
      <UploadBook userId={user.id} />
      {error ? <p className="text-sm text-red-400">{error.message}</p> : null}
      {books.length === 0 ? (
        <p className="text-ink/55">{t.library.empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}
