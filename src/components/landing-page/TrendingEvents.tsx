"use client";

import Image from "next/image";
import Link from "next/link";
import LandingEventCard from "./LandingEventCard";
import { ArrowRight } from "iconsax-react";
import { trendingEvents } from "@/constant/landing.config";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportConfig } from "./animations";

export default function TrendingEvents() {
  return (
    <section id="events" className="w-full relative py-20 overflow-hidden">
      <div className="absolute left-0 top-65">
        <Image
          src="/images/LoadingDash6.svg"
          alt="Sparkle"
          width={30}
          height={30}
          className="opacity-80 translate-x-25"
        />
      </div>
      <div className="absolute right-0 top-0">
        <Image
          src="/images/DotDot.svg"
          alt="Dots"
          width={100}
          height={150}
          className="opacity-60"
        />
      </div>

      <div className="w-full mx-auto px-5 md:px-20 flex flex-col items-center relative z-10">
        <motion.div
          className="text-center mb-16 relative z-10 w-full max-w-7xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeUp}
        >
          <div className="absolute -left-40 -top-15 w-full max-w-7xl aspect-6/1 pointer-events-none hidden md:block">
            <Image
              src="/images/Background+Blur.svg"
              alt="Sparkle"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[#13C5C6] font-semibold tracking-widest uppercase text-[22px] z-10">
              TRENDING EVENTS
            </span>
            <Image
              src="/images/LoadingDash6.svg"
              alt="Sparkle"
              width={28}
              height={28}
              className="z-10"
            />
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold secondary-color mb-6 relative inline-block">
            Trending <span className="text-[#13C5C6]">Events</span>
            <div className="absolute -bottom-6 right-0">
              <Image
                src="/images/Margin.svg"
                alt="Squiggly line"
                width={40}
                height={10}
              />
            </div>
          </h2>

          <p className="text-[#475467] text-base md:text-[24px] font-regular mt-8">
            Explore what&apos;s happening around you.
            <br />
            Join events, meet people, and create unforgettable memories.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-16 mt-16 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          {trendingEvents.map((event) => (
            <motion.div key={event.id} variants={fadeUp}>
              <LandingEventCard {...event} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeUp}
        >
          <Link
            href="/signup"
            className="w-full sm:w-67.5 sm:h-15 flex items-center justify-center gap-2 bg-main text-white px-8 py-4 sm:py-3.5 rounded-full font-medium text-xl sm:text-2xl relative z-10"
          >
            View All Events{" "}
            <ArrowRight size={28} color="#FFFFFF" className="font-bold" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
