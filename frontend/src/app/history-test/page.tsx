"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { apiFetch } from "@/lib/api/client";

type QuizResult = {
  resultId: string;
  branch: string;
  subjectId: string;
  difficulty: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
};

export default function HistoryTestPage() {
  const [status, setStatus] = useState("Checking authentication...");
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAuthenticated(Boolean(user));
      setStatus(user ? "Ready to load history." : "Please sign in first.");
      if (!user) setResults([]);
    });
  }, []);

  async function loadHistory() {
    if (!authenticated || loading) return;

    setLoading(true);
    setStatus("Loading quiz history...");

    try {
      const data = await apiFetch<QuizResult[]>("/api/results/me");
      setResults(data);
      setStatus(`Successfully retrieved ${data.length} quiz results.`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-bold">
        EngineeringQuizHub - Quiz History Test
      </h1>

      <button
        type="button"
        onClick={loadHistory}
        disabled={!authenticated || loading}
        className="my-6 rounded-lg bg-teal-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load My Quiz History"}
      </button>

      <p className="mb-6">{status}</p>

      {results.map((result) => (
        <div
          key={result.resultId}
          className="mb-4 rounded-xl border p-5"
        >
          <h2 className="text-lg font-bold">{result.subjectId}</h2>
          <p>Branch: {result.branch}</p>
          <p>Difficulty: {result.difficulty}</p>
          <p>
            Score: {result.correctAnswers} / {result.totalQuestions}
          </p>
          <p>Percentage: {result.percentage}%</p>
          <p>
            Submitted: {new Date(result.submittedAt).toLocaleString()}
          </p>
          <p className="mt-2 break-all text-xs">
            Result ID: {result.resultId}
          </p>
        </div>
      ))}
    </main>
  );
}