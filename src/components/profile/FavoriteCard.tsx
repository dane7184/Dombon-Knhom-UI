"use client";
import Image from "next/image";
import { FavoriteUserlist } from "@/types/user.type";
import { showToast } from "@/lib/myToast";
import Link from "next/link";
import { toggleFavoriteUser, toggleOrgFavoriteUser } from "@/services/profileInfo.service";
import { resolveUrl } from "@/lib/format";
import { BaseModal } from "./BaseModal";

interface FavoriteCardProps extends FavoriteUserlist {
  token: string;
  onRemove?: () => void;
}

export const FavoriteCard = ({
  entityId,
  name,
  username,
  email,
  image,
  entityType,
  favoriteCount,
  token,
  onRemove,
}: FavoriteCardProps) => {
  const handleRemove = async () => {
  if (!token) return;
  try {
    if (entityType === "Organizer") {
      await toggleOrgFavoriteUser(entityId, token);
    } else {
      await toggleFavoriteUser(entityId, token);
    }
    onRemove?.();
    showToast("deleteSuccess", {
      description: `${name ?? "User"} has been removed from your favorites.`,
    });
  } catch (err) {
    console.error("Failed to remove favorite:", err);
    showToast("error", {
      description: "Something went wrong. Please try again.",
    });
  }
};

  return (
    <div className="flex flex-col items-center p-5 border bg-(--background-white) card-shadow border-(--input-border) rounded-[15px] w-full">
      <Image
        src={resolveUrl(image)}
        alt={"Post image"}
        className="w-22 h-22 object-cover rounded-full border border-(--input-border)"
        width={100}
        height={100}
      />
      <h3 className="mt-3 text-[18px] font-semibold text-main line-clamp-1">
        {name || username || email || "Unknown User"}{" "}
        {entityType === "Organizer" && (
          <Image
            src="/images/Verified.svg"
            alt="organizer badge"
            width={16}
            height={16}
            className="ms-1 inline-block"
          />
        )}
      </h3>
      <p className="text-desc text-[16px]">{favoriteCount ?? 0} Favorites</p>
      <div className="flex gap-2 mt-3 w-full">
        <Link
          href={`/profile/${entityId}`}
          className="flex-1 cursor-pointer text-[16px] py-2 text-center bg-main text-white rounded-[10px] hover:bg-[#18ABC6] transition-colors duration-200"
        >
          Profile
        </Link>
        <BaseModal
          variant="removeFavoriteUser"
          descriptionValues={{ name: name || username || email || "this user" }}
          onConfirm={handleRemove}
        >
          <button
            type="button"
            className="flex-1 cursor-pointer border-[1.5px] text-[#ff0000ff] text-[16px] border-[#ff0000ff] rounded-[10px] hover:bg-[#ff0000ff] hover:text-white transition-colors duration-200"
          >
            Remove
          </button>
        </BaseModal>
      </div>
    </div>
  );
};