import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n";
import type { Book } from "@/types/book";

export async function BookCard({ book }: { book: Book }) {
  const t = getDictionary(await getLocale());

  return (
    <Link
      href={`/read/${book.id}`}
      className="group overflow-hidden rounded-2xl bg-cream shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 sm:rounded-3xl"
    >
      <div className="relative aspect-[3/4] bg-paper">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 240px"
            unoptimized
          />
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
  );
}
