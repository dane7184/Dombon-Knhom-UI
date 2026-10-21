// Shared helpers for mock services. Nothing here talks to the network.

import type { ApiErr, ApiRes, PaginatedData } from "@/types/common.type";
import type { CursorPage } from "@/types/event.type";

// ── IDs ──────────────────────────────────────────────────────

/**
 * Deterministic UUID-shaped id. Several forms validate ids with z.uuid() or a
 * UUID regex, so mock ids must look like real ones.
 *   mockId("3", 1) → "30000000-0000-4000-8000-000000000001"
 */
export function mockId(prefix: string, n: number): string {
  return `${prefix}0000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
}

let runtimeIdCounter = 0x100000;

/** Fresh id for records created at runtime (in-memory only). */
export function nextMockId(prefix: string): string {
  runtimeIdCounter += 1;
  return mockId(prefix, runtimeIdCounter);
}

// ── Timing & deterministic failures ─────────────────────────

const DEFAULT_DELAY_MS = Number(process.env.NEXT_PUBLIC_MOCK_DELAY_MS ?? 200);

/** Simulates network latency so loading states remain visible. */
export function mockDelay(ms: number = DEFAULT_DELAY_MS): Promise<void> {
  if (!ms || ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockServiceError extends Error {
  constructor(scope: string) {
    super(`[mock] Simulated failure for "${scope}"`);
    this.name = "MockServiceError";
  }
}

const FAIL_SCOPES = (process.env.NEXT_PUBLIC_MOCK_FAIL ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * True when NEXT_PUBLIC_MOCK_FAIL lists this scope (or "*"). Scopes match by
 * prefix, so "organizer" fails every "organizer.*" call.
 * Example: NEXT_PUBLIC_MOCK_FAIL=organizer.kpi,activity.gallery
 */
export function shouldMockFail(scope: string): boolean {
  return FAIL_SCOPES.some(
    (s) => s === "*" || scope === s || scope.startsWith(`${s}.`),
  );
}

/** Waits like a request would, then throws if the scope is configured to fail. */
export async function mockRequest(scope: string, ms?: number): Promise<void> {
  await mockDelay(ms);
  if (shouldMockFail(scope)) throw new MockServiceError(scope);
}

// ── Response envelopes ───────────────────────────────────────

export function apiRes<T>(data: T, message: string | null = null): ApiRes<T> {
  return { success: true, message, data, timestamp: new Date().toISOString() };
}

/**
 * A Response carrying the backend's ProblemDetails shape. Several real services
 * `throw res` on failure and callers read `err.json().detail`, so mock services
 * throw the same thing to keep that error handling working.
 */
export function apiErrorResponse(
  status: number,
  detail: string,
  errors?: Record<string, string>,
): Response {
  const body: ApiErr = {
    title: status === 401 ? "Unauthorized" : "Bad Request",
    status,
    detail,
    instance: "mock",
    errors,
    timestamp: new Date().toISOString(),
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Pagination ───────────────────────────────────────────────

/** Cursor pagination where the cursor is the stringified start offset. */
export function cursorPage<T>(
  items: readonly T[],
  cursor: string | null | undefined,
  size: number,
): CursorPage<T> {
  const start = Math.max(0, Number(cursor) || 0);
  const safeSize = Math.max(1, size);
  const content = items.slice(start, start + safeSize);
  const end = start + content.length;
  const hasNext = end < items.length;
  return { content, nextCursor: hasNext ? String(end) : null, hasNext };
}

/** 1-based page pagination matching the backend's PaginatedData shape. */
export function offsetPage<T>(
  items: readonly T[],
  page: number,
  size: number,
): PaginatedData<T> {
  const safeSize = Math.max(1, size);
  const totalPages = Math.max(1, Math.ceil(items.length / safeSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * safeSize;
  return {
    content: items.slice(start, start + safeSize),
    page: current,
    size: safeSize,
    totalElements: items.length,
    totalPages,
    first: current === 1,
    last: current === totalPages,
  };
}

// ── Dates ────────────────────────────────────────────────────

/** ISO timestamp relative to now, so "upcoming"/"past" mock data never goes stale. */
export function isoFromNow(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** "YYYY-MM" for `offset` months from the current month (0 = this month). */
export function monthKey(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Misc ─────────────────────────────────────────────────────

/** Copies fixtures before handing them out so callers can't mutate the store. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Logs writes so it's obvious they only changed in-memory mock state. */
export function logMockWrite(operation: string, detail?: unknown): void {
  console.info(
    `[mock] ${operation} — in-memory only, resets when the server/page reloads`,
    detail ?? "",
  );
}
