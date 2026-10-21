// components/ImageCropModal.tsx
"use client";

import { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { getCroppedImg } from "@/lib/getCroppedImg";

interface Props {
  imageSrc: string;
  aspect?: number; // e.g. 1 for avatar, 16/9 for banner
  onComplete: (blob: Blob, previewUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropModal({ imageSrc, aspect = 1, onComplete, onCancel }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

const onCropComplete = useCallback((_: Area, pixels: Area) => {
  setCroppedAreaPixels(pixels);
}, []);

  const handleDone = async () => {
  if (!croppedAreaPixels) return;
  const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
  const previewUrl = URL.createObjectURL(blob);
  onComplete(blob, previewUrl);
};

  return (
    <div className="fixed inset-0 z-9999! flex flex-col items-center justify-center bg-black/70">
      <div className="relative w-100 h-100 bg-gray-900 rounded-lg overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Zoom slider */}
      <input
        type="range"
        min={1}
        max={3}
        step={0.05}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="mt-4 w-75"
      />

      <div className="flex gap-3 mt-4">
        <button onClick={onCancel} className="btn-secondary px-8 py-2 rounded-lg! text-white cursor-pointer">
          Cancel
        </button>
        <button onClick={handleDone} className="btn-main px-6 py-2 rounded-lg! text-white cursor-pointer">
          Confirm
        </button>
      </div>
    </div>
  );
}