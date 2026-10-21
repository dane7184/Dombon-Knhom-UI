"use client";

import React, { useEffect, useRef } from "react";
import { TickCircle, CloseCircle, Warning2, InfoCircle } from "iconsax-react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

type ToastProps = {
  title: string;
  message: string;
  type: ToastType;
  onCloseAction: () => void;
};

const config: Record<
  ToastType,
  {
    bg: string;
    bar: string;
    barColor: string;
    border: string;
    titleColor: string;
    tint: string;
    color: string;
  }
> = {
  success: {
    bg: "bg-[#f0faf5]",
    bar: "bg-[#4eca8b]",
    barColor: "#4eca8b",
    border: "border-emerald-200",
    titleColor: "text-[#1a7a4a]",
    tint: "bg-emerald-500/12",
    color: "#16a34a",
  },
  error: {
    bg: "bg-[#fff0f0]",
    bar: "bg-[#e05252]",
    barColor: "#e05252",
    border: "border-rose-200",
    titleColor: "text-[#c03030]",
    tint: "bg-red-500/12",
    color: "#ef4444",
  },
  warning: {
    bg: "bg-[#fffbf0]",
    bar: "bg-[#f5a623]",
    barColor: "#f5a623",
    border: "border-amber-200",
    titleColor: "text-[#b36a00]",
    tint: "bg-amber-500/12",
    color: "#f59e0b",
  },
  info: {
    bg: "bg-[#f0f6ff]",
    bar: "bg-[#4a90d9]",
    barColor: "#4a90d9",
    border: "border-blue-200",
    titleColor: "text-[#1a5080]",
    tint: "bg-blue-500/12",
    color: "#3b82f6",
  },
};

function ToastIcon({
  type,
  size,
  color,
}: {
  type: ToastType;
  size: number;
  color: string;
}) {
  if (type === "success")
    return <TickCircle size={size} variant="Bold" color={color} />;
  if (type === "error")
    return <CloseCircle size={size} variant="Bold" color={color} />;
  if (type === "warning")
    return <Warning2 size={size} variant="Bold" color={color} />;
  return <InfoCircle size={size} variant="Bold" color={color} />;
}

/**
 * Unified responsive toast: glass card at the top on mobile, original top-right
 * card on desktop (md+). Used everywhere via sonner `toast.custom`.
 */
export default function Toast({
  title,
  message,
  type,
  onCloseAction,
}: ToastProps) {
  const onCloseRef = useRef(onCloseAction);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef<number>(3000);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    onCloseRef.current = onCloseAction;
  }, [onCloseAction]);

  const startTimer = (duration: number) => {
    startedAtRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      onCloseRef.current();
    }, duration);
  };

  const handleMouseEnter = () => {
    if (!timerRef.current || startedAtRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    const elapsed = performance.now() - startedAtRef.current;
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) return;
    startTimer(remainingRef.current);
  };

  useEffect(() => {
    startTimer(3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const c = config[type];

  return (
    <>
      {/* Mobile: glass, top, full-width */}
      <div
        className="md:hidden fixed inset-x-2 top-[max(0.60rem,env(safe-area-inset-top))] z-9999 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-[0_12px_34px_-10px_rgba(28,39,76,0.3)] backdrop-blur-xl backdrop-saturate-150 animate-in fade-in slide-in-from-top-3 duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${c.tint}`}
        >
          <ToastIcon type={type} size={20} color={c.color} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-(--secondary-color)">
            {title}
          </p>
          <p className="mt-0.5 break-words text-xs leading-snug text-(--text-desc)">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onCloseAction}
          className="shrink-0 text-slate-400 active:text-slate-600"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Desktop: original top-right card (unchanged) */}
      <div
        className={`hidden md:flex fixed top-6 right-6 z-9999 w-85 overflow-hidden rounded-lg border ${c.border} ${c.bg}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`w-1.5 shrink-0 ${c.bar}`} />
        <div className="flex flex-1 items-center gap-2.5 px-3 py-2.5">
          <div className="shrink-0">
            <ToastIcon type={type} size={18} color={c.barColor} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-medium leading-tight ${c.titleColor}`}>
              {title}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-gray-400">
              {message}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseAction}
          className="flex items-center self-stretch px-2.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </>
  );
}
