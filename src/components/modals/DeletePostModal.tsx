"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, X } from "lucide-react";
import Toast from "@/components/modals/Toast";

interface DeletePostModalProps {
  postId?: string;
  onDeleteSuccess?: () => void;
}

export default function DeletePostModal({ postId, onDeleteSuccess }: DeletePostModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetAndCloseModal = () => {
    setIsOpen(false);
    setIsDeleting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetAndCloseModal();
    else setIsOpen(true);
  };

  const handleDelete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsDeleting(true);

    try {
      if (postId) {
        const { deleteActivityAction } = await import("@/actions/activity.actions");
        const res = await deleteActivityAction(postId);
        if (!res.success) throw new Error(res.error);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const { toast } = await import("sonner");
      toast.custom((t) => (
        <Toast title="Success" message="Post deleted successfully" type="success" onCloseAction={() => toast.dismiss(t)} />
      ));

      if (onDeleteSuccess) onDeleteSuccess();
      resetAndCloseModal();
    } catch (error) {
      const { toast } = await import("sonner");
      const errMsg = error instanceof Error ? error.message : "Failed to delete post";
      toast.custom((t) => (
        <Toast title="Error" message={errMsg} type="error" onCloseAction={() => toast.dismiss(t)} />
      ));
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex cursor-pointer items-center justify-center py-2.5 px-5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">
          <Trash2 size={16} className="me-1.5" />
          Delete Post
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-w-sm rounded-2xl border-none bg-white p-0 shadow-xl data-[state=open]:slide-in-from-bottom-4"
        showCloseButton={false}
      >
        <form className="relative flex flex-col items-center p-7 text-center" onSubmit={handleDelete}>
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
            Delete Post
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
            You&apos;re going to permanently remove this post. This action cannot be undone.
          </DialogDescription>

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
