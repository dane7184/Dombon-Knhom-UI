"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDown2 } from "iconsax-react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: any) => void;
  options?: DropdownOption[];
}

export function Dropdown({ value, onChange, options }: DropdownProps) {
  const defaultOptions: DropdownOption[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  const currentOptions = options || defaultOptions;
  const activeLabel =
    currentOptions.find((opt) => opt.value === value)?.label || value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 border border-(--input-border) text-(--secondary-color) bg-white hover:bg-neutral-50/50 rounded-xl flex items-center justify-between gap-4 text-[15px] font-medium transition-all outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer capitalize shadow-none select-none"
        >
          <span className="tracking-wide opacity-90">{activeLabel}</span>
          <ArrowDown2
            size={16}
            variant="Linear"
            color="#1c274c"
            className="opacity-70"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-36 p-1 bg-white border border-(--input-border) rounded-xl shadow-md mt-1 focus:outline-none focus-visible:outline-none"
      >
        <DropdownMenuGroup className="flex flex-col gap-0.5">
          {currentOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-lg cursor-pointer outline-none transition-colors capitalize ${
                value === option.value
                  ? "bg-(--main-color) text-white"
                  : "text-(--secondary-color) hover:bg-neutral-50"
              }`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
