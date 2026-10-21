"use client";

import { NotificationBing, TickCircle } from "iconsax-react";
import { ChevronDown, User2, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrganizationInfo } from "@/hooks/org/useOrganizationInfo";
import { useAuth } from "@/hooks/useAuth";
import { useSwitchMode } from "@/hooks/useSwitchMode";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { useUnreadNotificationsCount } from "@/providers/NotificationProvider";
import { resolveAvatarUrl } from "@/lib/format";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

type Props = {
  role: "Admin" | "Moderator" | "Organizer";
  avatar?: string | null;
  onMenuClick?: () => void;
  showMenu?: boolean;
};

const ROLE_LABEL: Record<string, string> = {
  Admin: "System Admin",
  Moderator: "Moderator",
  Organizer: "Organizer",
};

const ROLE_ACCENT: Record<string, string> = {
  Admin: "#18ABC6",
  Moderator: "#18ABC6",
  Organizer: "#18ABC6",
};

const NOTIF_PATHS: Record<string, string> = {
  Admin: "/system-admin/notification",
  Moderator: "/moderator/notification",
  Organizer: "/organizer/notification",
};

const PATH_TITLES: Record<string, string> = {
  "/system-admin/reports": "Report Management",
  "/system-admin/users": "User Management",
  "/system-admin/transactions": "Transactions",
  "/system-admin/withdrawal": "Withdrawal Requests",
  "/system-admin/notification": "Notifications",
  "/system-admin": "Dashboard Overview",
  "/moderator/event-submissions": "Event Submissions",
  "/moderator/report-management": "Report Management",
  "/moderator/organization-requests": "Organization Requests",
  "/moderator/notification": "Notifications",
  "/moderator": "Dashboard Overview",
  "/organizer/events/create": "Event Management",
  "/organizer/events": "Event Management",
  "/organizer/wallet": "Wallet",
  "/organizer/profile": "Profile",
  "/organizer/notification": "Notifications",
  "/organizer": "Dashboard Overview",
};

function renderUserAvatar(avatar: string | null, fullName: string) {
  return (
    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-(--input-border) shrink-0">
      <Image
        src={resolveAvatarUrl(avatar)}
        alt={fullName}
        fill
        sizes="40px"
        className="object-cover"
      />
    </div>
  );
}

function renderOrgAvatar(
  orgLogo: string | null | undefined,
  orgName: string | null | undefined,
) {
  return (
    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-(--input-border) shrink-0">
      <Image
        src={resolveAvatarUrl(orgLogo)}
        alt={orgName ?? "Organization"}
        fill
        sizes="40px"
        className="object-cover"
      />
    </div>
  );
}

export default function DashboardNavbar({
  role,
  avatar,
  onMenuClick,
  showMenu,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: unreadCount } = useUnreadNotificationsCount();

  const { infoOrg } = useOrganizationInfo();
  const { user, isOrgMode, orgId } = useAuth();
  const { switchToUser, isSwitching } = useSwitchMode();
  const { data: myProfile } = useCurrentUserProfile();

  const accent = ROLE_ACCENT[role];
  const notifHref = NOTIF_PATHS[role];

  const pageTitle =
    PATH_TITLES[pathname] ??
    Object.entries(PATH_TITLES).find(([key]) =>
      pathname.startsWith(key),
    )?.[1] ??
    "Dashboard Overview";

  const fullName =
    myProfile?.fullName ??
    user?.fullName ??
    user?.email?.split("@")[0] ??
    "Personal account";
  const personalAvatar = myProfile?.avatar ?? avatar ?? null;
  const personalName = fullName;
  const effectiveOrgMode = isOrgMode;

  const handleSwitchToUser = async () => {
    await switchToUser();
  };

  const handleViewOrgProfile = () => {
    if (orgId) {
      router.push(`/profile/${orgId}`);
    }
  };

  return (
    <header className="flex h-18 shrink-0 items-center justify-between rounded-2xl bg-white px-4 md:px-6 shadow-sm">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        {showMenu && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--main-color)/5 hover:bg-(--main-color)/10 transition-colors cursor-pointer"
          >
            <Menu size={20} color="var(--main-color)" />
          </button>
        )}
        <h1
          className="text-[1.1rem] md:text-[1.5rem] font-bold text-[#1D2939] truncate"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6 md:pr-4">
        <Link
          href={notifHref}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-(--main-color)/5 hover:bg-(--main-color)/10 transition-colors cursor-pointer"
        >
          <NotificationBing size={24} color="var(--main-color)" />
          {!!unreadCount && (
            <span className="absolute top-1.5 right-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600" />
          )}
        </Link>

        {role === "Organizer" ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-w-0 cursor-pointer items-center gap-3 group outline-none select-none"
              >
                <div className="relative shrink-0">
                  {infoOrg?.logo ? (
                    <div
                      className="relative h-11 w-11 rounded-full border border-(--input-border) overflow-hidden"
                      style={{
                        outline: `2px solid ${accent}`,
                        outlineOffset: "1px",
                      }}
                    >
                      <Image
                        src={resolveAvatarUrl(infoOrg.logo)}
                        alt={infoOrg.name ?? "Organization"}
                        className="object-cover"
                        fill
                      />
                    </div>
                  ) : (
                    <User2 className="flex h-11 w-11 items-center justify-center rounded-full bg-(--main-color) text-base font-bold text-white border border-(--input-border)" />
                  )}
                  <div className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border border-(--input-border) bg-white p-0.5 shadow-xs translate-x-1/4 translate-y-1/4">
                    <ChevronDown className="h-3 w-3 text-slate-600 transition-colors group-hover:text-(--main-color)" />
                  </div>
                </div>
                <div className="hidden flex-col leading-tight text-left sm:flex">
                  <span className="text-md font-bold text-slate-800 truncate">
                    {infoOrg?.name}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: accent }}
                  >
                    {ROLE_LABEL[role]}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="w-80! min-w-80! rounded-[15px]! border-slate-100! translate-x-10 bg-white! p-0! shadow-[0_18px_40px_rgba(15,23,42,0.12)]! z-999! data-[side=bottom]:animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:animate-in data-[side=top]:slide-in-from-bottom-2 data-[side=left]:animate-in data-[side=left]:slide-in-from-right-2 data-[side=right]:animate-in data-[side=right]:slide-in-from-left-2"
            >
              {/* Switch to personal account */}
              <DropdownMenuItem
                onSelect={handleSwitchToUser}
                disabled={isSwitching}
                className="flex items-center gap-3 px-6 py-3 rounded-none cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                {renderUserAvatar(personalAvatar, personalName)}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-slate-800 flex items-center justify-between">
                    {personalName}
                    {!effectiveOrgMode && (
                      <TickCircle color="#00b832" variant="Bold" size={24} />
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isSwitching
                      ? "Switching..."
                      : "Switch to personal account"}
                  </p>
                </div>
              </DropdownMenuItem>

              {/* Switch to own organizer account */}
              <DropdownMenuSeparator className=" my-0 bg-(--input-border)! h-[0.1px]!" />
              <DropdownMenuItem
                onSelect={handleViewOrgProfile}
                className="flex items-center gap-3 px-6 py-3 rounded-none cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                {renderOrgAvatar(infoOrg?.logo, infoOrg?.name)}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-slate-800 flex items-center justify-between">
                    {infoOrg?.name ?? "Your Organization"}
                    {effectiveOrgMode && (
                      <TickCircle color="#00b832" variant="Bold" size={24} />
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    View organization profile
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-col leading-tight justify-center">
            <span className="text-md font-bold" style={{ color: accent }}>
              {role === "Admin"
                ? "Admin"
                : (myProfile?.fullName ?? ROLE_LABEL[role])}
            </span>
            {role !== "Admin" && myProfile?.province && (
              <span className="text-sm font-small" style={{ color: "black" }}>
                {myProfile.province}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
