"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logout, NotificationBing, TickCircle } from "iconsax-react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { logoutAction } from "@/actions/auth.actions";
import { useSwitchMode } from "@/hooks/useSwitchMode";
import { resolveUrl, sanitizeUrl } from "@/lib/format";
import { BaseModal } from "@/components/profile/BaseModal";
import { useUnreadNotificationsCount } from "@/providers/NotificationProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FallbackProfile from "@public/images/fallback-pf.png";

export interface NavbarProps {
  fullName: string;
  avatar: string | null;
  userId: string | null;
  orgId: string | null;
  orgName: string | null;
  orgLogo: string | null;
}

function renderUserAvatar(avatar: string | null, fullName: string) {
  return (
    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-(--input-border) shrink-0">
      <Image
        src={resolveUrl(avatar, FallbackProfile)}
        alt={fullName}
        fill
        sizes="40px"
        className="object-cover"
      />
    </div>
  );
}

function renderOrgAvatar(orgLogo: string | null, orgName: string | null) {
  return (
    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-(--input-border) shrink-0">
      <Image
        src={resolveUrl(orgLogo, FallbackProfile)}
        alt={orgName ?? "Organization"}
        fill
        sizes="40px"
        className="object-cover"
      />
    </div>
  );
}

export const Navbar: FC<NavbarProps> = ({
  fullName,
  avatar,
  userId,
  orgId,
  orgName,
  orgLogo,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [hasNotif] = useState(true);
  const { data: unreadCount } = useUnreadNotificationsCount();
  const { user, isOrgMode } = useAuth();
  const { switchToOrg, switchToUser, isSwitching } = useSwitchMode();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => pathname === path;
  const isDiscoveryActive =
    isActive("/discovery") || isActive("/discovery/grid");
  const isHomeActive = isActive("/home") || isActive("/home/list");
  const effectiveOrgMode = isOrgMode && !isSwitching;

  const avatarSrc = sanitizeUrl(effectiveOrgMode ? user?.logo : avatar);
  const displayName = effectiveOrgMode
    ? (user?.orgName ?? orgName ?? fullName)
    : fullName || user?.email?.split("@")[0] || "User";
  const resolvedUserId = userId ?? user?.userId ?? null;

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleUserRowClick = async () => {
    if (effectiveOrgMode) {
      await switchToUser();
    } else if (resolvedUserId) {
      router.push(`/profile/${resolvedUserId}`);
    }
  };

  const handleOrgRowClick = async () => {
    if (!effectiveOrgMode) {
      if (orgId) await switchToOrg(orgId);
    } else if (orgId) {
      router.push(`/profile/${orgId}`);
    }
  };

  return (
    <>
      {/* ── Main navbar — desktop layout unchanged ── */}
      <nav className="relative flex items-center justify-between rounded-2xl border border-white/80 bg-white/60 px-4 py-2.5 shadow-[0_8px_30px_-10px_rgba(28,39,76,0.25)] backdrop-blur-2xl backdrop-saturate-150 md:rounded-xl md:border-transparent md:bg-white md:px-10 md:shadow-xs md:backdrop-blur-none">
        {/* Logo */}
        <div className="flex shrink-0 items-center z-10">
          <Link href="/" className="flex items-center select-none pt-1">
            <Image
              src="/icons/project logo.png"
              alt="Brand Logo"
              width={120}
              height={40}
              priority
            />
          </Link>
        </div>

        {/* Nav links — desktop only, centered */}
        <div className="hidden items-center gap-10 md:absolute md:left-1/2 md:-translate-x-1/2 md:flex z-0">
          <Link
            href="/home"
            className={`relative flex flex-col items-center py-2 text-base font-semibold transition-colors duration-200 ${
              isHomeActive
                ? "text-(--main-color)"
                : "text-slate-800 hover:text-(--main-color)"
            }`}
          >
            <span>Home</span>
            {isHomeActive && (
              <span className="absolute bottom-0 h-0.5 w-7 rounded-full bg-(--main-color)" />
            )}
          </Link>
          <Link
            href="/discovery"
            className={`relative flex flex-col items-center py-2 text-base font-semibold transition-colors duration-200 ${
              isDiscoveryActive
                ? "text-(--main-color)"
                : "text-slate-800 hover:text-(--main-color)"
            }`}
          >
            <span>Discovery</span>
            {isDiscoveryActive && (
              <span className="absolute bottom-0 h-0.5 w-7 rounded-full bg-(--main-color)" />
            )}
          </Link>
        </div>

        {/* Right side */}
        <div className="flex max-w-[40%] shrink-0 items-center gap-3 md:gap-6 z-10">
          {/* Notification bell */}
          <Link
            href="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-(--main-color)/5 transition-colors hover:bg-(--main-color)/10 cursor-pointer"
          >
            <NotificationBing size={24} color="var(--main-color)" />
            {!!unreadCount && (
              <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600" />
            )}
          </Link>

          {/* Avatar dropdown — all sizes */}
          <div className="flex">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex min-w-0 cursor-pointer items-center gap-3 group outline-none select-none"
                >
                  <div className="relative shrink-0">
                    <div className="relative h-11 w-11 rounded-full overflow-hidden border border-(--input-border)">
                      <Image
                        src={resolveUrl(
                          effectiveOrgMode ? orgLogo : avatar,
                          FallbackProfile,
                        )}
                        alt={displayName}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border border-(--input-border) bg-white p-0.5 shadow-xs translate-x-1/4 translate-y-1/4">
                      <ChevronDown className="h-3 w-3 text-slate-600 transition-colors group-hover:text-(--main-color)" />
                    </div>
                  </div>
                  <span className="hidden truncate text-base font-bold text-(--secondary-color) transition-colors group-hover:text-(--main-color) sm:inline">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-80! min-w-80! rounded-2xl! md:rounded-[15px]! border-white/80! md:border-slate-100! md:translate-x-10 bg-white/80! md:bg-white! backdrop-blur-2xl backdrop-saturate-150 md:backdrop-blur-none p-1.5! md:p-0! shadow-[0_18px_40px_rgba(255, 255, 255, 0.2)]! z-999! data-[side=bottom]:animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:animate-in data-[side=top]:slide-in-from-bottom-2 data-[side=left]:animate-in data-[side=left]:slide-in-from-right-2 data-[side=right]:animate-in data-[side=right]:slide-in-from-left-2"
              >
                {/* ── Mobile dropdown — new style ── */}
                <div className="md:hidden flex flex-col gap-1">
                  {/* Personal account */}
                  <DropdownMenuItem
                    onSelect={handleUserRowClick}
                    disabled={isSwitching}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer ${
                      !effectiveOrgMode
                        ? "bg-(--main-color)/8"
                        : "focus:bg-gray-100/70 active:bg-gray-100/70"
                    }`}
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/80">
                      <Image
                        src={resolveUrl(avatar, FallbackProfile)}
                        alt={fullName}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-(--secondary-color)">
                        {fullName}
                      </p>
                      <p className="truncate text-xs text-slate-500 mt-0.5">
                        {!effectiveOrgMode
                          ? "Tap to view profile"
                          : isSwitching
                            ? "Switching..."
                            : "Switch to this account"}
                      </p>
                    </div>
                    {!effectiveOrgMode && (
                      <TickCircle
                        color="#00b832"
                        variant="Bold"
                        size={20}
                        className="shrink-0"
                      />
                    )}
                  </DropdownMenuItem>

                  {/* Organizer account */}
                  {orgId && (
                    <DropdownMenuItem
                      onSelect={handleOrgRowClick}
                      disabled={isSwitching}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer ${
                        effectiveOrgMode
                          ? "bg-(--main-color)/8"
                          : "focus:bg-gray-100/70 active:bg-gray-100/70"
                      }`}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/80">
                        <Image
                          src={resolveUrl(orgLogo, FallbackProfile)}
                          alt={orgName ?? "Organization"}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-(--secondary-color)">
                          {orgName ?? "Your Organization"}
                        </p>
                        <p className="truncate text-xs text-slate-500 mt-0.5">
                          {effectiveOrgMode
                            ? "Tap to view profile"
                            : isSwitching
                              ? "Switching..."
                              : "Switch to this account"}
                        </p>
                      </div>
                      {effectiveOrgMode && (
                        <TickCircle
                          color="#00b832"
                          variant="Bold"
                          size={20}
                          className="shrink-0"
                        />
                      )}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1 mx-1 bg-(--input-border)!" />

                  {/* Logout */}
                  <BaseModal variant="logout" onConfirm={handleLogout}>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer focus:bg-red-50"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Logout size={18} color="#ef4444" />
                      </span>
                      <span className="min-w-0 flex-1 text-[14px] font-semibold text-red-500">
                        Log out
                      </span>
                    </DropdownMenuItem>
                  </BaseModal>
                </div>

                {/* ── Desktop dropdown — unchanged ── */}
                <div className="hidden md:block">
                  <DropdownMenuItem
                    onSelect={handleUserRowClick}
                    disabled={isSwitching}
                    className="flex items-center gap-3 px-3 md:px-6 py-3 rounded-xl md:rounded-none cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                  >
                    {renderUserAvatar(avatar, fullName)}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-slate-800 flex items-center justify-between">
                        {fullName}
                        {!effectiveOrgMode && (
                          <TickCircle
                            color="#00b832"
                            variant="Bold"
                            size={24}
                          />
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {effectiveOrgMode
                          ? isSwitching
                            ? "Switching..."
                            : "Switch to personal account"
                          : "View personal profile"}
                      </p>
                    </div>
                  </DropdownMenuItem>

                  {orgId && (
                    <>
                      <DropdownMenuSeparator className="my-0 mx-2 md:mx-0 bg-(--input-border)! h-[0.1px]!" />
                      <DropdownMenuItem
                        onSelect={handleOrgRowClick}
                        disabled={isSwitching}
                        className="flex items-center gap-3 px-3 md:px-6 py-3 rounded-xl md:rounded-none cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                      >
                        {renderOrgAvatar(orgLogo, orgName)}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-medium text-secondary-color flex items-center justify-between">
                            {orgName ?? "Your Organization"}
                            {effectiveOrgMode && (
                              <TickCircle
                                color="#00b832"
                                variant="Bold"
                                size={24}
                              />
                            )}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {!effectiveOrgMode
                              ? isSwitching
                                ? "Switching..."
                                : "Switch to organization account"
                              : "View organization profile"}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="my-0 bg-(--input-border)! h-[0.1px]!" />
                  <BaseModal variant="logout" onConfirm={handleLogout}>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center gap-3 px-3 md:px-6 py-3 rounded-xl md:rounded-none cursor-pointer hover:bg-red-50 focus:bg-red-50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center border border-(--input-border) rounded-full bg-slate-100 text-slate-700">
                        <Logout size={20} color="#000000" />
                      </span>
                      <span className="min-w-0 flex-1 text-[15px] font-medium text-secondary-color">
                        Log out
                      </span>
                    </DropdownMenuItem>
                  </BaseModal>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </>
  );
};
