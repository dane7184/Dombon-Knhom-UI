"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar2,
  CloseCircle,
  DollarCircle,
  Location,
  People,
  Refresh,
  TickCircle,
  User,
} from "iconsax-react";
import {
  DollarSign,
} from "lucide-react";
import { AppBaseCategoryType, AppStatus } from "@/types/common.type";
import { EventAgendaComponent } from "@/components/events/EventAgendaComponent";
import { Agenda } from "@/types/event.type";
import { getCategoryConfig } from "@/constant/category.config";
import { statusStyles } from "@/constant/category.config";
import { toast } from "sonner";
import { getEventDetail, patchEventStatus } from "@/services/moderator.service";
import RejectReasonModal from "@/components/modals/rejectedReason";
import { resolveUrl } from "@/lib/format";

// Interfaces
export interface EventCapacity {
  joined: number;
  total: number;
}

export interface EventDate {
  start: string;
  end: string;
}

export type EventStatus = "Pending" | "Approved" | "Rejected";

export interface Event {
  eventId: string;
  eventName: string;
  image: string;
  user: string;
  createdAt: string;
  location: string;
  province?: string;
  capacity: EventCapacity;
  price?: number | null;
  eventDate: EventDate;
  category: AppBaseCategoryType;
  status: AppStatus;
  rejectedReason?: string | null;
  description: string;
  tags: string[];
  agenda: Agenda;
}

// Icons
const UserIcon = () => (
  <Image
    src="/images/user.svg"
    alt="user icon"
    width={24}
    height={24}
    className="object-cover rounded-[12px]"
  />
);
const CalendarIcon = () => (
  <Image
    src="/images/calendar-remove.svg"
    alt="calendar icon"
    width={24}
    height={24}
    className="object-cover rounded-[12px]"
  />
);
const PinIcon = () => (
  <Image
    src="/images/location.svg"
    alt="location icon"
    width={24}
    height={24}
    className="object-cover rounded-[12px]"
  />
);
const PeopleIcon = () => (
  <Image
    src="/images/capacity.svg"
    alt="capacity icon"
    width={24}
    height={24}
    className="object-cover rounded-[12px]"
  />
);
const PriceIcon = () => (
  <DollarSign size={22} className="text-(--text-secondary)" />
);

function formatPrice(price?: number | null): string {
  if (price == null) return "—";
  if (price === 0) return "Free";
  return `$${price.toLocaleString()}`;
}

// Helper Components
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2 text-sm py-1">
      <span className="text-(--text-secondary)">{icon}</span>
      <span className="text-(--text-secondary) w-35 text-md shrink-0">
        {label}
      </span>
      <span className="text-(--secondary-color) text-md text-right ml-auto">
        {value}
      </span>
    </div>
  );
}

// Main Page
export default function EventSubmissionDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<Event | null | undefined>(undefined);
  const [status, setStatus] = useState<EventStatus>("Pending");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const fallbackImage = "/images/default-fallback-image.png";

  useEffect(() => {
    let cancelled = false;
    getEventDetail(id).then((data) => {
      if (cancelled) return;
      setEvent(data);
      if (data) {
        setStatus(data.status as EventStatus);
        setImgSrc(resolveUrl(data.image));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Loading state
  if (event === undefined) {
    return (
      <div className="w-full min-h-full flex items-center justify-center py-20">
        <p className="text-gray-400 text-lg">Loading event…</p>
      </div>
    );
  }

  // Not found state
  if (!event) {
    return (
      <div className="w-full min-h-full flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-gray-400 text-lg">Event not found.</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--main-color)] hover:opacity-80 cursor-pointer"
        >
          <ArrowLeft size={16} color="currentColor" />
          Go back
        </button>
      </div>
    );
  }

  const handleApprove = async () => {
    if (status !== "Pending") return;

    const ok = await patchEventStatus(event.eventId, "Approved");

    if (ok) {
      setStatus("Approved");
      toast.success("Event approved.");
    } else {
      toast.error("Failed to approve event. Please try again.");
    }
  };

  const handleReject = async (reason: string) => {
    if (status !== "Pending") return;

    const ok = await patchEventStatus(event.eventId, "Rejected", reason.trim());

    if (ok) {
      setStatus("Rejected");
      toast.success("Event rejected.");
    } else {
      toast.error("Failed to reject event. Please try again.");
    }
  };

  const { config } = getCategoryConfig(event.category ?? "");
  const { icon: Icon, color, bg } = config;

  return (
    <div className="w-full min-h-full space-y-4">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="z-10 inline-flex items-center gap-1 font-medium hover:opacity-80 cursor-pointer main-color w-fit whitespace-nowrap"
      >
        <div className="bg-white p-2 rounded-full mr-2">
          <ArrowLeft size={18} color="currentColor" className="shrink-0" />
        </div>
        <span>Back</span>
      </button>

      {/* ── Event Card ── */}
      <div className="bg-white rounded-[15px] p-4 w-full shadow-sm">
        <div className="flex md:flex-row gap-10 items-start">
          {/* Image */}
          <div className="w-full md:w-1/3 h-64 md:h-auto self-stretch relative min-h-62.5">
            <Image
              src={imgSrc || fallbackImage}
              alt={event.eventName}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-[12px]"
              priority
              onError={() => setImgSrc(fallbackImage)}
            />
          </div>

          {/* Details */}
          <div className="flex-1 w-full flex flex-col justify-between min-h-55">
            <div>
              <h2 className="text-[24px] font-bold border-b border-slate-200 pb-4 text-(--secondary-color) mb-6 text-center">
                {event.eventName}
              </h2>
              <div className="flex flex-col gap-3">
                <InfoRow
                  icon={<User variant="Linear" size={24} color="var(--secondary-color)" />}
                  label="Request By"
                  value={event.user}
                />
                <InfoRow
                  icon={<Location variant="Linear" size={24} color="var(--secondary-color)" />}
                  label="Location"
                  value={event.location}
                />
                <InfoRow
                  icon={<People  variant="Linear" size={24} color="var(--secondary-color)" />}
                  label="Capacity"
                  value={`${event.capacity.joined.toLocaleString()} / ${event.capacity.total.toLocaleString()} joined`}
                />
                <InfoRow
                  icon={<DollarCircle variant="Linear" size={24} color="var(--secondary-color)" />}
                  label="Price"
                  value={formatPrice(event.price)}
                />
                <InfoRow
                  icon={
                    <Calendar2
                      variant="Linear"
                      size="24"
                      color="var(--secondary-color)"
                    />
                  }
                  label="Event Date"
                  value={`${event.eventDate.start} – ${event.eventDate.end}`}
                />
              </div>
            </div>

            {/* Footer: Badges & Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-md text-(--text-secondary) min-w-17.5">
                    Category:
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-full border"
                    style={{ backgroundColor: bg, color, borderColor: color }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                    {event.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-md text-(--text-secondary) min-w-17.5">
                    Status:
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-sm font-medium ${statusStyles[status as keyof typeof statusStyles]}`}
                  >
                    <span className="me-2 flex items-center">
                      {status === "Approved" ? (
                        <TickCircle size={16} color="#00C950" />
                      ) : status === "Pending" ? (
                        <Refresh size={16} color="#FFA800" />
                      ) : (
                        <CloseCircle size={16} color="#FD346E" />
                      )}
                    </span>
                    {status}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {status === "Pending" && (
                <div className="flex gap-4 sm:self-end mt-4 sm:mt-0">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-32 h-11 rounded-[8px] cursor-pointer text-white bg-[#ff3366] hover:bg-rose-600 transition-opacity font-semibold text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="w-32 h-11 rounded-[8px] cursor-pointer bg-[#17a2b8] hover:bg-cyan-600 text-white transition-opacity font-semibold text-sm"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Rejection Reason ── */}
      {status === "Rejected" && event.rejectedReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 md:p-6 shadow-sm">
          <h3 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-2">
            Rejection Reason
          </h3>
          <p className="text-md text-rose-700 leading-relaxed">
            {event.rejectedReason}
          </p>
        </div>
      )}

      {/* ── Event Description ── */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
        <h3 className="text-md font-bold text-(--secondary-color) uppercase tracking-widest mb-3">
          Event Description
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {event.tags.map((tag) => (
            <span key={tag} className="text-(--main-color) text-md font-medium">
              {tag}
            </span>
          ))}
        </div>
        <p className="text-md text-foreground leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* ── Agenda ── */}
      <EventAgendaComponent agenda={event.agenda} />

      {/* ── Reject Reason Modal ── */}
      {showRejectModal && (
        <RejectReasonModal
          onClose={() => setShowRejectModal(false)}
          onSubmit={(reason) => handleReject(reason)}
        />
      )}
    </div>
  );
}
