import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-4 py-16">
      <h1 className="font-serif text-4xl text-ink">No está este libro</h1>
      <p className="text-ink/65">El enlace no existe o dejó de ser público.</p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
