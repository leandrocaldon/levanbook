"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge/client";
import { newShareSlug } from "@/lib/share";
import type { Book } from "@/types/book";

export function ShareControls({ book }: { book: Book }) {
  const [isPublic, setIsPublic] = useState(book.is_public);
  const [slug, setSlug] = useState(book.share_slug);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shareUrl = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/b/${slug}` : "";

  async function publish() {
    const nextSlug = slug && /^[A-Za-z0-9]+$/.test(slug) ? slug : newShareSlug();
    const { error: updateError } = await insforge.database
      .from("books")
      .update({ is_public: true, share_slug: nextSlug })
      .eq("id", book.id);

    if (updateError) {
      setError(updateError.message);
      return null;
    }

    setSlug(nextSlug);
    setIsPublic(true);
    return nextSlug;
  }

  async function setPublic(next: boolean) {
    setError(null);
    const { error: updateError } = await insforge.database
      .from("books")
      .update({ is_public: next })
      .eq("id", book.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setIsPublic(next);
  }

  async function copyLink() {
    setBusy(true);
    setError(null);
    const nextSlug = isPublic && slug ? slug : await publish();
    setBusy(false);
    if (!nextSlug) return;

    const url = `${window.location.origin}/b/${nextSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="toolbar-btn" disabled={busy} onClick={() => void copyLink()}>
        {copied ? "Enlace copiado" : busy ? "Creando enlace…" : "Compartir"}
      </button>
      {isPublic ? (
        <button type="button" className="toolbar-btn" onClick={() => void setPublic(false)}>
          Revocar enlace
        </button>
      ) : null}
      {isPublic && shareUrl ? (
        <a href={shareUrl} className="text-xs text-ink/50 underline" target="_blank" rel="noreferrer">
          {shareUrl}
        </a>
      ) : null}
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
