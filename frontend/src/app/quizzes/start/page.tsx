"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { apiFetch } from "@/lib/api/client";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

type Question = {
  id: string;
  questionText: string;
  options: Record<string, string>;
};

type ReviewItem = {
  questionId: string;
  questionText: string;
  options: Record<string, string>;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation?: string;
};

type QuizResult = {
  review: ReviewItem[];
  resultId: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
};

// Fisher-Yates shuffle: preserves each question ID and each original option key.
function shuffleItems<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomizeQuestions(items: Question[]): Question[] {
  return shuffleItems(items).map((question) => ({
    ...question,
    options: Object.fromEntries(Object.entries(question.options).sort(([a], [b]) => a.localeCompare(b))),
  }));
}

function QuizContent() {
  const params = useSearchParams();

  const branch = params.get("branch") ?? "";
  const subjectId = params.get("subjectId") ?? "";

  const validSelection =
    /^[A-Z0-9_]+$/.test(branch) &&
    /^[A-Z0-9_]+$/.test(subjectId) &&
    subjectId.startsWith(`${branch}_`);

  const [ready, setReady] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Checking authentication...");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"ALL" | "WRONG" | "CORRECT">("ALL");

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setReady(Boolean(user));
      if (!user) setStatus("Please sign in to continue.");
    });
  }, []);

  useEffect(() => {
    if (!ready || !validSelection) return;

    let cancelled = false;

    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setStatus("Loading questions...");

    async function loadQuestions() {
      try {
        const data = await apiFetch<Question[]>(
          `/api/quizzes/questions?branch=${encodeURIComponent(branch)}&subjectId=${encodeURIComponent(subjectId)}&difficulty=${difficulty}`
        );

        if (!cancelled) {
          setQuestions(randomizeQuestions(data));
          setStatus(
            data.length
              ? `${data.length} questions available.`
              : "No questions available for this difficulty yet."
          );
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(
            error instanceof Error ? error.message : "Unable to load quiz."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [ready, validSelection, branch, subjectId, difficulty]);

  async function submitQuiz() {
    if (submitting || result || questions.length === 0) return;

    if (questions.some((question) => !answers[question.id])) {
      setStatus("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    setStatus("Submitting your answers...");

    try {
      const data = await apiFetch<QuizResult>("/api/quizzes/submit", {
        method: "POST",
        body: JSON.stringify({
          branch,
          subjectId,
          difficulty,
          answers: questions.map((question) => ({
            questionId: question.id,
            selectedOption: answers[question.id],
          })),
        }),
      });

      setResult(data);
      setStatus("Quiz submitted successfully!");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8faf9] px-5 py-8 text-[#17242f]">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/quizzes"
          className="text-sm font-semibold text-[#007c70]"
        >
          Back to Quizzes
        </Link>

        <section className="mt-6 rounded-3xl bg-[#007c70] p-7 text-white">
          <p className="text-sm text-white/80">EngineeringQuizHub</p>
          <h1 className="mt-2 text-3xl font-bold">
            {subjectId.replace(/_/g, " ")}
          </h1>
          <p className="mt-3 text-white/85">
            Select difficulty and answer the questions.
          </p>
        </section>

        {!validSelection ? (
          <p className="mt-6 text-red-600">
            Invalid branch or subject. Please return to Quizzes.
          </p>
        ) : (
          <>
            <div className="my-6 flex flex-wrap gap-3">
              {(["EASY", "MEDIUM", "HARD"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  disabled={submitting}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-xl px-6 py-3 font-semibold ${
                    difficulty === level
                      ? "bg-[#007c70] text-white"
                      : "border border-[#e2ebe8] bg-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <p role="status" className="mb-5 text-sm text-[#64748b]">
              {status}
            </p>

            {!ready && (
              <Link href="/login" className="text-[#007c70] underline">
                Sign in
              </Link>
            )}

            {loading && (
              <p className="mb-4">Loading quiz questions...</p>
            )}

            {questions.map((question, index) => (
              <article
                key={question.id}
                className="mb-4 rounded-2xl border border-[#e2ebe8] bg-white p-6"
              >
                <h2 className="font-bold">
                  {index + 1}. {question.questionText}
                </h2>

                <div className="mt-4 space-y-3">
                  {Object.entries(question.options).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e2ebe8] p-3"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === key}
                        disabled={Boolean(result) || submitting}
                        onChange={() =>
                          setAnswers((previous) => ({
                            ...previous,
                            [question.id]: key,
                          }))
                        }
                      />
                      <span>{key}. {value}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))}

            {questions.length > 0 && !result && (
              <button
                type="button"
                onClick={submitQuiz}
                disabled={submitting || loading}
                className="rounded-xl bg-[#007c70] px-7 py-3 font-bold text-white disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}

            {result && (
              <section className="mt-6 rounded-2xl border border-[#e2ebe8] bg-white p-7">
                <h2 className="text-2xl font-bold">Quiz Completed!</h2>

                <p className="mt-4 text-4xl font-bold text-[#007c70]">
                  {result.percentage}%
                </p>

                <p className="mt-3">
                  Correct Answers: {result.correctAnswers} / {result.totalQuestions}
                </p>

                <Link
                  href="/results"
                  className="mt-6 inline-block rounded-xl bg-[#007c70] px-6 py-3 font-semibold text-white"
                >
                  View My Results
                </Link>
               </section>
            )}

            {result?.review && (
              <section className="mt-6 space-y-4" aria-label="Question review">
                <h2 className="text-2xl font-bold">Review All Questions</h2>
                <div className="flex flex-wrap gap-2">
                  {(["ALL", "WRONG", "CORRECT"] as const).map((filter) => (
                    <button key={filter} type="button" onClick={() => setReviewFilter(filter)}
                      aria-pressed={reviewFilter === filter}
                      className={`rounded-xl px-4 py-2 font-semibold ${reviewFilter === filter ? "bg-[#007c70] text-white" : "border bg-white"}`}>
                      {filter === "ALL" ? `All (${result.totalQuestions})` :
                       filter === "WRONG" ? `Incorrect (${result.totalQuestions - result.correctAnswers})` :
                       `Correct (${result.correctAnswers})`}
                    </button>
                  ))}
                </div>
                {result.review.map((item, index) => ({ ...item, index }))
                  .filter((item) => reviewFilter === "ALL" || (reviewFilter === "WRONG" ? !item.isCorrect : item.isCorrect))
                  .map((item) => (
                    <article key={`${item.questionId}-${item.index}`} className="rounded-2xl border bg-white p-6">
                      <p className={`text-sm font-bold ${item.isCorrect ? "text-green-700" : "text-red-600"}`}>
                        Question {item.index + 1} - {item.isCorrect ? "Correct" : "Incorrect"}
                      </p>
                      <h3 className="mt-2 font-bold">{item.questionText}</h3>
                      <div className="mt-4 space-y-2">
                        {Object.entries(item.options).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => (
                          <div key={key} className={`rounded-xl border p-3 ${key === item.correctOption ? "border-green-500 bg-green-50" : key === item.selectedOption ? "border-red-400 bg-red-50" : "border-slate-200"}`}>
                            <span>{key}. {value}</span>
                            {key === item.correctOption && <span className="ml-2 font-bold text-green-700"> Correct answer</span>}
                            {key === item.selectedOption && <span className="ml-2 text-sm font-semibold">(Your answer)</span>}
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-sm">Your answer: <strong>{item.selectedOption} - {item.options[item.selectedOption] ?? ""}</strong></p>
                      <p className="mt-1 text-sm text-green-700">Correct answer: <strong>{item.correctOption} - {item.options[item.correctOption] ?? ""}</strong></p>
                      {item.explanation && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm"><strong>Explanation:</strong> {item.explanation}</p>}
                    </article>
                  ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function StartQuizPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading quiz...</p>}>
      <QuizContent />
    </Suspense>
  );
}
