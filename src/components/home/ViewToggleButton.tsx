"use client";

import { useRouter, usePathname } from "next/navigation";
import { List, Map } from "lucide-react";
import Link from "next/link";

const VIEW_TABS = [
  { label: "Map View", path: "/home", icon: Map },
  { label: "List View", path: "/home/list", icon: List },
] as const;

export default function ViewTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    // Mobile: full width so it fills the row; md+: original auto-width inline
    <div className="flex items-center gap-1 bg-(--main-color) rounded-lg p-1.5">
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
