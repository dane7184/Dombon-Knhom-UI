import { clientFetch } from "@/lib/client-fetch";
import { serverFetch } from "@/lib/server-fetch";
import {
    currentBalance,
    EventManagement,
    EventManagementDetails,
    EventManagementPage,
    organizationInfo,
    OrganizerKpi, OrgChangeAvatarType, RecentTransaction, TotalEarningsPerMonth,
    TotalLikeAndAttendee, TransactionResponse, UpdateOrganizationRequest
} from "@/types/organizer.type";

type OrganizerKpiResponse = Partial<OrganizerKpi> & {
    eventCount?: number;
    totalFavorite?: number;
    favoriteCount?: number;
    totalEarnings?: number;
    moneyEarned?: number;
    rating?: number;
    averageRating?: number;
};

const numberValue = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value.replace(/[$,]/g, "")) || 0;
    return 0;
};

const normalizeOrganizerKpi = (data: OrganizerKpiResponse): OrganizerKpi => ({
    totalEvents: numberValue(data.totalEvents ?? data.eventCount),
    totalFavorites: numberValue(
        data.totalFavorites ?? data.totalFavorite ?? data.favoriteCount
    ),
    totalMoneyEarned: numberValue(
        data.totalMoneyEarned ?? data.totalEarnings ?? data.moneyEarned
    ),
    totalRatings: numberValue(
        data.totalRatings ?? data.rating ?? data.averageRating
    ),
});

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function getOrganizerKpi(
    orgId: string,
    orgToken: string
): Promise<OrganizerKpi> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const response = await fetch(
        `${baseUrl}/organizations/${orgId}/kpi`,
        {
            headers: {
                Authorization: `Bearer ${orgToken}`,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch KPI");
    }

    const result = await response.json();
    return normalizeOrganizerKpi(result.data ?? result);
}

export async function getEventManagement(
    orgId: string,
    orgToken: string,
): Promise<EventManagement[]> {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const response = await fetch(`${baseUrl}/organizations/${orgId}/events?sort=createdAt,desc`, {
        method: "GET",
        headers: { Authorization: `Bearer ${orgToken}` },
        cache: "no-cache",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch event management ${orgId} [${response.status}]`);
    }

    const json = await response.json();

    if (!json.success) {
        throw new Error(json.message ?? "Unknown error event management");
    }

    return Array.isArray(json.data?.content) ? json.data.content as EventManagement[] : [];
}

// Cursor-paginated organizer events. Previously duplicated in
// getEventManagementAction (server) and EventsPanel (client); runs on either
// side by picking the fetch helper that carries the session token.
export async function getEventManagementPage(
    orgId: string,
    cursor: string | null = null,
): Promise<EventManagementPage> {
    const query = new URLSearchParams();
    query.set("sort", "createdAt,desc");
    if (cursor) query.set("cursor", cursor);

    const fetcher = typeof window === "undefined" ? serverFetch : clientFetch;
    const res = await fetcher(`organizations/${orgId}/events?${query.toString()}`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch events [${res.status}]: ${text}`);
    }

    const json = await res.json();
    if (!json.success) {
        throw new Error(json.message ?? "Unknown error");
    }

    return {
        events: Array.isArray(json.data?.content)
            ? (json.data.content as EventManagement[])
            : [],
        nextCursor: json.data?.nextCursor ?? null,
        hasNext: Boolean(json.data?.hasNext),
    };
}

function isFutureEvent(event: EventManagement): boolean {
    if (!event.startAt) return false;

    const startAt = new Date(event.startAt).getTime();
    return Number.isFinite(startAt) && startAt > Date.now();
}

export async function getEventUpcoming(
    orgId: string,
    orgToken: string
): Promise<EventManagement[]> {
    const events = await getEventManagement(orgId, orgToken);
    return events.filter(isFutureEvent);
}


// Total Like and Attendee per month
export async function getTotalLikeAndAttendee(
    orgId: string,
    orgToken: string
): Promise<TotalLikeAndAttendee[]> {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const response = await fetch(`${baseUrl}/organizations/${orgId}/stats`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${orgToken}`
        },
        cache: "no-cache",
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch total likes for ${orgId}`);
    }
    const json = await response.json();

    if (!json.success) {
        throw new Error(json.message ?? "Unknown error total likes for ${orgId}`);");
    }
    return Array.isArray(json.data) ? json.data : [];
}

// Top 5 Event
export async function getTop5Event(
    orgId: string,
    orgToken: string
): Promise<EventManagementDetails[]> {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const response = await fetch(`${baseUrl}/organizations/${orgId}/events/top`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${orgToken}`,
        },
        cache: "no-cache",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch top 5 events for ${orgId}`);
    }

    const json = await response.json();

    if (!json.success) {
        throw new Error(json.message ?? `Unknown error top 5 events for ${orgId}`);
    }

    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.data?.content)) return json.data.content;
    return [];
}


export async function organizationInfoService(
    orgId: string,
    orgToken: string
): Promise<organizationInfo> {

    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const response = await fetch(`${baseUrl}/organizations/${orgId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${orgToken}`
        },
        cache: "no-cache"
    });

    if (!response.ok) {
        throw new Error("Organization info could not be found");
    }

    const orgInfo = await response.json();
    // console.info(orgInfo, "orgInfo->");

    return orgInfo.data;
}


// update Organization
export async function updateOrganizationService(
    orgId: string,
    orgToken: string,
    payload: UpdateOrganizationRequest
): Promise<UpdateOrganizationRequest> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const response = await fetch(
        `${baseUrl}/organizations/${orgId}`,
        {
            method: "PUT", // change to PATCH if your API uses PATCH
            headers: {
                Authorization: `Bearer ${orgToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to update organization");
    }

    return result;
}

// Delete Account Own Organization
export async function deleteAccountOrganizer(
    orgId: string,
    orgToken: string
): Promise<void> {
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const response = await fetch(`${baseUrl}/organizations/${orgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${orgToken}` },
        cache: "no-cache",
    });

    if (!response.ok) {
        throw new Error("Failed to delete organization");
    }

    const text = await response.text();



    if (text) {
        const json = JSON.parse(text);

        if (!json.success) {
            throw new Error(json.message ?? "Failed to delete organization");
        }
    }
}

type RecentTransactionApiResponse =
    | TransactionResponse
    | RecentTransaction[]
    | {
    data?: RecentTransaction[] | TransactionResponse["data"];
    content?: RecentTransaction[];
};

function extractRecentTransactions(
    result: RecentTransactionApiResponse
): RecentTransaction[] {
    if (Array.isArray(result)) return result;
    if ("content" in result && Array.isArray(result.content)) return result.content;
    if (Array.isArray(result.data)) return result.data;
    if (result.data && "content" in result.data && Array.isArray(result.data.content)) {
        return result.data.content;
    }

    return [];
}

export async function recentTransactionService(
    orgId: string,
    orgToken: string,
    page = 1,
    size = 10
): Promise<RecentTransaction[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const response = await fetch(
        `${baseUrl}/organizations/${orgId}/transactions?page=${page}&size=${size}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${orgToken}`,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch recent transactions");
    }

    const result: RecentTransactionApiResponse = await response.json();
    return extractRecentTransactions(result);
}

export async function TotalEarningService(
    orgId: string,
    orgToken: string,
): Promise<TotalEarningsPerMonth[]> {
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const response = await fetch(`${baseUrl}/organizations/${orgId}/monthly-earning`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${orgToken}`,
        },
        cache: "no-cache",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch total earnings for org ${orgId} [${response.status}]`);
    }

    const json = await response.json();

    if (!json.success) {
        throw new Error(json.message ?? "Unknown error from monthly-earning endpoint");
    }

    return json.data as TotalEarningsPerMonth[];
}

export async function CurrentBalanceService(
    orgToken: string,
): Promise<currentBalance> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const response = await fetch(`${baseUrl}/organizations/wallet`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${orgToken}`,
        },
        cache: "no-cache",
    });

    const json = await response.json();


    if (!json.success) {
        throw new Error(json.message ?? "Unknown error from current balance");
    }

    return json.data as currentBalance;
}

export async function submitWithdrawalService(
    orgToken: string,
    body: { walletId: string; amount: number; qrString: string },
): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const response = await fetch(`${baseUrl}/organizations/wallet/withdrawal`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${orgToken}`,
        },
        body: JSON.stringify(body),
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
        throw new Error(json.message ?? `Failed to submit withdrawal [${response.status}]`);
    }
}

export async function orgChangeAvatarService(
    orgId: string,
    orgToken: string,
    file: File
): Promise<{ logoUrl?: string; avatar?: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    const formData = new FormData();
    formData.append("logo", file);

    const response = await fetch(`${baseUrl}/organizations/${orgId}/logo`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${orgToken}`,
        },
        body: formData,
    });

    const text = await response.text();
    let result: Record<string, unknown> = {};
    try {
        result = JSON.parse(text);
    } catch {
    }

    if (!response.ok) {
        console.error(`[orgChangeAvatarService] ${response.status}:`, text);
        throw new Error(
            (result.message as string) || `Failed to update logo [${response.status}]`
        );
    }
    return (result.data ?? result) as { logoUrl?: string; avatar?: string };
}