"use client";

import { useState } from "react";
import { MAX_PDF_BYTES } from "@/lib/constants";
import { PdfFlipBook } from "@/components/flipbook/PdfFlipBook";
import { useLocale } from "@/components/layout/LocaleProvider";

export function LocalViewer() {
  const { t } = useLocale();
  const [source, setSource] = useState<ArrayBuffer | null>(null);
  const [title, setTitle] = useState(t.localViewer.defaultTitle);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    setError(null);
    setSource(null);
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError(t.localViewer.pickPdf);
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError(t.localViewer.tooLarge);
      return;
    }
    setTitle(file.name.replace(/\.pdf$/i, ""));
    setSource(await file.arrayBuffer());
  }

  return (
    <div className="flex flex-col gap-6">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-ink/20 bg-cream/80 px-4 py-6 text-center sm:rounded-3xl sm:px-6 sm:py-8">
        <span className="font-serif text-2xl text-ink">{t.localViewer.title}</span>
        <span className="text-sm text-ink/60">{t.localViewer.hint}</span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
      </label>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {source ? <PdfFlipBook source={source} title={title} /> : null}
    </div>
  );
}
