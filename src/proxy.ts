import {auth} from "@/lib/auth";
import {NextResponse} from "next/server";
import type {Session} from "next-auth";

const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
];

const ROLE_PROTECTED: Record<string, { roles: string[]; requiresOrgMode?: boolean }> = {
    "/moderator": {roles: ["Moderator"]},
    "/organizer": {roles: ["Organizer"], requiresOrgMode: true},
    "/system-admin": {roles: ["Admin"]},
};

function getRedirectUrl(session: Session | null, requestUrl: URL): string | null {
    const {pathname} = requestUrl;

    const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (!session) {
        if (isPublicRoute) return null;
        return new URL("/login", requestUrl).toString();
    }

    const role = session.user.role;

    if (isPublicRoute) {
        return getDashboardHome(role, requestUrl);
    }

    for (const [prefix, config] of Object.entries(ROLE_PROTECTED)) {
        if (pathname.startsWith(prefix)) {
            if (!config.roles.includes(role)) {
                return getDashboardHome(role, requestUrl);
            }
            if (config.requiresOrgMode && !session.user.orgId) {
                return new URL("/home", requestUrl).toString();
            }
            return null;
        }
    }
    const isMainRoute =
        pathname.startsWith("/discovery") ||
        pathname.startsWith("/events") ||
        pathname.startsWith("/home") ||
        pathname.startsWith("/notifications") ||
        pathname.startsWith("/posts") ||
        pathname.startsWith("/profile");

    if (isMainRoute && (role === "Admin" || role === "Moderator")) {
        return getDashboardHome(role, requestUrl);
    }

    return null;
}

function getDashboardHome(role: string, requestUrl: URL): string | null {
    switch (role) {
        case "Admin":
            return new URL("/system-admin", requestUrl).toString();
        case "Moderator":
            return new URL("/moderator", requestUrl).toString();
        case "Organizer":
            return new URL("/organizer/events", requestUrl).toString();
        case "User":
            return new URL("/home", requestUrl).toString();
        default:
            return new URL("/login", requestUrl).toString();
    }
}

export const proxy = auth((req) => {
    const {nextUrl} = req;
    const session = req.auth;
    if (session && !session.user?.accessToken) {
        return NextResponse.redirect(new URL("/login", nextUrl).toString());
    }
    const redirectTo = getRedirectUrl(session, nextUrl);

    if (redirectTo) {
        return NextResponse.redirect(redirectTo);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};