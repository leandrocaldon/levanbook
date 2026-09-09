import { NextResponse } from "next/server";
import { BOOKS_BUCKET } from "@/lib/constants";
import { createInsForgeAdminClient } from "@/lib/insforge/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const admin = createInsForgeAdminClient();
    const { data: book, error } = await admin.database
      .from("books")
      .select("storage_key, title")
      .eq("share_slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (error || !book?.storage_key) {
      return NextResponse.json({ error: "Libro no encontrado." }, { status: 404 });
    }

    const { data: file, error: downloadError } = await admin.storage
      .from(BOOKS_BUCKET)
      .download(book.storage_key);

    if (downloadError || !file) {
      return NextResponse.json(
        { error: downloadError?.message ?? "No se pudo descargar el PDF." },
        { status: 500 },
      );
    }

    const filename = `${book.title.replace(/[^\w\s.-]/g, "").trim() || "documento"}.pdf`;

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
