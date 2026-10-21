import { toast } from "sonner";
import { createElement } from "react";
import Toast from "@/components/modals/Toast";

type ToastType = "success" | "warning" | "error" | "deleteSuccess";

interface ToastOptions {
  description: string;
}

const titleMap: Record<ToastType, string> = {
  success: "Success",
  warning: "Warning",
  error: "Error",
  deleteSuccess: "Removed",
};

/**
 * Unified toast — renders the single responsive `Toast` component (glass top on
 * mobile, top-right card on desktop). Keeps the original `(type, {description})`
 * signature so existing callers don't change.
 */
export function showToast(type: ToastType, { description }: ToastOptions) {
  const mapped = type === "deleteSuccess" ? "success" : type;

  toast.custom((t) =>
    createElement(Toast, {
      title: titleMap[type],
      message: description,
      type: mapped,
      onCloseAction: () => toast.dismiss(t),
    }),
  );
}
