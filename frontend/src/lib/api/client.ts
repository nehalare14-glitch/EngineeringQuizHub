
import { auth } from "@/lib/firebase/config";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://engineeringquizhub.onrender.com";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get currently authenticated Firebase user
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in first.");
  }

  // Get Firebase ID token
  const token = await user.getIdToken();

  // Prepare request headers
  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${token}`);

  // Automatically set JSON content type for requests with a body
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Send authenticated request to Spring Boot
  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check the API URL, network connection, and browser console for CORS errors."
    );
  }

  // Handle API errors
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
      // Keep the HTTP status error if response is not JSON
    }

    throw new Error(message);
  }

  // Handle responses without a body
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
