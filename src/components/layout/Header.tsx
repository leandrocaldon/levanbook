import Link from "next/link";
import { getCurrentUser } from "@/lib/insforge/server";
import { signOutAction } from "@/app/actions/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(46,33,18,0.08)] bg-[rgba(250,246,239,0.86)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Link href={user ? "/library" : "/"} className="font-serif text-2xl tracking-tight text-ink">
          Levanbook
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/try" className="text-ink/70 hover:text-ink">
            Probar
          </Link>
          {user ? (
            <>
              <Link href="/library" className="text-ink/70 hover:text-ink">
                Biblioteca
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="toolbar-btn">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink/70 hover:text-ink">
                Entrar
              </Link>
              <Link href="/signup" className="btn-primary">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
