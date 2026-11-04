"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { apiFetch } from "@/lib/api/client";
import {
  ArrowRight,
  Bell,
  BookOpen,
  ChartNoAxesColumn,
  ClipboardList,
  Code2,
  GraduationCap,
  House,
  LogOut,
  Menu,
  RadioTower,
  Search,
  Target,
  Trophy,
  UserRound,
  Wrench,
  X,
  Zap,
  Building2,
  Clock3,
} from "lucide-react";

type QuizHistoryItem = {
  resultId: string;
  subjectId?: string;
  branch?: string;
  difficulty?: string;
  correctAnswers?: number;
  totalQuestions?: number;
  percentage?: number;
  submittedAt?: string;
};

function quizSubjectName(id?: string) {
  if (!id) return "Engineering Quiz";
  return id.replace(/^[A-Z0-9]+_/, "").replace(/_/g, " ")
    .toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function validPercentage(result: QuizHistoryItem) {
  const percentage = Number(result.percentage);
  if (Number.isFinite(percentage)) return Math.min(100, Math.max(0, percentage));
  const correct = Number(result.correctAnswers);
  const total = Number(result.totalQuestions);
  return total > 0 && Number.isFinite(correct) ? Math.min(100, Math.max(0, correct * 100 / total)) : 0;
}

const branches = [
  {
    name: "Computer Science",
    code: "CSE",
    description: "Programming, databases, networking and software.",
    Icon: Code2,
  },
  {
    name: "Electronics & Communication",
    code: "ECE",
    description: "Electronics, communication and digital systems.",
    Icon: RadioTower,
  },
  {
    name: "Electrical Engineering",
    code: "EEE",
    description: "Electrical circuits, machines and power systems.",
    Icon: Zap,
  },
  {
    name: "Mechanical Engineering",
    code: "MECH",
    description: "Mechanics, manufacturing and thermal engineering.",
    Icon: Wrench,
  },
  {
    name: "Civil Engineering",
    code: "CIVIL",
    description: "Structures, construction and surveying.",
    Icon: Building2,
  },
  {
    name: "General Engineering",
    code: "GENERAL",
    description: "Mathematics, science and engineering fundamentals.",
    Icon: BookOpen,
  },
];

const navigation = [
  { label: "Home", Icon: House },
  { label: "Quizzes", Icon: ClipboardList },
  { label: "Results", Icon: ChartNoAxesColumn },
  { label: "Achievements", Icon: Trophy },
  { label: "Profile", Icon: UserRound },
];

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);

      if (!currentUser) {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) {
      setQuizResults([]);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;
    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const data = await apiFetch<QuizHistoryItem[]>("/api/results/me");
        if (!cancelled) {
          if (!Array.isArray(data)) throw new Error("Unexpected quiz history response.");
          setQuizResults(data);
        }
      } catch (error) {
        if (!cancelled) {
          setHistoryError(error instanceof Error ? error.message : "Unable to load quiz history.");
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }
    void loadHistory();
    return () => { cancelled = true; };
  }, [user]);

  const sortedResults = useMemo(() => [...quizResults].sort((a, b) =>
    (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")
  ), [quizResults]);
  const attempts = sortedResults.length;
  const averageAccuracy = attempts
    ? Math.round(sortedResults.reduce((sum, item) => sum + validPercentage(item), 0) / attempts)
    : null;
  // Dashboard scoring rule: 10 points for each correct answer.
  const totalPoints = sortedResults.reduce((sum, item) => sum + Math.max(0, Number(item.correctAnswers) || 0) * 10, 0);
  const recentResults = sortedResults.slice(0, 5);

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return branches.filter((branch) =>
      `${branch.name} ${branch.code} ${branch.description}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch {
      setNotice("Unable to sign out. Please try again.");
    }
  }

  function handleNavigation(label: string) {
    setMenuOpen(false);

    const routes: Record<string, string> = {
      Home: "/dashboard",
      Quizzes: "/quizzes",
      Results: "/results",
      Achievements: "/achievements",
      Profile: "/profile",
    };

    const destination = routes[label];

    if (destination) {
      router.push(destination);
    }
  }
  if (checkingAuth || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faf9]">
        <div className="text-center">
          <GraduationCap
            size={40}
            className="mx-auto mb-4 text-[#007c70]"
          />
          <p className="font-medium text-[#526572]">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  const displayName =
    user.displayName || user.email?.split("@")[0] || "Student";

  const stats = [
    {
      title: "Quizzes Attempted",
      value: historyLoading ? "..." : historyError ? "—" : String(attempts),
      description: historyError ? "History unavailable" : attempts ? "Completed quizzes" : "No attempts yet",
      Icon: ClipboardList,
    },
    {
      title: "Average Accuracy",
      value: historyLoading ? "..." : historyError || averageAccuracy === null ? "—" : `${averageAccuracy}%`,
      description: historyError ? "History unavailable" : attempts ? "Across completed quizzes" : "Complete a quiz to begin",
      Icon: Target,
    },
    {
      title: "Total Points",
      value: historyLoading ? "..." : historyError ? "—" : String(totalPoints),
      description: historyError ? "History unavailable" : "10 points per correct answer",
      Icon: Trophy,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#17242f]">
      <header className="sticky top-0 z-50 border-b border-[#e2ebe8] bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex h-19 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#007c70] p-2.5 text-white">
              <GraduationCap size={23} />
            </div>
            <span className="text-base font-bold tracking-tight sm:text-xl">
              EngineeringQuizHub
            </span>
          </div>



          <div className="hidden items-center gap-4 lg:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                aria-controls="dashboard-notifications"
                className="cursor-pointer rounded-xl p-2.5 text-[#64748b] hover:bg-[#f1f5f4]"
              >
                <Bell size={20} />
              </button>

              {notificationsOpen && (
                <div
                  id="dashboard-notifications"
                  className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-[#e2ebe8] bg-white p-5 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-[#17242f]">
                      Notifications
                    </h2>
                    <span className="text-xs text-[#64748b]">
                      0 unread
                    </span>
                  </div>

                  <div className="mt-5 border-t border-[#e2ebe8] pt-6 text-center">
                    <Bell
                      size={28}
                      className="mx-auto text-[#94a3b8]"
                    />
                    <p className="mt-3 font-semibold text-[#17242f]">
                      You're all caught up!
                    </p>
                    <p className="mt-2 text-sm text-[#64748b]">
                      New quiz announcements and important updates
                      will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => router.push("/profile")}
              aria-label="Open profile"
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold transition hover:bg-[#e1f2ee]"
            >
              <UserRound size={19} className="text-[#007c70]" />
              <span className="max-w-32 truncate">{displayName}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#d8e2ee] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#f0f5fa]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            className="cursor-pointer rounded-lg p-2 lg:hidden"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#e2ebe8] bg-white px-5 py-5 lg:hidden">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <UserRound size={18} className="text-[#007c70]" />
              {displayName}
            </div>

            <div className="space-y-1">
              {navigation.map(({ label, Icon }) => (
                <button
                  key={label}
                  onClick={() => handleNavigation(label)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-[#f1f5f4]"
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <aside className="fixed left-0 top-19 bottom-0 z-40 hidden w-64 border-r border-[#e2ebe8] bg-white px-4 py-7 lg:block">
        <p className="mb-5 px-4 text-xs font-bold tracking-widest text-[#94a3b8]">
          NAVIGATION
        </p>

        <nav aria-label="Dashboard navigation" className="space-y-2">
          {navigation.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => handleNavigation(label)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                label === "Home"
                  ? "bg-[#e1f2ee] text-[#007c70]"
                  : "text-[#526572] hover:bg-[#f1f5f4] hover:text-[#007c70]"
              }`}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="mx-auto max-w-7xl space-y-9 px-5 py-8 sm:py-10 lg:ml-64 lg:px-8">
        {notice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-[#cce9e2] bg-[#e1f2ee] px-4 py-3 text-sm text-[#006458]"
          >
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="relative overflow-hidden rounded-3xl bg-[#007c70] px-7 py-10 text-white sm:px-12 sm:py-12">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/20" />
          <div className="absolute -bottom-32 right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-[#c5eee4]">
              YOUR LEARNING DASHBOARD
            </p>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
              Welcome back, {displayName}!
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#e1f2ee] sm:text-base">
              Explore engineering subjects, challenge your knowledge,
              and monitor your learning progress in one place.
            </p>

            <button
              onClick={() => router.push("/quizzes")}
              className="mt-7 flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#007c70] transition hover:bg-[#e1f2ee]"
            >
              Explore Quizzes
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <section id="performance" className="scroll-mt-28">
          <div className="mb-5">
            <h2 className="text-xl font-bold sm:text-2xl">
              Performance Overview
            </h2>
            <p className="mt-1 text-sm text-[#64748b]">
              Your learning statistics at a glance.
            </p>
          </div>

          {historyError && (
            <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load quiz history: {historyError}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ title, value, description, Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#e2ebe8] bg-white p-6 shadow-sm shadow-slate-900/5"
              >
                <div className="mb-5 inline-flex rounded-xl bg-[#e1f2ee] p-3 text-[#007c70]">
                  <Icon size={22} />
                </div>
                <p className="text-sm font-medium text-[#64748b]">
                  {title}
                </p>
                <h3 className="mt-2 text-3xl font-bold">{value}</h3>
                <p className="mt-2 text-xs text-[#94a3b8]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="branches" className="scroll-mt-28">
          <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold tracking-widest text-[#007c70]">
                EXPLORE CATEGORIES
              </p>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Engineering Branches
              </h2>
              <p className="mt-2 text-sm text-[#64748b]">
                Choose a branch to explore subject-based quizzes.
              </p>
            </div>

            <div className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#d8e2ee] bg-white px-4 focus-within:border-[#007c70] md:max-w-80">
              <Search size={19} className="shrink-0 text-[#94a3b8]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search branches..."
                aria-label="Search engineering branches"
                className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#94a3b8]"
              />
            </div>
          </div>

          {filteredBranches.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map(({ name, code, description, Icon }) => (
                <article
                  key={code}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/quizzes?branch=${encodeURIComponent(code)}`)}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") router.push(`/quizzes?branch=${encodeURIComponent(code)}`); }}
                  className="group rounded-2xl border border-[#e2ebe8] bg-white p-6 transition hover:border-[#007c70] hover:shadow-lg hover:shadow-emerald-900/5"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e1f2ee] text-[#007c70]">
                      <Icon size={27} />
                    </div>

                    <span className="rounded-full bg-[#f0f5f3] px-3 py-1 text-xs font-bold text-[#007c70]">
                      {code}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold">{name}</h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#64748b]">
                    {description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#007c70]">
                    Explore subjects
                    <ArrowRight size={17} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d8e2ee] bg-white px-6 py-14 text-center">
              <Search size={28} className="mx-auto mb-4 text-[#94a3b8]" />
              <h3 className="font-bold">No matching branches</h3>
              <p className="mt-2 text-sm text-[#64748b]">
                Try searching with a different branch name or code.
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 cursor-pointer text-sm font-semibold text-[#007c70] hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#e2ebe8] bg-white p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#e1f2ee] p-3 text-[#007c70]"><Clock3 size={23} /></div>
                <h2 className="text-xl font-bold">Recent Activity</h2>
              </div>
              <button type="button" onClick={() => router.push("/results")}
                className="text-sm font-semibold text-[#007c70] hover:underline">View All Results</button>
            </div>
            {historyLoading ? (
              <p className="py-8 text-sm text-[#64748b]">Loading quiz history...</p>
            ) : historyError ? (
              <p className="py-8 text-sm text-red-600">Quiz history is temporarily unavailable.</p>
            ) : recentResults.length ? (
              <div className="space-y-3">
                {recentResults.map((result) => (
                  <div key={result.resultId} className="rounded-xl border border-[#e2ebe8] bg-[#fbfcfc] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{quizSubjectName(result.subjectId)}</p>
                        <p className="mt-1 text-xs text-[#64748b]">
                          {[result.branch, result.difficulty].filter(Boolean).join(" · ")}
                          {result.submittedAt && !Number.isNaN(Date.parse(result.submittedAt))
                            ? ` · ${new Date(result.submittedAt).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#007c70]">{Math.round(validPercentage(result))}%</p>
                        <p className="text-xs text-[#64748b]">{result.correctAnswers ?? 0}/{result.totalQuestions ?? 0} correct</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e1f2ee]">
                      <div className="h-full rounded-full bg-[#007c70]" style={{ width: `${validPercentage(result)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d8e2ee] bg-[#fbfcfc] px-5 py-10 text-center">
                <ClipboardList size={30} className="mx-auto mb-4 text-[#94a3b8]" />
                <h3 className="font-semibold">No quiz activity yet</h3>
                <p className="mt-2 text-sm text-[#64748b]">Your completed quizzes will appear here.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e2ebe8] bg-white p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#e1f2ee] p-3 text-[#007c70]"><ChartNoAxesColumn size={23} /></div>
              <h2 className="text-xl font-bold">Learning Insights</h2>
            </div>
            {historyLoading ? (
              <p className="py-8 text-sm text-[#64748b]">Loading learning insights...</p>
            ) : historyError ? (
              <p className="py-8 text-sm text-red-600">Learning insights are temporarily unavailable.</p>
            ) : attempts ? (
              <div>
                <p className="text-sm text-[#64748b]">Average accuracy across {attempts} completed {attempts === 1 ? "quiz" : "quizzes"}</p>
                <p className="mt-2 text-3xl font-bold text-[#007c70]">{averageAccuracy}%</p>
                <p className="mb-4 mt-5 text-sm font-semibold">Recent accuracy trend</p>
                <div className="flex h-40 items-end gap-3 rounded-xl bg-[#fbfcfc] p-4">
                  {[...recentResults].reverse().map((result) => (
                    <div key={result.resultId} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                      title={`${quizSubjectName(result.subjectId)}: ${Math.round(validPercentage(result))}%`}>
                      <span className="text-xs font-semibold">{Math.round(validPercentage(result))}%</span>
                      <div className="w-full max-w-12 rounded-t-md bg-[#007c70]"
                        style={{ height: `${Math.max(2, validPercentage(result))}%` }} />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[#64748b]">Oldest to newest among your last five attempts.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d8e2ee] bg-[#fbfcfc] px-5 py-10 text-center">
                <Target size={30} className="mx-auto mb-4 text-[#94a3b8]" />
                <h3 className="font-semibold">Your progress starts here</h3>
                <p className="mt-2 text-sm text-[#64748b]">Complete a quiz to see your performance trend.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="mt-10 border-t border-[#e2ebe8] bg-white px-5 py-7 text-center text-sm text-[#64748b]">
        EngineeringQuizHub - Your knowledge, your progress.
      </footer>
    </main>
  );
}
