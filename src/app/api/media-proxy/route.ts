import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url parameter", {status: 400});
    }

    const session = await auth();
    const accessToken = session?.user?.accessToken;

    const headers = new Headers();

    try {
        const urlObj = new URL(url);
        const backendHost = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname : "api.dombonkhnom.com";

        if (urlObj.hostname === backendHost || urlObj.hostname === "localhost") {
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
        }
    } catch {
    }

    const range = req.headers.get("range");
    if (range) {
        headers.set("Range", range);
    }

    try {
        // Range requests must not use force-cache — the cache key is URL-only
        // and ignores the Range header, so a cached partial response would be
        // served for a different byte range, breaking video streaming.
        const upstream = await fetch(url, {headers, cache: range ? "no-store" : "force-cache"});

        if (!upstream.ok) {
            return new NextResponse("Media not found", {status: upstream.status});
        }

        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.set("Cache-Control", "public, max-age=86400, immutable");

        return new NextResponse(upstream.body, {
            status: upstream.status,
            headers: responseHeaders,
        });
    } catch {
        return new NextResponse("Failed to fetch media", {status: 502});
    }
}
