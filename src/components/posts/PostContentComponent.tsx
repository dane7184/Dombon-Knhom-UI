"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import "@/app/globals.css";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import { PostEngagementBar } from "./PostEngagementBar";
import { PostDetail } from "@/types/activity.type";
import { resolveMediaUrl } from "@/lib/media";
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostDetailProps {
  post: PostDetail;
}

// next/image can't optimize a local URL with a query string (the media proxy
// uses /api/media-proxy?url=...). Unwrap it to the direct remote URL, which is
// allowed by remotePatterns and stays optimized.
function toDirectSrc(src: string): string {
  if (src.startsWith("/api/media-proxy")) {
    try {
      const real = new URLSearchParams(src.split("?")[1]).get("url");
      if (real) return real;
    } catch {
      // fall through to original src
    }
  }
  return src;
}

/* ── Autoplay video sub-component ── */
function AutoplayVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMutedState] = useState(true);

  // Use refs so the observer closure always has the latest values without needing to re-bind
  const isMutedRef = useRef(true);
  const userInteractedRef = useRef(false);

  const setIsMuted = (muted: boolean) => {
    isMutedRef.current = muted;
    setIsMutedState(muted);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userInteractedRef.current) {
            // First time seeing it: try playing unmuted
            video.muted = false;
            const p = video.play();
            if (p !== undefined) {
              p.then(() => {
                // Success playing unmuted!
                setIsMuted(false);
              }).catch(() => {
                // Browser blocked unmuted autoplay, fallback to muted
                video.muted = true;
                video
                  .play()
                  .then(() => {
                    setIsMuted(true);
                  })
                  .catch((e) => {
                    console.warn("Muted autoplay also failed:", e);
                  });
              });
            }
          } else {
            // User already interacted (toggled mute), respect their choice
            video.muted = isMutedRef.current;
            video.play().catch(() => {});
          }
        } else {
          // Scrolled out of view, pause it
          video.pause();
        }
      },
      { threshold: 0.3 }, // Trigger when 30% visible
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent post click
    const video = videoRef.current;
    if (!video) return;

    userInteractedRef.current = true;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className="relative group w-full h-full">
      <video
        ref={videoRef}
        src={src}
        controls
        playsInline
        loop
        muted // Initial state for iOS/Safari to allow video to load without blocking
        className="w-full h-full object-contain rounded-lg bg-black/10"
      />
      <button
        type="button"
        onClick={toggleMute}
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/80 shadow-md"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}

export const PostContentComponent = ({ post }: PostDetailProps) => {
  const { postType } = post;
  const postContent = (post.postContent ?? []).filter(Boolean).map(toDirectSrc);
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <>
      <div className="w-full p-5 bg-white rounded-[15px] shadow-sm">
        <div className="hidden md:flex mb-4 items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="hidden md:flex w-10 h-10 cursor-pointer items-center justify-center rounded-full hover:bg-slate-50 transition-colors border-none bg-transparent"
          >
            <ArrowLeft size={26} color="#18ABC6" />
          </button>
        </div>
        {postContent.length === 0 ? null : postType === "Image" ? (
          postContent.length > 1 ? (
            <div className="relative mb-2">
              <Swiper
                onSwiper={(s) => { swiperRef.current = s; }}
                onSlideChange={(s) => setCurrentSlide(s.activeIndex)}
                spaceBetween={10}
                slidesPerView={1}
                speed={500}
                className="rounded-lg overflow-hidden h-56 sm:h-80 md:h-125 bg-black/5"
              >
                {postContent.map((content, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-full">
                      <Image
                        fill
                        src={content}
                        alt={`content-${index}`}
                        className="object-contain"
                        sizes="100vw"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Prev button */}
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => swiperRef.current?.slidePrev()}
                disabled={currentSlide === 0}
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white transition-all duration-150 disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              {/* Next button */}
              <button
                type="button"
                aria-label="Next image"
                onClick={() => swiperRef.current?.slideNext()}
                disabled={currentSlide === postContent.length - 1}
                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white transition-all duration-150 disabled:opacity-0 disabled:pointer-events-none"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              {/* Pagination dots */}
              <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5 pointer-events-none">
                {postContent.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => swiperRef.current?.slideTo(i)}
                    className={`rounded-full transition-all duration-200 pointer-events-auto ${
                      currentSlide === i
                        ? "w-5 h-2 bg-white shadow-sm"
                        : "w-2 h-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="relative mb-2 w-full h-56 sm:h-80 md:h-125 overflow-hidden rounded-lg bg-black/5">
              <Image
                fill
                src={postContent[0]}
                alt="content"
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          )
        ) : (
          <div className="mb-2 flex h-56 sm:h-80 md:h-125 w-full items-center justify-center overflow-hidden rounded-lg bg-black/5">
            <AutoplayVideo src={resolveMediaUrl(postContent[0])} />
          </div>
        )}
        <PostEngagementBar post={post} />
      </div>
    </>
  );
};
