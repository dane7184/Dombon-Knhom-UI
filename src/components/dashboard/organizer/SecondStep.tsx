"use client";

import React, {useEffect, useRef, useState} from "react";
import {CloudAdd, DollarCircle, GalleryEdit, Trash} from "iconsax-react";
import Image from "next/image";
import {Image as ImageIcon} from "lucide-react";
import {resolveUrl} from "@/lib/format";


export default function Step2ImagePrice({
  initial = {},
  onChangeAction,
  showPrice = true,
  photoMinHeightClass = "min-h-55",
}: {
  initial?: { price?: number | string; image?: string };
  onChangeAction?: (data: { price?: number | string; image?: string }) => void;
  showPrice?: boolean;
  photoMinHeightClass?: string;
}) {
  const parsePrice = (value: number | string | undefined): string | number => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") return value;
    return 0;
  };

  const [price, setPrice] = useState<number | string>(parsePrice(initial.price));
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial.image ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageTouched, setImageTouched] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    setIsImageLoading(true);
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!onChangeAction) return;

    onChangeAction({
      price: showPrice ? price : undefined,
      image: previewUrl ?? undefined,
    });
  }, [price, previewUrl, showPrice]);



  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const setImageFile = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string | null;

      if (result) {
        setPreviewUrl(result);
        setErrorMessage("");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0]);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setErrorMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setImageFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-8">

      {showPrice && (
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-secondary-color flex items-center gap-2">
            <DollarCircle size={20} color="currentColor" variant="Outline" />
            Price (1000$)
          </label>

          <div className="flex flex-col gap-4">
            <div className="relative w-full md:w-90 group">
              <input
                type="range"
                min="0"
                max="1000"
                step="0.1"
                value={price === "" ? 0 : price}
                onChange={(event) =>
                  setPrice(Number(event.target.value))
                }
                className="absolute top-1/2 -translate-y-1/2 w-full z-20 opacity-0 cursor-pointer h-full"
              />

              <div className="w-full h-2 bg-[#18abc6]/25 rounded-full relative">
                <div
                  className="absolute left-0 top-0 h-full bg-[#18abc6] rounded-full"
                  style={{ width: `${(Number(price) / 1000) * 100}%` }}
                />
              </div>

              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#18abc6] rounded-full border-[5px] border-[#d8eef3]"
                style={{ left: `calc(${(Number(price) / 1000) * 100}% - 10px)` }}
              />
            </div>

            <div className="relative w-36">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#18abc6] text-sm font-semibold z-10">
                $
              </span>

              <input
                type="number"
                min="0"
                max="1000"
                step="0.1"
                value={price}
                onChange={(event) => {
                  const val = event.target.value;
                  if (val === "") {
                    setPrice("");
                    return;
                  }
                  const num = Number(val);
                  if (!Number.isNaN(num) && num >= 0 && num <= 1000) {
                    setPrice(val);
                  } else if (num > 1000) {
                    setPrice(1000);
                  }
                }}
                className="w-full h-10.5 border border-[#cbd5e1] rounded-sm pl-8 pr-10 outline-none text-sm font-semibold text-[#18abc6] bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              <DollarCircle
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1e293b]"
                color="currentColor"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-secondary-color flex items-center gap-2">
          <GalleryEdit size={20} color="currentColor" variant="Outline" />
          Photo
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div
          onClick={() => {
            setImageTouched(true);
            openFilePicker();
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            setImageTouched(true);
            handleDrop(event);
          }}
          className={`relative w-full border-[1.5px] rounded-2xl ${photoMinHeightClass} flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors px-4 text-center overflow-hidden ${
            imageTouched && !previewUrl ? "border-solid border-red-500 bg-transparent hover:bg-[#f8fafc]" :
            isDragging
            ? "border-dashed border-[#18abc6] bg-[#edf5fa]"
            : "border-dashed border-[#18abc6] bg-transparent hover:bg-[#f8fafc]"
            }`}
        >
          {previewUrl ? (
            <div className="absolute inset-0">
              <div className="relative w-full h-full overflow-hidden bg-slate-100">
                {isImageLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/40 via-slate-100 to-slate-200/40 animate-pulse" />
                    <div className="relative p-4 bg-white/60 rounded-2xl backdrop-blur-md shadow-sm border border-white/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  </div>
                )}
                <Image
                  src={resolveUrl(previewUrl)}
                  alt="Uploaded preview"
                  fill
                  className={`object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                  unoptimized={true}
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => setIsImageLoading(false)}
                />

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeImage();
                  }}
                  className="absolute right-3 top-3 z-30 bg-red-500/80 hover:bg-red-500 rounded-full px-2 py-2 cursor-pointer transition-colors"
                >
                  <Trash size={16} variant="Outline" color="white" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <CloudAdd
                size={48}
                variant="Outline"
                color="#18abc6"
                className="opacity-80"
              />

              <div className="text-center">
                <p className="text-sm font-medium text-[#64748b] mb-1">
                  Drag and Drop or Upload your image here
                </p>

                <p className="text-xs text-[#94a3b8]">
                  Max 5MB are allowed
                </p>
              </div>
            </>
          )}
        </div>

      {(errorMessage || (imageTouched && !previewUrl)) && (
          <div className="absolute top-full left-0 mt-1">
              <p className="text-xs font-medium text-red-500">
                  {errorMessage || 'Cover image is required.'}
              </p>
          </div>
      )}
      </div>
    </div>
  );
}