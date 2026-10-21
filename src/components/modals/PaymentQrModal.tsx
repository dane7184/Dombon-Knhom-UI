"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { TickCircle, CloseCircle } from "iconsax-react";
import { getPaymentQrAction, checkPaymentStatusAction } from "@/actions/payment.actions";

interface PaymentQrModalProps {
  bakongQrString: string;
  md5: string;
  eventTitle: string;
  price: number;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 5 * 60 * 1000;

type ModalState = "loading" | "pending" | "success" | "timeout" | "error";

export const PaymentQrModal = ({ bakongQrString, md5, eventTitle, price, onClose, onPaymentSuccess }: PaymentQrModalProps) => {
  const router = useRouter();
  const [state, setState] = useState<ModalState>("loading");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pollIntervalRef.current = null;
    timeoutRef.current = null;
  };

  const generateQr = async () => {
    setState("loading");
    setErrorMessage(null);
    const result = await getPaymentQrAction(bakongQrString, md5);
    if ("success" in result) {
      setQrImage(result.data);
      setState("pending");
      startPolling();
    } else {
      setErrorMessage(result.message);
      setState("error");
    }
  };

  const startPolling = () => {
    clearTimers();
    pollIntervalRef.current = setInterval(async () => {
      const result = await checkPaymentStatusAction(md5);
      if ("success" in result && result.data === true) {
        clearTimers();
        setState("success");
        onPaymentSuccess?.();
        router.refresh();
      }
    }, POLL_INTERVAL_MS);
    timeoutRef.current = setTimeout(() => {
      clearTimers();
      setState((prev) => (prev === "pending" ? "timeout" : prev));
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQr();
    }, 0);
    return () => {
      clearTimeout(timer);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-xl relative flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* LOADING */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-10 h-10 border-[3px] border-(--main-color) border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#7886a6]">Generating QR code...</p>
          </div>
        )}

        {/* ERROR */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <CloseCircle size={28} variant="Bold" color="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-(--secondary-color)">Failed to generate QR</h3>
            <p className="text-sm leading-relaxed text-[#7886a6]">{errorMessage}</p>
            <button
              onClick={generateQr}
              className="mt-2 w-full py-3 rounded-xl text-sm font-semibold bg-(--main-color) text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* PENDING */}
        {state === "pending" && qrImage && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-center">
              <h3 className="text-xl font-bold text-(--secondary-color) mb-1">Scan to Pay</h3>
              <p className="text-sm text-[#7886a6]">{eventTitle}</p>
              <p className="text-base font-bold text-(--main-color) mt-1">${price}</p>
            </div>

            <div className="relative w-52 h-52 rounded-xl overflow-hidden border border-gray-100 bg-white p-2">
              <Image src={qrImage} alt="Payment QR Code" fill className="object-contain" unoptimized />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#7886a6]">
              <div className="w-3 h-3 border-2 border-(--main-color) border-t-transparent rounded-full animate-spin" />
              <span>Waiting for payment confirmation...</span>
            </div>

            <p className="text-xs text-[#7886a6] text-center">
              Open your banking app and scan this code to complete payment.
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {state === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <TickCircle size={28} variant="Bold" color="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-(--secondary-color)">Payment Successful!</h3>
            <p className="text-sm leading-relaxed text-[#7886a6]">
              You&apos;ve successfully joined <span className="font-semibold text-(--secondary-color)">{eventTitle}</span>.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-3 rounded-xl text-sm font-semibold bg-(--main-color) text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* TIMEOUT */}
        {state === "timeout" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <CloseCircle size={28} variant="Bold" color="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-(--secondary-color)">QR Code Expired</h3>
            <p className="text-sm leading-relaxed text-[#7886a6]">
              The QR code has expired. You can generate a new one or cancel.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateQr}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-(--main-color) text-white hover:opacity-90 cursor-pointer transition-opacity"
              >
                Regenerate QR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
