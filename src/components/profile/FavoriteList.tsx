"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FavoriteCard } from "./FavoriteCard";
import { FavoriteUserlist } from "@/types/user.type";
import { SearchBarComponent } from "./SearchBarComponent";
import { useSearch } from "@/hooks/useSearchByName";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOrder = "newest" | "oldest";

export default function FavoriteList({
  initialList,
}: {
  initialList: FavoriteUserlist[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? "";

  const [list, setList] = useState(initialList);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const { searchTerm, setSearchTerm, filtered } = useSearch(list, "name");

  const validFiltered = useMemo(
    () => filtered.filter((user) => user.name && user.name.trim() !== ""),
    [filtered],
  );
  
  const sorted = useMemo(() => {
    return [...validFiltered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [validFiltered, sortOrder]);

  const handleRemove = (entityId: string) => {
    setList((prev) => prev.filter((f) => f.entityId !== entityId));
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <div className="w-full sm:w-[33%]">
          <SearchBarComponent
            value={searchTerm}
            onChangeAction={setSearchTerm}
            placeholder="Search by name..."
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-desc text-sm sm:text-base font-medium">Sort By:</span>
          <Select
            value={sortOrder}
            onValueChange={(val) => setSortOrder(val as SortOrder)}
          >
            <SelectTrigger className="w-36 cursor-pointer bg-white h-12! rounded-xl focus:outline-none! border-[1.5px] border-(--input-border)">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup className="cursor-pointer">
                <SelectLabel>Sort By</SelectLabel>
                <SelectItem value="newest" className="cursor-pointer">Newest</SelectItem>
                <SelectItem value="oldest" className="cursor-pointer">Oldest</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((user) => (
            <FavoriteCard
              key={user.entityId}
              {...user}
              token={token}
              onRemove={() => handleRemove(user.entityId)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-desc text-sm font-medium">No favorites found.</p>
        </div>
      )}
    </div>
  );
}