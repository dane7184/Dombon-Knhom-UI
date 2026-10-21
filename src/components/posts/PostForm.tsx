"use client";

import React, {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Hash,
  ImageIcon,
  Loader2,
  MapPin,
  RefreshCw,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import {MAX_IMAGE_COUNT} from "@/types/activity.type";
import {PreviewFile, useActivityForm} from "@/hooks/useActivityForm";
import {CAMBODIA_PROVINCES} from "@/constant/province";
import {resolveMediaUrl} from "@/lib/media";
import {resolveUrl} from "@/lib/format";

const MediaPreviewItem = ({
  file,
  onDelete,
  isPending,
}: {
  file: PreviewFile;
  onDelete: (id: string) => void;
  isPending?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  let src: string;
  if (file.preview.startsWith("blob:") || file.preview.startsWith("data:")) {
    src = file.preview;
  } else if (
    file.preview.startsWith("http://") ||
    file.preview.startsWith("https://")
  ) {
    src = file.preview;
  } else if (file.preview.startsWith("/")) {
    src = file.preview;
  } else {
    src = resolveMediaUrl(file.preview);
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors z-9999!">
      <div className="flex items-center gap-3">
        {file.type === "video" ? (
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-slate-100">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-tr from-slate-200/40 via-slate-100 to-slate-200/40 animate-pulse" />
                <div className="relative p-1.5 bg-white/60 rounded-lg backdrop-blur-md shadow-sm border border-white/50 animate-pulse">
                  <Video className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}
            <video
              src={src}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
              muted
              playsInline
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        ) : (
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-slate-100">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-tr from-slate-200/40 via-slate-100 to-slate-200/40 animate-pulse" />
                <div className="relative p-1.5 bg-white/60 rounded-lg backdrop-blur-md shadow-sm border border-white/50 animate-pulse">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}
            <Image
              src={src}
              alt={file.name}
              className={`w-full h-full object-cover transition-opacity duration-300 relative z-20 ${isLoading ? "opacity-0" : "opacity-100"}`}
              width={48}
              height={48}
              unoptimized={true}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        )}
        <div className="max-w-40 sm:max-w-50 md:max-w-55">
          <p className="text-sm font-semibold text-secondary truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-400">{file.sizeLabel}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(file.id)}
        disabled={isPending}
        className="cursor-pointer p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

interface PostFormProps {
  onClose: () => void;
  onPostSuccess?: (newData?: {
    content: string;
    location: string;
    tags: string[];
  }) => void;
  initialData?: {
    activityId: string;
    content: string;
    tags: string[];
    location: string;
    event: string;
    files: { id: string | number; preview: string; type?: "image" | "video" }[];
  };
}

function formatEventDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function PostForm({
  onClose,
  onPostSuccess,
  initialData,
}: PostFormProps) {
  const {
    content,
    setContent,
    tags,
    tagInput,
    setTagInput,
    province,
    setProvince,
    selectedEvent,
    setSelectedEvent,
    previewFiles,
    mediaMode,
    showProvinceSelect,
    setShowProvinceSelect,
    showEventSelect,
    setShowEventSelect,
    hasAttemptedSubmit,
    mediaError,
    mediaRequirementError,
    isSubmitting,
    fileInputRef,
    attendedEvents,
    isLoadingEvents,
    isContentInvalid,
    isProvinceInvalid,
    isEventInvalid,
    isMediaInvalid,
    isFormInvalid,
    handleProcessFiles,
    handleDeleteFile,
    processTagInput,
    handleTagKeyDown,
    handleTagInputChange,
    handleRemoveTag,
    handleSubmit,
  } = useActivityForm({ initialData, onSuccess: onPostSuccess, onClose });

  const handleUploadZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const getAcceptString = (): string => {
    if (mediaMode === "images") return ".jpg,.jpeg,.png,.webp";
    if (mediaMode === "video") return "video/*";
    return ".jpg,.jpeg,.png,.webp,video/*";
  };

  const selectedProvince = CAMBODIA_PROVINCES.find((p) => p.value === province);

  const [provinceSearch, setProvinceSearch] = useState("");
  const provinceInputRef = useRef<HTMLInputElement | null>(null);
  const provinceDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target as Node)) {
        setShowProvinceSelect(false);
        setProvinceSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowProvinceSelect]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="absolute inset-0"
        onClick={isSubmitting ? undefined : onClose}
      />

      <div className="w-full max-w-300 h-full max-h-[90dvh] md:max-h-170 bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-8 relative z-10 font-khmer box-shadow flex flex-col overflow-y-auto md:overflow-visible transition-all duration-300">
        <div className="flex items-center justify-between mb-4 md:mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer p-2 rounded-full hover:bg-background transition-colors group disabled:opacity-50"
            >
              <ArrowLeft className="w-6 h-6 text-(--main-color)" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-main">
              {initialData ? "Edit Post" : "Create Post"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 min-h-0"
        >
          <div className="flex flex-col space-y-2 min-h-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple={mediaMode !== "video"}
              accept={getAcceptString()}
              className="hidden"
            />

            <div
              onClick={handleUploadZoneClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all flex-1 min-h-40 md:min-h-30 group
                                ${
                                  mediaError
                                    ? "border-rose-400 bg-rose-50/30 hover:bg-rose-50/50"
                                    : "border-blue-200 hover:bg-(--background-color)/30"
                                }`}
            >
              <div className="p-2.5 md:p-3 bg-gray-50 rounded-xl mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
              </div>

              <p className="text-main font-semibold text-sm md:text-base mb-1">
                Select image or video file to upload
              </p>

              <p className="hidden md:block text-gray-400 text-xs md:text-sm">
                Or drag and drop it here
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Up to {MAX_IMAGE_COUNT} images (5MB each)
                </span>

                <span className="hidden sm:block text-gray-300">|</span>

                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />1 video (50MB)
                </span>
              </div>
            </div>

            {mediaError && (
              <p className="text-rose-500 text-xs font-semibold px-1">
                {mediaError}
              </p>
            )}

            <div className="border border-dashed border-blue-100 rounded-2xl p-2 space-y-2 flex-1 max-h-45 md:max-h-none overflow-y-auto no-scrollbar">
              {previewFiles.map((file) => (
                <MediaPreviewItem
                  key={file.id}
                  file={file}
                  onDelete={handleDeleteFile}
                  isPending={isSubmitting}
                />
              ))}
              {previewFiles.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4 md:py-8">
                  No attachments uploaded yet.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between md:h-full space-y-3 md:space-y-4 min-h-0">
            <div className="space-y-4 md:overflow-y-auto no-scrollbar md:pr-1 flex-1">
              <div className="space-y-1">
                <textarea
                  value={content}
                  maxLength={500}
                  onChange={(e) => {
                    setContent(e.target.value.substring(0, 500));
                  }}
                  placeholder="What's on your mind? Share it here..."
                  disabled={isSubmitting}
                  className={`w-full h-28 p-4 rounded-2xl border resize-none text-sm text-secondary placeholder-gray-400 focus:outline-none disabled:opacity-60
                                        ${
                                          hasAttemptedSubmit && isContentInvalid
                                            ? "border-rose-400 focus:border-rose-500 bg-rose-50/10"
                                            : "border-gray-200 focus:border-(--main-color)"
                                        }`}
                />
                <div className="flex justify-between items-center px-1">
                  <span className="text-rose-500 text-xs font-semibold">
                    {hasAttemptedSubmit && isContentInvalid
                      ? content.trim()
                        ? "Words cannot exceed 25 characters without spaces."
                        : "Content is required."
                      : ""}
                  </span>
                  <span
                    className={`text-xs ${content.length >= 500 ? "text-rose-500 font-bold" : "text-gray-400"}`}
                  >
                    {content.length}/500
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm font-semibold text-secondary w-full">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span>
                      Add tags{" "}
                      <span className="text-gray-400 font-normal text-xs">
                        (Optional)
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-400 font-normal text-xs hidden sm:inline">
                    Press Enter, comma, space, or click outside to add
                  </span>
                </div>

                <div className="w-full p-2.5 rounded-xl border flex flex-wrap items-center gap-2 bg-white min-h-12.5 max-h-23 overflow-y-auto no-scrollbar transition-all border-gray-200 focus-within:border-(--main-color)">
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef7fc] text-[#2ba0cb] rounded-full text-sm font-medium transition-all"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isSubmitting}
                        className="cursor-pointer hover:bg-sky-200/50 rounded-full p-0.5 transition-colors group/btn"
                      >
                        <X className="w-3 h-3 text-[#2ba0cb] group-hover/btn:text-sky-800" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    maxLength={25}
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      if (tagInput.trim()) processTagInput(tagInput);
                    }}
                    disabled={isSubmitting}
                    placeholder={tags.length === 0 ? "Enter tags here..." : ""}
                    className="flex-1 min-w-30 bg-transparent border-none outline-none text-sm text-secondary placeholder-gray-400 py-1 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1 relative" ref={provinceDropdownRef}>
                <div
                  onClick={() => {
                    if (isSubmitting) return;
                    setShowProvinceSelect(true);
                    setShowEventSelect(false);
                    setTimeout(() => provinceInputRef.current?.focus(), 0);
                  }}
                  className={`cursor-pointer w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium text-secondary hover:bg-gray-50 transition-colors
                                        ${isSubmitting ? "opacity-60" : ""}
                                        ${hasAttemptedSubmit && isProvinceInvalid ? "border-rose-300 bg-rose-50/10" : "border-gray-100"}`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <MapPin
                      className={`w-4 h-4 shrink-0 ${province ? "text-(--main-color)" : "text-gray-400"}`}
                    />
                    <input
                      ref={provinceInputRef}
                      type="text"
                      disabled={isSubmitting}
                      value={showProvinceSelect ? provinceSearch : (selectedProvince ? `Province: ${selectedProvince.label}` : "")}
                      placeholder="Select province *"
                      onChange={(e) => {
                        setProvinceSearch(e.target.value);
                        if (!showProvinceSelect) setShowProvinceSelect(true);
                      }}
                      onFocus={() => {
                        setShowProvinceSelect(true);
                        setProvinceSearch("");
                        setShowEventSelect(false);
                      }}
                      className={`min-w-0 flex-1 bg-transparent border-none outline-none p-0 text-sm placeholder:text-gray-400 disabled:cursor-not-allowed ${province && !showProvinceSelect ? "text-main font-semibold" : "text-secondary"}`}
                    />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showProvinceSelect ? "rotate-180" : ""}`} />
                </div>

                {showProvinceSelect && (() => {
                  const filtered = provinceSearch
                    ? CAMBODIA_PROVINCES.filter((p) => p.label.toLowerCase().includes(provinceSearch.toLowerCase()))
                    : CAMBODIA_PROVINCES;
                  return (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto text-sm p-1">
                      {filtered.length > 0 ? (
                        filtered.map((p) => (
                          <div
                            key={p.value}
                            onClick={() => {
                              setProvince(p.value);
                              setShowProvinceSelect(false);
                              setProvinceSearch("");
                            }}
                            className={`p-2.5 hover:bg-background rounded-lg cursor-pointer transition-colors ${
                              province === p.value
                                ? "bg-background font-semibold text-(--main-color)"
                                : ""
                            }`}
                          >
                            {p.label}
                          </div>
                        ))
                      ) : (
                        <div className="p-2.5 text-gray-400 text-center">No results found</div>
                      )}
                    </div>
                  );
                })()}
                {hasAttemptedSubmit && isProvinceInvalid && (
                  <p className="text-rose-500 text-xs font-semibold px-1">
                    Province is required.
                  </p>
                )}
              </div>

              <div className="space-y-1 relative">
                {selectedEvent ? (
                  <div className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-sky-200 bg-white shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-15 h-15 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        {selectedEvent.image ? (
                          <Image
                            src={resolveUrl(selectedEvent.image)}
                            alt={selectedEvent.title}
                            className="w-full h-full object-cover"
                            width={60}
                            height={60}
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-start gap-1">
                        <h4 className="text-gray-800 text-sm md:text-base font-semibold tracking-tight leading-none">
                          {selectedEvent.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatEventDate(selectedEvent.startAt)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEventSelect(!showEventSelect);
                            setShowProvinceSelect(false);
                          }}
                          disabled={isSubmitting}
                          className="cursor-pointer flex items-center gap-1.5 text-xs md:text-sm font-medium text-gray-500 hover:text-sky-600 transition-colors"
                        >
                          <div className="p-1 rounded-full bg-sky-50 text-sky-500">
                            <RefreshCw size={14} />
                          </div>
                          <span>Change Event</span>
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                      disabled={isSubmitting}
                      className="cursor-pointer p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventSelect(!showEventSelect);
                      setShowProvinceSelect(false);
                    }}
                    disabled={isSubmitting}
                    className={`cursor-pointer w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium text-secondary hover:bg-gray-50 transition-colors disabled:opacity-60
                                            ${hasAttemptedSubmit && isEventInvalid ? "border-rose-300 bg-rose-50/10" : "border-gray-100"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 font-normal">
                        Link an attended event *
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                {showEventSelect && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl z-20 text-sm p-1 max-h-64 overflow-y-auto">
                    {isLoadingEvents ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading events...</span>
                      </div>
                    ) : !attendedEvents || attendedEvents.length === 0 ? (
                      <div className="text-center py-5 text-gray-400">
                        <Calendar className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        <p className="font-medium">No attended events</p>
                        <p className="text-xs mt-1">
                          Attend events first to link them to your posts.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div
                          onClick={() => {
                            setSelectedEvent(null);
                            setShowEventSelect(false);
                          }}
                          className={`flex items-center gap-3 p-2.5 hover:bg-background rounded-lg cursor-pointer transition-colors ${!selectedEvent ? "bg-background" : ""}`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-700">
                              Don&#39;t link an event
                            </h4>
                            <p className="text-xs text-gray-500">
                              Post without an event tag
                            </p>
                          </div>
                        </div>
                        {attendedEvents.map((ev) => (
                          <div
                            key={ev.eventId}
                            onClick={() => {
                              setSelectedEvent(ev);
                              setShowEventSelect(false);
                            }}
                            className={`flex items-center gap-3 p-2.5 hover:bg-background rounded-lg cursor-pointer transition-colors ${
                              selectedEvent?.eventId === ev.eventId
                                ? "bg-background"
                                : ""
                            }`}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                              {ev.image ? (
                                <Image
                                  src={resolveUrl(ev.image)}
                                  alt={ev.title}
                                  className="w-full h-full object-cover"
                                  width={40}
                                  height={40}
                                  unoptimized={true}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-700 font-medium truncate">
                                {ev.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{formatEventDate(ev.startAt)}</span>
                                <span>·</span>
                                <span>{ev.province?.replace(/_/g, " ")}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
                {hasAttemptedSubmit && isMediaInvalid && (
                  <p className="text-rose-500 text-xs font-semibold px-1 mt-1">
                    {mediaRequirementError ||
                      "At least one image or a video is required."}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 md:mt-4 pb-4 md:pb-0 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer flex-1 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold rounded-xl transition-colors text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`cursor-pointer flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-(--main-color) hover:opacity-90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
                                    ${
                                      isFormInvalid && hasAttemptedSubmit
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                        : "bg-(--main-color) text-white hover:opacity-95 cursor-pointer"
                                    }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {initialData ? "Updating..." : "Posting..."}
                  </>
                ) : initialData ? (
                  "Update Post"
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
