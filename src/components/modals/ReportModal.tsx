"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import MoreHorizontal from "../../../public/icons/More_Horizontal.svg";
import {
  Flag,
  Check,
  Trash2,
  Pencil,
  Bookmark,
  BookmarkCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Toast from "@/components/modals/Toast";
import PostForm from "@/components/posts/PostForm";
import { reportActivity } from "@/services/activity.service";
import { deleteActivityAction } from "@/actions/activity.actions";
import { deleteEventAction } from "@/actions/event.actions";
import { Button } from "../ui/button";

interface UploadedFile {
  id: string | number;
  name: string;
  size: string;
  preview: string;
  rawFile?: File;
}

interface PostData {
  activityId: string;
  content: string;
  tags: string[];
  location: string;
  event: string;
  files: UploadedFile[];
}

interface ReportModalProps {
  postOwnerId: string;
  contentType: "post" | "event";
  contentId: string;
  isOwner?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onDeleteSuccess?: () => void;
  onUpdateSuccess?: (updatedData: PostData) => void;
  initialData?: PostData;
  showSaveInDropdown?: boolean;
}

const REPORT_REASONS = [
  { id: "spam", label: "Spam or misleading" },
  { id: "nudity", label: "Inappropriate content" },
  { id: "hate_speech", label: "Hate speech" },
  { id: "false_info", label: "False information" },
  { id: "scam", label: "Scam or fraud" },
  { id: "other", label: "Something else" },
];

export default function ReportModal({
  postOwnerId,
  contentType,
  contentId,
  isOwner: propIsOwner,
  isSaved,
  onToggleSave,
  onDeleteSuccess,
  onUpdateSuccess,
  initialData,
  showSaveInDropdown = false,
}: ReportModalProps) {
  const isOwner = propIsOwner;

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCloseReport = () => {
    setIsReportOpen(false);
    setTimeout(() => {
      setSelectedReason("");
      setDetails("");
    }, 300);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setIsDeleting(false);
  };

  const handleReportSubmit = async () => {
    if (!selectedReason || isSubmittingReport) return;
    setIsSubmittingReport(true);
    try {
      await reportActivity(contentId, selectedReason.toUpperCase(), details);
      handleCloseReport();
      toast.custom((t) => (
        <Toast
          title="Success"
          message="Report submitted successfully"
          type="success"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
    } catch (err) {
      toast.custom((t) => (
        <Toast
          title="Error"
          message={`You have already reported this ${contentType}.`}
          type="error"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
      handleCloseReport();
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      if (contentType === "post") {
        const res = await deleteActivityAction(contentId);
        if (!res.success) throw new Error(res.error);
      } else if (contentType === "event") {
        const res = await deleteEventAction(contentId);
        if (!res.success) throw new Error(res.error);
      }
      toast.custom((t) => (
        <Toast
          title="Success"
          message={`${contentType === "post" ? "Post" : "Event"} deleted successfully`}
          type="success"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
      if (onDeleteSuccess) onDeleteSuccess();
      handleCloseDelete();
    } catch (error) {
      console.error(`Failed to delete ${contentType}:`, error);
      const errMsg =
        error instanceof Error
          ? error.message
          : `Failed to delete ${contentType}`;
      toast.custom((t) => (
        <Toast
          title="Error"
          message={errMsg}
          type="error"
          onCloseAction={() => toast.dismiss(t)}
        />
      ));
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
          >
            <Image
              src={MoreHorizontal}
              alt="More options"
              width={20}
              height={20}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
          {isOwner ? (
            <>
              <DropdownMenuItem
                onSelect={() => setIsEditOpen(true)}
                className="cursor-pointer font-medium text-sm gap-2.5 px-3 py-2.5 rounded-lg"
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onSelect={() => setIsDeleteOpen(true)}
                className="cursor-pointer font-medium text-sm gap-2.5 px-3 py-2.5 rounded-lg text-(--accent-color) focus:bg-(--accent-color)/5 focus:text-(--accent-color)"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {showSaveInDropdown && onToggleSave && (
                <>
                  <DropdownMenuItem
                    onSelect={onToggleSave}
                    className="cursor-pointer font-medium text-sm gap-2.5 px-3 py-2.5 rounded-lg"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-(--main-color)" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-muted-foreground" />
                    )}
                    {isSaved ? "Unsave" : "Save"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                </>
              )}
              <DropdownMenuItem
                onSelect={() => setIsReportOpen(true)}
                className="cursor-pointer font-medium text-sm gap-2.5 px-3 py-2.5 rounded-lg text-(--accent-color) focus:bg-(--accent-color)/5 focus:text-(--accent-color)"
              >
                <Flag className="w-4 h-4 text-(--accent-color)!" />
                Report
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isReportOpen} onOpenChange={handleCloseReport}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-110 p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
        >
          <DialogHeader className="px-7 pt-7 pb-5 space-y-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-(--accent-color)/10 flex items-center justify-center">
                  <Flag className="w-4.5 h-4.5 text-(--accent-color)" />
                </div>
                <div>
                  <DialogTitle className="text-[15px] font-semibold">
                    Report {contentType}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Your report is anonymous
                  </DialogDescription>
                </div>
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

      <Dialog open={isDeleteOpen} onOpenChange={handleCloseDelete}>
        <DialogContent
          showCloseButton={false}
          className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
        >
          <div className="relative flex flex-col items-center p-7 text-center">
            <button
              type="button"
              onClick={handleCloseDelete}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>

            <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
              Delete {contentType === "post" ? "Activity" : "Event"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
              This can&apos;t be undone. This {contentType} will be permanently
              removed.
            </DialogDescription>

            <div className="mt-6 flex gap-3 w-full">
              <button
                type="button"
                onClick={handleCloseDelete}
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
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isEditOpen && (
        <PostForm
          initialData={
            initialData as {
              activityId: string;
              content: string;
              tags: string[];
              location: string;
              event: string;
              files: {
                id: string | number;
                preview: string;
                type?: "image" | "video";
              }[];
            }
          }
          onClose={() => setIsEditOpen(false)}
          onPostSuccess={(newData) => {
            if (onUpdateSuccess && newData) {
              onUpdateSuccess({
                ...(initialData as PostData),
                content: newData.content,
                location: newData.location,
                tags: newData.tags,
              });
            } else if (onUpdateSuccess) {
              onUpdateSuccess(initialData as PostData);
            }
            setIsEditOpen(false);
          }}
        />
      )}
    </>
  );
}
