"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteOwnedBook, type DeletableBook } from "@/lib/books/delete";
import { useLocale } from "@/components/layout/LocaleProvider";

export function DeleteBookButton({
  book,
  afterDelete = "refresh",
  variant = "overlay",
}: {
  book: DeletableBook & { title: string };
  afterDelete?: "refresh" | "library";
  variant?: "overlay" | "toolbar";
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    if (!window.confirm(t.delete.confirm(book.title))) return;

    setBusy(true);
    setError(null);
    try {
      await deleteOwnedBook(book);
      if (afterDelete === "library") {
        router.push("/library");
      }
      router.refresh();
    } catch {
      setError(t.delete.failed);
      setBusy(false);
    }
  }

  const className =
    variant === "overlay"
      ? "rounded-full bg-paper/90 px-3 py-1 text-xs text-ink shadow-sm hover:bg-red-900/80 disabled:opacity-60"
      : "toolbar-btn hover:border-red-400/50 hover:text-red-200";

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" className={className} disabled={busy} onClick={(event) => void onDelete(event)}>
        {busy ? t.delete.deleting : t.delete.action}
      </button>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </span>
  );
}
