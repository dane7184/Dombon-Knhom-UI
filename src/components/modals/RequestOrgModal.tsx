"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/lib/myToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Verify } from "iconsax-react";
import { CAMBODIA_PROVINCES } from "@/constant/province";
import {
  requestOrganizerSchema,
  RequestOrganizerInput,
} from "@/types/schemas/profile.schema";
import { useRequestOrganizer } from "@/hooks/useRequestOrganizer";

const defaultProfilePreview =
  "https://i.pinimg.com/736x/1d/ec/e2/1dece2c8357bdd7cee3b15036344faf5.jpg";



function ProvinceSearchSelect({
  selectedValue,
  error,
  onSelect,
}: {
  selectedValue: string;
  error?: string;
  onSelect: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = CAMBODIA_PROVINCES.find((p) => p.value === selectedValue);
  const selectedLabel = selectedOption?.label || "";
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = search
    ? CAMBODIA_PROVINCES.filter((p) => p.label.toLowerCase().includes(search.toLowerCase()))
    : CAMBODIA_PROVINCES;

  return (
    <div className="block space-y-2">
      <span className="text-sm font-semibold text-(--secondary-color)">
        Province<span className="text-rose-600">*</span>
      </span>
      <div ref={ref} className="relative">
        <div
          className={`w-full mt-1.5 rounded-xl border bg-white px-4 py-3 text-[15px] flex items-center gap-2 transition-colors ${error ? "border-rose-400" : "border-gray-200 focus-within:border-(--main-color) focus-within:ring-2 focus-within:ring-(--main-color)/10"} ${isOpen ? "border-(--main-color) ring-2 ring-(--main-color)/10" : ""}`}
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? search : selectedLabel}
            placeholder={selectedLabel || "Select province"}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setSearch("");
            }}
            className="flex-1 min-w-0 bg-transparent border-none outline-none p-0 text-[15px] text-gray-800 placeholder:text-[#9ca3af] cursor-pointer"
          />
          <svg className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-44 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    onSelect(p.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-4 py-2.5 text-left text-[15px] cursor-pointer transition-colors hover:bg-[#f1f5f9] ${p.value === selectedValue ? "text-(--main-color) font-semibold bg-[#f0fafb]" : "text-gray-800"}`}
                >
                  {p.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[#94a3b8]">No results found</div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

const initialValues: RequestOrganizerInput = {
  profileImage: null,
  fullName: "",
  province: "",
  phone: "",
  website: "",
  about: "",
  verificationDocument: undefined as unknown as File,
};

export default function RequestOrgModal({ alreadyRequested = false }: { alreadyRequested?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profilePreview, setProfilePreview] = useState(defaultProfilePreview);
  const [fileName, setFileName] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(alreadyRequested);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (alreadyRequested) {
      setHasRequested(true);
    } else {
      setHasRequested(localStorage.getItem("org_requested") === "true");
    }
    setMounted(true);
  }, [alreadyRequested]);

  const requestOrganizer = useRequestOrganizer();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequestOrganizerInput>({
    resolver: zodResolver(requestOrganizerSchema),
    defaultValues: initialValues,
  });

  const provinceValue = watch("province");

  const resetAndCloseModal = () => {
    if (profilePreview.startsWith("blob:")) {
      URL.revokeObjectURL(profilePreview);
    }
    setIsOpen(false);
    reset(initialValues);
    setFileName(null);
    setProfilePreview(defaultProfilePreview);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetAndCloseModal();
    else setIsOpen(true);
  };

  const handleProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (profilePreview.startsWith("blob:")) URL.revokeObjectURL(profilePreview);
    setValue("profileImage", selectedFile, { shouldValidate: true });
    setProfilePreview(
      selectedFile ? URL.createObjectURL(selectedFile) : defaultProfilePreview,
    );
  };

  const handleDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setValue("verificationDocument", selectedFile as unknown as File, {
      shouldValidate: true,
    });
    setFileName(selectedFile?.name ?? null);
  };

  const onSubmit = async (values: RequestOrganizerInput) => {
    try {
      const result = await requestOrganizer.mutateAsync(values);

      if (result === "already_exists") {
        setHasRequested(true);
        localStorage.setItem("org_requested", "true");
        showToast("error", {
          description: "You already have a pending or active organizer request.",
        });
        return;
      }

      setHasRequested(true);
      localStorage.setItem("org_requested", "true");
      showToast("success", {
        description: "Your organizer request has been sent for review.",
      });
      resetAndCloseModal();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      showToast("error", { description: message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={hasRequested}>
        {!mounted ? (
          <div className="w-45 h-9" />
        ) : (
          <button
            disabled={hasRequested}
            onClick={(e) => {
              if (hasRequested) e.preventDefault();
            }}
            className={
              !hasRequested
                ? "btn-main flex cursor-pointer justify-center w-full sm:w-45 text-center"
                : "text-(--main-color) flex opacity-60 cursor-not-allowed pointer-events-none w-full sm:w-45 justify-center"
            }
          >
            <Verify
              color={!hasRequested ? "white" : "#18abc6"}
              size={20}
              className="me-2"
            />
            {hasRequested ? "Requested" : "Request"}
          </button>
        )}
      </DialogTrigger>

      <DialogContent
        className="overflow-hidden w-full sm:max-w-3xl rounded-[24px] border-none bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.15)] z-9999!"
        showCloseButton={false}
      >
        <DialogHeader className="px-8 pt-8 pb-0 z-9999!">
          <div className="flex items-center justify-between z-9999!">
            <DialogTitle className="text-xl font-bold text-(--secondary-color)">
              Organizer Request
            </DialogTitle>
            <button
              type="button"
              onClick={resetAndCloseModal}
              className="rounded-full cursor-pointer p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
          <DialogDescription className="sr-only">
            Fill in details to request an organizer account.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6 px-8 pb-8 pt-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Profile Image (optional) */}
          <div className="flex justify-center mb-5">
            <div className="relative cursor-pointer group">
              <div className="relative shrink-0">
                <Image
                  src={profilePreview}
                  alt="Profile Avatar"
                  width={100}
                  height={100}
                  unoptimized
                  className="w-35 h-35 object-cover rounded-full border-2 border-(--input-border) block"
                />
                <div className="absolute -bottom-1 right-4">
                  <label className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full border-[1.75px] border-(--input-border) bg-(--background-gray) transition-opacity">
                    <Camera size={18} color="gray" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          {errors.profileImage && (
            <p className="text-sm text-rose-600 text-center">
              {errors.profileImage.message}
            </p>
          )}

          {/* Fields */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-(--secondary-color)">
                Organizer Name<span className="text-rose-600">*</span>
              </span>
              <input
                {...register("fullName")}
                placeholder="Enter organizer name"
                className="w-full mt-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors placeholder:text-[#9ca3af] focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10"
              />
              {errors.fullName && (
                <p className="text-sm text-rose-600">
                  {errors.fullName.message}
                </p>
              )}
            </label>

            <ProvinceSearchSelect
              selectedValue={provinceValue}
              error={errors.province?.message}
              onSelect={(val) => setValue("province", val, { shouldValidate: true })}
            />

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-(--secondary-color)">
                Phone<span className="text-rose-600">*</span>
              </span>
              <input
                {...register("phone")}
                placeholder="Enter phone number"
                className="w-full mt-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors placeholder:text-[#9ca3af] focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10"
              />
              {errors.phone && (
                <p className="text-sm text-rose-600">{errors.phone.message}</p>
              )}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-(--secondary-color)">
                Website
              </span>
              <input
                {...register("website")}
                placeholder="Enter organizer website"
                className="w-full mt-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors placeholder:text-[#9ca3af] focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10"
              />
              {errors.website && (
                <p className="text-sm text-rose-600">
                  {errors.website.message}
                </p>
              )}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-(--secondary-color)">
              About<span className="text-rose-600">*</span>
            </span>
            <textarea
              {...register("about")}
              placeholder="Tell me about your organizer"
              rows={2}
              className="w-full mt-1.5 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition-colors placeholder:text-[#9ca3af] focus:border-(--main-color) focus:ring-2 focus:ring-(--main-color)/10"
            />
            {errors.about && (
              <p className="text-sm text-rose-600">{errors.about.message}</p>
            )}
          </label>

          {/* Verification Document */}
          <div>
            <span className="text-sm font-semibold text-(--secondary-color)">
              Verification Document<span className="text-rose-600">*</span>
            </span>
            <label className="relative mt-2 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c2d6ff] bg-white transition-colors hover:bg-blue-50/30">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 shadow-sm">
                <Upload size={16} className="text-gray-700" />
              </div>
              {fileName ? (
                <div className="text-sm font-semibold text-(--main-color)">
                  {fileName}
                </div>
              ) : (
                <>
                  <div className="text-[15px] font-medium text-[#2d333a]">
                    Only PDF files are allowed (max 5MB)
                  </div>
                  <div className="mt-1 text-[13px] text-[#86919f]">
                    Or drag and drop it here
                  </div>
                </>
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleDocumentFile}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
            {errors.verificationDocument && (
              <p className="text-sm text-rose-600">
                {errors.verificationDocument.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-2 grid grid-cols-1 border-0 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={resetAndCloseModal}
              className="w-full rounded-xl border border-gray-200 bg-[#f7f8f9] py-3.5 text-[15px] font-medium cursor-pointer text-[#484f56] transition-colors hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestOrganizer.isPending}
              className="w-full rounded-xl btn-main py-3.5 text-[15px] text-white cursor-pointer shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {requestOrganizer.isPending ? "Submitting..." : "Submit"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}