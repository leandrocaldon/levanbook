"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { getPageAspect, loadPdf, renderPageToCanvas } from "@/lib/pdf/engine";
import "page-flip/src/Style/stPageFlip.css";

type PdfFlipBookProps = {
  source: ArrayBuffer;
  title?: string;
};

const RENDER_WINDOW = 3;

export function PdfFlipBook({ source, title }: PdfFlipBookProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pageNodesRef = useRef<HTMLElement[]>([]);
  const flipRef = useRef<import("page-flip").PageFlip | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const rendered = useRef(new Set<number>());
  const [pageCount, setPageCount] = useState(0);
  const [current, setCurrent] = useState(1);
  const [status, setStatus] = useState("Abriendo el documento…");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const paintNearby = useCallback(async (index: number) => {
    const pdf = pdfRef.current;
    const nodes = pageNodesRef.current;
    if (!pdf || nodes.length === 0) return;

    const start = Math.max(1, index - RENDER_WINDOW);
    const end = Math.min(pdf.numPages, index + RENDER_WINDOW);

    for (let page = start; page <= end; page += 1) {
      if (rendered.current.has(page)) continue;
      const node = nodes[page - 1];
      const image = node?.querySelector("img");
      if (!image) continue;

      const canvas = document.createElement("canvas");
      await renderPageToCanvas(pdf, page, canvas, 900);
      image.src = canvas.toDataURL("image/jpeg", 0.88);
      image.alt = `Página ${page}`;
      rendered.current.add(page);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const host = document.createElement("div");
    host.className = "flip-host";

    async function setup() {
      const stage = stageRef.current;
      if (!stage) return;

      try {
        setReady(false);
        setError(null);
        setStatus("Leyendo páginas…");
        const pdf = await loadPdf(source.slice(0));
        if (cancelled) return;
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);

        const aspect = await getPageAspect(pdf);
        const nodes: HTMLElement[] = [];
        for (let i = 1; i <= pdf.numPages; i += 1) {
          const page = document.createElement("div");
          page.className = "flip-page";
          page.dataset.density = i === 1 || i === pdf.numPages ? "hard" : "soft";
          page.innerHTML = `<img class="flip-page-image" alt="Página ${i}" />`;
          nodes.push(page);
        }
        pageNodesRef.current = nodes;
        rendered.current.clear();

        await paintNearby(1);
        if (cancelled) return;

        stage.innerHTML = "";
        stage.appendChild(host);

        const { PageFlip } = await import("page-flip");
        if (cancelled) return;

        const narrow = stage.clientWidth < 640;
        const pageAspect = aspect.height / aspect.width;
        const pageWidth = narrow
          ? Math.max(150, stage.clientWidth - 12)
          : Math.min(460, Math.max(240, stage.clientWidth / 2 - 16));
        const pageHeight = pageWidth * pageAspect;

        const flip = new PageFlip(host, {
          width: Math.round(pageWidth),
          height: Math.round(pageHeight),
          size: "stretch",
          minWidth: narrow ? 140 : 240,
          maxWidth: narrow ? 420 : 560,
          minHeight: narrow ? 200 : 320,
          maxHeight: narrow ? 720 : 820,
          drawShadow: true,
          flippingTime: 700,
          usePortrait: true,
          startZIndex: 0,
          autoSize: true,
          maxShadowOpacity: 0.55,
          showCover: true,
          mobileScrollSupport: true,
          useMouseEvents: true,
          showPageCorners: true,
        });

        flip.loadFromHTML(nodes);
        flip.on("flip", (event) => {
          const next = Number(event.data) + 1;
          setCurrent(next);
          void paintNearby(next);
        });

        flipRef.current = flip;
        if (!cancelled) {
          setReady(true);
          setStatus("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo abrir el PDF.");
        }
      }
    }

    void setup();

    return () => {
      cancelled = true;
      try {
        flipRef.current?.destroy();
      } catch {
        host.remove();
      }
      flipRef.current = null;
      pageNodesRef.current = [];
      void pdfRef.current?.cleanup();
      pdfRef.current = null;
    };
  }, [source, paintNearby]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") flipRef.current?.flipNext();
      if (event.key === "ArrowLeft") flipRef.current?.flipPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function toggleFullscreen() {
    const node = stageRef.current?.parentElement;
    if (!node) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await node.requestFullscreen();
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/50 px-5 py-4 text-sm text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-cream/90 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0">
          <p className="truncate font-serif text-base text-ink sm:text-lg">{title ?? "Documento"}</p>
          <p className="text-xs tracking-wide text-ink/55">
            {ready ? `Página ${current} de ${pageCount}` : status}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
          <button type="button" className="toolbar-btn min-h-11 w-full justify-center px-2 text-xs sm:w-auto sm:text-sm" onClick={() => flipRef.current?.flipPrev()}>
            Anterior
          </button>
          <button type="button" className="toolbar-btn min-h-11 w-full justify-center px-2 text-xs sm:w-auto sm:text-sm" onClick={() => flipRef.current?.flipNext()}>
            Siguiente
          </button>
          <button type="button" className="toolbar-btn min-h-11 w-full justify-center px-2 text-xs sm:w-auto sm:text-sm" onClick={() => void toggleFullscreen()}>
            <span className="sm:hidden">Pantalla</span>
            <span className="hidden sm:inline">Pantalla completa</span>
          </button>
        </div>
      </div>
      <div className="flip-stage">
        <div ref={stageRef} className="flip-mount" />
      </div>
    </div>
  );
}
