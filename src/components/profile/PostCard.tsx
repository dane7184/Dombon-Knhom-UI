"use client";
import { Copy } from "iconsax-react";
import Link from "next/link";
import { resolveUrl } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";
import Image from "next/image";
import { ActivitiesResponse } from "@/types/activity.type";

export default function PostCard({
  activityId,
  previewUrl,
  mediaType,
  hasMore,
  durations,
}: ActivitiesResponse) {
  function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
  return (
    <div>
      <Link href={`/posts/${activityId}`}>
        <div className="w-full h-40 sm:h-60 md:h-80 lg:h-95 relative border-[1.5px] border-(--input-border) overflow-hidden">
          {mediaType === "Image" && hasMore ? (
            <>
              <Image
                src={resolveUrl(previewUrl)}
                alt={"Post image"}
                className="object-cover"
                fill
              />

              <span className="absolute top-2 right-2 text-red-500 p-2 rounded-xl bg-white/10 border border-(--input-border) backdrop-blur-xl shadow-lg">
                <Copy size={22} color="#E2E8F0" />
              </span>
            </>
          ) : mediaType === "Video" ? (
            <>
              <video
                src={`${resolveMediaUrl(previewUrl)}#t=1`}
                className="object-cover w-full h-full"
                muted
                playsInline
                preload="metadata"
              />

              <span className="absolute top-2 left-2 text-md backdrop-blur-xl text-[#E2E8F0] px-3 py-1 rounded-full border border-(--input-border)">
                {formatDuration(Number(durations))}
              </span>
            </>
          ) : (
            <div>
              <Image
                src={resolveUrl(previewUrl)}
                alt={"Post image"}
                className="object-cover"
                fill
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
