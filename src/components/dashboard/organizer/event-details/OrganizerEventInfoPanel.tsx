"use client";

import Image from "next/image";
import { Heart, CalendarDays, CircleDollarSign, Users } from "lucide-react";
import { useState } from "react";
import type { EventDetail, OrgProfile, UserProfile } from "@/types/event.type";
import { resolveAvatarUrl } from "@/lib/format";

function PanelCard({
  title,
  value,
  note,
  icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-(--main-color)">{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {title}
          </div>
          <div className="mt-1 text-sm font-semibold secondary-color">
            {value}
          </div>
          <div className="mt-1 text-xs text-slate-500">{note}</div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerEventInfoPanel({
  event,
  profile,
}: {
  event: EventDetail;
  profile: OrgProfile | UserProfile | null;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-slate-100 shrink-0">
            <Image
              src={resolveAvatarUrl(profile?.avatarUrl)}
              alt={profile?.name ?? ""}
              className="object-cover"
              fill
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold secondary-color">
              {profile?.name ?? "Loading..."}
            </h3>
            <p className="text-sm text-slate-500">
              {event.organizerId ? "Organizer" : "Creator"}
            </p>
          </div>
          {/* Favorite button — local only, no API yet */}
          <button
            type="button"
            onClick={() => setIsFavorite((prev) => !prev)}
            className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isFavorite
                ? "bg-(--accent-color) text-white"
                : "bg-(--main-color) text-white"
            }`}
          >
            <Heart
              size={14}
              fill={isFavorite ? "currentColor" : "none"}
              className="pointer-events-none"
            />
            <span className="pointer-events-none">
              {isFavorite ? "Favorited" : "Favorite"}
            </span>
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {event.description}
        </p>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
        <h3 className="text-base font-bold secondary-color mb-4">Event Date</h3>
        <div className="grid grid-cols-2 gap-3">
          <PanelCard
            title="Start"
            value={event.startDate}
            note={event.startTime}
            icon={<CalendarDays size={18} />}
          />
          <PanelCard
            title="End"
            value={event.endDate}
            note={event.endTime}
            icon={<CalendarDays size={18} />}
          />
          <PanelCard
            title="Price"
            value={event.isFree ? "FREE" : `$${event.price}`}
            note={event.isFree ? "Free to join" : "Ticketed"}
            icon={<CircleDollarSign size={18} />}
          />
          <PanelCard
            title="Capacity"
            value={
              event.capacity === "unlimited"
                ? `${event.joined ?? 0} / Unlimited`
                : `${event.joined ?? 0} / ${event.capacity}`
            }
            note="registered"
            icon={<Users size={18} />}
          />
        </div>
      </section>
    </div>
  );
}
