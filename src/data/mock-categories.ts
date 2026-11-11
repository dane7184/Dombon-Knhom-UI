import {AppBaseCategoryType, AppContentType, AppStatus , } from "@/types/common.type";
import { TickCircle  } from "iconsax-react";

export const mockCategories = async () => {
  return null;
};

export const categoryStyles: Record<AppBaseCategoryType, string> = {
  Health: "border-violet-400 text-violet-600",
  Music: "border-[#895129] text-[#895129]",
  Adventure: "border-indigo-300 text-indigo-500",
  Traditional: "border-cyan-400 text-cyan-600",
  Sport: "border-[#FD346E] text-[#FD346E]",
  Entertainment: "border-[#FFA800] text-[#FFA800]",
  International: "border-lime-500 text-lime-600",
  Education: "border-green-400 text-green-600",
  Cultural: "border-amber-400 text-amber-600",
  Food: "border-orange-400 text-orange-600",
  Technology: "border-sky-400 text-sky-600",
  Community: "border-teal-400 text-teal-600",
  Business: "border-slate-400 text-slate-600",
  Career: "border-blue-400 text-blue-600",
  Networking: "border-purple-400 text-purple-600",
  Art: "border-fuchsia-400 text-fuchsia-600",
  Exhibition: "border-rose-400 text-rose-600",
  Charity: "border-red-400 text-red-600",
  Workshop: "border-emerald-400 text-emerald-600",
  Fashion: "border-pink-400 text-pink-600",
  Photography: "border-stone-400 text-stone-600",
  Gaming: "border-violet-500 text-violet-700",
  Movie: "border-yellow-500 text-yellow-700",
  Religious: "border-amber-500 text-amber-700",
  Nightlife: "border-indigo-500 text-indigo-700",
  Other: "border-gray-400 text-gray-600",
};

export const statusStyles: Record<AppStatus, string> = {
    Approved: "border-emerald-300 bg-emerald-50 text-emerald-600",
    Pending: "border-yellow-300 bg-yellow-50 text-yellow-600",
    Rejected: "border-red-300 bg-red-50 text-red-600",
}

export const contentTypeStyles: Record<AppContentType, string> = {
    Event: "border-0 bg-pink-100 text-pink-600",
    Activity: "border-0 bg-blue-100 text-blue-600",
}