"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { apiFetch } from "@/lib/api/client";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarDays,
  ChartNoAxesColumn, ClipboardList, GraduationCap, Search,
  Sparkles, Target, TrendingUp, Trophy,
} from "lucide-react";

type QuizResult = {
  id: string;
  title: string;
  subject: string;
  completedAt: string;
  correct: number;
  total: number;
  durationSeconds: number;
};

type ApiQuizResult = {
  resultId: string;
  branch: string;
  subjectId: string;
  difficulty: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
};

function convertResult(item: ApiQuizResult): QuizResult {
  return {
    id: item.resultId,
    title: item.subjectId.replace(/_/g, " "),
    subject: `${item.branch} - ${item.difficulty}`,
    completedAt: item.submittedAt,
    correct: item.correctAnswers,
    total: item.totalQuestions,
    durationSeconds: 0,
  };
}

function getLocalDateKey(value: string | Date): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "highest">("newest");
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        setResults([]);
        setResultsLoading(false);
        router.replace("/login");
        return;
      }

      setResultsLoading(true);
      setResultsError("");

      void apiFetch<ApiQuizResult[]>("/api/results/me")
        .then((data) => {
          if (auth.currentUser?.uid !== currentUser.uid) return;
          setResults(data.map(convertResult));
        })
        .catch((error: unknown) => {
          if (auth.currentUser?.uid !== currentUser.uid) return;
          setResultsError(
            error instanceof Error ? error.message : "Unable to load results."
          );
        })
        .finally(() => {
          if (auth.currentUser?.uid === currentUser.uid) {
            setResultsLoading(false);
          }
        });
    });
  }, [router]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNextDay() {
      setTodayKey(getLocalDateKey(new Date()));

      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      timeoutId = setTimeout(
        scheduleNextDay,
        nextMidnight.getTime() - now.getTime() + 100
      );
    }

    function refreshDate() {
      clearTimeout(timeoutId);
      scheduleNextDay();
    }

    scheduleNextDay();

    window.addEventListener("focus", refreshDate);
    document.addEventListener("visibilitychange", refreshDate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("focus", refreshDate);
      document.removeEventListener("visibilitychange", refreshDate);
    };
  }, []);

  const filteredResults = useMemo(() => {
    const matches = results.filter((item) => {
      const matchesSearch =
        `${item.title} ${item.subject}`
          .toLowerCase()
          .includes(search.toLowerCase().trim());

      const completedDay = getLocalDateKey(item.completedAt);

      if (sort === "newest") {
        return matchesSearch && completedDay === todayKey;
      }

      if (sort === "oldest") {
        return matchesSearch && completedDay !== "" && completedDay < todayKey;
      }

      return matchesSearch;
    });

    return [...matches].sort((a, b) => {
      if (sort === "highest") {
        const scoreA = a.total > 0 ? a.correct / a.total : 0;
        const scoreB = b.total > 0 ? b.correct / b.total : 0;

        if (scoreB !== scoreA) return scoreB - scoreA;
        if (b.correct !== a.correct) return b.correct - a.correct;

        return new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime();
      }

      const diff =
        new Date(b.completedAt).getTime() -
        new Date(a.completedAt).getTime();

      return sort === "oldest" ? -diff : diff;
    });
  }, [results, search, sort, todayKey]);

  const attempts = results.length;
  const average = attempts
    ? Math.round(results.reduce((sum, r) => sum + (r.correct / r.total) * 100, 0) / attempts)
    : null;
  const best = attempts
    ? Math.round(Math.max(...results.map((r) => (r.correct / r.total) * 100)))
    : null;
  const totalCorrect = results.reduce((sum, r) => sum + r.correct, 0);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faf9]">
        <p className="text-[#007c70]">Checking your account...</p>
      </main>
    );
  }

  const stats = [
    { label: "Quizzes Completed", value: String(attempts), icon: ClipboardList, hint: "Total attempts" },
    { label: "Average Score", value: average === null ? "â€”" : `${average}%`, icon: Target, hint: "Across completed quizzes" },
    { label: "Best Score", value: best === null ? "â€”" : `${best}%`, icon: Trophy, hint: "Your personal best" },
    { label: "Correct Answers", value: String(totalCorrect), icon: TrendingUp, hint: "Across all attempts" },
  ];

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
        <section className="relative overflow-hidden rounded-3xl bg-[#007c70] p-7 text-white sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              <Sparkles size={16} /> YOUR LEARNING JOURNEY
            </span>
            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">My Results</h1>
            <p className="mt-3 max-w-xl leading-7 text-white/85">
              Every attempt is a chance to learn. Explore your quiz results, celebrate your progress, and discover what to practice next.
            </p>
            <Link href="/quizzes" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#007c70] transition hover:bg-[#e1f2ee]">
              Explore Quizzes <ArrowRight size={17} />
            </Link>
          </div>
          <ChartNoAxesColumn size={190} className="pointer-events-none absolute -bottom-10 -right-7 text-white/10" />
        </section>

        {resultsLoading && (
          <p role="status" className="text-sm text-[#007c70]">
            Loading your saved quiz results...
          </p>
        )}

        {resultsError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load quiz history: {resultsError}
          </p>
        )}

        <section aria-label="Results overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-[#e2ebe8] bg-white p-6">
                <div className="mb-4 inline-flex rounded-xl bg-[#e1f2ee] p-3 text-[#007c70]"><Icon size={22} /></div>
                <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
                <h2 className="mt-2 text-sm font-semibold">{stat.label}</h2>
                <p className="mt-1 text-xs text-[#64748b]">{stat.hint}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#e2ebe8] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#e1f2ee] p-3 text-[#007c70]"><BarChart3 size={22} /></span>
              <div><h2 className="text-lg font-bold">Performance Insights</h2><p className="text-sm text-[#64748b]">Your scores over time</p></div>
            </div>
                        <div className="mt-7 rounded-xl border border-[#d6e5e0] bg-[#fbfdfc] p-5">
              {results.length === 0 ? (
                <p className="text-center text-sm text-[#64748b]">
                  Complete a quiz to see your performance.
                </p>
              ) : (
                <div className="space-y-4">
                  {[...results]
                    .sort((a, b) =>
                      new Date(a.completedAt).getTime() -
                      new Date(b.completedAt).getTime()
                    )
                    .map((result, index) => {
                      const score = result.total > 0
                        ? (result.correct / result.total) * 100
                        : 0;

                      return (
                        <div key={result.id}>
                          <div className="mb-2 flex justify-between gap-3 text-sm">
                            <span className="font-medium">
                              Attempt {index + 1} - {result.title}
                            </span>
                            <span className="font-bold text-[#007c70]">
                              {score.toFixed(2)}%
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-[#e1f2ee]">
                            <div
                              className="h-full rounded-full bg-[#007c70]"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-[#e2ebe8] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-[#e1f2ee] p-3 text-[#007c70]"><Target size={22} /></span>
              <div><h2 className="text-lg font-bold">Accuracy Breakdown</h2><p className="text-sm text-[#64748b]">Correct answers and opportunities to improve</p></div>
            </div>
                        <div className="mt-7 rounded-xl border border-[#d6e5e0] bg-[#fbfdfc] p-5">
              {results.length === 0 ? (
                <p className="text-center text-sm text-[#64748b]">
                  Complete a quiz to see your performance.
                </p>
              ) : (
                <div className="space-y-4">
                  {[...results]
                    .sort((a, b) =>
                      new Date(a.completedAt).getTime() -
                      new Date(b.completedAt).getTime()
                    )
                    .map((result, index) => {
                      const score = result.total > 0
                        ? (result.correct / result.total) * 100
                        : 0;

                      return (
                        <div key={result.id}>
                          <div className="mb-2 flex justify-between gap-3 text-sm">
                            <span className="font-medium">
                              Attempt {index + 1} - {result.title}
                            </span>
                            <span className="font-bold text-[#007c70]">
                              {score.toFixed(2)}%
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-[#e1f2ee]">
                            <div
                              className="h-full rounded-full bg-[#007c70]"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e2ebe8] bg-white p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold">Quiz History</h2>
              <p className="mt-2 text-sm text-[#64748b]">Find your completed quizzes and review your scores.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block">
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
                <span className="sr-only">Search quiz results</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search results" className="w-full rounded-xl border border-[#e2ebe8] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#007c70] sm:w-56" />
              </label>
              <label className="sr-only" htmlFor="results-sort">Sort quiz results</label>
              <select id="results-sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-xl border border-[#e2ebe8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#007c70]">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest score</option>
              </select>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="mt-7 flex flex-col items-center rounded-2xl border border-dashed border-[#d6e5e0] bg-[#fbfdfc] px-5 py-12 text-center">
              <span className="rounded-2xl bg-[#e1f2ee] p-5 text-[#007c70]"><CalendarDays size={32} /></span>
              <h3 className="mt-5 text-xl font-bold">{results.length
  ? sort === "newest"
    ? "No quizzes completed today"
    : sort === "oldest"
      ? "No past quizzes yet"
      : "No matching results"
  : "Your first result is waiting"}</h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-[#64748b]">
                {results.length
  ? sort === "newest"
    ? "Quizzes completed today will appear here. Earlier quizzes are available under Oldest first."
    : sort === "oldest"
      ? "Quizzes completed before today will appear here automatically."
      : "Try a different search term."
  : "Complete your first quiz to see your results here."}
              </p>
              {!results.length && <Link href="/quizzes" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#007c70] px-5 py-3 text-sm font-semibold text-white hover:bg-[#00685f]">Browse Quizzes <ArrowRight size={17} /></Link>}
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredResults.map((result) => (
                <article key={result.id} className="flex flex-col gap-3 rounded-xl border border-[#e2ebe8] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><h3 className="font-semibold">{result.title}</h3><p className="mt-1 text-sm text-[#64748b]">{result.subject} Â· {new Date(result.completedAt).toLocaleDateString()}</p></div>
                  <span className="font-bold text-[#007c70]">{Math.round((result.correct / result.total) * 100)}%</span>
                </article>
              ))}
            </div>
          )}
        </section>
        <p className="text-center text-xs text-[#64748b]">Results are retrieved securely from your saved quiz attempts.</p>
      </div>
    </main>
  );
}
