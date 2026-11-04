"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { apiFetch } from "@/lib/api/client";
import {
  ArrowLeft, BookOpen, CheckCircle2, Crown, Flame, GraduationCap,
  LockKeyhole, Medal, Sparkles, Target, Trophy, Zap,
} from "lucide-react";

type QuizResult = {
  resultId: string;
  percentage: number;
  submittedAt: string;
};

type BadgeProgress = { unlocked: boolean; current: number; required: number };

function getBadgeProgress(id: string, results: QuizResult[]): BadgeProgress {
  const count = results.length;
  const best = results.reduce((max, result) => Math.max(max, Number(result.percentage) || 0), 0);
  const days = new Set(results.map((result) => String(result.submittedAt || "").slice(0, 10)).filter(Boolean)).size;
  const rules: Record<string, [number, number]> = {
    "first-quiz": [count, 1],
    "quiz-explorer": [count, 10],
    "high-scorer": [best, 90],
    "perfect-score": [best, 100],
    "consistent-learner": [days, 7],
    "quiz-champion": [count, 50],
  };
  const [current, required] = rules[id] ?? [0, 1];
  return { unlocked: current >= required, current, required };
}

type Badge = {
  id: string;
  title: string;
  description: string;
  requirement: string;
  category: "Participation" | "Performance" | "Consistency" | "Milestones";
  icon: typeof Trophy;
  iconColor: string;
  iconBg: string;
};

const badges: Badge[] = [
  { id: "first-quiz", title: "First Spark", description: "Every great journey starts with one step.", requirement: "Complete your first quiz", category: "Participation", icon: Zap, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
  { id: "quiz-explorer", title: "Curious Explorer", description: "Keep asking questions and discovering more.", requirement: "Complete 10 quizzes", category: "Participation", icon: BookOpen, iconColor: "text-sky-600", iconBg: "bg-sky-50" },
  { id: "high-scorer", title: "Sharp Mind", description: "Your preparation is turning into progress.", requirement: "Score at least 90% on a quiz", category: "Performance", icon: Target, iconColor: "text-indigo-600", iconBg: "bg-indigo-50" },
  { id: "perfect-score", title: "Perfect Finish", description: "An exceptional milestone worth celebrating.", requirement: "Score 100% on a quiz", category: "Performance", icon: Medal, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
  { id: "consistent-learner", title: "On a Roll", description: "Consistency builds lasting confidence.", requirement: "Complete quizzes on 7 different days", category: "Consistency", icon: Flame, iconColor: "text-orange-600", iconBg: "bg-orange-50" },
  { id: "quiz-champion", title: "Quiz Legend", description: "Look how far your curiosity has taken you.", requirement: "Complete 50 quizzes", category: "Milestones", icon: Crown, iconColor: "text-violet-600", iconBg: "bg-violet-50" },
];

const categories = ["All", "Participation", "Performance", "Consistency", "Milestones"] as const;

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        setResults([]);
        setResultsLoading(false);
        router.replace("/login");
      }
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setResultsLoading(true);
    setResultsError("");
    apiFetch<QuizResult[]>("/api/results/me")
      .then((data) => {
        if (!cancelled) setResults(Array.isArray(data) ? data : []);
      })
      .catch((error: unknown) => {
        if (!cancelled) setResultsError(error instanceof Error ? error.message : "Unable to load quiz results.");
      })
      .finally(() => {
        if (!cancelled) setResultsLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faf9]">
        <p className="text-[#007c70]">Checking your account...</p>
      </main>
    );
  }

  const visibleBadges = category === "All" ? badges : badges.filter((badge) => badge.category === category);
  const earned = badges.filter((badge) => getBadgeProgress(badge.id, results).unlocked).length;
  const completedQuizzes = results.length;
  const nextBadge = badges.find((badge) => !getBadgeProgress(badge.id, results).unlocked);
  const nextProgress = nextBadge ? getBadgeProgress(nextBadge.id, results) : null;
  const levels = [
    { label: "Beginner", minimum: 0 },
    { label: "Explorer", minimum: 1 },
    { label: "Achiever", minimum: 10 },
    { label: "Champion", minimum: 25 },
    { label: "Legend", minimum: 50 },
  ];
  const currentLevel = levels.filter((level) => completedQuizzes >= level.minimum).at(-1)!;
  const nextLevel = levels.find((level) => level.minimum > completedQuizzes);

  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#17242f]">
      <header className="border-b border-[#e2ebe8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 font-bold">
            <span className="rounded-xl bg-[#007c70] p-2 text-white"><GraduationCap size={24} /></span>
            <span className="truncate">EngineeringQuizHub</span>
          </Link>
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#007c70]">
            <ArrowLeft size={17} /> Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl bg-[#007c70] px-7 py-10 text-white sm:px-10 sm:py-12">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold tracking-wide sm:text-sm">
              <Sparkles size={16} className="text-amber-200" /> YOUR ACHIEVEMENT JOURNEY
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">Every quiz brings you closer to greatness.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">Start small. Stay curious. Celebrate every milestone. Your completed quizzes count toward every milestone!</p>
            <Link href="/quizzes" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#007c70] transition hover:bg-[#e1f2ee]">
              <Zap size={17} /> Explore Quizzes
            </Link>
          </div>
          <Trophy size={200} aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-10 text-white/10" />
        </section>

        {resultsLoading && <p role="status" className="text-sm text-[#64748b]">Loading your achievements...</p>}
        {resultsError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load your saved quiz results: {resultsError}. Check that the backend is running and try refreshing.</div>}
        {!resultsLoading && !resultsError && <section className="grid gap-4 sm:grid-cols-3" aria-label="Achievement summary">
          {[
            { label: "Badges Earned", value: earned, icon: Trophy },
            { label: "Waiting to Unlock", value: badges.length - earned, icon: LockKeyhole },
            { label: "Achievements Available", value: badges.length, icon: Medal },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-[#e2ebe8] bg-white p-6">
                <span className="inline-flex rounded-xl bg-[#e1f2ee] p-3 text-[#007c70]"><Icon size={22} /></span>
                <p className="mt-4 text-3xl font-bold tabular-nums">{item.value}</p>
                <p className="mt-2 text-sm text-[#64748b]">{item.label}</p>
              </div>
            );
          })}
        </section>}

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#e2ebe8] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#e1f2ee] p-3 text-[#007c70]"><Target size={23} /></span>
              <div><h2 className="text-lg font-bold">Your Next Milestone</h2><p className="text-sm text-[#64748b]">One quiz at a time.</p></div>
            </div>
            <p className="mt-6 text-xl font-bold">{nextBadge?.title ?? "All badges unlocked!"} {nextProgress && <span className="ml-2 text-sm font-medium text-[#64748b]">{Math.min(nextProgress.current, nextProgress.required)} / {nextProgress.required}</span>}</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#e1f2ee]" role="progressbar" aria-label="Next badge progress" aria-valuenow={nextProgress ? Math.min(nextProgress.current, nextProgress.required) : 1} aria-valuemin={0} aria-valuemax={nextProgress?.required ?? 1}>
              <div className="h-full rounded-full bg-[#007c70]" style={{ width: `${nextProgress ? Math.min(100, (nextProgress.current / nextProgress.required) * 100) : 100}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#64748b]">{nextBadge?.requirement ?? "Congratulations! You have earned every available badge."}</p>
          </div>
          <div className="rounded-2xl border border-[#e2ebe8] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-violet-50 p-3 text-violet-600"><Crown size={23} /></span>
              <div><h2 className="text-lg font-bold">Your Learning Level</h2><p className="text-sm text-[#64748b]">Progress through five milestones.</p></div>
            </div>
            <p className="mt-6 text-xl font-bold">{currentLevel.label}</p>
            <p className="mt-2 text-sm text-[#64748b]">{nextLevel ? `Next: ${nextLevel.label} at ${nextLevel.minimum} completed ${nextLevel.minimum === 1 ? "quiz" : "quizzes"}.` : "You have reached the highest level!"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {levels.map((level) => (
                <span key={level.label} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${level.label === currentLevel.label ? "bg-[#007c70] text-white" : "bg-[#f1f5f4] text-[#64748b]"}`}>
                  {level.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Badges Worth Earning</h2>
            <p className="mt-2 text-sm text-[#64748b]">Each badge celebrates a different kind of progress.</p>
          </div>
          <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter achievements">
            {categories.map((item) => (
              <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}
                className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition ${category === item ? "bg-[#007c70] text-white" : "border border-[#e2ebe8] bg-white text-[#64748b] hover:bg-[#e1f2ee]"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleBadges.map((badge) => {
              const Icon = badge.icon;
              const progress = getBadgeProgress(badge.id, results);
              return (
                <article key={badge.id} className="rounded-2xl border border-[#e2ebe8] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#a8d8ce] hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-2xl p-4 ${badge.iconBg} ${badge.iconColor}`}><Icon size={30} /></span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${progress.unlocked ? "bg-emerald-50 text-emerald-700" : "bg-[#f1f5f9] text-[#64748b]"}`}>{progress.unlocked ? <CheckCircle2 size={12} /> : <LockKeyhole size={12} />}{progress.unlocked ? "Unlocked" : "Not yet earned"}</span>
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#007c70]">{badge.category}</p>
                  <h3 className="mt-2 text-xl font-bold">{badge.title}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-[#64748b]">{badge.description}</p>
                  <div className="mt-5 border-t border-[#e2ebe8] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Your challenge</p>
                    <p className="mt-2 text-sm font-medium">{badge.requirement}</p>
                     <p className="mt-2 text-xs text-[#64748b]">{Math.min(progress.current, progress.required)} / {progress.required} {badge.id === "high-scorer" || badge.id === "perfect-score" ? "% best score" : badge.id === "consistent-learner" ? "days" : "quizzes"}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#cce9e2] bg-[#eaf7f3] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-white p-3 text-[#007c70]"><CheckCircle2 size={24} /></span>
            <div>
              <h2 className="text-lg font-bold">Your achievement journey</h2>
              <p className="mt-2 text-sm leading-6 text-[#64748b]">{resultsLoading ? "Checking your quiz history..." : resultsError ? "Achievement progress is temporarily unavailable." : `You have completed ${completedQuizzes} quizzes and unlocked ${earned} of ${badges.length} badges. Your progress is calculated from your saved quiz results.`}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
