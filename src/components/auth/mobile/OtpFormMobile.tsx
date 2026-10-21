"use client";

import AuthMobileCard from "@/components/auth/mobile/AuthMobileCard";

import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { resendOtpAction, verifyOtpAction } from "@/actions/auth.actions";
import { showMobileError, showMobileSuccess } from "@/lib/mobile-toast";

/**
 * Mobile-only OTP verification screen — glass card over the auth gradient.
 * Mirrors the desktop OtpForm logic. Rendered below `md`.
 */
export default function OtpFormMobile({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  if (!sessionToken) router.replace("/signup");

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((c) => Math.max(c - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (value: number) => {
    const minutes = String(Math.floor(value / 60)).padStart(2, "0");
    const seconds = String(value % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const updateDigit = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKey = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length < 6) {
      showMobileError("Please enter all 6 digits.");
      return;
    }

    setIsSubmitting(true);

    const result = await verifyOtpAction({ sessionToken, otp });
    if (!result.success) {
      showMobileError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push("/login");
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;

    setDigits(Array(6).fill(""));

    const result = await resendOtpAction({ sessionToken });
    if (!result.success) {
      showMobileError(result.error);
      return;
    }

    setSecondsLeft(120);
    showMobileSuccess("A new code has been sent to your email.");
  };

  return (
    <AuthMobileCard>
        {/* Title */}
        <h1 className="text-[26px] font-bold tracking-tight text-(--main-color) text-center">
          OTP Verification
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-(--text-desc)">
          Enter the 6-digit code we sent to your inbox.
        </p>

        {/* Digits */}
        <div className="mt-6 flex gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) =>
                updateDigit(i, e.target.value.replace(/\D/g, ""))
              }
              onKeyDown={(e) => handleKey(i, e)}
              onPaste={handlePaste}
              className="h-14 min-w-0 flex-1 rounded-xl border border-white/70 bg-white/55 text-center text-xl font-semibold text-slate-800 outline-none transition-all duration-200 focus:border-(--main-color) focus:bg-white/90 focus:ring-2 focus:ring-(--main-color)/20"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || secondsLeft === 0}
          className="mt-6 w-full rounded-xl bg-(--main-color) py-3.5 text-[16px] font-semibold text-white shadow-[0_4px_10px_rgba(24,171,198,0.18)] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? "Verifying OTP..." : "Verify OTP"}
        </button>

        <p className="mt-5 text-center text-sm text-(--text-desc)">
          {"Didn't get the code?"}{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0}
            className="font-semibold text-(--accent-color) disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {secondsLeft > 0 ? `Resend (${formatTime(secondsLeft)})` : "Resend"}
          </button>
        </p>
    </AuthMobileCard>
  );
}
