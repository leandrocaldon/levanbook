"use client";

import { useEffect, useState } from "react";
import { BOOKS_BUCKET } from "@/lib/constants";
import { insforge } from "@/lib/insforge/client";

// The books bucket is private, so a plain <img> against the object URL gets a
// 401. Download the cover with the authenticated SDK client instead.
export function BookCover({ coverKey, title }: { coverKey: string; title: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    async function load() {
      const { data, error } = await insforge.storage.from(BOOKS_BUCKET).download(coverKey);
      if (!active) return;
      if (error || !data) {
        setFailed(true);
        return;
      }
      objectUrl = URL.createObjectURL(data);
      setSrc(objectUrl);
    }

    void load();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [coverKey]);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center font-serif text-xl text-ink/50">
        {title}
      </div>
    );
  }

  if (!src) {
    return <div className="h-full animate-pulse bg-ink/5" />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={title} className="absolute inset-0 h-full w-full object-cover" />;
}
