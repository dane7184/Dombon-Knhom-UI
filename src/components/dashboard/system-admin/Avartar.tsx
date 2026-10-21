import { useState } from "react";
import Image from "next/image";

type AvatarProps = {
  name: string;
  imageUrl?: string | null;
};

export function Avatar({ name, imageUrl }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showImage = imageUrl && !imageError;

  return (
    <div className="w-25 h-25 rounded-full overflow-hidden border-4 border-white shadow-sm">
      {showImage ? (
        <Image
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-(--main-color)/15 flex items-center justify-center text-(--main-color) text-4xl font-bold">
          {initials}
        </div>
      )}
    </div>
  );
}