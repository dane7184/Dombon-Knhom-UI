"use client";
import { useSession } from "next-auth/react";
import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Add, Camera, Global, Location, ScanBarcode } from "iconsax-react";
import { ArrowLeft, Heart, Phone } from "lucide-react";
import { ImageCropModal } from "@/components/profile/ImageCropModal";
import PostForm from "@/components/posts/PostForm";
import Link from "next/link";
import {
  toggleFavoriteUser,
  toggleOrgFavoriteUser,
  updateAvatarClient,
  updateOrgAvatarClient,
  getAvatarDisplayUrl,
} from "@/services/profileInfo.service";
import { Role } from "@/types/common.type";
import { BadgeHoverConfig, BadgesConfig } from "@/constant/badges.config";
import { isOrganizerProfile, ProfileInfoType } from "@/types/user.type";

import { useAuth } from "@/hooks/useAuth";
import { revalidateDiscovery } from "@/actions/feed";
import { showToast } from "@/lib/myToast";
import { validateImageFile } from "@/lib/media";

interface ProfileProps {
  profile: ProfileInfoType;
  isCurrentUser: boolean;
  currentUserRole?: Role | null;
  currentUserOrgId?: string | null;
  isOrgProfile?: boolean;
  badge: { type: string; quantity: number; awardedMonths: string[] }[];
}

export const ProfileInfomation = ({
  profile,
  isCurrentUser,
  currentUserRole,
  currentUserOrgId,
  isOrgProfile = false,
  badge,
}: ProfileProps) => {
  const { isOrgMode } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();

  const [isFavorited, setIsFavorited] = useState(profile.isFavorite ?? false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [trackedProfile, setTrackedProfile] = useState(profile);
  if (trackedProfile !== profile) {
    setTrackedProfile(profile);
    setIsFavorited(profile.isFavorite ?? false);
  }
  const handlePostSuccess = async () => {
    await revalidateDiscovery();
    router.refresh();
  };
  const handleToggleFavorite = async () => {
    const token = session?.user?.accessToken;
    if (!token || isFavoriting) return;

    setIsFavorited((current) => !current);
    setIsFavoriting(true);

    try {
      if (isOrganizer) {
        await toggleOrgFavoriteUser(profile.userId, token);
      } else {
        await toggleFavoriteUser(profile.userId, token);
      }
      if (!isFavorited) {
        showToast("success", {
          description: `${profile.fullName ?? "User"} has been add to your favorites.`,
        });
      } else {
        showToast("deleteSuccess", {
          description: `${profile.fullName ?? "User"} has been remove from your favorites.`,
        });
      }
    } catch (error) {
      setIsFavorited((current) => !current);
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsFavoriting(false);
    }
  };

  const hasOrganizerFields = isOrganizerProfile(profile);
  const isOrganizer =
    hasOrganizerFields ||
    (isCurrentUser &&
      isOrgProfile &&
      currentUserRole === "Organizer" &&
      Boolean(currentUserOrgId));
  const organizerProfile = hasOrganizerFields ? profile : null;

  const USER_BADGES = [
    "FIRST_TIMER",
    "STREAK_KEEPER",
    "CITY_HOPPER",
    "MEMORY_MAKER",
    "CONVERSATION_STARTER",
    "NICHE_SPECIALIST",
    "FIRST_IMPRESSION",
  ];
  const ORG_BADGES = ["CROWD_PULLER", "HIGHLY_RATED_HOST"];

  const [imageError, setImageError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"user" | "org">("user");

  useEffect(() => {
    if (!profile.avatar?.trim()) return;

    const token = session?.user?.accessToken;
    if (!token) return;

    getAvatarDisplayUrl(profile.avatar, token)
      .then((displayUrl) => setAvatarUrl(displayUrl))
      .catch(() => setImageError(true));
  }, [profile.avatar, session?.user?.accessToken]);

  // Open cropper for user avatar
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !session?.user?.userId || !session?.user.accessToken) return;

    const error = validateImageFile(file);
    if (error) {
      showToast("error", { description: error });
      return;
    }

    setCropTarget("user");
    setCropSrc(URL.createObjectURL(file));
  };

  // Open cropper for org logo
  const handleOrgLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !session?.user?.accessToken) return;
    if (!isOrgMode) {
      return;
    }

    const error = validateImageFile(file);
    if (error) {
      showToast("error", { description: error });
      return;
    }

    setCropTarget("org");
    setCropSrc(URL.createObjectURL(file));
  };

  // Called after user confirms crop
  const handleCropComplete = async (blob: Blob, previewUrl: string) => {
    URL.revokeObjectURL(cropSrc!);
    setCropSrc(null);

    setAvatarUrl(previewUrl);
    setImageError(false);
    setIsUploading(true);

    try {
      const token = session!.user.accessToken;
      let fileName: string | null = null;

      if (cropTarget === "org") {
        const orgId = session!.user.orgId;
        const file = new File([blob], "avatar.jpg", { type: blob.type });
        const res = await updateOrgAvatarClient(orgId!, file, token);
        fileName =
          typeof res.data === "string" && res.data.trim()
            ? res.data.trim()
            : null;
      } else {
        const file = new File([blob], "avatar.jpg", { type: blob.type });
        const res = await updateAvatarClient(profile.userId, file, token);
        fileName =
          typeof res.data === "string" && res.data.trim()
            ? res.data.trim()
            : null;
      }

      if (fileName) {
        URL.revokeObjectURL(previewUrl);
        setAvatarUrl(null);
        setImageError(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Upload failed:", err);
      URL.revokeObjectURL(previewUrl);
      const avatar = profile.avatar?.trim();
      setAvatarUrl(
        !avatar
          ? null
          : avatar.startsWith("/")
            ? avatar // local asset path (e.g. mock data) — already displayable
            : `${process.env.NEXT_PUBLIC_API_URL}media/images/${profile.avatar}`,
      );
      setImageError(false);
    } finally {
      setIsUploading(false);
    }
  };
  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  return (
    <div className="w-full bg-(--background-white) p-5 md:p-8 md:pb-6 rounded-[15px] box-shadow relative">
      <button
        type="button"
        onClick={() => router.back()}
        className="md:hidden absolute top-4 left-4 w-9 h-9 cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent"
      >
        <ArrowLeft size={22} color="#18ABC6" />
      </button>
      <div className="md:hidden flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Image
              key={avatarUrl}
              src={
                avatarUrl && !imageError ? avatarUrl : "/images/fallback-pf.png"
              }
              alt={isOrganizer ? "Organizer logo" : "User avatar"}
              width={500}
              height={500}
              onError={() => {
                setImageError(true);
                setAvatarUrl(null);
              }}
              className="w-24 h-24 object-cover rounded-full border-2 border-(--input-border)"
            />
            {isCurrentUser && (
              <div
                className={`absolute bottom-0 right-1 border border-input p-1.5 rounded-full bg-white cursor-pointer ${isUploading ? "opacity-50" : ""}`}
              >
                <label>
                  <Camera
                    size={14}
                    color="#424242"
                    className="cursor-pointer"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={
                      isOrganizer ? handleOrgLogoChange : handleAvatarChange
                    }
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <h2 className="text-[20px] font-bold text-main leading-tight text-center">
              {profile.fullName}{" "}
              {isOrganizer && (
                <Image
                  src="/images/Verified.svg"
                  alt="Verified"
                  width={18}
                  height={18}
                  className="inline-block ms-1 mb-0.5"
                />
              )}
            </h2>
            <div className="flex justify-center">
              <div className="text-center px-5">
                <p className="text-[20px] font-bold text-main leading-none">
                  {profile.favoriteCount}
                </p>
                <p className="text-[12px] font-medium text-desc mt-0.5">
                  Favorites
                </p>
              </div>
              <div className="text-center border-l-2 border-(--input-border) px-5">
                <p className="text-[20px] font-bold text-main leading-none">
                  {profile.activityCount}
                </p>
                <p className="text-[12px] font-medium text-desc mt-0.5">
                  Posts
                </p>
              </div>
              <div className="text-center border-l-2 border-(--input-border) px-5">
                <p className="text-[20px] font-bold text-main leading-none">
                  {profile.createdEventCount}
                </p>
                <p className="text-[12px] font-medium text-desc mt-0.5">
                  Events
                </p>
              </div>
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-desc leading-relaxed text-center">
            {profile.bio}
          </p>
        )}

        {isOrganizer && (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Location size={16} color="var(--main-color)" />
              <span className="text-secondary">
                {organizerProfile?.province || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} color="var(--main-color)" />
              <span className="text-secondary">
                {organizerProfile?.phone || "Unknown"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Global size={16} color="var(--main-color)" />
              {organizerProfile?.website ? (
                <Link
                  href={organizerProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-main truncate hover:underline"
                >
                  {organizerProfile.website}
                </Link>
              ) : (
                <span className="text-secondary">No website</span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {isCurrentUser ? (
            <button
              type="button"
              className="btn-main flex items-center gap-2 cursor-pointer flex-1 justify-center"
              onClick={handleOpenForm}
            >
              <Add size={18} color="#FFFFFF" />
              <span>Add Post</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={isFavoriting}
              aria-pressed={isFavorited}
              className={`flex items-center gap-2 cursor-pointer flex-1 justify-center transition-colors disabled:opacity-60 ${isFavorited ? "btn-accent" : "btn-main"}`}
            >
              <Heart
                size={18}
                color="#FFFFFF"
                fill={isFavorited ? "#FFFFFF" : "none"}
              />
              <span>
                {isFavoriting ? "..." : isFavorited ? "Favorited" : "Favorite"}
              </span>
            </button>
          )}
          {isOrganizer && isCurrentUser && (
            <Link
              href="/organizer"
              className="btn-secondary flex items-center gap-2 cursor-pointer flex-1 justify-center"
            >
              <ScanBarcode size={18} color="#FFFFFF" />
              <span>Dashboard</span>
            </Link>
          )}
        </div>

        {(() => {
          const earnedTypes = (profile.badge ?? [])
            .map((b) => b.type)
            .filter((t) =>
              (isOrganizer ? ORG_BADGES : USER_BADGES).includes(t),
            );
          const types = isCurrentUser
            ? isOrganizer
              ? ORG_BADGES
              : USER_BADGES
            : earnedTypes;
          if (!types.length) return null;
          return (
            <div className="flex flex-wrap gap-3 justify-center">
              {types.map((type) => {
                const badgeConfig = BadgesConfig[type];
                const src =
                  badgeConfig?.src ??
                  "/images/Badges/fallback/default-fallback.svg";
                const fallback =
                  badgeConfig?.fallback ??
                  "/images/Badges/fallback/default-fallback.svg";
                const hasEarned = earnedTypes.includes(type);
                const quantity =
                  (profile.badge ?? []).find((b) => b.type === type)
                    ?.quantity ?? 0;
                return (
                  <div key={type} className="relative w-fit">
                    <Image
                      src={hasEarned ? src : fallback}
                      alt={type}
                      width={44}
                      height={44}
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (!img.dataset.fallbackApplied) {
                          img.dataset.fallbackApplied = "true";
                          img.src = fallback;
                        }
                      }}
                    />
                    {hasEarned && quantity > 1 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-900"
                        style={{ backgroundColor: badgeConfig?.color }}
                      >
                        {quantity}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── DESKTOP layout (original, untouched) ── */}
      <div className="hidden md:flex md:flex-row md:justify-between gap-5">
        <div className="w-full md:w-[70%]">
          <div className="flex gap-4 sm:gap-6 md:gap-8 items-start">
            <div className="relative shrink-0">
              <Image
                key={avatarUrl}
                src={
                  avatarUrl && !imageError
                    ? avatarUrl
                    : "/images/fallback-pf.png"
                }
                alt={isOrganizer ? "Organizer logo" : "User avatar"}
                width={500}
                height={500}
                onError={() => {
                  setImageError(true);
                  setAvatarUrl(null);
                }}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-43 md:h-43 object-cover rounded-full border-2 border-(--input-border) block"
              />
              {isCurrentUser && (
                <div
                  className={`absolute bottom-0 right-5 border border-input p-2 rounded-full bg-white cursor-pointer ${isUploading ? "opacity-50" : ""}`}
                >
                  <label>
                    <Camera
                      size={16}
                      color="#424242"
                      className="cursor-pointer"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={
                        isOrganizer ? handleOrgLogoChange : handleAvatarChange
                      }
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex-col flex gap-3">
              <h2 className="text-[24px] font-semibold text-main">
                {profile.fullName}{" "}
                {isOrganizer && (
                  <span>
                    <Image
                      src="/images/Verified.svg"
                      alt="Verified"
                      width={22}
                      height={22}
                      className="inline-block ms-1"
                    />
                  </span>
                )}
              </h2>
              <div className="flex flex-wrap mt-1 gap-y-2">
                <div className="pe-4 md:pe-8">
                  <h3 className="text-[18px] md:text-[20px] font-medium text-main">
                    {profile.favoriteCount}
                  </h3>
                  <p className="text-desc text-[14px] md:text-[16px]">
                    favorite
                  </p>
                </div>
                <div className="ps-3 md:ps-4 pe-4 md:pe-8 border-l-2 border-(--background-gray)">
                  <h3 className="text-[18px] md:text-[20px] font-medium text-main">
                    {profile.activityCount}
                  </h3>
                  <p className="text-desc text-[14px] md:text-[16px]">posts</p>
                </div>
                <div className="ps-3 md:ps-4 border-l-2 border-(--background-gray)">
                  <h3 className="text-[18px] md:text-[20px] font-medium text-main">
                    {profile.createdEventCount}
                  </h3>
                  <p className="text-desc text-[14px] md:text-[16px]">
                    created events
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-[18px] font-medium">About</h3>
                <p className="text-desc text-[16px]">
                  {profile.bio ? profile.bio : "No bio available."}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            {isOrganizer && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-0 sm:justify-between">
                <div className="flex gap-1.5 items-center">
                  <Location size={20} color="#424242" />
                  <p className="text-secondary text-[14px] md:text-[16px]">
                    Province
                    <span className="ms-1 text-main text-[14px] md:text-[16px]">
                      {organizerProfile?.province
                        ? organizerProfile.province
                        : "Unknown"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1.5 items-center text-start">
                  <Phone size={20} color="#424242" />
                  <p className="text-secondary text-[14px] md:text-[16px]">
                    Phone
                    <span className="ms-1 text-main text-[14px] md:text-[16px]">
                      {organizerProfile?.phone
                        ? organizerProfile.phone
                        : "Unknown"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1.5 items-center text-start">
                  <Global size={20} color="#424242" />
                  {organizerProfile?.website ? (
                    <Link
                      href={organizerProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="text-secondary text-[14px] md:text-[16px]">
                        Website
                        <span className="ms-1 text-main text-[14px] md:text-[16px]">
                          {organizerProfile.website}
                        </span>
                      </p>
                    </Link>
                  ) : (
                    <p className="text-secondary text-[14px] md:text-[16px]">
                      Website{" "}
                      <span className="ms-1 text-main text-[14px] md:text-[16px]">
                        Unknown
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-[28%] flex flex-col justify-between gap-4 md:gap-0">
          <div className="flex items-center justify-start md:justify-end gap-3 flex-wrap">
            {isCurrentUser ? (
              <button
                type="button"
                className="btn-main flex items-center cursor-pointer"
                onClick={handleOpenForm}
              >
                <Add size={20} color="#FFFFFF" />
                <span className="ml-2 text-[16px]">Add Post</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleFavorite}
                disabled={isFavoriting}
                aria-pressed={isFavorited}
                className={`flex items-center cursor-pointer transition-colors disabled:opacity-60 ${
                  isFavorited ? "btn-accent" : "btn-main"
                }`}
              >
                <Heart
                  size={20}
                  color="#FFFFFF"
                  fill={isFavorited ? "#FFFFFF" : "none"}
                />
                <span className="ml-2 text-[16px]">
                  {isFavoriting
                    ? "..."
                    : isFavorited
                      ? "Favorited"
                      : "Favorite"}
                </span>
              </button>
            )}
            {isOrganizer && isCurrentUser && (
              <Link
                href="/organizer"
                className="btn-secondary flex items-center cursor-pointer"
              >
                <ScanBarcode size={20} color="#FFFFFF" />
                <span className="ml-2 text-[16px]">Dashboard</span>
              </Link>
            )}
          </div>

          {isOrganizer ? (
            <div className="h-full items-start py-5 flex justify-end gap-5">
              {(() => {
                const earnedTypes = (profile.badge ?? [])
                  .map((b) => b.type)
                  .filter((type) => ORG_BADGES.includes(type));
                const badges = isCurrentUser ? ORG_BADGES : earnedTypes;
                return badges.map((type) => {
                  const badgeConfig = BadgesConfig[type];
                  const HoverComponent = BadgeHoverConfig[type];
                  const src =
                    badgeConfig?.src ??
                    "/images/Badges/fallback/default-fallback.svg";
                  const fallback =
                    badgeConfig?.fallback ??
                    "/images/Badges/fallback/default-fallback.svg";
                  const hasEarned = earnedTypes.includes(type);
                  const badgeData = (profile.badge ?? []).find(
                    (b) => b.type === type,
                  );
                  const quantity = badgeData?.quantity ?? 0;

                  return (
                    <div key={type} className="relative group w-fit">
                      <Image
                        src={hasEarned ? src : fallback}
                        alt={type}
                        width={55}
                        height={55}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (!img.dataset.fallbackApplied) {
                            img.dataset.fallbackApplied = "true";
                            img.src = fallback;
                          }
                        }}
                      />
                      {hasEarned && quantity > 1 && (
                        <span
                          className={`absolute -top-2 -right-2 px-3 py-1 rounded-2xl text-xs font-semibold text-gray-900`}
                          style={{ backgroundColor: badgeConfig?.color }}
                        >
                          {quantity}
                        </span>
                      )}
                      {HoverComponent && (
                        <div className="absolute -top-25 -right-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                          <HoverComponent />
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-start gap-2 mt-5">
              <div className="flex justify-center flex-wrap gap-5 gap-y-0">
                {(() => {
                  const earnedTypes = (profile.badge ?? [])
                    .map((b) => b.type)
                    .filter((type) => USER_BADGES.includes(type));
                  const badges = isCurrentUser ? USER_BADGES : earnedTypes;
                  return badges.map((type) => {
                    const badgeConfig = BadgesConfig[type];
                    const HoverComponent = BadgeHoverConfig[type];
                    const src =
                      badgeConfig?.src ??
                      "/images/Badges/fallback/default-fallback.svg";
                    const fallback =
                      badgeConfig?.fallback ??
                      "/images/Badges/fallback/default-fallback.svg";
                    const hasEarned = earnedTypes.includes(type);
                    const badgeData = (profile.badge ?? []).find(
                      (b) => b.type === type,
                    );
                    const quantity = badgeData?.quantity ?? 0;

                    return (
                      <div key={type} className="relative group w-fit">
                        <Image
                          src={hasEarned ? src : fallback}
                          alt={type}
                          width={55}
                          height={55}
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (!img.dataset.fallbackApplied) {
                              img.dataset.fallbackApplied = "true";
                              img.src = fallback;
                            }
                          }}
                        />
                        {hasEarned && quantity > 1 && (
                          <span
                            className={`absolute -top-2 -right-2 px-3 py-1 rounded-2xl text-xs font-semibold text-gray-900`}
                            style={{ backgroundColor: badgeConfig?.color }}
                          >
                            {quantity}
                          </span>
                        )}
                        {HoverComponent && (
                          <div className="absolute -top-28 -left-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <HoverComponent />
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* closes hidden md:flex desktop block */}

      {isFormOpen ? (
        <PostForm onClose={handleCloseForm} onPostSuccess={handlePostSuccess} />
      ) : null}
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={1}
          onComplete={handleCropComplete}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
        />
      )}
    </div>
  );
};
