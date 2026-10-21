"use client";

import React, { useEffect, useRef, useState } from "react";
import { searchUsersAction, type SearchUser } from "@/actions/user.actions";
import Link from "next/link";
import { X } from "lucide-react";
import { resolveAvatarUrl } from "@/lib/format";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query: string) {
  if (!query) return <span>{text}</span>;
  const escapedQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-blue-600 font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function SearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function Avatar({ user }: { user: SearchUser }) {
  return (
    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-gray-100 shrink-0">
      <Image
        src={resolveAvatarUrl(user.image)}
        alt={user.fullName || "User"}
        fill
        sizes="44px"
        className="object-cover"
      />
    </div>
  );
}

function UserCard({
  user,
  query,
  onSelect,
}: {
  user: SearchUser;
  query: string;
  onSelect: () => void;
}) {
  const topBadge = user.isOrganizer
    ? { label: "Organizer", style: "bg-green-100 text-green-700" }
    : user.badges?.[0]
      ? { label: user.badges[0].name, style: "bg-blue-100 text-blue-700" }
      : null;

  return (
    <Link
      href={`/profile/${user.id}`}
      onClick={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <Avatar user={user} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-gray-900">
            {highlightText(user.fullName || "Unknown", query)}
          </span>
          {user.isCurrentUser && (
            <span className="text-xs text-gray-400">(you)</span>
          )}
        </div>
        {topBadge && (
          <span
            className={`inline-block text-[11px] px-2 py-0.5 rounded-full mt-0.5 ${topBadge.style}`}
          >
            {topBadge.label}
          </span>
        )}
        {user.bio && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{user.bio}</p>
        )}
      </div>
    </Link>
  );
}

function SearchPopup({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // focus + body scroll lock
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults([]);
      setError(null);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Immediate loading state on query change
  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      setError(null);
    } else {
      setResults([]);
      setError(null);
      setLoading(false);
    }
  }, [query]);

  // Debounced search API request handler
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    let active = true;

    async function performSearch() {
      const res = await searchUsersAction(q);
      if (!active) return;

      if (res.success) {
        setResults(res.data);
      } else {
        setError(res.error ?? "Search failed");
        setResults([]);
      }
      setLoading(false);
    }

    performSearch();

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const q = query.trim();
  const visible = results.filter(
    (u) => u.role !== "Admin" && u.role !== "Moderator",
  );
  const organizers = visible.filter((u) => u.isOrganizer);
  const regular = visible.filter((u) => !u.isOrganizer);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-16 top-15"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl border border-gray-100 w-full max-w-lg mx-4 max-h-[72vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-xl font-semibold text-gray-900">Search here</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input */}
        <div className="px-5 pt-4 pb-3 relative">
          <div className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users or organizers..."
            className="w-full h-11 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Results */}
        <div className="overflow-y-auto px-3 pb-3 flex-1">
          {!q ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <SearchIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-800">
                Search for users or organizers
              </p>
              <p className="text-xs text-gray-400 text-center">
                Enter any keyword to find users
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Searching...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm font-medium text-red-500">Search failed</p>
              <p className="text-xs text-gray-400 text-center">
                Please try again
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <SearchIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-800">
                No results found
              </p>
              <p className="text-xs text-gray-400 text-center">
                Try another keyword
              </p>
            </div>
          ) : (
            <>
              {organizers.length > 0 && (
                <>
                  <p className="text-[11px] font-medium tracking-widest text-gray-400 uppercase px-3 pt-2 pb-1">
                    Organizers
                  </p>
                  {organizers.map((u) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      query={q}
                      onSelect={onClose}
                    />
                  ))}
                </>
              )}

              {organizers.length > 0 && regular.length > 0 && (
                <hr className="my-2 border-gray-100 mx-3" />
              )}

              {regular.length > 0 && (
                <>
                  <p className="text-[11px] font-medium tracking-widest text-gray-400 uppercase px-3 pt-2 pb-1">
                    Users
                  </p>
                  {regular.map((u) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      query={q}
                      onSelect={onClose}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SidebarSearch() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full">
        <button
          onClick={() => setOpen(true)}
          className="relative w-full bg-(--background-white) rounded-xl border border-(--input-border) card-shadow transition-all group focus-within:border-(--main-color)"
        >
          <div className="w-full h-10 pl-5 pr-12 flex items-center text-sm text-(--text-desc)">
            Search...
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-(--text-desc) transition-colors pointer-events-none">
            <SearchIcon />
          </div>
        </button>
      </div>

      <SearchPopup isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
