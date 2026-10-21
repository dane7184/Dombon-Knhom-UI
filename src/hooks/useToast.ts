import { useState, useCallback } from "react";

type ToastData = {
  title:   string;
  message: string;
  type:    "success" | "error";
};

export function useToast() {
  const [toastData, setToastData] = useState<ToastData | null>(null);

  const showToast = useCallback((data: ToastData) => {
    setToastData(data);
  }, []);

  const hideToast = useCallback(() => {
    setToastData(null);
  }, []);

  return { toastData, showToast, hideToast };
}