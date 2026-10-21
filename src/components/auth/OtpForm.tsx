"use client";

import {ClipboardEvent, KeyboardEvent, useEffect, useRef, useState,} from "react";
import {useRouter} from "next/navigation";
import {resendOtpAction, verifyOtpAction} from "@/actions/auth.actions";

export default function OtpForm({sessionToken}: { sessionToken: string }) {
    const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
    const [error, setError] = useState("");
    const [resendMsg, setResendMsg] = useState("");
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
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(""));
            refs.current[5]?.focus();
        }
    };

    const handleSubmit = async () => {
        const otp = digits.join("");
        if (otp.length < 6) {
            setError("Please enter all 6 digits.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const result = await verifyOtpAction({sessionToken, otp});
        if (!result.success) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        router.push("/login");
    };

    const handleResend = async () => {
        if (secondsLeft > 0) return;

        setError("");
        setResendMsg("");
        setDigits(Array(6).fill(""));

        const result = await resendOtpAction({sessionToken});

        if (!result.success) {
            setError(result.error);
            return;
        }

        setSecondsLeft(120);
        setResendMsg("A new code has been sent to your email.");
    };

    return (
        <div className="space-y-6 max-w-sm mx-auto">
            <div className="text-center">
                <h1 className="text-3xl text-(--secondary-color) font-black mt-2">
                    OTP Verification
                </h1>
                <div className="mt-3 flex items-center justify-center gap-3">
                    <div className="h-0.5 w-20 bg-(--main-color) rounded-full"/>
                    <div className="h-3 w-3 rounded-full bg-(--main-color)"/>
                    <div className="h-0.5 w-20 bg-(--main-color) rounded-full"/>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-center text-(--text-desc)">
                    We need to verify your identity. Enter the
                    <br/>
                    6-digit code we dropped in your inbox.
                </p>
            </div>

            {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-(--accent-color)">
                    {error}
                </p>
            )}
            {resendMsg && (
                <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    {resendMsg}
                </p>
            )}

            {secondsLeft === 0 && (
                <p className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                    {"Didn't received your OTP, you can request a new one."}
                </p>
            )}

            <div className="flex justify-center gap-5">
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
                        onChange={(e) => updateDigit(i, e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => handleKey(i, e)}
                        onPaste={handlePaste}
                        className="h-14 w-12 rounded-xl border border-slate-200 bg-white text-center text-xl font-semibold tracking-wider text-slate-800 shadow-xs
                         outline-none transition-all duration-200 hover:border-slate-300 focus:border-(--main-color) focus:ring-4 focus:ring-(--main-color)/20 focus:scale-105"
                    />
                ))}
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || secondsLeft === 0}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 bg-(--main-color) cursor-pointer"
            >
                {isSubmitting ? "Verifying OTP..." : "Verify OTP"}
            </button>

            <p className="text-center text-sm text-(--text-desc) mb-2">
                {"Didn't get the code?"}{" "}
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={secondsLeft > 0}
                    className="font-semibold text-(--accent-color) hover:underline bg-transparent border-none p-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {secondsLeft > 0 ? `Resend (${formatTime(secondsLeft)})` : "Resend"}
                </button>
            </p>
        </div>
    );
}