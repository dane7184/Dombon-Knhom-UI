"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/modals/Toast";
import RejectReasonModal from "@/components/modals/rejectedReason";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { OrgRequestDetailResponse } from "@/types/moderator.type";
import { getOrgRequestDetail, patchOrganizerStatus } from "@/services/moderation-organizer.service";
import { formatDateString } from "@/services/event.service";
import { TickCircle, CloseCircle, Refresh } from "iconsax-react";
import {resolveAvatarUrl} from "@/lib/format";

export default function OrganizationRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken, isLoading } = useAuth();
  const { toastData, showToast, hideToast } = useToast();

  const orgId = params?.id as string;
  const [detail, setDetail] = useState<OrgRequestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (isLoading || !orgId) return;

    async function fetchDetail() {
      setLoading(true);
      const data = await getOrgRequestDetail(orgId, accessToken ?? undefined);
      if (data) {
        setDetail(data);
      }
      setLoading(false);
    }

    fetchDetail().catch((err) => {
      console.error("Failed to fetch organizer detail:", err);
      setLoading(false);
    });
  }, [orgId, isLoading, accessToken]);

  const handleStatusUpdate = async (status: "Approved" | "Rejected", reason?: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await patchOrganizerStatus(orgId, status, reason, accessToken ?? undefined);
      if (success) {
        setDetail((prev) => (prev ? { ...prev, status } : prev));
        showToast({
          type: "success",
          title: "Success!",
          message: `Request ${status === "Approved" ? "approved" : "rejected"}.`,
        });
      } else {
        showToast({
          type: "error",
          title: "Failed!",
          message: `Could not ${status === "Approved" ? "approve" : "reject"} this request.`,
        });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast({
        type: "error",
        title: "Failed!",
        message: "An error occurred while updating status.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <p>Could not load organizer detail. Please try again.</p>
        <button onClick={() => router.push("/moderator/organization-requests")} className="mt-4 text-(--main-color) underline">Go back</button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === "Approved") return <TickCircle size={16} color="#00C950" />;
    if (status === "Pending") return <Refresh size={16} color="#FFA800" />;
    return <CloseCircle size={16} color="#FD346E" />;
  };

  const statusClass = 
    detail.status === "Approved" ? "border-emerald-300 bg-emerald-50 text-emerald-600" :
    detail.status === "Pending" ? "border-amber-300 bg-amber-50 text-amber-600" :
    "border-rose-300 bg-rose-50 text-rose-600";

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      {toastData && (
        <Toast
          type={toastData.type}
          title={toastData.title}
          message={toastData.message}
          onCloseAction={hideToast}
        />
      )}

      <button
        onClick={() => router.push("/moderator/organization-requests")}
        className="z-10 inline-flex items-center gap-1 font-medium hover:opacity-80 cursor-pointer main-color w-fit whitespace-nowrap"
      >
        <div className="bg-white p-2 rounded-full mr-2 shadow-sm">
          <ArrowLeft size={18} color="currentColor" className="shrink-0" />
        </div>
        <span>Back</span>
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1">
        <div className="flex items-start gap-8 border-b border-gray-100 pb-8">
          <div className="w-1/5 aspect-square shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative flex items-center justify-center">
            {detail.logo ? (
              <Image
                src={resolveAvatarUrl(detail.logo)}
                alt={detail.name}
                fill
                className="object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Logo</div>
            )}
          </div>
          
          <div className="flex-1 h-full min-w-0 py-2">
            <h1 className="font-semibold text-(--secondary-color) text-2xl mb-4">{detail.name}</h1>
            <div className="space-y-4">
              <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium ${statusClass}`}>
                <span className="me-2">{getStatusIcon(detail.status)}</span>
                {detail.status}
              </span>
              <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                <span>Requested: {formatDateString(detail.requested)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col h-full justify-end gap-5 mr-4 items-end shrink-0 self-end">
            {detail.status === "Pending" && (
              <div className="flex gap-5">
                 <button
                    onClick={() => handleStatusUpdate("Approved")}
                    disabled={isSubmitting}
                    className="bg-(--main-color) w-32.5 h-10 rounded-[8px] text-white text-sm font-medium px-5 py-1.5 transition-colors hover:bg-(--main-color)/80 cursor-pointer"
                 >
                    Approve
                 </button>
                 <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isSubmitting}
                    className="bg-(--accent-color) w-32.5 h-10 rounded-[8px] text-white text-sm font-medium px-5 py-1.5 transition-colors hover:bg-(--accent-color)/80 cursor-pointer"
                 >
                    Reject
                 </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-4">Organization Details</h3>
              <div className="flex flex-col justify-center space-y-3 bg-gray-50 rounded-xl p-4 h-40">
                <div className="grid grid-cols-3">
                  <span className="text-base text-gray-500">Province:</span>
                  <span className="text-base font-medium secondary-color col-span-2">{detail.province?.replace(/_/g, " ")}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-base text-gray-500">Phone:</span>
                  <span className="text-base font-medium secondary-color col-span-2">{detail.phone || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-base text-gray-500">Website:</span>
                  <span className="text-base font-medium secondary-color col-span-2">{detail.website ? <a href={detail.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{detail.website}</a> : "N/A"}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-base text-gray-500">Submitted By:</span>
                  <span className="text-base font-medium secondary-color col-span-2">{detail.submittedBy || "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-4">About Organization</h3>
              <p className="text-base secondary-color whitespace-pre-wrap leading-relaxed">{detail.about || "No description provided."}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-4">Document</h3>
              {detail.documentUrl ? (
                <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 h-40 gap-4">
                   <div className="text-center">
                     <p className="text-base font-medium secondary-color mb-1">Supporting Document Provided</p>
                     <p className="text-sm text-gray-500 mb-4">Click below to view or download</p>
                   </div>
                   <a
                     href={`${process.env.NEXT_PUBLIC_API_URL}media/documents/${detail.documentUrl}/preview`}
                     target="_blank" 
                     rel="noreferrer"
                     className="px-6 py-2 bg-main text-white font-medium rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
                   >
                     View Document
                   </a>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-center bg-gray-50 h-40">
                   <span className="text-base text-gray-400">No document provided</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Reject Reason Modal ── */}
      {showRejectModal && (
        <RejectReasonModal
          onClose={() => setShowRejectModal(false)}
          onSubmit={(reason) => handleStatusUpdate("Rejected", reason)}
        />
      )}
    </div>
  );
}
