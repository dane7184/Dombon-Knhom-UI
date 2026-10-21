"use client";

import {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const TOP = 104; // top-26 (6.5rem) — keeps the card clear of the logo
const BOTTOM = 16; // bottom-4 (1rem)

/**
 * Mobile-only auth card positioner.
 * - Short form  → dead screen-center.
 * - Taller      → top pins at `top-26` (won't overlap the logo) and grows down.
 * - Too tall    → spans top-26 → bottom-4 and scrolls inside the card.
 * Needs JS because true screen-centering + an asymmetric top/bottom clamp
 * can't both be expressed in plain CSS.
 */
export default function AuthMobileCard({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({
    top: "50%",
    transform: "translateY(-50%)",
  });
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const recompute = () => {
      const vh = window.innerHeight;
      const h = inner.offsetHeight; // natural content height
      const bandMax = vh - TOP - BOTTOM;

      if (h > bandMax) {
        // too tall → fill the band and scroll inside
        setStyle({ top: `${TOP}px`, bottom: `${BOTTOM}px` });
        setScroll(true);
      } else if ((vh - h) / 2 >= TOP) {
        // fits with room above the logo → true screen-center
        setStyle({ top: "50%", transform: "translateY(-50%)" });
        setScroll(false);
      } else {
        // centering would hit the logo → pin top, grow downward
        setStyle({ top: `${TOP}px` });
        setScroll(false);
      }
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(inner);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, []);

  return (
    <div
      style={style}
      className={`md:hidden fixed inset-x-4 z-20 rounded-3xl border border-white/60 bg-white/55 backdrop-blur-2xl backdrop-saturate-150 ${
        scroll ? "overflow-y-auto no-scrollbar" : ""
      }`}
    >
      <div ref={innerRef} className="px-6 py-6">
        {children}
      </div>
    </div>
  );
}
