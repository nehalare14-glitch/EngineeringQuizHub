import { auth } from "@/lib/firebase/config";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://engineeringquizhub.onrender.com";

const REQUEST_TIMEOUT_MS = 60000;
const RETRY_DELAY_MS = 1000;

function waitForRetry(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      reject(signal?.reason);
    }

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in first.");
  }

  const method = (options.method ?? "GET").toUpperCase();
  const maxAttempts = method === "GET" ? 2 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeoutSignal])
      : timeoutSignal;

    try {
      const token = await user.getIdToken();

      if (signal.aborted) {
        throw signal.reason;
      }

      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${token}`);

      if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        signal,
        cache: "no-store",
      });

      if (!response.ok) {
        if (
          method === "GET" &&
          attempt < maxAttempts &&
          (response.status === 429 || response.status >= 500)
        ) {
          await waitForRetry(RETRY_DELAY_MS, options.signal ?? undefined);
          continue;
        }

        let message = `API request failed: ${response.status}`;

        try {
          const errorData: unknown = await response.json();

          if (
            errorData !== null &&
            typeof errorData === "object" &&
            "error" in errorData &&
            typeof errorData.error === "string"
          ) {
            message = errorData.error;
          }
        } catch {
          // Preserve HTTP status message
        }

        throw new Error(message);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (options.signal?.aborted) {
        throw error;
      }

      const isTimeout = timeoutSignal.aborted;
      const isNetworkError = error instanceof TypeError;

      if (
        method === "GET" &&
        attempt < maxAttempts &&
        (isTimeout || isNetworkError)
      ) {
        await waitForRetry(RETRY_DELAY_MS, options.signal ?? undefined);
        continue;
      }

      if (isTimeout) {
        throw new Error(
          "The server is taking too long to respond. Please try again."
        );
      }

      if (isNetworkError) {
        throw new Error(
          "Cannot connect to the backend. Check your internet connection."
        );
      }

      throw error;
    }
  }

  throw new Error("The request could not be completed.");
}