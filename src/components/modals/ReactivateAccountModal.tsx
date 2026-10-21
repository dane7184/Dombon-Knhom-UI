"use client";

import React, { useState } from "react";
import { CheckCircle2, Mail, RotateCcw, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { requestReactivationAction } from "@/actions/auth.actions";

interface ReactivateAccountModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

export default function ReactivateAccountModal({
  isOpen,
  email,
  onClose,
}: ReactivateAccountModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const resetAndClose = () => {
    setIsSending(false);
    setError("");
    setSent(false);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetAndClose();
  };

  const handleSend = async () => {
    setIsSending(true);
    setError("");
    const result = await requestReactivationAction({ email });
    if (!result.success) {
      setError(result.error);
      setIsSending(false);
      return;
    }
    setSent(true);
    setIsSending(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
        showCloseButton={false}
      >
        <div className="relative flex flex-col items-center p-7 text-center">
          <button
            type="button"
            onClick={resetAndClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {sent ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <CheckCircle2 size={26} strokeWidth={2} />
              </div>
              <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
                Check your email
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
                We sent reactivation instructions to{" "}
                <span className="font-semibold text-(--secondary-color)">
                  {email}
                </span>
                . Follow the link to restore your account.
              </DialogDescription>
              <button
                type="button"
                onClick={resetAndClose}
                className="btn-main mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--main-color)/10 text-(--main-color)">
                <RotateCcw size={26} strokeWidth={2} />
              </div>
              <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
                Account deactivated
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
                This account has been deactivated. Click{" "}
                <strong>Send link</strong> to send a reactivation email to{" "}
                <span className="font-semibold text-(--secondary-color)">
                  {email}
                </span>{" "}
                and restore access.
              </DialogDescription>
              {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
              <div className="mt-6 flex gap-3 w-full">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  className="btn-main flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {/* <Mail size={14} /> */}
                  {isSending ? "Sending…" : "Send link"}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
