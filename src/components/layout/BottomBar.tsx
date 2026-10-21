"use client";

import React, { FC, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Add, Discover, Home2 } from "iconsax-react";

const INACTIVE = "#64748b"; // slate-500

interface TabLinkProps {
  href: string;
  label: string;
  active: boolean;
  children: ReactNode;
}

const TabLink: FC<TabLinkProps> = ({ href, label, active, children }) => (
  <Link
    href={href}
    className="relative z-10 flex flex-1 flex-col items-center gap-1 py-1 select-none"
  >
    {children}
    <span
      className={`text-[11px] font-semibold tracking-wide transition-colors ${
        active ? "text-(--main-color)" : "text-slate-500"
      }`}
    >
      {label}
    </span>
  </Link>
);

export const BottomBar: FC = () => {
  const pathname = usePathname();
  const isHome = pathname === "/home" || pathname === "/home/list";
  const isFeed = pathname === "/discovery" || pathname === "/discovery/grid";

  // Context-aware center action: create an event on Home, a post on Discovery.
  const createHref = isHome ? "/events/create" : "/posts/create";
  const createLabel = isHome ? "Create event" : "Create post";

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-1000 pointer-events-none">
      {/* soft fade so content scrolls out gracefully behind the glass */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-background to-transparent" />

      <div className="relative flex justify-center px-4 pt-2 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
        <nav className="pointer-events-auto relative flex w-full items-center justify-between rounded-[28px] border border-white/60 bg-white/55 px-3 py-2 shadow-[0_10px_40px_-8px_rgba(28,39,76,0.35)] backdrop-blur-2xl backdrop-saturate-150">
          {/* glass sheen highlight */}
          <span className="pointer-events-none absolute inset-0 rounded-[28px] bg-linear-to-b from-white/70 to-white/5" />

          {/* Home */}
          <TabLink href="/home" label="Home" active={isHome}>
            <Home2
              size={24}
              variant={isHome ? "Bold" : "Linear"}
              color={isHome ? "var(--main-color)" : INACTIVE}
            />
          </TabLink>

          {/* Create — elevated center action (context-aware) */}
          <Link
            href={createHref}
            aria-label={createLabel}
            className="relative z-10 -mt-8 flex flex-col items-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--main-color) text-white shadow-[0_10px_28px_-6px_rgba(24,171,198,0.85)] ring-4 ring-white/70 transition-transform duration-200 active:scale-90">
              <Add size={30} color="#ffffff" />
            </span>
          </Link>

          {/* Discovery — social feed */}
          <TabLink href="/discovery" label="Discovery" active={isFeed}>
            <Discover
              size={24}
              variant={isFeed ? "Bold" : "Linear"}
              color={isFeed ? "var(--main-color)" : INACTIVE}
            />
          </TabLink>
        </nav>
      </div>
    </div>
  );
};
