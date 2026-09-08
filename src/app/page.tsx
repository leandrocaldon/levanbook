import Link from "next/link";
import { getCurrentUser } from "@/lib/insforge/server";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <section className="grid flex-1 items-center gap-12 py-8 lg:grid-cols-2">
      <div className="max-w-xl">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-ink/50">Digitalizador de documentos</p>
        <h1 className="font-serif text-5xl leading-tight text-ink sm:text-6xl">
          Tus PDFs, con el gesto de pasar página.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-ink/70">
          Sube un documento, guárdalo en tu biblioteca y léelo como un libro.
          Si quieres, comparte un enlace para que otra persona lo hojee.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={user ? "/library" : "/signup"} className="btn-primary">
            {user ? "Ir a la biblioteca" : "Empezar"}
          </Link>
          <Link href="/try" className="toolbar-btn px-5 py-3">
            Probar un PDF aquí
          </Link>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] bg-[#2f4a3c] px-8 py-12 text-[#faf6ef] shadow-[0_24px_60px_rgba(36,25,16,0.18)]">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#a24a27]/40 blur-2xl" />
        <p className="font-serif text-3xl leading-snug">Una biblioteca propia, sin mandar tus archivos a un flipbook comercial.</p>
        <ul className="mt-8 space-y-3 text-sm/7 text-[#faf6ef]/80">
          <li>Hojeas con StPageFlip en el navegador.</li>
          <li>El PDF se renderiza con PDF.js, página a página.</li>
          <li>Cuentas y archivos quedan en tu proyecto InsForge.</li>
        </ul>
      </div>
    </section>
  );
}
