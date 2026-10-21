export type sortOrder = "ASC" | "DESC";
export type Gender = "Male" | "Female";
export type Role = "User" | "Organizer" | "Moderator" | "Admin";
export type AppStatus = "Pending" | "Approved" | "Rejected";
export type AppContentType = "Event" | "Activity";
export type AppBaseCategoryType =
    | "Traditional"
    | "Cultural"
    | "Sport"
    | "Entertainment"
    | "Education"
    | "Health"
    | "International"
    | "Music"
    | "Food"
    | "Adventure"
    | "Technology"
    | "Community"
    | "Business"
    | "Career"
    | "Networking"
    | "Art"
    | "Exhibition"
    | "Charity"
    | "Workshop"
    | "Fashion"
    | "Photography"
    | "Gaming"
    | "Movie"
    | "Religious"
    | "Nightlife"
    | "Other";
export type MediaType = "Image" | "Video";
export type ActionRes<T> =
    | { success: true; data: T }
    | { success: false; error: string; fieldErrors?: Record<string, string> };

export interface ApiRes<T> {
    success: boolean;
    message: string | null;
    data: T;
    timestamp: string;
}

export interface ApiErr {
    title: string;
    status: number;
    detail: string;
    instance: string;
    errors?: Record<string, string>;
    timestamp: string;
}

export interface CursorData<T> {
    content: T[];
    nextCursor?: string | null;
    hasNext?: boolean;
}

export interface PaginationMeta {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export type PaginatedData<T> = { content: T[] } & PaginationMeta;

export interface ProblemDetails {
    title: string;
    status: number;
    detail: string;
    instance: string;
    timestamp: string;
    errors?: Record<string, string>;
}

export interface AgendaDay {
    id: number;
    dayLabel: string;
    dateValue?: string;
    dateLabel: string;
    accentColor: string;
    start: string;
    end: string;
    speaker: string;
    description: string;
}