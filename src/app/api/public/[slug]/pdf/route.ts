import { NextResponse } from "next/server";
import { BOOKS_BUCKET } from "@/lib/constants";
import { createInsForgeAdminClient } from "@/lib/insforge/admin";
import { isShareSlug } from "@/lib/share";

const NOT_FOUND = "Libro no encontrado.";
const INTERNAL_ERROR = "No se pudo abrir el documento.";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!isShareSlug(slug)) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  try {
    const admin = createInsForgeAdminClient();
    const { data: book, error } = await admin.database
      .from("books")
      .select("storage_key")
      .eq("share_slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (error || !book?.storage_key) {
      return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
    }

    const { data: file, error: downloadError } = await admin.storage
      .from(BOOKS_BUCKET)
      .download(book.storage_key);

    if (downloadError || !file) {
      return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 });
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="documento.pdf"',
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  } catch {
    return NextResponse.json({ error: INTERNAL_ERROR }, { status: 500 });
  }
}
