"use client";

import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || sending) return;

    setSending(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setEmail(normalizedEmail);
      setSubmitted(true);
    } catch (err: unknown) {
      const code = typeof err === "object" && err !== null && "code" in err
        ? String(err.code) : "";
      if (code === "auth/too-many-requests") {
        setError("Too many requests. Please wait and try again later.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your connection and try again.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Email/password sign-in must be enabled in Firebase Authentication.");
      } else {
        setError("Unable to request a reset email right now. Please try again.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#17242f]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#f8faf9] px-12 py-12 lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#007c70] p-3 text-white">
              <GraduationCap size={25} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              EngineeringQuizHub
            </span>
          </div>

          <div className="max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d8ebe6] bg-[#e1f2ee] px-4 py-2 text-sm font-medium text-[#007c70]">
              <ShieldCheck size={16} />
              Secure account recovery
            </div>

            <h1 className="text-5xl font-bold leading-tight xl:text-6xl">
              Your account.
              <br />
              <span className="text-[#007c70]">Always accessible.</span>
            </h1>

            <p className="mt-7 max-w-md text-lg leading-8 text-[#526572]">
              Forgot your password? No problem. Recover access to your
              EngineeringQuizHub account using your registered email address.
            </p>

            <div className="mt-12 rounded-2xl border border-[#d8ebe6] bg-[#e1f2ee] p-6">
              <KeyRound size={27} className="mb-4 text-[#007c70]" />
              <h3 className="text-lg font-semibold">
                Simple password recovery
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#526572]">
                Once email recovery is connected, you can request a reset
                link and set a new password securely.
              </p>
            </div>
          </div>

          <p className="text-sm text-[#64748b]">
            EngineeringQuizHub — Your knowledge, your progress.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-[440px]">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="rounded-xl bg-[#007c70] p-3 text-white">
                <GraduationCap size={24} />
              </div>
              <span className="text-xl font-bold">
                EngineeringQuizHub
              </span>
            </div>

            {!submitted ? (
              <>
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e1f2ee] text-[#007c70]">
                  <KeyRound size={27} />
                </div>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Forgot password?
                </h2>

                <p className="mt-3 text-[#64748b]">
                  Enter your email address and we&apos;ll help you reset
                  your password.
                </p>

                {error && (
                  <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Email address
                    </label>

                    <div className="flex h-13 items-center gap-3 rounded-xl border border-[#d8e5e2] bg-white px-4 focus-within:border-[#007c70]">
                      <Mail size={19} className="shrink-0 text-[#94a3b8]" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your registered email"
                        className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#9baabd]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#007c70] font-semibold text-white transition hover:bg-[#006458] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send reset link"}
                    <ArrowRight size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div role="status">
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e1f2ee] text-[#007c70]">
                  <CheckCircle2 size={32} />
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Check your email
                </h2>

                <p className="mt-4 leading-7 text-[#64748b]">
                  If an eligible email/password account exists for this address,
                  password-reset instructions will arrive shortly. Check your inbox and spam folder.
                  Google-only accounts should use Google sign-in.
                </p>

                <p className="mt-4 break-all rounded-xl border border-[#d8ebe6] bg-[#f8faf9] p-4 text-sm font-semibold text-[#17242f]">
                  {email}
                </p>

                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setError(""); }}
                  className="mt-7 cursor-pointer font-semibold text-[#007c70] hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}

            <Link
              href="/login"
              className="mt-9 flex items-center justify-center gap-2 text-sm font-semibold text-[#007c70] hover:underline"
            >
              <ArrowLeft size={17} />
              Back to login
            </Link>

            <p className="mt-14 text-center text-xs text-[#94a3b8]">
              Protected access · EngineeringQuizHub
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

