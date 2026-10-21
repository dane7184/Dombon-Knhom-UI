"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { UserMinus, Logout } from "iconsax-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ModalVariant =
  | "delete"
  | "confirm"
  | "removeFavoriteUser"
  | "deleteEvent"
  | "success"
  | "logout";

interface DescriptionValues {
  eventTitle?: string;
  accountName?: string;
  name?: string;
}

interface BaseModalProps {
  variant?: ModalVariant;
  title?: string;
  description?: string;
  triggerLabel?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  children?: React.ReactNode;
  descriptionValues?: DescriptionValues;
}

const VARIANT_DEFAULTS: Record<
  ModalVariant,
  {
    title: string;
    description: (values?: DescriptionValues) => string;
    confirmLabel: string;
    iconBg: string;
    icon: React.ReactNode;
    confirmColor: string;
  }
> = {
  delete: {
    title: "Delete item",
    description: (values) => {
      const target = values?.eventTitle ?? values?.accountName ?? values?.name;
      return target
        ? `Are you sure you want to permanently delete "${target}"? This action cannot be undone.`
        : "This action cannot be undone. Are you sure you want to permanently delete this?";
    },
    confirmLabel: "Delete",
    iconBg: "#FEF2F2",
    icon: <Trash2 size={36} color="var(--accent-color)" />,
    confirmColor: "var(--accent-color)",
  },

  logout: {
    title: "Logout from account",
    description: (values) => {
      const target = values?.eventTitle ?? values?.accountName ?? values?.name;
      return target
        ? `Are you sure you want to logout from "${target}"?`
        : "Are you sure you want to logout from your account?";
    },
    confirmLabel: "Logout",
    iconBg: "#FEF2F2",
    icon: <Logout size={36} color="var(--accent-color)" />,
    confirmColor: "var(--accent-color)",
  },
  deleteEvent: {
    title: "Delete Event",
    description: (values) => {
      const target = values?.eventTitle ?? values?.accountName ?? values?.name;
      return target
        ? `Are you sure you want to permanently delete "${target}"? This action cannot be undone.`
        : "This action cannot be undone. Are you sure you want to permanently delete this event?";
    },
    confirmLabel: "Delete",
    iconBg: "#FEF2F2",
    icon: <Trash2 size={36} color="var(--accent-color)" />,
    confirmColor: "var(--accent-color)",
  },
  removeFavoriteUser: {
    title: "Remove Favorite User",
    description: (values) => {
      const target = values?.eventTitle ?? values?.accountName ?? values?.name;
      return target
        ? `Are you sure you want to remove "${target}" from your favorites?`
        : "Are you sure you want to remove this user from your favorites?";
    },
    confirmLabel: "Remove",
    iconBg: "#FEF2F2",
    icon: <UserMinus size={36} color="var(--accent-color)" />,
    confirmColor: "var(--accent-color)",
  },
  confirm: {
    title: "Are you sure?",
    description: (values) => {
      const target = values?.eventTitle ?? values?.accountName ?? values?.name;
      return target
        ? `Please confirm you want to proceed with "${target}".`
        : "Please confirm you want to proceed with this action.";
    },
    confirmLabel: "Confirm",
    iconBg: "#FEFEF2",
    icon: <AlertTriangle size={36} color="#EAB308" />,
    confirmColor: "#EAB308",
  },
  success: {
    title: "Success",
    description: (values) => {
      const target = values?.eventTitle ?? values?.accountName ?? values?.name;
      return target
        ? `Action completed successfully for "${target}".`
        : "Action completed successfully.";
    },
    confirmLabel: "OK",
    iconBg: "#EBF9FC",
    icon: <CheckCircle size={36} color="#18ABC6" />,
    confirmColor: "#18ABC6",
  },
};

export function BaseModal({
  variant = "confirm",
  title,
  description,
  triggerLabel,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  disabled = false,
  children,
  descriptionValues,
}: BaseModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaults = VARIANT_DEFAULTS[variant];

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {children ?? (
          <Button style={{ backgroundColor: defaults.confirmColor }}>
            {triggerLabel ?? defaults.confirmLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm z-9999! p-0 rounded-2xl data-[state=open]:slide-in-from-bottom-4">
        <div className="flex flex-col items-center p-7 text-center">
          {/* Icon circle */}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: defaults.iconBg }}
          >
            {defaults.icon}
          </div>

          <DialogTitle className="mt-5 text-xl font-bold text-(--secondary-color)">
            {title ?? defaults.title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-[#7886a6]">
            {description ?? defaults.description(descriptionValues)}
          </DialogDescription>

          <div className="mt-6 flex gap-3 w-full">
            <DialogClose asChild>
              <button
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
              >
                {cancelLabel}
              </button>
            </DialogClose>
            <button
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: defaults.confirmColor }}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : (confirmLabel ?? defaults.confirmLabel)}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
