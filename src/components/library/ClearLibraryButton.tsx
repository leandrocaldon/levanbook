"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteOwnedBook, type DeletableBook } from "@/lib/books/delete";
import { useLocale } from "@/components/layout/LocaleProvider";

export function ClearLibraryButton({ books }: { books: DeletableBook[] }) {
  const router = useRouter();
  const { t } = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClear() {
    if (busy || books.length === 0) return;
    if (!window.confirm(t.delete.confirmAll)) return;

    setBusy(true);
    setError(null);
    try {
      for (const book of books) {
        await deleteOwnedBook(book);
      }
      router.refresh();
    } catch {
      setError(t.delete.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="toolbar-btn" disabled={busy} onClick={() => void onClear()}>
        {busy ? t.delete.deleting : t.delete.clearAll}
      </button>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </div>
  );
}
