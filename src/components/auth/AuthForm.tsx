"use client";

import { useState } from "react";
import Link from "next/link";
import {
  resendVerificationAction,
  signInAction,
  signUpAction,
  verifyEmailAction,
} from "@/app/actions/auth";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setNotice(null);
    const result =
      mode === "login" ? await signInAction(formData) : await signUpAction(formData);
    setPending(false);

    if (!result) return;
    if ("needsVerification" in result && result.needsVerification && result.email) {
      setVerifyEmail(result.email);
      setNotice("Te enviamos un código de 6 dígitos. Revísalo en tu correo.");
      return;
    }
    if (result.error) setError(result.error);
  }

  async function onVerify(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await verifyEmailAction(formData);
    setPending(false);
    if (result?.error) setError(result.error);
  }

  if (verifyEmail) {
    return (
      <form action={onVerify} className="auth-card">
        <h1 className="font-serif text-3xl text-ink">Confirma tu correo</h1>
        <p className="text-sm text-ink/65">Código enviado a {verifyEmail}</p>
        <input type="hidden" name="email" value={verifyEmail} />
        <label className="field">
          Código
          <input name="otp" inputMode="numeric" maxLength={6} required className="input" />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {notice ? <p className="text-sm text-forest">{notice}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Verificando…" : "Verificar y entrar"}
        </button>
        <button
          type="button"
          className="text-sm text-ink/60 underline"
          onClick={() => void resendVerificationAction(verifyEmail)}
        >
          Reenviar código
        </button>
      </form>
    );
  }

  return (
    <form action={onSubmit} className="auth-card">
      <h1 className="font-serif text-3xl text-ink">
        {mode === "login" ? "Entrar a Levanbook" : "Crear tu biblioteca"}
      </h1>
      <p className="text-sm text-ink/65">
        {mode === "login"
          ? "Abre tus documentos y sigue leyendo donde lo dejaste."
          : "Guarda PDFs, hojéalos y comparte un enlace de lectura."}
      </p>
      {mode === "signup" ? (
        <label className="field">
          Nombre
          <input name="name" autoComplete="name" className="input" />
        </label>
      ) : null}
      <label className="field">
        Correo
        <input name="email" type="email" autoComplete="email" required className="input" />
      </label>
      <label className="field">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          required
          className="input"
        />
      </label>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>
      <p className="text-sm text-ink/60">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="underline">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="underline">
              Entra
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
