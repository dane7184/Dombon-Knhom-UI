"use client";

import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabOption {
  value: string;
  label: string;
}

interface DashboardTabsProps {
  options: TabOption[];
}

export default function DashboardTabs({ options }: DashboardTabsProps) {
  return (
    <TabsList className="flex h-auto items-center gap-1 bg-(--main-color) p-1.5 rounded-lg w-full sm:w-auto shrink-0">
      {options.map((option) => (
        <TabsTrigger
          key={option.value}
          value={option.value}
          className="flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-md text-sm font-semibold text-white cursor-pointer text-center data-[state=active]:bg-white data-[state=active]:text-(--secondary-color) data-[state=active]:shadow hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
        >
          {option.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
