"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { loginWithGoogle } from "@/lib/firebase/googleAuth";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.88 46.98 24.55z"/>
      <path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function Register() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function getRegistrationError(error: unknown): string {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code) : "";
    switch (code) {
      case "auth/email-already-in-use": return "This email already has an account. Sign in instead, or use Google if you registered with Google.";
      case "auth/invalid-email": return "Enter a valid email address.";
      case "auth/weak-password": return "Choose a stronger password.";
      case "auth/operation-not-allowed": return "This sign-in method is not enabled in Firebase.";
      case "auth/network-request-failed": return "Network error. Check your internet connection.";
      case "auth/too-many-requests": return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user": return "Google sign-in was cancelled.";
      case "auth/popup-blocked": return "Allow the Google sign-in popup in your browser.";
      case "auth/account-exists-with-different-credential": return "An account already exists with another sign-in method. Sign in using that method.";
      default: return "Registration failed. Please try again.";
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setMessage("");
    if (name.trim().length < 2) { setError("Please enter your full name."); return; }
    if (password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setBusy(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // The account is created before profile updates; don't claim failure if an optional update fails.
      try { await updateProfile(credential.user, { displayName: name.trim() }); }
      catch (profileError) { console.error("Profile update failed:", profileError); }
      try { await sendEmailVerification(credential.user); }
      catch (verificationError) { console.error("Verification email could not be sent:", verificationError); }
      setMessage("Account created successfully. Redirecting to your dashboard...");
      router.replace("/dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
      setError(getRegistrationError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleRegister() {
    if (busy) return;
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await loginWithGoogle(true);
      router.replace("/dashboard");
    } catch (err) {
      console.error("Google registration failed:", err);
      setError(getRegistrationError(err));
    } finally {
      setBusy(false);
    }
  }

  const inputStyle =
    "h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#9baabd]";

  const fieldStyle =
    "flex h-12 items-center gap-3 rounded-xl border border-[#d8e5e2] bg-white px-4 focus-within:border-[#007c70]";

  return (
    <main className="min-h-screen bg-white text-[#17242f]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#f8faf9] px-12 py-12 lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="relative flex items-center gap-3">
            <div className="rounded-xl bg-[#007c70] p-3 text-white">
              <GraduationCap size={25} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              EngineeringQuizHub
            </span>
          </div>

          <div className="relative max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d8ebe6] bg-[#e1f2ee] px-4 py-2 text-sm text-[#007c70]">
              <CheckCircle2 size={16} />
              Start your learning journey
            </div>

            <h1 className="text-5xl font-bold leading-tight xl:text-6xl">
              Learn more.
              <br />
              <span className="text-[#007c70]">Achieve more.</span>
            </h1>

            <p className="mt-7 max-w-md text-lg leading-8 text-[#526572]">
              Create your free account to explore engineering quizzes,
              challenge your knowledge, and follow your progress.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Explore multiple engineering branches",
                "Practice quizzes at different difficulty levels",
                "Review your results and learn from mistakes",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-[#007c70]" />
                  <span className="text-[#526572]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-sm text-[#64748b]">
            EngineeringQuizHub — Your knowledge, your progress.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="rounded-xl bg-[#007c70] p-3 text-white">
                <GraduationCap size={24} />
              </div>
              <span className="text-xl font-bold">EngineeringQuizHub</span>
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-bold tracking-tight">
                Create your account
              </h2>
              <p className="mt-2 text-[#64748b]">
                Join EngineeringQuizHub and start practicing.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={busy}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#d8e5e2] bg-white font-semibold transition hover:bg-[#f5faf8]"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#dce5e2]" />
              <span className="text-xs font-medium text-[#94a3b8]">
                OR REGISTER WITH EMAIL
              </span>
              <div className="h-px flex-1 bg-[#dce5e2]" />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold">
                  Full name
                </label>
                <div className={fieldStyle}>
                  <UserRound size={18} className="shrink-0 text-[#94a3b8]" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email address
                </label>
                <div className={fieldStyle}>
                  <Mail size={18} className="shrink-0 text-[#94a3b8]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                  Password
                </label>
                <div className={fieldStyle}>
                  <Lock size={18} className="shrink-0 text-[#94a3b8]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    className={inputStyle}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-[#64748b]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold"
                >
                  Confirm password
                </label>
                <div className={fieldStyle}>
                  <Lock size={18} className="shrink-0 text-[#94a3b8]" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm your password"
                    className={inputStyle}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Hide confirmation" : "Show confirmation"
                    }
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="cursor-pointer text-[#64748b]"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {message && (
                <p role="status" className="rounded-lg bg-[#e1f2ee] p-3 text-sm text-[#007c70]">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#007c70] font-semibold text-white transition hover:bg-[#006458]"
              >
                {busy ? "Creating account..." : "Create account"}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#64748b]">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#007c70] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
