"use client";
import "@/app/globals.css";
import { Edit } from "iconsax-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import {
  PersonalProfileData,
  usePersonalProfile,
  useUpdateProfile,
} from "@/hooks/useProfile";
import {
  buildPersonalInfoSchema,
  PersonalInfoFormValues,
} from "@/types/schemas/profile.schema";
import { showToast } from "@/lib/myToast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileProps {
  userId: string;
}

export const PersonalInformation = ({ userId }: ProfileProps) => {
  const { isOrgMode } = useAuth();
  const { data: profile, isLoading, isError } = usePersonalProfile(userId);

  if (isLoading) {
    return (
      <div className="p-5 bg-(--background-white) rounded-[15px] border card-shadow border-(--input-border) w-full">
        <div className="flex items-center justify-center py-10">
          <span className="ml-3 text-desc">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-5 bg-(--background-white) rounded-[15px] border card-shadow border-(--input-border) w-full">
        <p className="text-sm text-rose-600">Failed to load profile.</p>
      </div>
    );
  }

  return <PersonalInfoForm profile={profile} isOrgMode={isOrgMode} />;
};

interface PersonalInfoFormProps {
  profile: PersonalProfileData;
  isOrgMode: boolean;
}

const PersonalInfoForm = ({ profile, isOrgMode }: PersonalInfoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateProfile();

  const schema = useMemo(() => buildPersonalInfoSchema(isOrgMode), [isOrgMode]);

  const defaultValues: PersonalInfoFormValues = {
    fullName: profile.fullName,
    bio: profile.bio,
    gender: profile.gender,
    phone: profile.phone,
    website: profile.website,
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleCancel = () => {
    reset(defaultValues);
    setIsEditing(false);
  };

  const onSubmit = async (values: PersonalInfoFormValues) => {
    try {
      await updateProfile(values);
      showToast("success", { description: "Profile updated successfully." });
      setIsEditing(false);
    } catch (error) {
      showToast("error", {
        description:
          error instanceof Error ? error.message : "Failed to update profile.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 bg-(--background-white) rounded-[15px] border card-shadow border-(--input-border) w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-[17px] sm:text-[20px] font-bold text-main">
          Personal Information
        </h2>
        {!isEditing ? (
          <button
            type="button"
            className="cursor-pointer btn-main flex items-center"
            onClick={() => setIsEditing(true)}
          >
            <Edit size="20" className="inline-block me-2" color="#FFFFFF" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex cursor-pointer items-center rounded-xl bg-[#eef3f7] px-3 sm:px-6 py-2 sm:py-3 text-[13px] sm:text-[15px] font-medium text-[#3b4047] transition-colors hover:bg-[#e2e8ee] disabled:opacity-50"
            >
              <span className="me-2 text-lg">×</span>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-main cursor-pointer flex items-center px-4 sm:px-7 py-2 sm:py-3 text-[13px] sm:text-[15px] font-medium disabled:opacity-60"
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <span className="me-2 text-lg">✓</span>
                  Save
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5">
        <hr className="border-(--input-border)" />
      </div>

      <div className="space-y-5 mt-5">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-[15px] font-medium text-desc sm:w-36 shrink-0">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your fullname"
              {...register("fullName")}
              disabled={!isEditing}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
            />
          </div>
          <div >
            {errors.fullName && (
            <p className="text-sm text-rose-600 sm:ms-40 ms-0 mt-1  ">
              {errors.fullName.message}
            </p>
          )}
          </div>
        </div>

        {isOrgMode ? (
          <>
            {/* Phone */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-[15px] font-medium text-desc sm:w-36 shrink-0">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="Enter your phone"
                  {...register("phone")}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-rose-600 mt-1  sm:ms-40 ms-0">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-[15px] font-medium text-desc sm:w-36 shrink-0">
                  Website
                </label>
                <input
                  type="text"
                  placeholder="Enter your website"
                  {...register("website")}
                  disabled={!isEditing}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all"
                />
              </div>
              {errors.website && (
                <p className="text-sm text-rose-600 mt-1  sm:ms-40 ms-0">
                  {errors.website.message}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-[15px] font-medium text-desc sm:w-36 shrink-0">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[15px] text-secondary outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-[15px] font-medium text-desc sm:w-36 shrink-0">
                  Gender
                </label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="w-full h-10! rounded-xl cursor-pointer border border-slate-300 bg-white text-[14px] outline-none data-disabled:text-gray-800! data-disabled:opacity-100">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="Male"
                          className="h-10 cursor-pointer text-gray-800!"
                        >
                          Male
                        </SelectItem>
                        <SelectItem
                          value="Female"
                          className="h-10 cursor-pointer text-gray-800!"
                        >
                          Female
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.gender && (
                <p className="text-sm text-rose-600 mt-1  sm:ms-40 ms-0">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </>
        )}

        <div>
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <label className="text-[15px] font-medium text-desc sm:w-36 shrink-0 sm:pt-2">
              Bio
            </label>
            <textarea
              placeholder="Enter your bio"
              {...register("bio")}
              disabled={!isEditing}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/20 transition-all resize-none"
            />
          </div>
          {errors.bio && (
            <p className="text-sm text-rose-600 mt-1  sm:ms-40 ms-0">
              {errors.bio.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};
