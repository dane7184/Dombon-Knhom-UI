"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl?: string;
}

const SOCIAL_BUTTONS = [
  {
    name: "Instagram",
    src: "/images/Instagram.svg",
    fallback: "IG",
    shareBaseUrl: "https://www.instagram.com/",
  },
  {
    name: "Facebook",
    src: "/images/Facebook.svg",
    fallback: "f",
    shareBaseUrl: "https://www.facebook.com/sharer/sharer.php?u=",
  },
  {
    name: "Messenger",
    src: "/images/Messenger.svg",
    fallback: "M",
    shareBaseUrl: "https://www.messenger.com/",
  },
  {
    name: "Telegram",
    src: "/images/Telegram.svg",
    fallback: "T",
    shareBaseUrl: "https://t.me/share/url?url=",
  },
  {
    name: "LinkedIn",
    src: "/images/LinkedIn.svg",
    fallback: "in",
    shareBaseUrl: "https://www.linkedin.com/sharing/share-offsite/?url=",
  },
];

export default function SharePopup({
  isOpen,
  onClose,
  shareUrl = "https://dombonknhom.kshrd.app/",
}: SharePopupProps) {
  const [copied, setCopied] = useState(false);

  const resolvedUrl = useMemo(() => {
    if (typeof window === "undefined") return shareUrl;
    const { origin, pathname } = window.location;

    if (/^\/(posts|events)\/[^/]+\/?$/.test(pathname)) {
      return `${origin}${pathname}`;
    }

    try {
      const url = new URL(shareUrl, origin);
      return `${origin}${url.pathname}${url.search}${url.hash}`;
    } catch {
      return shareUrl;
    }
  }, [shareUrl, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const navs = Array.from(
      document.querySelectorAll<HTMLElement>("nav, header"),
    );
    const prevVisibility = navs.map((el) => el.style.visibility);
    navs.forEach((el) => {
      el.style.visibility = "hidden";
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      navs.forEach((el, i) => {
        el.style.visibility = prevVisibility[i];
      });
    };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const handleSocialShare = (baseUrl: string) => {
    const encodedUrl = encodeURIComponent(resolvedUrl);
    window.open(`${baseUrl}${encodedUrl}`, "_blank", "width=600,height=600");
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/20 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-8 max-w-115 w-full shadow-xl relative flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-300">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header Text Group */}
        <div className="text-center w-full mb-6">
          <h3 className="text-xl font-bold text-(--secondary-color) leading-tight mb-2">
            Share with Friends
          </h3>
          <p className="text-sm text-[#7886a6]">
            To enjoy these activities you can connect with friends!
          </p>
        </div>

        {/* Input Wrapper Container */}
        <div className="flex flex-col gap-2 w-full mb-6">
          <label className="text-sm font-semibold text-(--secondary-color)">
            Share this link
          </label>
          <div className="w-full border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between bg-white focus-within:border-(--main-color) focus-within:ring-2 focus-within:ring-(--main-color)/10">
            <p className="text-sm text-[#4A5568] truncate mr-2">
              {resolvedUrl}
            </p>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0"
            >
              {copied ? (
                <span className="text-sm text-green-600 font-medium">
                  Copied!
                </span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-slate-400 hover:text-(--main-color) transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 10h6a2 2 0 002-2v-8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Custom Decorative Divider matching Figma structure style */}
        <div className="w-full h-px bg-[#E2E8F0] mb-6" />

        {/* Social Sharing Grid */}
        <div className="w-full">
          <label className="text-sm font-semibold text-(--secondary-color) block mb-3 text-center">
            Share to
          </label>
          <div className="flex gap-2.5 justify-center w-full flex-wrap">
            {SOCIAL_BUTTONS.map((social) => (
              <button
                key={social.name}
                onClick={() => handleSocialShare(social.shareBaseUrl)}
                className="w-13 h-13 flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white cursor-pointer transition-all hover:scale-105"
                aria-label={social.name}
              >
                <div className="w-7 h-7 relative flex items-center justify-center">
                  {social.src ? (
                    <Image
                      src={social.src}
                      alt={social.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold leading-none uppercase text-slate-500">
                      {social.fallback}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
