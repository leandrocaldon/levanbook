"use client";

import { useState } from "react";
import Link from "next/link";
import {
  resendVerificationAction,
  signInAction,
  signUpAction,
  verifyEmailAction,
} from "@/app/actions/auth";
import { useLocale } from "@/components/layout/LocaleProvider";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function publicAuthError(code: string | null | undefined) {
    if (code === "AUTH_INVALID") return t.auth.invalidCredentials;
    return t.auth.genericError;
  }

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
      setNotice(t.auth.codeNotice);
      return;
    }
    if (result.error) setError(publicAuthError(result.error));
  }

  async function onVerify(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await verifyEmailAction(formData);
    setPending(false);
    if (result?.error) setError(publicAuthError(result.error));
  }

  if (verifyEmail) {
    return (
      <form action={onVerify} className="auth-card">
        <h1 className="font-serif text-3xl text-ink">{t.auth.verifyTitle}</h1>
        <p className="text-sm text-ink/65">{t.auth.verifySent(verifyEmail)}</p>
        <input type="hidden" name="email" value={verifyEmail} />
        <label className="field">
          {t.auth.code}
          <input name="otp" inputMode="numeric" maxLength={6} required className="input" />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {notice ? <p className="text-sm text-forest">{notice}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? t.auth.verifying : t.auth.verifySubmit}
        </button>
        <button
          type="button"
          className="text-sm text-ink/60 underline"
          onClick={() => void resendVerificationAction(verifyEmail)}
        >
          {t.auth.resendCode}
        </button>
      </form>
    );
  }

  return (
    <form action={onSubmit} className="auth-card">
      <h1 className="font-serif text-3xl text-ink">
        {mode === "login" ? t.auth.loginTitle : t.auth.signupTitle}
      </h1>
      <p className="text-sm text-ink/65">
        {mode === "login" ? t.auth.loginSubtitle : t.auth.signupSubtitle}
      </p>
      {mode === "signup" ? (
        <label className="field">
          {t.auth.name}
          <input name="name" autoComplete="name" className="input" />
        </label>
      ) : null}
      <label className="field">
        {t.auth.email}
        <input name="email" type="email" autoComplete="email" required className="input" />
      </label>
      <label className="field">
        {t.auth.password}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            required
            className="input w-full pr-11"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/55 hover:bg-ink/5 hover:text-ink"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 3l18 18M10.58 10.58A2 2 0 0 0 12 15a2 2 0 0 0 1.42-.58M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7.5a11.2 11.2 0 0 1-2.12 3.17M6.11 6.11A11.18 11.18 0 0 0 1 12.5C2.73 16.89 7 20 12 20a10.94 10.94 0 0 0 4.91-1.12"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M2 12.5C3.73 8.11 8 5 13 5s9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S3.73 16.89 2 12.5Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="13" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.75" />
              </svg>
            )}
          </button>
        </div>
      </label>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? t.auth.pending : mode === "login" ? t.auth.loginSubmit : t.auth.signupSubmit}
      </button>
      <p className="text-sm text-ink/60">
        {mode === "login" ? (
          <>
            {t.auth.noAccount}{" "}
            <Link href="/signup" className="underline">
              {t.auth.signupLink}
            </Link>
          </>
        ) : (
          <>
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="underline">
              {t.auth.loginLink}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
