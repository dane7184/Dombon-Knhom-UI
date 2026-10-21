"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import MoreHorizontal from "../../../public/icons/More_Horizontal.svg";
import { Pencil, Trash2, Bookmark, BookmarkCheck, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentOptionsMenuProps {
  isOwner: boolean;
  isSaved?: boolean;
  onOpenEdit: () => void;
  onOpenDelete: () => void;
  onOpenReport: () => void;
  onToggleSave?: () => void;
}

export default function ContentOptionsMenu({
  isOwner,
  isSaved,
  onOpenEdit,
  onOpenDelete,
  onOpenReport,
  onToggleSave,
}: ContentOptionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted-foreground hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-0 cursor-pointer"
        >
          <Image
            src={MoreHorizontal}
            alt="More options"
            width={20}
            height={20}
            className="opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
        {isOwner ? (
          <>
            <DropdownMenuItem
              onSelect={onOpenEdit}
              className="cursor-pointer font-medium text-sm gap-2.5 px-3 py-2.5 rounded-lg"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onSelect={onOpenDelete}
              className="cursor-pointer font-medium text-sm gap-2.5 px-3 py-2.5 rounded-lg text-[var(--accent-color)] focus:bg-[var(--accent-color)]/5 focus:text-[var(--accent-color)]"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {onToggleSave && (
              <>
                <DropdownMenuItem
                  onSelect={onToggleSave}
                  className="cursor-pointer font-medium text-sm gap-2.5 px-3 py-2.5 rounded-lg flex items-center"
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-4 h-4 text-[var(--main-color)]" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                  )}
                  {isSaved ? "Unsave" : "Save"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
              </>
            )}
            
            <DropdownMenuItem
              onSelect={onOpenReport}
              className="cursor-pointer font-medium text-sm gap-2.5 px-3 py-2.5 rounded-lg text-[var(--accent-color)] focus:bg-[var(--accent-color)]/5 focus:text-[var(--accent-color)]"
            >
              <Flag className="w-4 h-4" />
              Report
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
