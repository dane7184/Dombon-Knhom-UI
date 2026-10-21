import DefaultFallBack from "@public/images/default-fallback-image.png";
import FallbackProfile from "@public/images/fallback-pf.png";
import { StaticImageData } from "next/image";

export const sanitizeUrl = (url: string | null | undefined): string | null => {
  if (url == null) return null;
  const trimmed = String(url).trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.pathname !== "/"
    ) {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
};

export function formatTableDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function resolveUrl(
  url: string | null | undefined,
  fallback: StaticImageData = DefaultFallBack,
): string {
  if (!url) return fallback.src;

  if (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/")
  ) {
    return url;
  }

  // Already a local public asset or proxied path (e.g. fallback avatars) - pass through as-is.
  if (url.startsWith("/")) {
    return url;
  }

  if (url.startsWith("http")) {
    if (/\.(mp4|mov|webm)$/i.test(url)) {
      return `/api/media-proxy?url=${encodeURIComponent(`${url}/stream`)}`;
    }
    return url;
  }

  const fileName = url.replace(/^media\/(images|videos)\//, "");
  const isVideo = /\.(mp4|mov|webm)$/i.test(fileName);
  const path = isVideo
    ? `media/videos/${fileName}/stream`
    : `media/images/${fileName}`;
  const absolute = `${process.env.NEXT_PUBLIC_API_URL || ""}${path}`;

  return isVideo
    ? `/api/media-proxy?url=${encodeURIComponent(absolute)}`
    : absolute;
}

/**
 * Resolve a profile/avatar/org-logo image URL, falling back to the profile
 * placeholder (`fallback-pf.png`) instead of the event default.
 */
export function resolveAvatarUrl(url: string | null | undefined): string {
  return resolveUrl(url, FallbackProfile);
}

export function formatDate(dateString: string): string {
  return dateString.split("T")[0];
}
