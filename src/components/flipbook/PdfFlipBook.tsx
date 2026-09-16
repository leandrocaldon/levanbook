"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { getPageAspect, loadPdf, renderPageToCanvas } from "@/lib/pdf/engine";
import { useLocale } from "@/components/layout/LocaleProvider";
import "page-flip/src/Style/stPageFlip.css";

type PdfFlipBookProps = {
  source: ArrayBuffer;
  title?: string;
};

type LoadPhase = "opening" | "reading" | "ready";

const RENDER_WINDOW = 3;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundZoom(value: number) {
  return Math.round(value * 100) / 100;
}

export function PdfFlipBook({ source, title }: PdfFlipBookProps) {
  const { t } = useLocale();
  const shellRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pageNodesRef = useRef<HTMLElement[]>([]);
  const flipRef = useRef<import("page-flip").PageFlip | null>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const rendered = useRef(new Set<string>());
  const zoomRef = useRef(MIN_ZOOM);
  const panRef = useRef({ x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef<number | null>(null);
  const panningRef = useRef(false);
  const [pageCount, setPageCount] = useState(0);
  const [current, setCurrent] = useState(1);
  const [phase, setPhase] = useState<LoadPhase>("opening");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  zoomRef.current = zoom;
  panRef.current = pan;

  const paintNearby = useCallback(
    async (index: number) => {
      const pdf = pdfRef.current;
      const nodes = pageNodesRef.current;
      if (!pdf || nodes.length === 0) return;

      const quality = zoomRef.current > 1.2 ? 1600 : 900;
      const start = Math.max(1, index - RENDER_WINDOW);
      const end = Math.min(pdf.numPages, index + RENDER_WINDOW);

      for (let page = start; page <= end; page += 1) {
        const token = `${page}:${quality}`;
        if (rendered.current.has(token)) continue;
        const node = nodes[page - 1];
        const image = node?.querySelector("img");
        if (!image) continue;

        const canvas = document.createElement("canvas");
        await renderPageToCanvas(pdf, page, canvas, quality);
        image.src = canvas.toDataURL("image/jpeg", 0.88);
        image.alt = t.viewer.pageLabel(page);
        rendered.current.add(token);
      }
    },
    [t.viewer],
  );

  useEffect(() => {
    let cancelled = false;
    const host = document.createElement("div");
    host.className = "flip-host";

    async function setup() {
      const stage = stageRef.current;
      if (!stage) return;

      try {
        setPhase("opening");
        setError(null);
        setPhase("reading");
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
          page.innerHTML = `<img class="flip-page-image" alt="${t.viewer.pageLabel(i)}" />`;
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
          mobileScrollSupport: narrow,
          useMouseEvents: true,
          showPageCorners: true,
        });

        flip.loadFromHTML(nodes);
        flip.on("changeState", (event) => {
          if (event.data !== "flipping") return;
          const index = flip.getCurrentPageIndex() + 1;
          void paintNearby(index);
          void paintNearby(index + 1);
          void paintNearby(index - 1);
        });
        flip.on("flip", (event) => {
          const next = Number(event.data) + 1;
          setCurrent(next);
          void paintNearby(next);
        });

        flipRef.current = flip;
        if (!cancelled) {
          setPhase("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t.viewer.openFailed);
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
  }, [source, paintNearby, t.viewer]);

  const prefetchAround = useCallback(
    (pageIndex: number) => {
      void paintNearby(pageIndex);
      void paintNearby(pageIndex + 1);
      void paintNearby(pageIndex - 1);
    },
    [paintNearby],
  );

  const flipNext = useCallback(() => {
    const flip = flipRef.current;
    if (!flip) return;
    prefetchAround(flip.getCurrentPageIndex() + 2);
    flip.flipNext();
  }, [prefetchAround]);

  const flipPrev = useCallback(() => {
    const flip = flipRef.current;
    if (!flip) return;
    prefetchAround(flip.getCurrentPageIndex());
    flip.flipPrev();
  }, [prefetchAround]);

  const applyZoom = useCallback((next: number) => {
    const value = roundZoom(clamp(next, MIN_ZOOM, MAX_ZOOM));
    zoomRef.current = value;
    setZoom(value);
    if (value <= MIN_ZOOM) {
      panRef.current = { x: 0, y: 0 };
      setPan({ x: 0, y: 0 });
    }
  }, []);

  const zoomIn = useCallback(() => applyZoom(zoomRef.current + ZOOM_STEP), [applyZoom]);
  const zoomOut = useCallback(() => applyZoom(zoomRef.current - ZOOM_STEP), [applyZoom]);
  const zoomReset = useCallback(() => applyZoom(MIN_ZOOM), [applyZoom]);

  useEffect(() => {
    void paintNearby(current);
  }, [zoom, current, paintNearby]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (event.key === "ArrowRight") flipNext();
      if (event.key === "ArrowLeft") flipPrev();
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomIn();
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomOut();
      }
      if (event.key === "0") zoomReset();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev, zoomIn, zoomOut, zoomReset]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function onWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      applyZoom(zoomRef.current + delta);
    }

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [applyZoom]);

  useEffect(() => {
    function onFullscreenChange() {
      window.dispatchEvent(new Event("resize"));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function pointerDistance() {
    const points = [...pointersRef.current.values()];
    if (points.length < 2) return null;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (zoomRef.current > MIN_ZOOM && pointersRef.current.size === 1) {
      panningRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2) {
      const distance = pointerDistance();
      if (distance && pinchDistanceRef.current) {
        applyZoom(zoomRef.current * (distance / pinchDistanceRef.current));
      }
      pinchDistanceRef.current = distance;
      panningRef.current = false;
      return;
    }

    if (!panningRef.current || zoomRef.current <= MIN_ZOOM) return;
    const next = {
      x: panRef.current.x + event.movementX,
      y: panRef.current.y + event.movementY,
    };
    panRef.current = next;
    setPan(next);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchDistanceRef.current = null;
    if (pointersRef.current.size === 0) panningRef.current = false;
  }

  async function toggleFullscreen() {
    const node = shellRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await node.requestFullscreen();
  }

  const statusText =
    phase === "ready"
      ? t.viewer.pageOf(current, pageCount)
      : phase === "reading"
        ? t.viewer.reading
        : t.viewer.opening;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/50 px-5 py-4 text-sm text-red-200">
        {error}
      </div>
    );
  }

  const zoomed = zoom > MIN_ZOOM;
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return (
    <div ref={shellRef} className="flip-shell flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-cream/90 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0">
          <p className="truncate font-serif text-base text-ink sm:text-lg">{title ?? t.viewer.document}</p>
          <p className="text-xs tracking-wide text-ink/55">{statusText}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="toolbar-btn min-h-11 justify-center px-3 text-xs sm:text-sm" onClick={flipPrev}>
            {t.viewer.previous}
          </button>
          <button type="button" className="toolbar-btn min-h-11 justify-center px-3 text-xs sm:text-sm" onClick={flipNext}>
            {t.viewer.next}
          </button>
          <button
            type="button"
            className="toolbar-btn min-h-11 w-11 justify-center px-0 text-base"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label={t.viewer.zoomOut}
          >
            −
          </button>
          <button
            type="button"
            className="toolbar-btn min-h-11 justify-center px-3 text-xs tabular-nums sm:text-sm"
            onClick={zoomReset}
            disabled={!zoomed}
            aria-label={t.viewer.zoomReset}
          >
            {zoomLabel}
          </button>
          <button
            type="button"
            className="toolbar-btn min-h-11 w-11 justify-center px-0 text-base"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label={t.viewer.zoomIn}
          >
            +
          </button>
          <button type="button" className="toolbar-btn min-h-11 justify-center px-3 text-xs sm:text-sm" onClick={() => void toggleFullscreen()}>
            <span className="sm:hidden">{t.viewer.fullscreenShort}</span>
            <span className="hidden sm:inline">{t.viewer.fullscreen}</span>
          </button>
        </div>
      </div>
      <div
        ref={viewportRef}
        className={`flip-stage${zoomed ? " is-zoomed" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="flip-zoom"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <div ref={stageRef} className="flip-mount" />
        </div>
      </div>
    </div>
  );
}
