"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Location, ArrowDown2, Edit } from "iconsax-react";
import { Province } from "@/constant/province";
import { useUpdateUser, useUpdateModerator, useUpdateOrganizer } from "@/hooks/admin/useAdminAccounts";
import { AdminUser, AdminModerator, AdminOrganizer } from "@/types/admin.type";
import { signupSchema } from "@/types/schemas/auth.schema";

function toReadableProvince(value?: string): string {
  if (!value) return "";
  return Object.keys(Province).find((key) => Province[key] === value) || value;
}

function toBackendProvince(value?: string): string {
  if (!value) return "";
  return Province[value] || value;
}

const baseEditSchema = z.object({
  fullName: signupSchema.shape.fullName.optional(),
  gender: signupSchema.shape.gender.optional(),
  province: z.string().trim().optional(),
  orgName: z.string().trim().optional(),
  email: signupSchema.shape.email.optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^[0-9]{7,11}$/.test(val),
      "Phone number must contain only numbers and be between 7 and 11 digits (e.g., 087242555)"
    ),
  website: z.string().trim().optional(),
  about: z
    .string()
    .trim()
    .max(250, "About section cannot exceed 250 characters")
    .optional(),
});

export type EditAccountValues = z.infer<typeof baseEditSchema>;

function buildEditSchema(role: "user" | "organizer" | "moderator") {
  return baseEditSchema.superRefine((data, ctx) => {
    if (role === "user" || role === "moderator") {
      if (!data.fullName || data.fullName.length < 2) {
        ctx.addIssue({ code: "custom", path: ["fullName"], message: "Full name must be at least 2 characters" });
      }
      if (!data.gender) {
        ctx.addIssue({ code: "custom", path: ["gender"], message: "Gender is required" });
      }
    }

    if (role === "moderator" && !data.province) {
      ctx.addIssue({ code: "custom", path: ["province"], message: "Province is required" });
    }

    if (role === "organizer") {
      if (!data.orgName || data.orgName.length < 2) {
        ctx.addIssue({ code: "custom", path: ["orgName"], message: "Organization name is required" });
      }
      if (data.email && !signupSchema.shape.email.safeParse(data.email).success) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email" });
      }
    }
  });
}

function buildDefaultValues(
  row: AdminUser | AdminOrganizer | AdminModerator | null,
  role: "user" | "organizer" | "moderator",
): EditAccountValues {
  if (!row) return {};

  if (role === "user") {
    const u = row as AdminUser;
    return {
      fullName: u.fullName ?? "",
      gender: (u.gender as "Male" | "Female" | undefined) ?? undefined,
    };
  }

  if (role === "moderator") {
    const m = row as AdminModerator;
    return {
      fullName: m.fullName ?? "",
      gender: (m.gender as "Male" | "Female" | undefined) ?? undefined,
      province: toReadableProvince(m.province),
    };
  }

  const o = row as AdminOrganizer;
  return {
    orgName: o.orgName ?? "",
    email: o.email ?? "",
    phone: o.phone ?? "",
    province: toReadableProvince(o.province),
    website: o.website ?? "",
    about: o.bio ?? "",
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  row: AdminUser | AdminOrganizer | AdminModerator | null;
  role: "user" | "organizer" | "moderator";
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function EditAccountModal({
  isOpen,
  onClose,
  row,
  role,
  onSuccess,
  onError,
}: Props) {
  const schema = useMemo(() => buildEditSchema(role), [role]);
  const defaultValues = useMemo(() => buildDefaultValues(row, role), [row, role]);
  const updateUserMutation = useUpdateUser();
  const updateModeratorMutation = useUpdateModerator();
  const updateOrganizerMutation = useUpdateOrganizer();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditAccountValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedGender = watch("gender");
  const selectedProvince = watch("province") || null;

  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isOpenGenderDropdown, setIsOpenGenderDropdown] = useState(false);
  const provinceOptions = Object.keys(Province);

  // Reset form whenever the modal opens for a (possibly different) row
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
      setIsOpenDropdown(false);
      setIsOpenGenderDropdown(false);
    }
  }, [isOpen, reset, defaultValues]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !row) return null;

  const submitForm = async (values: EditAccountValues) => {
    try {
      if (role === "user") {
        const u = row as AdminUser;
        await updateUserMutation.mutateAsync({
          userId: u.userId,
          body: {
            fullName: values.fullName,
            gender: values.gender,
          },
        });
      } else if (role === "moderator") {
        const m = row as AdminModerator;
        const backendProvince = toBackendProvince(values.province);
        await updateModeratorMutation.mutateAsync({
          userId: m.userId,
          body: {
            fullName: values.fullName,
            gender: values.gender,
            province: backendProvince,
          },
        });
      } else {
        const o = row as AdminOrganizer;
        const backendProvince = values.province ? toBackendProvince(values.province) : undefined;
        await updateOrganizerMutation.mutateAsync({
          orgId: o.orgId,
          body: {
            orgName: values.orgName,
            email: values.email || undefined,
            phone: values.phone || undefined,
            province: backendProvince,
            website: values.website || undefined,
            about: values.about || undefined,
          },
        });
      }

      onSuccess("Updated successfully.");
      onClose();
    } catch (err) {
      console.error("Failed to update account:", err);
      onError("Update failed. Please try again.");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10 text-slate-800 placeholder-gray-300 transition-all";
  const labelClass = "text-sm font-semibold text-(--secondary-color) mb-2 block";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ animation: "deletePopupIn 0.18s ease" }}
    >
      <style>{`
          @keyframes deletePopupIn {
            from { opacity: 0; transform: scale(0.95) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
        `}</style>
      <div className="bg-white w-full max-w-md rounded-[24px] p-8 shadow-xl relative max-h-[90vh] overflow-y-visible">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 bg-(--main-color)/10 text-(--main-color) rounded-full flex items-center justify-center mb-3">
            <Edit size={24} color="currentColor" />
          </div>
          <h3 className="text-xl font-bold text-(--secondary-color)">
            Edit {role === "moderator" ? "Moderator" : role === "organizer" ? "Organizer" : "User"}
          </h3>
          <p className="text-sm text-[#7886a6] mt-1">
            Update the account information below
          </p>
        </div>

        <form onSubmit={handleSubmit(submitForm)} noValidate className="flex flex-col gap-5">
          {role === "organizer" ? (
            <>
              {/* Organization Name */}
              <div>
                <label className={labelClass}>Organization Name</label>
                <input className={inputClass} {...register("orgName")} placeholder="Enter organization name" />
                {errors.orgName && <p className="text-xs text-red-600 mt-1">{errors.orgName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} {...register("email")} placeholder="Enter email address" />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} {...register("phone")} placeholder="Enter phone number" />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
              </div>

              {/* Website */}
              <div>
                <label className={labelClass}>Website</label>
                <input className={inputClass} {...register("website")} placeholder="Enter website" />
                {errors.website && <p className="text-xs text-red-600 mt-1">{errors.website.message}</p>}
              </div>

              {/* About */}
              <div>
                <label className={labelClass}>About</label>
                <input className={inputClass} {...register("about")} placeholder="Enter a short bio" />
                {errors.about && <p className="text-xs text-red-600 mt-1">{errors.about.message}</p>}
              </div>
            </>
          ) : (
            <>
              {/* Full Name */}
              <div>
                <label className={labelClass}>Full Name</label>
                <input className={inputClass} {...register("fullName")} placeholder="Enter full name" />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
              </div>

              {/* Gender */}
              <div className="relative z-50">
                <label className={labelClass}>Gender</label>

                <div className="relative">
                  <div
                    onClick={() => setIsOpenGenderDropdown(!isOpenGenderDropdown)}
                    className={`flex items-center justify-between gap-2 px-4 border rounded-xl bg-white h-11 cursor-pointer transition-all ${
                      isOpenGenderDropdown
                        ? "border-(--main-color) ring-2 ring-(--secondary-color)/20"
                        : "border-slate-200 hover:border-(--main-color)"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`text-sm truncate font-inter ${
                          selectedGender ? "text-(--secondary-color) font-medium" : "text-slate-400"
                        }`}
                      >
                        {selectedGender || "Select Gender..."}
                      </span>
                    </div>

                    <ArrowDown2
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${
                        isOpenGenderDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isOpenGenderDropdown && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
                      {(["Male", "Female"] as const).map((g) => (
                        <div
                          key={g}
                          onClick={() => {
                            setValue("gender", g, { shouldValidate: true });
                            setIsOpenGenderDropdown(false);
                          }}
                          className="px-4 py-3 text-sm text-(--secondary-color) hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          {g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender.message}</p>}
              </div>

              {/* Province (Moderator Only) */}
              {role === "moderator" && (
                <div className="relative z-49">
                  <label className={labelClass}>Province</label>
                  <div className="relative">
                    <div
                      onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                      className={`flex items-center justify-between gap-2 px-3 border rounded-xl bg-white h-11 cursor-pointer transition-all ${
                        isOpenDropdown
                          ? "border-(--main-color) ring-2 ring-(--secondary-color)/20"
                          : "border-slate-200 hover:border-(--main-color)"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Location size={16} color="#94a3b8" variant="Linear" />

                        <span
                          className={`text-sm truncate font-inter ${
                            selectedProvince ? "text-(--secondary-color) font-medium" : "text-slate-400"
                          }`}
                        >
                          {selectedProvince || "Select Province..."}
                        </span>
                      </div>

                      <ArrowDown2
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 ${
                          isOpenDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {isOpenDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
                        {provinceOptions.map((p) => (
                          <div
                            key={p}
                            onClick={() => {
                              setValue("province", p, { shouldValidate: true });
                              setIsOpenDropdown(false);
                            }}
                            className="px-4 py-3 text-sm text-(--secondary-color) hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.province && <p className="text-xs text-red-600 mt-1">{errors.province.message}</p>}
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-(--main-color) text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-all cursor-pointer mt-2 disabled:opacity-60 shadow-md shadow-cyan-100"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
