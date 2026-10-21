"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
  DocumentText,
  People,
  Card,
  MoneySend,
  CalendarTick,
  Icon,
  Home2,
  Edit,
  SidebarLeft,
  SidebarRight,
  EmptyWallet,
  ProfileCircle,
  Folder2,
  Logout,
  Scan,
} from "iconsax-react";
import { BaseModal } from "@/components/profile/BaseModal";
import { logoutAction } from "@/actions/auth.actions";

type NavItem = {
  label: string;
  href: string;
  icon: Icon;
};

const NAV_ITEMS: Record<string, NavItem[]> = {
  Admin: [
    { label: "Overview", href: "/system-admin", icon: Home2 },
    { label: "Report", href: "/system-admin/reports", icon: DocumentText },
    { label: "User", href: "/system-admin/users", icon: People },
    { label: "Transactions", href: "/system-admin/transactions", icon: Card },
    { label: "Withdrawal", href: "/system-admin/withdrawal", icon: MoneySend },
  ],
  Moderator: [
    { label: "Overview", href: "/moderator", icon: Home2 },
    {
      label: "Event Submissions",
      href: "/moderator/event-submissions",
      icon: CalendarTick,
    },
    {
      label: "Report Management",
      href: "/moderator/report-management",
      icon: DocumentText,
    },
    {
      label: "Organization Requests",
      href: "/moderator/organization-requests",
      icon: Folder2,
    },
  ],
  Organizer: [
    { label: "Overview", href: "/organizer", icon: Home2 },
    { label: "Event Management", href: "/organizer/events", icon: Edit },
    { label: "Scan Ticket", href: "/organizer/scan", icon: Scan },
    { label: "Wallet", href: "/organizer/wallet", icon: EmptyWallet },
    { label: "Profile", href: "/organizer/profile", icon: ProfileCircle },
  ],
};

const ROLE_ACCENT: Record<string, string> = {
  Admin: "#18ABC6",
  Moderator: "#18ABC6",
  Organizer: "#18ABC6",
};

type Props = {
  role: "Admin" | "Moderator" | "Organizer";
  fullName: string;
  email: string;
  avatarUrl?: string;
  onNavigate?: () => void;
};

export default function DashboardSidebar({ role, onNavigate }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV_ITEMS[role] ?? [];
  const accent = ROLE_ACCENT[role];

  const handleLogout = async () => {
    await logoutAction();
  };

  const baseHref =
    role === "Admin"
      ? "/system-admin"
      : role === "Moderator"
        ? "/moderator"
        : "/organizer";

  const isActive = (href: string) =>
    href === baseHref ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="flex h-full flex-col rounded-3xl bg-white shadow-sm transition-all duration-300"
      style={{ width: collapsed ? "80px" : "300px" }}
    >
      <div
        className={`flex h-18 shrink-0 items-center py-6 mt-4 ${collapsed ? "justify-center" : "justify-between px-5"}`}
      >
        {!collapsed ? (
          <>
            <Link href="/" className="flex items-center">
              <Image
                src="/icons/project logo.png"
                alt="Logo"
                width={140}
                height={40}
                className="object-contain ml-4"
                priority
              />
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="pr-1 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <SidebarLeft size={22} variant="Linear" color={accent} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            <SidebarRight size={22} variant="Linear" color={accent} />
          </button>
        )}
      </div>

      <nav
        className={`flex-1 overflow-y-auto py-6 ${collapsed ? "px-2" : "pr-6"}`}
      >
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-4 transition-all font-semibold
                    ${collapsed ? "rounded-2xl px-0 justify-center" : "rounded-r-2xl pl-10 justify-start"}
                  `}
                  style={{
                    background: active ? `${accent}12` : "transparent",
                    color: active ? accent : "#1D2939",
                    fontWeight: active ? "800" : "500",
                    height: "56px",
                  }}
                >
                  {active && !collapsed && (
                    <div
                      className="absolute left-0 h-8 w-1.5 rounded-full"
                      style={{ background: accent }}
                    />
                  )}

                  <span className="shrink-0 transition-transform group-hover:scale-110">
                    <Icon
                      size={22}
                      variant="Linear"
                      color={active ? accent : "#1D2939"}
                    />
                  </span>

                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`shrink-0 border-t border-slate-100 py-4 ${collapsed ? "px-2" : "pr-6"}`}
      >
        <BaseModal variant="logout" onConfirm={handleLogout}>
          <button
            type="button"
            className={`group relative flex w-full items-center gap-4 transition-all text-[#1D2939] hover:bg-red-50 hover:text-red-600
        ${collapsed ? "rounded-2xl px-0 justify-center" : "rounded-r-2xl px-10 justify-start cursor-pointer"}
      `}
            style={{ height: "56px" }}
          >
            {!collapsed && (
              <div className="absolute left-0 h-8 w-1.5 rounded-full bg-red-600 opacity-0 transition-opacity group-hover:opacity-100" />
            )}

            <span className="shrink-0 transition-transform group-hover:scale-110">
              <Logout size={22} variant="Linear" color="currentColor" />
            </span>

            {!collapsed && (
              <span className="truncate transition-all group-hover:font-extrabold">
                Logout
              </span>
            )}
          </button>
        </BaseModal>
      </div>
    </aside>
  );
}
