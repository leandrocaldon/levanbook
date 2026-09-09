import Link from "next/link";
import { getCurrentUser } from "@/lib/insforge/server";
import { signOutAction } from "@/app/actions/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <Link
          href={user ? "/library" : "/"}
          className="shrink-0 font-serif text-xl tracking-tight text-ink sm:text-2xl"
        >
          Levanbook
        </Link>
        <nav className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
          <Link href="/try" className="px-1 py-2 text-ink/70 hover:text-ink">
            Probar
          </Link>
          {user ? (
            <>
              <Link href="/library" className="hidden px-1 py-2 text-ink/70 hover:text-ink sm:inline">
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
              <Link href="/login" className="px-1 py-2 text-ink/70 hover:text-ink">
                Entrar
              </Link>
              <Link href="/signup" className="btn-primary !px-3 !py-2 text-sm sm:!px-[1.15rem] sm:!py-[0.7rem]">
                <span className="sm:hidden">Crear</span>
                <span className="hidden sm:inline">Crear cuenta</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
