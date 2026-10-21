import { USE_MOCK_DATA } from "@/config/data-source";

/**
 * In mock mode every data call should go through a mock service. If a request
 * still reaches clientFetch/serverFetch, answer it locally with a 503 instead
 * of contacting the backend, and log it so the missing mock is easy to find.
 */
export function blockedInMockMode(path: string): Response | null {
  if (!USE_MOCK_DATA) return null;
  console.warn(`[mock] Blocked backend request "${path}" — no mock service handles it.`);
  return new Response(
    JSON.stringify({
      success: false,
      message: `No mock available for "${path}" (NEXT_PUBLIC_DATA_SOURCE=mock)`,
      data: null,
      timestamp: new Date().toISOString(),
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}
