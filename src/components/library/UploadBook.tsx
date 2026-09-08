"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BOOKS_BUCKET, LARGE_BOOK_PAGES, MAX_PDF_BYTES } from "@/lib/constants";
import { newShareSlug } from "@/lib/share";
import { insforge } from "@/lib/insforge/client";
import { loadPdf, renderCoverBlob } from "@/lib/pdf/engine";

export function UploadBook({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMessage(null);

    if (file.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError("El PDF no puede superar 100 MB.");
      return;
    }

    setBusy(true);
    try {
      setMessage("Leyendo el documento…");
      const buffer = await file.arrayBuffer();
      const pdf = await loadPdf(buffer.slice(0));
      const pageCount = pdf.numPages;
      const cover = await renderCoverBlob(pdf);
      void pdf.cleanup();

      const bookId = crypto.randomUUID();
      const pdfKey = `${userId}/${bookId}/document.pdf`;
      const coverKey = `${userId}/${bookId}/cover.jpg`;

      setMessage("Subiendo el PDF…");
      const uploaded = await insforge.storage.from(BOOKS_BUCKET).upload(pdfKey, file);
      if (uploaded.error) throw new Error(uploaded.error.message);

      const coverUpload = await insforge.storage
        .from(BOOKS_BUCKET)
        .upload(coverKey, new File([cover], "cover.jpg", { type: "image/jpeg" }));
      if (coverUpload.error) throw new Error(coverUpload.error.message);

      const title = file.name.replace(/\.pdf$/i, "");
      const { error: insertError } = await insforge.database.from("books").insert([
        {
          id: bookId,
          owner_id: userId,
          title,
          storage_key: uploaded.data?.key ?? pdfKey,
          storage_url: uploaded.data?.url ?? null,
          cover_key: coverUpload.data?.key ?? coverKey,
          cover_url: coverUpload.data?.url ?? null,
          page_count: pageCount,
          file_size: file.size,
          share_slug: newShareSlug(),
          is_public: false,
        },
      ]);
      if (insertError) throw new Error(insertError.message);

      if (pageCount > LARGE_BOOK_PAGES) {
        setMessage(`Listo. El libro tiene ${pageCount} páginas; el visor las carga poco a poco.`);
      } else {
        setMessage("Documento guardado.");
      }
      router.push(`/read/${bookId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el documento.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="flex cursor-pointer flex-col gap-2 rounded-3xl border border-dashed border-[rgba(46,33,18,0.22)] bg-[rgba(255,250,242,0.7)] px-6 py-8 text-center">
      <span className="font-serif text-2xl text-ink">Añadir un PDF</span>
      <span className="text-sm text-ink/60">Hasta 100 MB. Se guarda en tu biblioteca.</span>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={busy}
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      {busy ? <span className="text-sm text-forest">{message ?? "Trabajando…"}</span> : null}
      {error ? <span className="text-sm text-red-700">{error}</span> : null}
    </label>
  );
}
