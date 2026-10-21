"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CheckCircle2, Eye, EyeOff} from "lucide-react";
import {useRouter} from "next/navigation";
import {ResetPasswordInput, resetPasswordSchema} from "@/types/schemas/auth.schema";
import {resetPasswordAction} from "@/actions/auth.actions";
import Link from "next/link";

export function ResetPasswordForm({sessionToken}: {sessionToken?: string}) {
  const [error, setError] = useState("");
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
    setError("");

    const result = await resetPasswordAction({
      sessionToken,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setIsSuccess(true);
  };

  return (
      <div className="space-y-6 max-w-sm mx-auto">
        <div className="text-center">
          <h1 className="text-3xl text-(--secondary-color) font-black mt-2">
            Create New Password
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-0.5 w-20 bg-(--main-color) rounded-full" />
            <div className="h-3 w-3 rounded-full bg-(--main-color)" />
            <div className="h-0.5 w-20 bg-(--main-color) rounded-full" />
          </div>
        </div>

        {isSuccess ? (
            <div className="space-y-6 animate-fadeIn mb-2">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium leading-relaxed text-slate-800">
                  Your password has been successfully updated. You can now log in
                  with your new password.
                </p>
              </div>
            <Link
              href="/login"
              className="block w-full text-center rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 bg-(--main-color)"
              >
              Go back to Login
            </Link>
          </div>
          ) : (
          <div className="space-y-6 mb-2">
          <p className="-mt-2 text-sm leading-relaxed text-center text-(--text-desc)">
          Make your account secure. Pick a fresh password
          <br />
          that is at least 8 characters long.
          </p>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-(--accent-color)">
        {error}
      </p>
  )}

  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-(--secondary-color)">
        New Password
      </label>
      <div className="relative">
        <input
            type={showNewPass ? "text" : "password"}
            {...register("newPassword")}
            placeholder="password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
        />
        <button
            type="button"
            onClick={() => setShowNewPass(!showNewPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer z-10 p-1"
        >
          {showNewPass ? <Eye size={17} /> : <EyeOff size={17} />}
        </button>
      </div>
      {errors.newPassword && (
          <p className="mt-1 text-xs text-(--accent-color)">
            {errors.newPassword.message}
          </p>
      )}
    </div>

    <div>
      <label className="mb-1.5 block text-sm font-semibold text-(--secondary-color)">
        Confirm New Password
      </label>
      <div className="relative">
        <input
            type={showConfirmPass ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder="password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
        />
        <button
            type="button"
            onClick={() => setShowConfirmPass(!showConfirmPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer z-10 p-1"
        >
          {showConfirmPass ? <Eye size={17} /> : <EyeOff size={17} />}
        </button>
      </div>
      {errors.confirmPassword && (
          <p className="mt-1 text-xs text-(--accent-color)">
            {errors.confirmPassword.message}
          </p>
      )}
    </div>

    <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 bg-(--main-color) cursor-pointer"
    >
      {isSubmitting ? "Saving changes..." : "Save"}
    </button>
  </form>
</div>
)}
</div>
)
}
