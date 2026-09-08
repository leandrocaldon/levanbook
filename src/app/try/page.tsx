import { LocalViewer } from "@/components/flipbook/LocalViewer";

export default function TryPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Vista previa</p>
        <h1 className="font-serif text-4xl text-ink">Hojear sin cuenta</h1>
        <p className="mt-2 max-w-xl text-ink/65">
          El archivo no se guarda. Para archivarlo y compartirlo, crea una cuenta.
        </p>
      </div>
      <LocalViewer />
    </section>
  );
}
