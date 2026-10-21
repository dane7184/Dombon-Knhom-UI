"use client";

import React, { useState } from "react";
import "@/app/globals.css";
import { Calendar, People, TicketStar } from "iconsax-react";
import { EventDetail, JoinEventResult } from "@/types/event.type";
import { joinEventAction } from "@/actions/event.actions";
import { ConfirmJoinModal } from "@/components/modals/ConfirmJoinModal";
import { TicketModal } from "@/components/modals/TicketModal";
import { MeData } from "@/types/auth.types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/modals/Toast";
import { toast } from "sonner";
import { PaymentQrModal } from "../modals/PaymentQrModal";
import { useAuth } from "@/hooks/useAuth";

interface EventDateComponentProps {
  event: EventDetail;
  me?: MeData | null;
  showExportBtn?: boolean;
  isOrganizerView?: boolean;
}

export const EventDateComponent = ({
  event,
  me,
  showExportBtn,
  isOrganizerView = false,
}: EventDateComponentProps) => {
  const router = useRouter();
  const {
    startDate,
    endDate,
    capacity,
    price,
    isFree,
    title,
    isJoined,
    creatorId,
    organizerId,
  } = event;

  const { isOrgMode, userId, orgId } = useAuth();

  const isMyEvent = Boolean(
    isOrganizerView ||
    (!isOrgMode && me?.userId && creatorId && me.userId === creatorId) ||
    (isOrgMode && me?.orgId && organizerId && me.orgId === organizerId)
  );

  const [hasJoined, setHasJoined] = useState(isJoined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticket, setTicket] = useState<JoinEventResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toastData, showToast, hideToast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    bakongQrString: string;
    md5: string;
  } | null>(null);

  // Get first and last agenda entries across all days
  const agendaDays = Object.entries(event.agenda).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const firstDay = agendaDays[0];
  const lastDay = agendaDays[agendaDays.length - 1];

  const firstItem = firstDay?.[1].sort((a, b) => a.order - b.order)[0];
  const lastItems = lastDay?.[1].sort((a, b) => a.order - b.order);
  const lastItem = lastItems?.[lastItems.length - 1];

  function to24Hour(timeStr: string): string {
    const cleaned = timeStr.toUpperCase().trim();
    const isPM = cleaned.includes("PM");
    const isAM = cleaned.includes("AM");
    const match = cleaned.match(/(\d+):(\d+)/);
    if (!match) return "00:00";

    let hours = parseInt(match[1], 10);
    const minutes = match[2];

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  // Convert display date "Jun 14, 2026" → "2026-06-14"
  function toISODateString(displayDate: string): string {
    const d = new Date(displayDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // const startDateISO = toISODateString(event.startDate);
  // const endDateISO = toISODateString(event.endDate);

  // const eventStartDateTime = firstItem
  //   ? new Date(`${startDateISO}T${to24Hour(firstItem.startTime)}:00+07:00`)
  //   : new Date(`${startDateISO}T00:00:00+07:00`);

  // const eventEndDateTime = lastItem
  //   ? new Date(`${endDateISO}T${to24Hour(lastItem.endTime)}:00+07:00`)
  //   : new Date(`${endDateISO}T23:59:59+07:00`);

  // const now = new Date();
  // const hasStarted = now >= eventStartDateTime;
  // const hasEnded = now > eventEndDateTime;

  const startDateISO = toISODateString(event.startDate);
  const endDateISO = toISODateString(event.endDate);

  const todayISO = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Phnom_Penh",
  }); // "YYYY-MM-DD"

  const hasStarted = todayISO >= startDateISO;
  const hasEnded = todayISO > endDateISO;

  // ── Owner / organizer check — these cannot join ─────────────────
  // Org accounts cannot join events — only regular users can
  const canJoin = !isMyEvent && !isOrgMode;

  // Update handleConfirmJoin:
  const handleConfirmJoin = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    const result = await joinEventAction(event.id);
    setLoading(false);

    if ("success" in result) {
      if (
        result.data.requiresPayment &&
        result.data.bakongQrString &&
        result.data.md5
      ) {
        // Paid event — open QR payment modal
        setPaymentInfo({
          bakongQrString: result.data.bakongQrString,
          md5: result.data.md5,
        });
        setShowPaymentModal(true);
      } else {
        // Free event — joined directly
        setTicket(result.data);
        setHasJoined(true);
        setShowTicketModal(true);
        // No success toast — backend pushes "you have successfully joined the event" via SSE
      }
    } else {
      showToast({
        type: "error",
        title: "Join failed",
        message: "Failed to join event. Please try again.",
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const { exportEventAttendees } = await import("@/services/event.service");
      const blob = await exportEventAttendees(event.id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendees-${event.id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast({
        type: "success",
        title: "Export successful",
        message: "Attendees exported successfully.",
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Export failed",
        message: "Failed to export attendees. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {toastData && (
        <Toast
          type={toastData.type}
          title={toastData.title}
          message={toastData.message}
          onCloseAction={hideToast}
        />
      )}

      <div className="p-5 bg-(--background-white) rounded-2xl box-shadow flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-(--secondary-color)">
            Event Details
          </h3>
          {(isOrganizerView || isMyEvent) ? (
            <button
              onClick={() => {
                if (isOrganizerView || isOrgMode) {
                  router.push(`/organizer/events/${event.id}/attendees`);
                } else {
                  router.push(`/events/${event.id}/attendees`);
                }
              }}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[var(--main-color)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              View Attendees
            </button>
          ) : showExportBtn ? (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[var(--main-color)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              Export
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Start
              </p>
              <div className="flex items-center gap-1.5">
                <Calendar size={20} color="var(--main-color)" />
                <p className="text-md font-semibold text-slate-700">
                  {startDate}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                End
              </p>
              <div className="flex items-center gap-1.5">
                <Calendar size={20} color="var(--main-color)" />
                <p className="text-md font-semibold text-slate-700">
                  {endDate}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Price
              </p>
              {isFree ? (
                <p className="text-lg font-bold text-(--main-color)">FREE</p>
              ) : (
                <p className="text-lg font-bold text-(--accent-color)">
                  ${price}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Capacity
              </p>
              <div className="flex items-center gap-1.5">
                <People size={20} color="var(--main-color)" />
                <p className="text-md font-semibold text-slate-700">
                  {isMyEvent
                    ? capacity === "unlimited"
                      ? `${event.joined ?? 0} / Unlimited`
                      : `${event.joined ?? 0} / ${capacity}`
                    : capacity === "unlimited"
                      ? "Unlimited"
                      : `${capacity}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {canJoin ? (
          hasJoined ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
              {hasEnded ? "Attended" : "You're Joined"}
            </div>
          ) : hasEnded ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-slate-100 text-slate-500">
              Event Ended
            </div>
          ) : hasStarted ? (
            <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-slate-100 text-slate-500">
              Event Already Started
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold btn-main cursor-pointer hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Event"}
            </button>
          )
        ) : null}
      </div>
      {showConfirmModal && (
        <ConfirmJoinModal
          isFree={isFree}
          price={price}
          onConfirm={handleConfirmJoin}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
      {/* {showTicketModal && ticket && (
        <TicketModal
          ticket={ticket}
          eventTitle={title}
          onClose={() => setShowTicketModal(false)}
        />
      )} */}
      {showPaymentModal && paymentInfo && (
        <PaymentQrModal
          bakongQrString={paymentInfo.bakongQrString}
          md5={paymentInfo.md5}
          eventTitle={title}
          price={price}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentInfo(null);
          }}
          onPaymentSuccess={() => setHasJoined(true)}
        />
      )}
    </>
  );
};
