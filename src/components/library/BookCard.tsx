import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/types/book";

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/read/${book.id}`}
      className="group overflow-hidden rounded-3xl bg-[rgba(255,250,242,0.86)] shadow-[0_12px_40px_rgba(46,33,18,0.08)] transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[3/4] bg-[#ded4c4]">
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
      <div className="px-4 py-4">
        <h2 className="line-clamp-2 font-serif text-lg text-ink">{book.title}</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink/45">
          {book.page_count} páginas
          {book.is_public ? " · Público" : ""}
        </p>
      </div>
    </Link>
  );
}
