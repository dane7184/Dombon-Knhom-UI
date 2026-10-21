"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import { X } from "lucide-react";

import type {
  UserDetail,
  ModeratorDetail,
  OrganizerDetail,
} from "@/types/admin.type";
import {
  IconEmail,
  IconGender,
  IconOwn,
  IconPhone,
  IconProvince,
  IconRole,
  IconWebsite,
} from "@/components/profile/iconProfilePopUp";

type ProfileDetail = UserDetail | ModeratorDetail | OrganizerDetail;

function normalise(detail: ProfileDetail) {
  if ("orgId" in detail) {
    return {
      id: detail.orgId,
      name: detail.orgName,
      role: "Organizer" as const,
      owner: detail.owner,
      phone: detail.phone ?? "Empty",
      province: detail.province,
      email: detail.email ?? "Empty",
      website: detail.website ?? "Empty",
      status: detail.status,
      biography: detail.bio,
      image: null,
    };
  }

  if ("userId" in detail && "province" in detail) {
    return {
      id: detail.userId,
      name: detail.fullName,
      role: "Moderator" as const,
      gender: detail.gender,
      email: detail.email,
      province: detail.province,
      biography: detail.bio,
      image: detail.photo ?? null,
    };
  }

  return {
    id: detail.userId,
    name: detail.fullName,
    role: "User" as const,
    gender: detail.gender,
    email: detail.email,
    status: detail.status ?? "Active",
    biography: detail.biography,
    image: detail.profile ?? null,
  };
}

function AvatarFallback({ image }: { image?: string | null }) {
  return (
      <div className="w-25 h-25 rounded-full overflow-hidden border-4 border-white shadow-sm">
        <Image
            src={image && image.trim() !== "" ? image : "/images/default-avatar.jpg"}
            alt="Avatar"
            width={100}
            height={100}
            className="w-full h-full object-cover"
        />
      </div>
  );
}

function InfoRow({
  icon,
  label,
  valueNode,
}: {
  icon: React.ReactNode;
  label: string;
  valueNode: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-[#4c4b4b]">{icon}</span>
        <span className="text-md text-[#4c4b4b]">{label}</span>
      </div>
      <div className="text-md font-medium text-(--secondary-color) text-right max-w-[55%] truncate">
        {valueNode}
      </div>
    </div>
  );
}

function roleBadge(role: string) {
  if (role === "Organizer") return "bg-purple-100 t text-purple-500";
  if (role === "Moderator") return "bg-orange-100 text-orange-600";
  return "bg-green-100 text-green-600";
}

interface ProfilePopUpProps {
  isOpen: boolean;
  isClose: () => void;
  detail: ProfileDetail | null;
  loading: boolean;
}

export default function ProfilePopUp({
  isOpen,
  isClose,
  detail,
}: ProfilePopUpProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") isClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isClose]);

  if (!isOpen) return null;
  if (!detail) return null;

  const data = normalise(detail);
  const isActive = ["Active", "Approved"].includes(data.status ?? "Active");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && isClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-md overflow-hidden w-132.5"
        style={{ animation: "deletePopupIn 0.18s ease" }}
      >
        <style>{`
          @keyframes deletePopupIn {
            from { opacity: 0; transform: scale(0.95) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
        `}</style>

        {/* CLOSE */}
        <div className="relative">
          <button
            type="button"
            onClick={isClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* AVATAR */}
          <div className="flex flex-col items-center pt-15 pb-5 px-10">
            <AvatarFallback image={data.image} />
            <h2 className="mt-2 text-xl font-bold text-(--secondary-color)">
              {data.name}
              {data.image}
            </h2>
            <div className="w-full mt-4 border-t border-gray-100" />
          </div>
        </div>

        {/* BODY */}
        <div className="px-7 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-(--secondary-color)">
              {data.role} Information
            </h3>
            {data.role !== "Moderator" && (
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-400">Status:</span>

    {data.role === "Organizer" ? (
      <StatusBadge status={data.status} />
    ) : (
      <span
        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
          isActive
            ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]"
            : "bg-[#fff1f2] border-[#fecdd3] text-[#e11d48]"
        }`}
      >
        {data.status}
      </span>
    )}
  </div>
)}
          </div>

          {data.role === "Organizer" && (
            <InfoRow
              icon={<IconOwn color="var(--main-color)" />}
              label="Owner"
              valueNode={data.owner}
            />
          )}

          {data.role === "Moderator" ||
            (data.role === "User" && (
              <InfoRow
                icon={<IconGender color="var(--main-color)" />}
                label="Gender"
                valueNode={data.gender}
              />
            ))}

          <InfoRow
            icon={<IconRole color="var(--main-color)" />}
            label="Role"
            valueNode={
              <span
                className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${roleBadge(data.role)}`}
              >
                {data.role}
              </span>
            }
          />

          {["Moderator", "Organizer"].includes(data.role) && (
            <InfoRow
              icon={<IconProvince color="var(--main-color)" />}
              label="Province"
              valueNode={(data.province || "Empty").replace("_", " ")}
            />
          )}

          {data.role === "Organizer" && (
            <InfoRow
              icon={<IconPhone color="var(--main-color)" />}
              label="Phone"
              valueNode={data.phone}
            />
          )}

          <InfoRow
            icon={<IconEmail color="var(--main-color)" />}
            label="Email"
            valueNode={data.email}
          />

          {data.role === "Organizer" && (
            <>
              <InfoRow
                icon={<IconWebsite color="var(--main-color)" />}
                label="Website"
                valueNode={data.website ? data.website : "Empty"}
              />
            </>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xl font-bold text-(--secondary-color) mb-4">
              Biography
            </h3>
            <p className="text-sm w-full h-30 p-2 pl-4 mb-4 border rounded-[15px] border-gray-300 text-gray-600 leading-7">
              {data.biography || "No biography available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const displayStatus = status || "Unknown";

  const colors: Record<string, string> = {
    Pending: "bg-orange-100 text-orange-500",
    Approved: "bg-teal-100 text-teal-600",
    Rejected: "bg-red-100 text-red-500",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-medium ${colors[displayStatus] ?? "bg-gray-100 text-gray-500"}`}
    >
      {displayStatus}
    </span>
  );
}
