"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { X, Upload, Trash } from "lucide-react";
import { DollarCircle, DocumentText, MoneySend } from "iconsax-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateWithdrawalStatus } from "@/hooks/admin/useAdminWithdrawals";
import { WithdrawalResponse } from "@/types/admin.type";
import {
  approveWithdrawalSchema,
  ApproveWithdrawalFormValues,
} from "@/types/schemas/withdrawal.schema";
import {resolveMediaUrl} from "@/lib/media";

interface Props {
  withdrawal: WithdrawalResponse | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function WithdrawalModal({
  withdrawal,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const { mutate: updateStatus, isPending: isLoading } = useUpdateWithdrawalStatus();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isPdfProof = proofFile?.type === "application/pdf";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApproveWithdrawalFormValues>({
    resolver: zodResolver(approveWithdrawalSchema),
    defaultValues: { transactionRef: "" },
  });

  useEffect(() => {
    if (!previewUrl && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!withdrawal) return null;

  const resetForm = () => {
    reset({ transactionRef: "" });
    setProofFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleUpdateStatus = (status: "Approved" | "Rejected", values?: ApproveWithdrawalFormValues) => {
    updateStatus(
      {
        withdrawalId: withdrawal.withdrawalId,
        status,
        transactionRef: values?.transactionRef,
        proof: values?.proof,
      },
      {
        onSuccess: () => {
          onSuccess?.(`Withdrawal ${status.toLowerCase()} successfully.`);
          resetForm();
          onClose();
        },
        onError: (err) => {
          console.error("Failed to update withdrawal status:", err);
          onError?.(`Failed to ${status.toLowerCase()} withdrawal. Please try again.`);
        },
      },
    );
  };

  const handleApprove = (values: ApproveWithdrawalFormValues) => {
    handleUpdateStatus("Approved", values);
  };

  const handleReject = () => {
    handleUpdateStatus("Rejected");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProofFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setValue("proof", file, { shouldValidate: true });
  };

  const removeProof = () => {
    setProofFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setValue("proof", undefined, { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] p-8 w-100 shadow-2xl relative flex flex-col items-center animate-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-all duration-200"
        >
          <X size={16} />
        </button>

        {/* Top icon */}
        <div className="h-14 w-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-5">
          <DollarCircle size={25} color="currentColor" />
        </div>

        <h3 className="text-xl font-bold text-(--secondary-color) mb-1 text-center">
          {withdrawal.orgName}
        </h3>
        <p className="text-xl font-bold text-(--secondary-color) mb-6">
          ${withdrawal.amount}
        </p>

        {/* QR Code */}
        <div className="bg-white border border-gray-100 shadow-inner p-4 rounded-2xl mb-4 flex items-center justify-center min-h-[180px] min-w-[180px]">
          {withdrawal.qrString ? (
            <QRCodeSVG value={withdrawal.qrString} size={180} level="M" />
          ) : (
            <p className="text-xs text-gray-400 text-center px-4">No QR code available for this request.</p>
          )}
        </div>

        <p className="text-sm text-[#7886a6] mb-8">
          Requested on: {withdrawal.requestDate ? withdrawal.requestDate.slice(0, 10) : "—"}
        </p>

        <form onSubmit={handleSubmit(handleApprove)} className="w-full">
          <label className="block text-left text-xs font-semibold text-[#4B5563] mb-1.5">
            Transaction reference (required to approve)
          </label>
          <input
            {...register("transactionRef")}
            placeholder="Bank transfer / transaction reference"
            disabled={isLoading}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1f2a4a] outline-none transition-colors placeholder:text-gray-300 focus:border-(--main-color) disabled:opacity-60"
          />
          {errors.transactionRef && (
            <p className="mt-1.5 text-xs text-rose-600">{errors.transactionRef.message}</p>
          )}

          <label className="block text-left text-xs font-semibold text-[#4B5563] mt-4 mb-1.5">
            Proof of transfer (required to approve)
          </label>
          <div
            onClick={openFilePicker}
            className="relative flex h-28 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-center transition-colors hover:bg-gray-100"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />
            {previewUrl ? (
              <div className="absolute inset-0">
                {isPdfProof ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-white px-4">
                    <DocumentText size={26} color="#64748b" variant="Bold" />
                    <p className="max-w-full truncate text-xs font-medium text-gray-600">{proofFile?.name}</p>
                  </div>
                ) : (
                  <Image src={resolveMediaUrl(previewUrl)} alt="Proof of transfer preview" fill className="object-cover"  />
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeProof();
                  }}
                  className="absolute right-2 top-2 z-10 rounded-full bg-(--accent-color)/70 px-2.5 py-1.5 cursor-pointer"
                >
                  <Trash size={12} strokeWidth={2.2} color="#ffffff" />
                </button>
              </div>
            ) : (
              <>
                <Upload size={18} className="text-gray-400" />
                <p className="mt-1.5 text-xs text-gray-500">Click to upload receipt (image or PDF)</p>
              </>
            )}
          </div>
          {errors.proof && (
            <p className="mt-1.5 text-xs text-rose-600">{errors.proof.message}</p>
          )}

          <div className="grid grid-cols-2 gap-4 w-full mt-5">
            <button
              type="button"
              onClick={handleReject}
              disabled={isLoading}
              className="w-full py-3 bg-(--accent-color) hover:bg-(--accent-color)/80 text-white rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <X size={16} strokeWidth={2.5} />
              {isLoading ? "Processing..." : "Reject"}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-(--main-color) hover:bg-(--main-color)/80 text-white rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              <MoneySend size={15} color="white" />
              {isLoading ? "Processing..." : "Paid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
