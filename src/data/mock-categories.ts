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
  Extra: "border-gray-400 text-gray-600",
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