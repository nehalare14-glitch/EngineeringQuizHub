
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  loginWithGoogle,
  loginWithEmail,
} from "@/lib/firebase/googleAuth";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function getLoginErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup.";

    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase.";

    default:
      return "Unable to sign in. Please try again.";
  }
}

export default function Login() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Email and password login
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    setLoginError("");
    setIsLoggingIn(true);

    try {
      await loginWithEmail(email, password, rememberMe);

      router.replace("/dashboard");
    } catch (error) {
      console.error("Email login failed:", error);
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  }

  // Google login
  async function handleGoogleLogin() {
    setLoginError("");
    setIsLoggingIn(true);

    try {
      await loginWithGoogle(rememberMe);

      router.replace("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#ffffff] text-[#17242f]">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT INFORMATION SECTION */}

        <section className="relative hidden overflow-hidden bg-[#f8faf9] px-12 py-12 text-[#17242f] lg:flex lg:flex-col lg:justify-between xl:px-20">

          <div className="absolute -right-24 top-24 h-80 w-80 rounded-full border border-[#dceae6]" />

          <div className="absolute -left-28 bottom-0 h-96 w-96 rounded-full bg-[#cde9e3]/35 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-xl bg-[#007c70] p-3">
              <GraduationCap size={25} />
            </div>

            <span className="text-xl font-bold tracking-tight">
              EngineeringQuizHub
            </span>
          </div>

          <div className="relative max-w-xl">

            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d8ebe6] bg-[#e1f2ee] px-4 py-2 text-sm text-[#007c70]">
              <Sparkles size={16} />
              Learn. Practice. Improve.
            </div>

            <h1 className="text-5xl font-bold leading-tight xl:text-6xl">
              Build knowledge.
              <br />
              <span className="text-[#007c70]">
                Challenge yourself.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-lg leading-8 text-[#526572]">
              Explore engineering quizzes, test your understanding,
              and track your progress in one organized platform.
            </p>

            <div className="mt-12 grid max-w-md grid-cols-2 gap-4">

              <div className="rounded-2xl border border-[#d8ebe6] bg-[#e1f2ee] p-5">
                <BookOpen className="mb-4 text-[#007c70]" size={28} />

                <h3 className="font-semibold">
                  Multiple Branches
                </h3>

                <p className="mt-2 text-sm text-[#526572]">
                  Practice across engineering disciplines.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d8ebe6] bg-[#e1f2ee] p-5">
                <CheckCircle2 className="mb-4 text-[#007c70]" size={28} />

                <h3 className="font-semibold">
                  Track Progress
                </h3>

                <p className="mt-2 text-sm text-[#526572]">
                  Review results and improve your skills.
                </p>
              </div>

            </div>
          </div>

          <p className="relative text-sm text-[#64748b]">
            EngineeringQuizHub — Your knowledge, your progress.
          </p>

        </section>

        {/* RIGHT LOGIN SECTION */}

        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">

          <div className="w-full max-w-[440px]">

            {/* MOBILE BRAND */}

            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="rounded-xl bg-[#007c70] p-3 text-white">
                <GraduationCap size={24} />
              </div>

              <span className="text-xl font-bold">
                EngineeringQuizHub
              </span>
            </div>

            {/* LOGIN HEADING */}

            <div className="mb-8">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e1f2ee] px-3 py-1.5 text-xs font-semibold text-[#007c70]">
                <ShieldCheck size={14} />
                Secure account access
              </div>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-[#64748b]">
                Sign in to continue your learning journey.
              </p>

            </div>

            {/* ERROR MESSAGE */}

            {loginError && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {loginError}
              </div>
            )}

            {/* GOOGLE LOGIN */}

            <button
              type="button"
              disabled={isLoggingIn}
              onClick={handleGoogleLogin}
              className="flex h-13 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#d8e2ee] bg-white font-semibold transition hover:bg-[#f0f5fa] disabled:cursor-not-allowed disabled:opacity-60"
            >

              <svg
                width="22"
                height="22"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />

                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.88 46.98 24.55z"
                />

                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"
                />

                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>

              {isLoggingIn ? "Please wait..." : "Continue with Google"}

            </button>

            {/* DIVIDER */}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#dce5ef]" />

              <span className="text-xs font-medium text-[#94a3b8]">
                OR CONTINUE WITH EMAIL
              </span>

              <div className="h-px flex-1 bg-[#dce5ef]" />
            </div>

            {/* EMAIL LOGIN FORM */}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  Email address
                </label>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-[#d8e2ee] bg-white px-4 focus-within:border-[#007c70]">

                  <Mail size={19} className="text-[#94a3b8]" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#9baabd]"
                  />

                </div>
              </div>

              {/* PASSWORD */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-semibold"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-[#007c70] hover:underline"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="flex h-13 items-center gap-3 rounded-xl border border-[#d8e2ee] bg-white px-4 focus-within:border-[#007c70]">

                  <Lock size={19} className="text-[#94a3b8]" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#9baabd]"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-[#64748b]"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>
              </div>

              {/* REMEMBER ME */}

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#52647d]">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  className="h-4 w-4 accent-[#007c70]"
                />

                Remember me

              </label>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#007c70] font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#006458] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isLoggingIn ? "Signing in..." : "Sign in"}

                {!isLoggingIn && <ArrowRight size={18} />}

              </button>

            </form>

            {/* REGISTER */}

            <p className="mt-8 text-center text-sm text-[#64748b]">

              Don&apos;t have an account?{" "}

              <Link
                href="/register"
                className="font-bold text-[#007c70] hover:underline"
              >
                Create account
              </Link>

            </p>

            {/* FOOTER */}

            <p className="mt-12 text-center text-xs text-[#94a3b8]">
              Protected access · EngineeringQuizHub
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}
