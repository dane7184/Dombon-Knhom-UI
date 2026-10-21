"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, X, Trash } from "lucide-react";
import { MoneySend } from "iconsax-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import WithdrawConfirmModal from "./WithdrawConfirmModal";
import SuccessModal from "./Success";
import Toast from "@/components/modals/Toast";
import { useToast } from "@/hooks/useToast";
import { decodeQrFromFile } from "@/lib/qr-decode";
import { submitWithdrawalAction } from "@/actions/organizer.action";
import {
  buildWithdrawalRequestSchema,
  WithdrawalRequestFormValues,
} from "@/types/schemas/withdrawal.schema";

interface Props {
  balance: number;
}

export default function WithdrawForm({ balance }: Props) {
  const router = useRouter();
  const { toastData, showToast, hideToast } = useToast();

  const [requestOpen, setRequestOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingQr, setIsReadingQr] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const schema = useMemo(() => buildWithdrawalRequestSchema(balance), [balance]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<WithdrawalRequestFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", qrString: "" },
  });

  const qrString = watch("qrString");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetFlow = () => {
    setRequestOpen(false);
    setConfirmOpen(false);
    setSuccessOpen(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    reset({ amount: "", qrString: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRequestOpenChange = (open: boolean) => {
    if (!open) {
      resetFlow();
      return;
    }
    setRequestOpen(true);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    setIsReadingQr(true);
    const decoded = await decodeQrFromFile(file);
    setIsReadingQr(false);
    setValue("qrString", decoded ?? "", { shouldValidate: true });
  };

  const sanitizeAmount = (raw: string) => {
    let val = raw.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }
    if (val.includes(".")) {
      const [intPart, decPart] = val.split(".");
      val = intPart + "." + (decPart || "").slice(0, 2);
    }
    if (!val.startsWith("0.")) {
      val = val.replace(/^0+(\d)/, "$1");
    }
    return val;
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue("amount", sanitizeAmount(event.target.value), { shouldValidate: true });
  };

  const handleAmountPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setValue("amount", sanitizeAmount(event.clipboardData.getData("text")), {
      shouldValidate: true,
    });
  };

  const removeImage = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setValue("qrString", "", { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onValid = () => {
    setRequestOpen(false);
    setConfirmOpen(true);
  };

  const amount = watch("amount");

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const result = await submitWithdrawalAction({
      amount: Number(amount),
      qrString,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setConfirmOpen(false);
      setRequestOpen(true);
      showToast({
        type: "error",
        title: "Failed!",
        message: result.error ?? "Failed to submit withdrawal request.",
      });
      return;
    }

    setConfirmOpen(false);
    setSuccessOpen(true);
    router.refresh();
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setRequestOpen(true);
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

      <Dialog open={requestOpen} onOpenChange={handleRequestOpenChange}>
        <DialogTrigger asChild>
          <button className="w-full bg-main text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
            <Image src="/icons/Money.svg" alt="Send" width={20} height={20} />
            Create Withdraw Request
          </button>
        </DialogTrigger>

        <DialogContent
          className="overflow-hidden rounded-[26px] border-none bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
          style={{ width: "min(600px, calc(100vw - 2rem))", maxWidth: "none" }}
          showCloseButton={false}
        >
          <DialogHeader className="px-7 pt-5 pb-2">
            <div className="flex items-center justify-end">
              <button type="button" onClick={resetFlow} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer" aria-label="Close dialog">
                <X size={16} />
              </button>
            </div>
          </DialogHeader>

          <form className="px-7 pb-6 pt-0 text-center" onSubmit={handleSubmit(onValid)}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dff5e3] text-[#16a34a]">
              <MoneySend size={28} variant="Linear" color="#16a34a" />
            </div>

            <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
              Withdraw Amount
            </DialogTitle>

            <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
              You can withdraw from $1 up to $10,000.
            </DialogDescription>

            <div className="mx-auto mt-5 w-full max-w-77.5">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#24314f]">$</span>
                <input
                  {...register("amount")}
                  value={amount}
                  onChange={handleAmountChange}
                  onPaste={handleAmountPaste}
                  inputMode="decimal"
                  pattern="^\d*(\.\d{0,2})?$"
                  placeholder="0.00"
                  className="w-full rounded-[12px] border border-[#dbe4f3] bg-white py-3.5 pl-8 pr-4 text-[18px] text-[#24314f] outline-none transition-colors placeholder:text-[#b7c1d6] focus:border-[#18abc6]"
                />
              </div>
              {errors.amount && <p className="mt-2 text-xs text-rose-600">{errors.amount.message}</p>}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-(--secondary-color)">
                Upload your bank&apos;s KHQR
              </h3>
              <p className="mt-2 text-sm text-[#7886a6]">
                Select your preferred bank KHQR
              </p>

              <div
                onClick={openFilePicker}
                className="relative mx-auto mt-5 flex h-55 w-full max-w-85 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border-2 border-dashed border-[#cfe0ff] bg-[#fcfdff] text-center transition-colors hover:bg-[#f7fbff]"
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {previewUrl ? (
                  <div className="absolute inset-0">
                    <div className="relative h-full w-full overflow-hidden">
                      <Image src={previewUrl} alt="Uploaded QR preview" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeImage();
                        }}
                        className="absolute right-3 top-3 z-10 bg-(--accent-color)/70 rounded-full px-3 py-1.5 cursor-pointer"
                      >
                        <Trash size={14} strokeWidth={2.2} color="#ffffff" />
                      </button>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-black/35 px-4 py-3 text-left">
                      <p className="text-xs text-white/90">
                        {isReadingQr ? "Reading QR code..." : "Click to replace the QR image"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#d7e2f2] bg-white text-[#223052] shadow-sm">
                      <Upload size={20} />
                    </div>
                    <div className="mt-4 text-[18px] font-medium text-[#223052]">
                      Select Bank KHQR
                    </div>
                    <div className="mt-2 text-[16px] text-[#7a88a6]">
                      Or drag and drop it here
                    </div>
                  </>
                )}
              </div>
              {errors.qrString && <p className="mt-2 text-xs text-rose-600">{errors.qrString.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isReadingQr}
              className="mt-8 inline-flex min-w-52.5 cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-[#18abc6] px-8 py-3.5 text-[18px] font-semibold text-white transition-colors hover:bg-[#149ab2] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#18abc6]"
            >
              <MoneySend size={18} variant="Linear" color="#ffffff" />
              Send Request
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <WithdrawConfirmModal
        open={confirmOpen}
        amount={amount}
        isSubmitting={isSubmitting}
        onOpenChangeAction={(open) => {
          if (!open) {
            resetFlow();
            return;
          }
          setConfirmOpen(true);
        }}
        onCancelAction={handleCancelConfirm}
        onConfirmAction={handleConfirm}
      />

      <SuccessModal
        open={successOpen}
        onOpenChangeAction={(open) => {
          if (!open) {
            resetFlow();
          }
        }}
        onCloseAction={resetFlow}
      />
    </>
  );
}
