"use client";
import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { Media } from "@/types/activity.type";
import { resolveMediaUrl } from "@/lib/media";

import "swiper/css";

interface ActivityCarousalProps {
  media: Media[];
  activitiesId: string;
  activityType: "image" | "video";
  priority?: boolean;
}

const FALLBACK_IMAGE = "/images/default-fallback-image.png";
const getFallback = (_index: number) => FALLBACK_IMAGE;

const ActivityMediaProxyImage = ({
  url,
  fallback,
  priority,
}: {
  url: string;
  fallback: string;
  priority?: boolean;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={fallback}
          alt="Activity fallback"
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-contain"
        />
      </div>
    );
  }
  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-linear-to-tr from-slate-200/40 via-slate-100 to-slate-200/40 animate-pulse" />
          <div className="relative p-4 bg-white/60 rounded-2xl backdrop-blur-md shadow-sm border border-white/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
        </div>
      )}
      <Image
        src={resolveMediaUrl(url)}
        alt="Activity image"
        fill
        sizes="(max-width: 768px) 100vw, 768px"
        className={`object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

const ActivityMediaProxyVideo = ({
  url,
  fallback,
}: {
  url: string;
  fallback: string;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [unsupported, setUnsupported] = React.useState(false);
  const [isMuted, setIsMutedState] = React.useState(true);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const isMutedRef = React.useRef(true);
  const userInteractedRef = React.useRef(false);

  const src = resolveMediaUrl(url);

  const setIsMuted = (muted: boolean) => {
    isMutedRef.current = muted;
    setIsMutedState(muted);
  };

  React.useEffect(() => {
    const isMov = /\.mov(\/stream)?$/i.test(url);
    if (!isMov) return;
    const probe = document.createElement("video");
    const canPlay = probe.canPlayType("video/quicktime");
    if (canPlay === "") {
      React.startTransition(() => {
        setUnsupported(true);
        setIsLoading(false);
      });
    }
  }, [url]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || unsupported) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userInteractedRef.current) {
            video.muted = false;
            const p = video.play();
            if (p !== undefined) {
              p.then(() => setIsMuted(false)).catch(() => {
                video.muted = true;
                video
                  .play()
                  .then(() => setIsMuted(true))
                  .catch(() => {});
              });
            }
          } else {
            video.muted = isMutedRef.current;
            video.play().catch(() => {});
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [unsupported]);

  if (unsupported) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-black/5">
        <Video className="w-10 h-10 text-slate-400" />
        <p className="text-xs text-slate-500 text-center px-4">
          This video format (.MOV) is not supported in your browser.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/40 via-slate-100 to-slate-200/40 animate-pulse" />
          <div className="relative p-4 bg-white/60 rounded-2xl backdrop-blur-md shadow-sm border border-white/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            <Video className="w-8 h-8 text-slate-400" />
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        controls
        className={`w-full h-full object-contain block transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        preload="metadata"
        playsInline
        muted
        loop
        onLoadedMetadata={() => setIsLoading(false)}
        onLoadedData={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setUnsupported(true);
        }}
      />
    </div>
  );
};

export function ActivityCarousal({
  media,
  activitiesId,
  activityType,
  priority,
}: ActivityCarousalProps) {
  const swiperRef = React.useRef<SwiperType | null>(null);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const isVideo = activityType === "video";

  return (
    <div className="relative w-full h-full">
      <Swiper
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onSlideChange={(s) => setCurrentSlide(s.activeIndex)}
        spaceBetween={1}
        slidesPerView={1}
        speed={500}
        roundLengths={true}
        className="w-full h-full"
      >
        {media.map((m, index) =>
          isVideo ? (
            <SwiperSlide key={index} className="w-full h-full overflow-hidden">
              <div className="w-full h-full">
                <ActivityMediaProxyVideo
                  url={m.url}
                  fallback={getFallback(index)}
                />
              </div>
            </SwiperSlide>
          ) : (
            <SwiperSlide key={index} className="w-full h-full overflow-hidden">
              <Link
                href={`/posts/${activitiesId}`}
                className="block w-full h-full"
              >
                <ActivityMediaProxyImage
                  url={m.url}
                  fallback={getFallback(index)}
                  priority={priority && index === 0}
                />
              </Link>
            </SwiperSlide>
          ),
        )}
      </Swiper>

      {media.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              swiperRef.current?.slidePrev();
            }}
            disabled={currentSlide === 0}
            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white transition-all duration-150 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              swiperRef.current?.slideNext();
            }}
            disabled={currentSlide === media.length - 1}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/10 text-white transition-all duration-150 disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5 pointer-events-none">
            {media.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  swiperRef.current?.slideTo(i);
                }}
                className={`rounded-full transition-all duration-200 pointer-events-auto ${
                  currentSlide === i
                    ? "w-5 h-2 bg-white shadow-sm"
                    : "w-2 h-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
