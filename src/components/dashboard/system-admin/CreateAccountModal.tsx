"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { z } from "zod";
import {
  useCreateUser,
  useCreateModerator,
} from "@/hooks/admin/useAdminAccounts";
import { signupSchema } from "@/types/schemas/auth.schema";
import { Province } from "@/constant/province";
import { ArrowDown2, Location, Eye, EyeSlash } from "iconsax-react";

type AccountRole = "user" | "moderator";

const buildSchema = (role: AccountRole) =>
  z.object({
    fullName: signupSchema.shape.fullName,
    gmail: signupSchema.shape.email,
    password: signupSchema.shape.password,
    gender: signupSchema.shape.gender,
    verified: z.boolean(),
    province:
      role === "moderator"
        ? z.string().trim().min(1, "Province is required")
        : z.string().optional(),
  });

export type CreateAccountValues = z.infer<ReturnType<typeof buildSchema>>;

interface Props {
  isOpen: boolean;
  role: AccountRole;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function CreateAccountModal({
  isOpen,
  role,
  onClose,
  onSuccess,
  onError,
}: Props) {
  const schema = useMemo(() => buildSchema(role), [role]);
  const createUserMutation = useCreateUser();
  const createModeratorMutation = useCreateModerator();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      gmail: "",
      password: "",
      gender: "Male",
      verified: true,
      province: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedGender = watch("gender");
  const verified = watch("verified");
  const selectedProvince = watch("province") || null;
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  // Reset form every time the modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
      setIsOpenDropdown(false);
    }
  }, [isOpen, reset]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Called when form passes validation
  const submitForm = async (values: CreateAccountValues) => {
    try {
      if (role === "user") {
        await createUserMutation.mutateAsync({
          fullName: values.fullName,
          email: values.gmail,
          password: values.password,
          gender: values.gender,
          verified: values.verified,
        });
      } else {
        const rawProvinceName = values.province ?? "";
        const backendProvinceValue =
          Province[rawProvinceName] || rawProvinceName;

        await createModeratorMutation.mutateAsync({
          fullName: values.fullName,
          email: values.gmail,
          password: values.password,
          gender: values.gender,
          province: backendProvinceValue,
        });
      }

      onSuccess(`${values.fullName} was created successfully.`);
      onClose();
    } catch (err) {
      console.error("Failed to create account:", err);
      onError(`Failed to create ${values.fullName}. Please try again.`);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";
  const provinceOptions = Object.keys(Province);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl rounded-[24px] bg-white p-8 shadow-xl"
        style={{ animation: "deletePopupIn 0.18s ease" }}
      >
        <style>{`
          @keyframes deletePopupIn {
            from { opacity: 0; transform: scale(0.95) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
        `}</style>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold text-(--secondary-color)">
            {role === "user" ? "Create New User" : "Create New Moderator"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submitForm)}
          noValidate
          className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2"
        >
          {/* Full Name */}
          <label className="block space-y-2">
            <span className="text-sm font-medium text-(--secondary-color)">
              Full Name
            </span>
            <input
              type="text"
              {...register("fullName")}
              placeholder="Enter full name"
              className={inputClass}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600">{errors.fullName.message}</p>
            )}
          </label>

          {/* Email */}
          <label className="block space-y-2">
            <span className="text-sm font-medium text-(--secondary-color)">
              Email
            </span>
            <input
              type="email"
              {...register("gmail")}
              placeholder="Enter email address"
              className={inputClass}
            />
            {errors.gmail && (
              <p className="text-xs text-red-600">{errors.gmail.message}</p>
            )}
          </label>

          {/* Password */}
          <div className="block space-y-2">
            <span className="text-sm font-medium text-(--secondary-color)">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter password"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer z-10 p-1"
              >
                {showPassword ? <EyeSlash size={20} color="#94a3b8"  /> : <Eye size={20} color="#94a3b8"  />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="block space-y-2">
            <span className="text-sm font-medium text-(--secondary-color)">
              Gender
            </span>
            <div className="flex items-center gap-6 py-3">
              {(["Male", "Female"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    setValue("gender", g, { shouldValidate: true })
                  }
                  className="flex items-center gap-2 text-sm text-(--secondary-color)"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      selectedGender === g
                        ? "border-(--main-color)"
                        : "border-slate-400"
                    }`}
                  >
                    {selectedGender === g && (
                      <span className="h-2.5 w-2.5 rounded-full bg-(--main-color)" />
                    )}
                  </span>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Province (Only Rendered if Moderator) */}
          {role === "moderator" && (
            <div className="block space-y-2 md:col-span-2 relative">
              <span className="text-sm font-medium text-(--secondary-color)">
                Province
              </span>
              <input type="hidden" {...register("province")} />

              <div className="relative">
                <div
                  onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                  className={`flex items-center justify-between gap-2 px-3 border rounded-lg bg-white h-10 cursor-pointer transition-all ${
                    isOpenDropdown
                      ? "border-(--main-color) ring-2 ring-cyan-100/50"
                      : "border-gray-200 hover:border-(--main-color)"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Location size={16} color="#94a3b8" variant="Linear" />
                    <span
                      className={`text-sm truncate font-inter ${
                        selectedProvince
                          ? "text-(--secondary-color) font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      {selectedProvince || "Select Province..."}
                    </span>
                  </div>
                  <ArrowDown2
                    size={16}
                    className={`text-slate-400 transition-transform ${isOpenDropdown ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Dropdown Options List */}
                {isOpenDropdown && (
                  <div className="absolute top-11 left-0 right-0 max-h-60 overflow-y-auto border border-gray-200 bg-white rounded-xl z-50 shadow-xl p-1.5 flex flex-col gap-0.5">
                    {provinceOptions.map((p) => (
                      <div
                        key={p}
                        onClick={() => {
                          setValue("province", p, { shouldValidate: true });
                          setIsOpenDropdown(false);
                        }}
                        className="px-3 py-2 text-sm text-(--secondary-color) rounded-lg hover:bg-gray-50 cursor-pointer font-inter transition-colors"
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errors.province && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.province.message}
                </p>
              )}
            </div>
          )}

          {/* Submit Action Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="min-w-32 cursor-pointer rounded-2xl bg-gray-100 text-gray-600 px-6 py-3 text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-32 rounded-2xl bg-(--main-color) cursor-pointer px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
