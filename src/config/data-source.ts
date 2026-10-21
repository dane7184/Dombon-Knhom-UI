// Single switch between mock data and the real Dombon Khnom API.
//
// NEXT_PUBLIC_* variables are inlined at build time, so restart `next dev`
// (or rebuild) after changing NEXT_PUBLIC_DATA_SOURCE.

export type DataSource = "mock" | "api";

const rawDataSource = process.env.NEXT_PUBLIC_DATA_SOURCE?.trim().toLowerCase();

// Anything other than an explicit "api" falls back to mock, so a missing
// variable never sends requests to a backend that may not be reachable.
export const DATA_SOURCE: DataSource = rawDataSource === "api" ? "api" : "mock";

export const USE_MOCK_DATA = DATA_SOURCE === "mock";
