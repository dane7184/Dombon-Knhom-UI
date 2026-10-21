"use client";

import React, { useState } from "react";
import { Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  deleteAccount,
  deleteOrgAccount,
} from "@/services/profileInfo.service";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface DeleteAccountModalProps {
  isOrgMode?: boolean;
  orgId?: string | null;
}

export default function DeleteAccountModal({
  isOrgMode = false,
  orgId = null,
}: DeleteAccountModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resetAndCloseModal = () => {
    setIsOpen(false);
    setIsDeleting(false);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetAndCloseModal();
    else setIsOpen(true);
  };

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    setError(null);
    try {
      const session = await getSession();
      const token = session?.user?.accessToken;
      if (!token) throw new Error("No auth token found");

      if (isOrgMode && orgId) {
        await deleteOrgAccount(orgId, token);
        resetAndCloseModal();
        await signOut({ redirect: false });
        router.push("/login");
      } else {
        await deleteAccount(token);
        resetAndCloseModal();
        await signOut({ redirect: false });
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsDeleting(false);
    }
  };

  const title = isOrgMode ? "Delete Organization" : "Delete Account";
  const description = isOrgMode
    ? "You're going to delete your organization permanently."
    : "You're going to delete your account permanently.";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex cursor-pointer items-center justify-center py-2.5 px-5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
          <Trash2 size={16} className="me-1.5" />
          Delete
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
        showCloseButton={false}
      >
        <form
          className="relative flex flex-col items-center p-7 text-center"
          onSubmit={handleDelete}
        >
          <button
            type="button"
            onClick={resetAndCloseModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={26} strokeWidth={2} />
          </div>

          <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
            {title}
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
            {description} Are you sure?
          </DialogDescription>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

          <div className="mt-6 flex gap-3 w-full">
            <button
              type="button"
              onClick={resetAndCloseModal}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
