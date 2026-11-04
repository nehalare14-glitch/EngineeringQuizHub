"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { apiFetch } from "@/lib/api/client";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

type Question = {
  id: string;
  questionText: string;
  difficulty: string;
  options: Record<string, string>;
};

type QuizResult = {
  resultId: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
};

export default function ApiTestPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Checking authentication...");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAuthenticated(Boolean(user));

      if (!user) {
        setQuestions([]);
        setStatus("Please sign in first.");
      }
    });
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    let cancelled = false;

    setQuestions([]);
    setAnswers({});
    setResult(null);
    setStatus("Fetching questions...");

    async function loadQuestions() {
      try {
        const data = await apiFetch<Question[]>(
          `/api/quizzes/questions?branch=CSE&subjectId=CSE_PROGRAMMING&difficulty=${difficulty}`
        );

        if (!cancelled) {
          setQuestions(data);
          setStatus(`Retrieved ${data.length} questions.`);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      }
    }

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [authenticated, difficulty]);

  async function submitQuiz() {
    if (questions.length === 0 || submitting || result) return;

    if (questions.some((question) => !answers[question.id])) {
      setStatus("Please answer all questions.");
      return;
    }

    setSubmitting(true);
    setStatus("Submitting quiz...");

    try {
      const data = await apiFetch<QuizResult>(
        "/api/quizzes/submit",
        {
          method: "POST",
          body: JSON.stringify({
            branch: "CSE",
            subjectId: "CSE_PROGRAMMING",
            difficulty,
            answers: questions.map((question) => ({
              questionId: question.id,
              selectedOption: answers[question.id],
            })),
          }),
        }
      );

      setResult(data);
      setStatus("Quiz submitted successfully!");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">
        EngineeringQuizHub API Test
      </h1>

      <div className="my-6 flex flex-wrap gap-3">
        {(["EASY", "MEDIUM", "HARD"] as const).map((level) => (
          <button
            key={level}
            type="button"
            disabled={submitting}
            onClick={() => setDifficulty(level)}
            className={`rounded-lg px-5 py-2 font-semibold ${
              difficulty === level
                ? "bg-teal-700 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <p className="my-5">{status}</p>

      {questions.map((question, index) => (
        <div
          key={question.id}
          className="mb-4 rounded-xl border p-5"
        >
          <h2 className="font-semibold">
            {index + 1}. {question.questionText}
          </h2>

          {Object.entries(question.options).map(([key, value]) => (
            <label
              key={key}
              className="mt-3 flex items-center gap-3"
            >
              <input
                type="radio"
                name={question.id}
                value={key}
                checked={answers[question.id] === key}
                disabled={Boolean(result) || submitting}
                onChange={() =>
                  setAnswers((previous) => ({
                    ...previous,
                    [question.id]: key,
                  }))
                }
              />
              {key}. {value}
            </label>
          ))}
        </div>
      ))}

      {questions.length > 0 && !result && (
        <button
          type="button"
          onClick={submitQuiz}
          disabled={submitting}
          className="rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Test Quiz"}
        </button>
      )}

      {result && (
        <section className="mt-6 rounded-xl border p-6">
          <h2 className="text-xl font-bold">Quiz Result</h2>
          <p>Correct Answers: {result.correctAnswers}</p>
          <p>Total Questions: {result.totalQuestions}</p>
          <p>Percentage: {result.percentage}%</p>
          <p className="mt-3 break-all text-sm">
            Result ID: {result.resultId}
          </p>
        </section>
      )}
    </main>
  );
}