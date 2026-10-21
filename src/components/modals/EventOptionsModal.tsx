"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Check, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Toast from "@/components/modals/Toast";
import { showToast } from "@/lib/myToast";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/services/event.service";
import ContentOptionsMenu from "./ContentOptionsMenu";
import { useSession } from "next-auth/react";
import { reportEventAction } from "@/actions/event.actions";
import { EventDetail } from "@/types/event.type";
import { useSwitchMode } from "@/hooks/useSwitchMode";

interface EventOptionsModalProps {
  contentId: string;
  isOwner: boolean;
  isSaved?: boolean;
  onDeleteSuccess?: () => void;
  event?: EventDetail;
}

const REPORT_REASONS = [
  { id: "canceled", label: "Fake or canceled event" },
  { id: "spam", label: "Spam or misleading" },
  { id: "inappropriate", label: "Inappropriate event content" },
  { id: "scam", label: "Ticket fraud or scam" },
  { id: "other", label: "Something else" },
];

export default function EventOptionsModal({
  contentId,
  isOwner,
  isSaved = false,
  onDeleteSuccess,
  event,
}: EventOptionsModalProps) {
  const router = useRouter();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: session } = useSession();
  const currentToken = session?.user?.accessToken;
  const { switchToOrg, isSwitching } = useSwitchMode();

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localIsSaved, setLocalIsSaved] = useState(isSaved);

  const handleToggleSave = async () => {
    // Optimistic update
    const next = !localIsSaved;
    setLocalIsSaved(next);
    // Toast immediately (optimistic); revert + error toast only if it fails.
    showToast(next ? "success" : "deleteSuccess", {
      description: next
        ? "Event saved successfully"
        : "Event removed from saved",
    });
    const { toggleSaveAction } = await import("@/actions/event.actions");
    const result = await toggleSaveAction(contentId);
    if ("error" in result) {
      setLocalIsSaved(!next);
      showToast("error", { description: "Failed to save event." });
    }
  };

  const handleCloseReport = () => {
    setIsReportOpen(false);
    setTimeout(() => {
      setSelectedReason("");
      setDetails("");
    }, 300);
  };

  const handleReportSubmit = async () => {
    if (!selectedReason || isSubmittingReport) return;
    setIsSubmittingReport(true);

    const result = await reportEventAction(
      contentId,
      selectedReason.toUpperCase(),
      details,
    );

    if ("success" in result) {
      handleCloseReport();
      toast.custom((t) => (
        <Toast
          title="Success"
          message={result.message}
          type="success"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    } else {
      toast.custom((t) => (
        <Toast
          title="Error"
          message={result.message}
          type="error"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
      handleCloseReport();
    }

    setIsSubmittingReport(false);
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (event) {
      const startDate = new Date(event.startDate);
      startDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilStart = (startDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      const joinedCount = event.joined || 0;
      const price = event.price || 0;

      if (price === 0) {
        if (daysUntilStart < 3) {
          toast.error("Cannot delete free event less than 3 days before start");
          return;
        }
      } else {
        if (joinedCount > 0) {
          toast.error("Cannot delete paid event with registered attendees");
          return;
        }
        if (daysUntilStart < 3) {
          toast.error("Cannot delete paid event less than 3 days before start");
          return;
        }
      }
    }
    setIsDeleting(true);
    try {
      await deleteEvent(contentId, currentToken);
      toast.custom((t) => (
        <Toast
          title="Success"
          message="Event deleted successfully"
          type="success"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
      if (onDeleteSuccess) onDeleteSuccess();
      setIsDeleteOpen(false);
      router.push("/events");
    } catch (error) {
      toast.custom((t) => (
        <Toast
          title="Error"
          message="Failed to delete event"
          type="error"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = async () => {
    if (event) {
      const startDate = new Date(event.startDate);
      startDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilStart = (startDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      const joinedCount = event.joined || 0;
      const price = event.price || 0;

      if (price === 0) {
        if (daysUntilStart < 3) {
          toast.error("Cannot edit free event less than 3 days before start");
          return;
        }
      } else {
        if (joinedCount > 0) {
          toast.error("Cannot edit paid event with registered attendees");
          return;
        }
        if (daysUntilStart < 3) {
          toast.error("Cannot edit paid event less than 3 days before start");
          return;
        }
      }
    }

    if (event && event.organizerId) {
      if (session?.user?.role === "Organizer" && !session.user.orgId) {
        await switchToOrg(event.organizerId, `/organizer/events/${contentId}/edit`);
      } else {
        router.push(`/organizer/events/${contentId}/edit`);
      }
    } else {
      router.push(`/events/${contentId}/edit`);
    }
  };

  return (
    <>
      <ContentOptionsMenu
        isOwner={isOwner}
        isSaved={localIsSaved}
        onOpenEdit={handleEditClick}
        onOpenDelete={() => setIsDeleteOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onToggleSave={handleToggleSave}
      />

      <Dialog open={isReportOpen} onOpenChange={handleCloseReport}>
        <DialogContent className="sm:max-w-110 p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-xl data-[state=open]:slide-in-from-bottom-4">
          <DialogHeader className="px-7 pt-7 pb-5 space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-(--accent-color)/10 flex items-center justify-center">
                <Flag className="w-4.5 h-4.5 text-(--accent-color)" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold">
                  Report this Event
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Your report is anonymous
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id;
                return (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() =>
                      setSelectedReason(isSelected ? "" : reason.id)
                    }
                    className={cn(
                      "relative px-3.5 py-3 rounded-xl text-left text-[13px] font-medium transition-all duration-150 cursor-pointer border",
                      isSelected
                        ? "bg-(--accent-color)/5 border-(--accent-color)/30 text-(--accent-color)"
                        : "bg-muted/30 border-transparent text-foreground hover:bg-muted/60",
                    )}
                  >
                    {reason.label}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-(--accent-color) flex items-center justify-center">
                        <Check
                          className="w-2.5 h-2.5 text-white"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedReason && (
              <div className="mt-4">
                <Textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add details (optional)..."
                  maxLength={250}
                  className="resize-none w-full min-w-full max-w-full h-24 min-h-24 max-h-24 overflow-y-auto text-[13px] rounded-xl border-border/60 bg-muted/30 focus-visible:ring-1 focus-visible:ring-(--accent-color)/40 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                  style={{ fieldSizing: "fixed" } as React.CSSProperties}
                />
                <p className="text-[11px] text-muted-foreground/40 text-right mt-1">
                  {details.length}/250
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 px-6 pb-6 pt-3">
            <button
              type="button"
              onClick={handleCloseReport}
              className="flex-1 py-3 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReportSubmit}
              disabled={!selectedReason || isSubmittingReport}
              className={cn(
                "flex-1 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer",
                selectedReason && !isSubmittingReport
                  ? "bg-(--accent-color) text-white hover:opacity-90"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed",
              )}
            >
              {isSubmittingReport ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending
                </span>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={() => setIsDeleteOpen(false)}>
        <DialogContent
          className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl z-9999! data-[state=open]:slide-in-from-bottom-4"
          showCloseButton={false}
        >
          <div className="relative flex flex-col items-center p-7 text-center">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Trash2 size={26} />
            </div>

            <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
              Delete Event
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
              Are you sure you want to permanently delete this event? This
              action cannot be undone.
            </DialogDescription>

            <div className="mt-6 flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
