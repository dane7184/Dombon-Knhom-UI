"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Map } from "lucide-react";

const VIEW_TABS = [
  { label: "Map View", path: "/home", icon: Map },
  { label: "List View", path: "/home/list", icon: List },
] as const;

export default function ViewTabBar() {
  const pathname = usePathname();

  return (
    <div className="absolute top-28 left-4 lg:top-28 lg:left-4 z-500 flex items-center gap-1 bg-(--main-color) rounded-lg p-1.5 shadow-lg">
      {VIEW_TABS.map((tab) => {
        const isActive = pathname === tab.path;
        const IconComponent = tab.icon;

        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`w-8 h-8 lg:w-auto lg:h-auto lg:px-6 lg:py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 select-none ${
              isActive
                ? "bg-white text-(--secondary-color) shadow cursor-default"
                : "text-white cursor-pointer hover:bg-white/10"
            }`}
          >
            <IconComponent size={16} strokeWidth={isActive ? 2.5 : 2} />
            <span className="hidden lg:inline">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
