"use client";

import AuthMobileCard from "@/components/auth/mobile/AuthMobileCard";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from "@/types/schemas/auth.schema";
import { resetPasswordAction } from "@/actions/auth.actions";
import { showMobileError } from "@/lib/mobile-toast";

/**
 * Mobile-only Create New Password screen — glass card over the auth gradient.
 * Mirrors the desktop ResetPasswordForm logic. Rendered below `md`.
 */
export default function ResetPasswordFormMobile({
  sessionToken,
}: {
  sessionToken?: string;
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { sessionToken },
  });

  if (!sessionToken) {
    router.replace("/forgot-password");
    return null;
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    const result = await resetPasswordAction({
      sessionToken,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
    if (!result.success) {
      showMobileError(result.error);
      return;
    }
    setIsSuccess(true);
  };

  return (
    <AuthMobileCard>
        {/* Title */}
        <h1 className="text-[26px] font-bold tracking-tight text-(--main-color) text-center">
          Create New Password
        </h1>

        {isSuccess ? (
          <div className="mt-6 space-y-6">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/60 bg-emerald-50/80 px-4 py-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm font-medium leading-relaxed text-slate-800">
                Your password has been successfully updated. You can now log in
                with your new password.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full rounded-xl bg-(--main-color) py-3.5 text-center text-[15px] font-semibold text-white shadow-[0_4px_10px_rgba(24,171,198,0.18)] transition-all active:scale-[0.98]"
            >
              Go back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-center text-sm leading-relaxed text-(--text-desc)">
              Pick a fresh password that is at least 8 characters long.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-6 flex flex-col"
            >
              {/* New Password */}
              <label className="mb-1.5 block text-sm font-medium text-(--secondary-color)">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3.5 pr-11 text-[15px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-(--main-color) focus:bg-white/90 focus:ring-2 focus:ring-(--main-color)/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer z-10 p-1"
                >
                  {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-(--accent-color)">
                  {errors.newPassword.message}
                </p>
              )}

              {/* Confirm Password */}
              <label className="mb-1.5 mt-4 block text-sm font-medium text-(--secondary-color)">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/70 bg-white/55 px-4 py-3.5 pr-11 text-[15px] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-(--main-color) focus:bg-white/90 focus:ring-2 focus:ring-(--main-color)/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer z-10 p-1"
                >
                  {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-(--accent-color)">
                  {errors.confirmPassword.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 w-full rounded-xl bg-(--main-color) py-3.5 text-[16px] font-semibold text-white shadow-[0_4px_10px_rgba(24,171,198,0.18)] transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? "Saving changes..." : "Save"}
              </button>
            </form>
          </>
        )}
    </AuthMobileCard>
  );
}
