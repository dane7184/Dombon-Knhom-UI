"use client";

import React, { useState } from "react";
import { z } from "zod";
import { X, Eye, EyeOff, Edit } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { updatePassword } from "@/services/profileInfo.service";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .refine((value) => /[A-Z]/.test(value), "Need one uppercase letter")
      .refine((value) => /[a-z]/.test(value), "Need one lowercase letter")
      .refine((value) => /[0-9]/.test(value), "Need one number")
      .refine((value) => /[^A-Za-z0-9]/.test(value), "Need one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordFormErrors = Partial<Record<keyof PasswordFormState, string>>;

const initialState: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordModal() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState<PasswordFormState>(initialState);
  const [fieldErrors, setFieldErrors] = useState<PasswordFormErrors>({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndCloseModal = () => {
    setIsOpen(false);
    setForm(initialState);
    setApiError("");
    setSuccess("");
    setIsSubmitting(false);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setFieldErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetAndCloseModal();
    else setIsOpen(true);
  };

  const handleChange =
    (field: keyof PasswordFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: event.target.value });
      setSuccess("");
      setApiError("");
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setApiError("");
    setSuccess("");

    const validationResult = passwordSchema.safeParse(form);
    if (!validationResult.success) {
      const nextFieldErrors: PasswordFormErrors = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = issue.path[0] as keyof PasswordFormState | undefined;
        if (fieldName && !nextFieldErrors[fieldName]) {
          nextFieldErrors[fieldName] = issue.message;
        }
      }
      setFieldErrors(nextFieldErrors);
      setIsSubmitting(false);
      return;
    }

    const token = session?.user?.accessToken;
    if (!token) {
      setApiError("Not authenticated. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePassword(form.currentPassword, form.newPassword, token);
      setFieldErrors({});
      setSuccess("Password updated successfully.");
      setTimeout(() => resetAndCloseModal(), 1500);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="btn-main flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 w-full sm:w-60 text-white">
          <Edit size={16} />
          Change Password
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-md rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-0">
          <DialogTitle className="text-xl font-bold text-(--secondary-color)">
            Change Password
          </DialogTitle>
          <button
            type="button"
            onClick={resetAndCloseModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form className="flex flex-col gap-4 px-7 pb-7 pt-5" onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--secondary-color)">Current password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={form.currentPassword}
                onChange={handleChange("currentPassword")}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-300 hover:text-gray-500 cursor-pointer transition-colors"
              >
                {showCurrent ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="text-xs text-red-500">{fieldErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--secondary-color)">New password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10"
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-300 hover:text-gray-500 cursor-pointer transition-colors"
              >
                {showNew ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs text-red-500">{fieldErrors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--secondary-color)">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="Retype new password"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-300 hover:text-gray-500 cursor-pointer transition-colors"
              >
                {showConfirm ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {apiError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetAndCloseModal}
              className="flex-1 rounded-xl cursor-pointer bg-gray-100 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 cursor-pointer rounded-xl btn-main py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save Password"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
