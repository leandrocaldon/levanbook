"use client";

import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from "pdfjs-dist";

let workerReady = false;

function ensureWorker() {
  if (workerReady) return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerReady = true;
}

export async function loadPdf(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  ensureWorker();
  const task = getDocument({ data: new Uint8Array(data) });
  return task.promise;
}

export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth: number,
) {
  const page = await pdf.getPage(pageNumber);
  const unscaled = page.getViewport({ scale: 1 });
  const scale = targetWidth / unscaled.width;
  const viewport = page.getViewport({ scale: Math.min(scale, 2.2) });
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo crear el contexto del canvas.");

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;
}

export async function renderCoverBlob(pdf: PDFDocumentProxy): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await renderPageToCanvas(pdf, 1, canvas, 480);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la portada."))),
      "image/jpeg",
      0.82,
    );
  });
}

export function getPageAspect(pdf: PDFDocumentProxy) {
  return pdf.getPage(1).then((page) => {
    const viewport = page.getViewport({ scale: 1 });
    return { width: viewport.width, height: viewport.height };
  });
}
