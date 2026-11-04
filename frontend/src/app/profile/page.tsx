"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import {
  ArrowLeft, CheckCircle2, GraduationCap, KeyRound, LogOut,
  Mail, ShieldCheck, Trash2, UserRound,
} from "lucide-react";

function errorMessage(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code) : "";
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Current password is incorrect. Please try again.";
    case "auth/weak-password": return "Choose a stronger password (at least 8 characters).";
    case "auth/too-many-requests": return "Too many attempts. Please try again later.";
    case "auth/requires-recent-login": return "For security, sign out and sign in again before retrying.";
    case "auth/network-request-failed": return "Network error. Check your connection and retry.";
    default: return "The operation couldn't be completed. Please try again.";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");


  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setName(currentUser?.displayName ?? "");
    setLoading(false);
    if (!currentUser) router.replace("/login");
  }), [router]);

  const passwordProvider = user?.providerData.some((p) => p.providerId === "password") ?? false;
  const googleProvider = user?.providerData.some((p) => p.providerId === "google.com") ?? false;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try { await action(); } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    if (!name.trim()) { setError("Please enter your name."); return; }
    await run(async () => {
      await updateProfile(user, { displayName: name.trim() });
      setMessage("Your name has been updated.");
    });
  }

  async function verifyEmail() {
    if (!user || user.emailVerified) return;
    await run(async () => {
      await sendEmailVerification(user);
      setMessage("Verification email sent. Check your inbox.");
    });
  }

  async function refreshVerification() {
    if (!user) return;
    await run(async () => {
      await user.reload();
      setUser(auth.currentUser);
      setMessage(auth.currentUser?.emailVerified ? "Your email is verified." : "Your email is not verified yet.");
    });
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.email || !passwordProvider) return;
    if (newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
    if (currentPassword === newPassword) { setError("Choose a different new password."); return; }
    await run(async () => {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
    });
  }

  async function resetPassword() {
    if (!passwordProvider) {
      setError("");
      setMessage("This account uses Google Sign-In. Manage your Google password through your Google Account.");
      return;
    }
    if (!user?.email) return;
    await run(async () => {
      await sendPasswordResetEmail(auth, user.email!);
      setMessage("If password reset is available for this email, you'll receive instructions shortly.");
    });
  }


  async function deleteAccount() {
    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your EngineeringQuizHub account? This action cannot be undone."
    );

    if (!confirmed) return;

    if (passwordProvider && !deletePassword) {
      setError("Enter your current password to continue.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (passwordProvider) {
        if (!user.email) {
          throw new Error("Your account email is unavailable.");
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          deletePassword
        );

        await reauthenticateWithCredential(user, credential);
      } else if (googleProvider) {
        await reauthenticateWithPopup(
          user,
          new GoogleAuthProvider()
        );
      } else {
        throw new Error(
          "Your sign-in provider does not support this deletion flow."
        );
      }

      await deleteUser(user);
      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await run(async () => { await signOut(auth); router.replace("/login"); });
  }

  if (loading || !user) return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8faf9]">
      <p className="text-[#007c70]">Checking your account...</p>
    </main>
  );

  const inputClass = "mt-2 w-full rounded-xl border border-[#dce7e3] bg-white px-4 py-3 text-sm outline-none focus:border-[#007c70] focus:ring-2 focus:ring-[#e1f2ee]";
  const buttonClass = "rounded-xl bg-[#007c70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00665c] disabled:cursor-not-allowed disabled:opacity-50";
  const cardClass = "rounded-2xl border border-[#e2ebe8] bg-white p-6 sm:p-7";

  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#17242f]">
      <header className="border-b border-[#e2ebe8] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-3 font-bold">
            <span className="rounded-xl bg-[#007c70] p-2 text-white"><GraduationCap size={24} /></span>
            EngineeringQuizHub
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-[#007c70]">
            <ArrowLeft size={17} /> Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:py-10">
        <div>
          <div className="mb-4 inline-flex rounded-2xl bg-[#e1f2ee] p-3 text-[#007c70]"><UserRound size={28} /></div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-[#64748b]">Manage your EngineeringQuizHub account and security.</p>
        </div>

        {message && <div role="status" className="rounded-xl border border-[#b8e3d4] bg-[#eaf8f1] px-4 py-3 text-sm text-[#146c50]">{message}</div>}
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className={cardClass}>
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><UserRound className="text-[#007c70]" size={21} /> Personal Information</h2>
          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="text-sm font-semibold">Full name</label>
              <input id="profile-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required />
            </div>
            <button className={buttonClass} disabled={busy} type="submit">Save Changes</button>
          </form>
          <div className="mt-6 border-t border-[#e2ebe8] pt-5">
            <p className="text-sm font-semibold">Email address</p>
            <p className="mt-1 break-all text-sm text-[#64748b]">{user.email ?? "No email address available"}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${user.emailVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                <CheckCircle2 size={14} /> {user.emailVerified ? "Email verified" : "Email not verified"}
              </span>
              {!user.emailVerified && user.email && <>
                <button type="button" disabled={busy} onClick={verifyEmail} className="text-sm font-semibold text-[#007c70] disabled:opacity-50">Send verification email</button>
                <button type="button" disabled={busy} onClick={refreshVerification} className="text-sm font-semibold text-[#007c70] disabled:opacity-50">Refresh status</button>
              </>}
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><ShieldCheck className="text-[#007c70]" size={21} /> Sign-in & Security</h2>
          <p className="mb-5 text-sm text-[#64748b]">Sign-in methods: {[
            passwordProvider ? "Email and password" : null,
            googleProvider ? "Google" : null,
          ].filter(Boolean).join(", ") || "Other provider"}</p>
          {passwordProvider ? (
            <form onSubmit={changePassword} className="space-y-4">
              <h3 className="flex items-center gap-2 font-semibold"><KeyRound size={18} className="text-[#007c70]" /> Change Password</h3>
              <div><label htmlFor="current-password" className="text-sm font-semibold">Current password</label><input id="current-password" type="password" autoComplete="current-password" className={inputClass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
              <div><label htmlFor="new-password" className="text-sm font-semibold">New password</label><input id="new-password" type="password" autoComplete="new-password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required /></div>
              <div><label htmlFor="confirm-password" className="text-sm font-semibold">Confirm new password</label><input id="confirm-password" type="password" autoComplete="new-password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required /></div>
              <button type="submit" disabled={busy} className={buttonClass}>Update Password</button>
            </form>
          ) : (
            <p className="rounded-xl bg-[#f3f7f6] px-4 py-3 text-sm text-[#526572]">Your account does not currently have an email/password sign-in method. Manage your Google password through your Google Account.</p>
          )}
          {user.email && <div className="mt-6 border-t border-[#e2ebe8] pt-5">
            <h3 className="mb-2 flex items-center gap-2 font-semibold"><Mail size={18} className="text-[#007c70]" /> Forgot Password</h3>
            <p className="mb-3 text-sm text-[#64748b]">For accounts with email/password sign-in, request a password-reset email.</p>
            <button type="button" disabled={busy} onClick={resetPassword} className="text-sm font-semibold text-[#007c70] disabled:cursor-not-allowed disabled:opacity-40">Send password-reset email</button>
          </div>}
        </section>

        <section className={cardClass}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><LogOut className="text-[#007c70]" size={21} /> Account Session</h2>
          <button type="button" onClick={logout} disabled={busy} className={buttonClass}>Logout</button>
        </section>

        <section className={`${cardClass} border-red-200`}>
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-red-700"><Trash2 size={21} /> Delete Account</h2>
          <p className="mb-4 text-sm text-[#64748b]">
            Permanently delete your EngineeringQuizHub Firebase account.
            You will need to verify your identity before deletion.
            This cannot be undone.
          </p>

          {passwordProvider && (
            <div className="mb-4">
              <label htmlFor="delete-password" className="text-sm font-semibold">
                Current password
              </label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                className={inputClass}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
          )}

          <button
            type="button"
            onClick={deleteAccount}
            disabled={busy}
            className="rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <Trash2 size={17} />
              {busy ? "Processing..." : "Permanently Delete Account"}
            </span>
          </button>

          {googleProvider && (
            <p className="mt-3 text-xs text-[#64748b]">
              Google users will be asked to authenticate again.
            </p>
          )}

        </section>
      </div>
    </main>
  );
}


