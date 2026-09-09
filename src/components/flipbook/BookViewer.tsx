"use client";

import { useEffect, useState } from "react";
import { BOOKS_BUCKET } from "@/lib/constants";
import { insforge } from "@/lib/insforge/client";
import { PdfFlipBook } from "@/components/flipbook/PdfFlipBook";

type BookViewerProps = {
  storageKey: string;
  title: string;
  publicSlug?: string;
};

export function BookViewer({ storageKey, title, publicSlug }: BookViewerProps) {
  const [source, setSource] = useState<ArrayBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (publicSlug) {
        const response = await fetch(`/api/public/${publicSlug}/pdf`);
        if (!active) return;
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(payload?.error ?? "No se pudo descargar el PDF.");
          return;
        }
        setSource(await response.arrayBuffer());
        return;
      }

      const { data, error: downloadError } = await insforge.storage
        .from(BOOKS_BUCKET)
        .download(storageKey);
      if (!active) return;
      if (downloadError || !data) {
        setError(downloadError?.message ?? "No se pudo descargar el PDF.");
        return;
      }
      setSource(await data.arrayBuffer());
    }
    void load();
    return () => {
      active = false;
    };
  }, [publicSlug, storageKey]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/50 px-5 py-4 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!source) {
    return <p className="text-sm text-ink/60">Preparando el libro…</p>;
  }

  return <PdfFlipBook source={source} title={title} />;
}
