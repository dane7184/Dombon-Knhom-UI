"use client";

import AuthMobileCard from "@/components/auth/mobile/AuthMobileCard";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/types/schemas/auth.schema";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { showMobileError } from "@/lib/mobile-toast";

/**
 * Mobile-only Forgot Password screen — glass card over the auth gradient.
 * Mirrors the desktop ForgotPasswordForm logic. Rendered below `md`.
 */
export default function ForgotPasswordFormMobile() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    const result = await forgotPasswordAction(data);
    if (!result.success) {
      showMobileError(result.error);
      return;
    }
    setSuccess(true);
  };

  return (
    <AuthMobileCard>
        {/* Title */}
        <h1 className="text-[26px] font-bold tracking-tight text-(--main-color) text-center">
          Forgot Password?
        </h1>

        {success ? (
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/60 bg-emerald-50/80 px-4 py-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm font-medium leading-relaxed text-slate-800">
                We&#39;ve sent a password reset link to your email. It may take a
                few seconds to arrive.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full rounded-xl border border-white/70 bg-white/50 py-3.5 text-center text-[15px] font-semibold text-(--secondary-color) transition-all active:bg-white/70 cursor-pointer"
            >
              Go back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-center text-sm leading-relaxed text-(--text-desc)">
              Locked out? Give us your email and we&apos;ll send a recovery link
              over.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-6 flex flex-col"
            >
              <label className="mb-1.5 block text-sm font-medium text-(--secondary-color)">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                placeholder="example@gmail.com"
                className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3.5 text-[15px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-(--main-color) focus:bg-white/90 focus:ring-2 focus:ring-(--main-color)/20"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-(--accent-color)">
                  {errors.email.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 w-full rounded-xl bg-(--main-color) py-3.5 text-[16px] font-semibold text-white shadow-[0_4px_10px_rgba(24,171,198,0.18)] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? "Sending Link..." : "Send Reset Email"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-(--text-desc)">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-(--accent-color) cursor-pointer"
              >
                Back to Login
              </Link>
            </p>
          </>
        )}
    </AuthMobileCard>
  );
}
