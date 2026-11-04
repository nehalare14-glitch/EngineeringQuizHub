"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { apiFetch } from "@/lib/api/client";
import { BrainCircuit, 
  ArrowLeft, ArrowRight, BookOpen, Building2, CheckCircle2, CircuitBoard,
  Code2, GraduationCap, Layers3, Search, Settings2, Sparkles, X,
} from "lucide-react";

type ApiSubject = {
  id: string;
  name: string;
  branchCode: string;
};

type Branch = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: typeof Code2;
  subjects: string[];
};

// Subject names are browsing categories, not published quizzes.
const branches: Branch[] = [
  {
    id: "cse", name: "Computer Science & Engineering", shortName: "CSE",
    description: "Programming, computing, and software foundations.", icon: Code2,
    subjects: ["Programming", "Data Structures", "Database Management", "Computer Networks", "Operating Systems"],
  },
  {
    id: "ece", name: "Electronics & Communication", shortName: "ECE",
    description: "Electronics, signals, and communication systems.", icon: CircuitBoard,
    subjects: ["Digital Electronics", "Analog Electronics", "Communication Systems", "Microprocessors"],
  },
  {
    id: "eee", name: "Electrical & Electronics", shortName: "EEE",
    description: "Electrical circuits, machines, and power systems.", icon: Settings2,
    subjects: ["Circuit Theory", "Electrical Machines", "Power Systems", "Control Systems"],
  },
  {
    id: "mech", name: "Mechanical Engineering", shortName: "MECH",
    description: "Mechanics, manufacturing, and thermal engineering.", icon: Layers3,
    subjects: ["Engineering Mechanics", "Thermodynamics", "Manufacturing", "Machine Design"],
  },
  {
    id: "civil", name: "Civil Engineering", shortName: "CIVIL",
    description: "Structures, materials, and construction engineering.", icon: Building2,
    subjects: ["Surveying", "Structural Engineering", "Building Materials", "Environmental Engineering"],
  },
  {
    id: "aiml",
    name: "Artificial Intelligence & Machine Learning",
    shortName: "AI & ML",
    description: "Intelligent systems, machine learning, and emerging AI technologies.",
    icon: BrainCircuit,
    subjects: [
      "Python for AI",
      "Machine Learning",
      "Deep Learning",
      "Neural Networks",
      "Natural Language Processing",
      "Generative AI",
    ],
  },
];

export default function QuizzesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("branch")?.toLowerCase();
    if (requested && branches.some((branch) => branch.id === requested)) setSelectedBranch(requested);
  }, []);
  const [apiSubjects, setApiSubjects] = useState<ApiSubject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) router.replace("/login");
    });
  }, [router]);

  useEffect(() => {
    if (!user || !selectedBranch) {
      return;
    }

    let cancelled = false;

    setApiSubjects([]);
    setSubjectsError("");
    setSubjectsLoading(true);

    const branchCode = selectedBranch.toUpperCase();

    async function loadSubjects() {
      try {
        const data = await apiFetch<ApiSubject[]>(
          `/api/subjects?branch=${encodeURIComponent(branchCode)}`
        );

        if (!cancelled) {
          setApiSubjects(data);
        }
      } catch (error) {
        if (!cancelled) {
          setSubjectsError(
            error instanceof Error ? error.message : "Unable to load subjects."
          );
        }
      } finally {
        if (!cancelled) {
          setSubjectsLoading(false);
        }
      }
    }

    void loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [user, selectedBranch]);

  const visibleBranches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return branches.filter((branch) =>
      !query || [branch.name, branch.shortName, branch.description, ...branch.subjects]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [search]);

  const activeBranch = branches.find((branch) => branch.id === selectedBranch) ?? null;

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8faf9]">
        <p className="text-[#007c70]">Checking your account...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#17242f]">
      <header className="border-b border-[#e2ebe8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3 font-bold">
            <span className="shrink-0 rounded-xl bg-[#007c70] p-2 text-white"><GraduationCap size={24} /></span>
            <span className="truncate">EngineeringQuizHub</span>
          </Link>
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#007c70]">
            <ArrowLeft size={17} /> Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl bg-[#007c70] px-7 py-9 text-white sm:px-11 sm:py-12">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium">
              <Sparkles size={16} /> Learn one topic at a time
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Explore Quizzes</h1>
            <p className="mt-4 text-sm leading-7 text-white/85 sm:text-base">
              Choose your engineering branch, discover subjects, and get ready to test your knowledge.
            </p>
          </div>
          <BookOpen size={190} aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-8 text-white/10" />
        </section>

        <section aria-labelledby="branches-heading" className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 id="branches-heading" className="text-2xl font-bold">Choose your branch</h2>
              <p className="mt-2 text-sm text-[#64748b]">Browse subjects by engineering discipline.</p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search size={19} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                aria-label="Search branches or subjects"
                placeholder="Search branches or subjects"
                className="w-full rounded-xl border border-[#e2ebe8] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#007c70] focus:ring-2 focus:ring-[#007c70]/15"
              />
            </div>
          </div>

          {visibleBranches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleBranches.map((branch) => {
                const Icon = branch.icon;
                const active = selectedBranch === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranch(branch.id)}
                    aria-pressed={active}
                    className={`cursor-pointer rounded-2xl border bg-white p-6 text-left transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007c70] ${active ? "border-[#007c70] ring-2 ring-[#007c70]/15" : "border-[#e2ebe8] hover:border-[#a8d8ce]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-2xl bg-[#e1f2ee] p-3 text-[#007c70]"><Icon size={26} /></span>
                      {active ? <CheckCircle2 size={21} className="text-[#007c70]" /> : <ArrowRight size={19} className="text-[#94a3b8]" />}
                    </div>
                    <span className="mt-5 block text-xs font-bold uppercase tracking-wider text-[#007c70]">{branch.shortName}</span>
                    <h3 className="mt-1 text-lg font-bold">{branch.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#64748b]">{branch.description}</p>
                    <p className="mt-4 text-xs font-semibold text-[#64748b]">{branch.subjects.length} subject categories</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e2ebe8] bg-white px-6 py-12 text-center">
              <Search size={28} className="mx-auto text-[#94a3b8]" />
              <h3 className="mt-3 font-bold">No matching branches</h3>
              <p className="mt-2 text-sm text-[#64748b]">Try another branch or subject name.</p>
              <button type="button" onClick={() => setSearch("")} className="mt-4 cursor-pointer text-sm font-semibold text-[#007c70]">Clear search</button>
            </div>
          )}
        </section>

        {activeBranch ? (
          <section aria-labelledby="subjects-heading" className="rounded-3xl border border-[#cce9e2] bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#007c70]">Selected branch - {activeBranch.shortName}</p>
                <h2 id="subjects-heading" className="mt-2 text-2xl font-bold">Explore subjects</h2>
                <p className="mt-2 text-sm text-[#64748b]">Choose a subject to begin your quiz.</p>
              </div>
              <button type="button" onClick={() => setSelectedBranch(null)} aria-label="Close selected branch" className="cursor-pointer rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f4]"><X size={20} /></button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjectsLoading ? (
                <p className="text-sm text-[#64748b]">
                  Loading available subjects...
                </p>
              ) : subjectsError ? (
                <p role="alert" className="text-sm text-red-600">
                  {subjectsError}
                </p>
              ) : apiSubjects.length === 0 ? (
                <p className="text-sm text-[#64748b]">
                  No subjects are currently available for this branch.
                </p>
              ) : (
                apiSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-3 rounded-xl border border-[#e2ebe8] bg-[#f8faf9] px-4 py-4"
                  >
                    <BookOpen size={18} className="shrink-0 text-[#007c70]" />
                    <span className="flex-1 text-sm font-semibold">
                      {subject.name}
                    </span>
                    <Link
                      href={`/quizzes/start?branch=${encodeURIComponent(subject.branchCode)}&subjectId=${encodeURIComponent(subject.id)}`}
                      className="text-xs font-bold text-[#007c70] hover:underline"
                    >
                      Start Quiz
                    </Link>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 rounded-xl bg-[#eaf7f3] px-5 py-4 text-sm leading-6 text-[#006458]">
              Select a subject to explore available quiz questions and difficulty levels.
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-[#e2ebe8] bg-white px-6 py-8 text-center">
            <BookOpen size={28} className="mx-auto text-[#007c70]" />
            <h2 className="mt-3 text-lg font-bold">Your next challenge starts here</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#64748b]">
              Select a branch above to see its subjects. Published quizzes will appear once the quiz system is connected.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

