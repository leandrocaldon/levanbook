"use client";

import { createScope, createTimeline } from "animejs";
import { useEffect, useRef } from "react";
import { useLocale } from "@/components/layout/LocaleProvider";

export function LandingMotion() {
  const root = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (!root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.current.classList.add("demo-static");
      return;
    }

    const scope = createScope({ root }).add(() => {
      const timeline = createTimeline({
        defaults: { ease: "out(3)" },
        loop: true,
        loopDelay: 640,
      });

      timeline
        .add(".demo-drop", {
          opacity: [0, 1],
          scale: [0.96, 1],
          duration: 480,
        })
        .add(
          ".demo-step-1",
          { opacity: [0, 1], y: [8, 0], duration: 320 },
          "-=280",
        )
        .add(".demo-file", {
          opacity: [0, 1],
          y: [-56, 0],
          rotate: [-8, -4],
          duration: 700,
        })
        .add(".demo-drop", {
          borderColor: "#9CA3AF",
          backgroundColor: "#1F2937",
          duration: 280,
        }, "-=180")
        .add([".demo-file", ".demo-drop", ".demo-step-1"], {
          opacity: 0,
          duration: 360,
          delay: 380,
        })
        .add(".demo-book", {
          opacity: [0, 1],
          scale: [0.94, 1],
          duration: 560,
        }, "-=160")
        .add(".demo-step-2", {
          opacity: [0, 1],
          y: [8, 0],
          duration: 320,
        }, "-=320")
        .add(".demo-leaf", {
          rotateY: [0, -178],
          duration: 880,
          ease: "inOut(3)",
          delay: 240,
        })
        .add(".demo-leaf", {
          rotateY: [-178, 0],
          duration: 880,
          ease: "inOut(3)",
          delay: 420,
        })
        .add(".demo-step-2", { opacity: 0, duration: 220 }, "-=200")
        .add(".demo-step-3", {
          opacity: [0, 1],
          y: [8, 0],
          duration: 320,
        })
        .add(".demo-share-btn", {
          scale: [1, 1.06, 1],
          duration: 420,
        }, "-=80")
        .add(".demo-share", {
          opacity: [0, 1],
          y: [16, 0],
          duration: 480,
        }, "-=120")
        .add(".demo-share", { opacity: 1, duration: 1200 })
        .add(
          [".demo-book", ".demo-share", ".demo-step-3"],
          { opacity: 0, duration: 380 },
        )
        .add(".demo-leaf", { rotateY: 0, duration: 1 }, "<")
        .add(".demo-drop", {
          borderColor: "#4B5563",
          backgroundColor: "#111827",
          duration: 1,
        }, "<");
    });

    return () => scope.revert();
  }, []);

  return (
    <div ref={root} className="demo-stage">
      <p className="demo-step demo-step-1">{t.landing.step1}</p>
      <p className="demo-step demo-step-2">{t.landing.step2}</p>
      <p className="demo-step demo-step-3">{t.landing.step3}</p>

      <div className="demo-upload" aria-hidden>
        <div className="demo-file">
          <span className="demo-file-badge">PDF</span>
          <strong>catalogo.pdf</strong>
          <small>{t.landing.fileMeta("2.4 MB", 18)}</small>
        </div>
        <div className="demo-drop">
          <strong>{t.landing.addPdf}</strong>
          <span>{t.landing.addPdfHint}</span>
        </div>
      </div>

      <div className="demo-book" aria-hidden>
        <div className="demo-spread">
          <div className="demo-page demo-page-left">
            <em>{t.landing.catalogTitle}</em>
            <p>{t.landing.catalogBody}</p>
            <p className="demo-muted">{t.landing.pageShort(8)}</p>
          </div>
          <div className="demo-leaf">
            <div className="demo-page demo-page-front">
              <em>{t.landing.detailTitle}</em>
              <p>{t.landing.detailBody}</p>
              <p className="demo-muted">{t.landing.pageShort(9)}</p>
            </div>
            <div className="demo-page demo-page-back">
              <em>{t.landing.libraryTitle}</em>
              <p>{t.landing.libraryBody}</p>
              <p className="demo-muted">{t.landing.pageShort(10)}</p>
            </div>
          </div>
        </div>
        <div className="demo-toolbar">
          <span>{t.landing.previous}</span>
          <span className="demo-page-num">{t.landing.pageOf(8, 18)}</span>
          <span className="demo-share-btn">{t.landing.share}</span>
        </div>
      </div>

      <div className="demo-share">
        <span>{t.landing.linkCopied}</span>
        <code>/b/catalogo7xk</code>
      </div>
    </div>
  );
}
