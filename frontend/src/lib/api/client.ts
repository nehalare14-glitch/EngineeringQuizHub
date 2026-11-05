import { auth } from "@/lib/firebase/config";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://engineeringquizhub.onrender.com";

const REQUEST_TIMEOUT_MS = 30000;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  const signal = options.signal
    ? AbortSignal.any([options.signal, controller.signal, timeoutSignal])
    : AbortSignal.any([controller.signal, timeoutSignal]);

  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please sign in first.");
    }

    const token = await Promise.race([
      user.getIdToken(),
      new Promise<never>((_, reject) => {
        if (signal.aborted) {
          reject(signal.reason);
          return;
        }
        signal.addEventListener(
          "abort",
          () => reject(signal.reason),
          { once: true }
        );
      }),
    ]);

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
        // Keep HTTP status message
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (timeoutSignal.aborted) {
      throw new Error(
        "The server is taking too long to respond. Please try again."
      );
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to the backend. Check your internet connection."
      );
    }

    throw error;
  } finally {
    controller.abort();
  }
}