import Link from "next/link";
import { BookCover } from "@/components/library/BookCover";
import { DeleteBookButton } from "@/components/library/DeleteBookButton";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Book } from "@/types/book";

export async function BookCard({ book }: { book: Book }) {
  const t = getDictionary(await getLocale());

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-cream shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 sm:rounded-3xl">
      <div className="absolute right-2 top-2 z-10">
        <DeleteBookButton book={book} />
      </div>
      <Link href={`/read/${book.id}`} className="block">
        <div className="relative aspect-[3/4] bg-paper">
          {book.cover_key ? (
            <BookCover coverKey={book.cover_key} title={book.title} />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center font-serif text-xl text-ink/50">
              {book.title}
            </div>
          )}
        </div>
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <h2 className="line-clamp-2 font-serif text-base text-ink sm:text-lg">{book.title}</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/45">
            {t.bookCard.pages(book.page_count)}
            {book.is_public ? t.bookCard.public : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
