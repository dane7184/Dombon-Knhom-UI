"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Profile2User, Share, Send2 } from "iconsax-react";
import { motion } from "framer-motion";
import { fadeUp, fadeLeft, floatIn, staggerContainer, viewportConfig } from "./animations";

export default function OrganizerSection() {
  return (
    <section id="organize" className="w-full relative py-5 lg:py-40 z-10 font-sans lg:mt-40">
      <div className="w-full px-5 md:px-20 lg:px-40 mx-auto ">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-40 w-full">
          <motion.div
            className="flex-[1.5] relative w-full aspect-[772/697] max-w-[800px] xl:max-w-none flex items-end justify-center z-10"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <motion.div className="w-full h-full relative z-10 overflow-visible flex items-end justify-center" variants={fadeUp}>
              <div className="absolute bottom-0 w-[100%] lg:w-[130%] h-[120%] lg:h-[130%] max-w-[850px] flex items-end justify-center">
                <Image src="/images/OrganizerHero.svg" alt="Smiling organizer with laptop" fill className="object-contain object-bottom" />
              </div>
            </motion.div>

            <motion.div
              className="hidden sm:flex absolute -top-[15%] md:-top-[25%] lg:-top-[15%] left-[5%] md:left-[5%] lg:left-0 w-max max-w-[189px] h-auto min-h-[80px] bg-white px-4 py-3 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-50 items-center gap-3 z-30"
              variants={floatIn}
            >
              <div><Profile2User size={30} color="currentColor" className="text-[#6941C6]" /></div>
              <span className="text-[13px] md:text-[15px] font-semibold secondary-color leading-tight">Build your<br />community</span>
            </motion.div>

            <motion.div
              className="hidden sm:flex absolute -top-[5%] md:-top-[15%] lg:-top-[5%] right-[0%] md:-right-[5%] lg:-right-5 w-max max-w-[216px] h-auto min-h-[95px] bg-white px-4 py-3 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-50 items-center gap-3 z-30"
              variants={floatIn}
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <Image src="/images/YelloStar.svg" alt="Star" width={28} height={28} />
              </div>
              <span className="text-[14px] md:text-base font-bold secondary-color leading-tight">Create<br />memorable<br />experiences</span>
            </motion.div>

            <motion.div
              className="hidden sm:flex absolute top-[15%] md:top-[10%] lg:top-[20%] -left-[5%] md:-left-[10%] lg:-left-20 w-max max-w-[189px] h-auto min-h-[80px] bg-white px-4 py-3 rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-50 items-center gap-3 z-30"
              variants={floatIn}
            >
              <div>
                <Share size={30} color="currentColor" className="text-(--accent-color)" />
              </div>
              <span className="text-[14px] md:text-base font-bold secondary-color leading-tight">Share what<br />you love</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 space-y-8 relative lg:-top-30"
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <div className="absolute -top-16 left-0 z-0 hidden md:block">
              <Image src="/images/UserAndDirectionPink.svg" alt="airplane path" width={200} height={75} />
            </div>

            <motion.div className="relative z-10" variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl md:text-[48px] lg:text-5xl font-bold secondary-color leading-[1.15] mb-5">
                Become an <br />
                <span className="text-(--accent-color) relative inline-block">
                  Organizer
                  <div className="absolute -right-5 top-0 opacity-70">
                    <svg width="15" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF2D55" strokeWidth="3"><line x1="6" y1="4" x2="10" y2="20" /><line x1="14" y1="4" x2="18" y2="20" /></svg>
                  </div>
                </span>
              </h2>
              <p className="text-[#475467] text-[18px] font-medium max-w-md leading-relaxed">
                Turn your passion into impactful experiences. Create events, build your audience, and inspire your community.
              </p>
            </motion.div>

            <motion.div className="space-y-7 pt-2 relative z-10 w-full max-w-lg" variants={staggerContainer}>
              <motion.div className="flex gap-5 items-start" variants={fadeUp}>
                <div className="w-11 h-11 rounded-full bg-[#ffeaf0] flex items-center justify-center shrink-0">
                  <Calendar className="text-(--accent-color)" color="currentColor" size={18} />
                </div>
                <div>
                  <h4 className="font-bold secondary-color text-[16px]">Create & Manage Events</h4>
                  <p className="text-[#475467] text-[14px] mt-1 font-medium">Easily set up, promote, and manage events that stand out.</p>
                </div>
              </motion.div>

              <motion.div className="flex gap-5 items-start" variants={fadeUp}>
                <div className="w-11 h-11 rounded-full bg-[#e8fafa] flex items-center justify-center shrink-0">
                  <Profile2User className="main-color" color="currentColor" size={24} />
                </div>
                <div>
                  <h4 className="font-bold secondary-color text-[16px]">Grow Your Community</h4>
                  <p className="text-[#475467] text-[14px] mt-1 font-medium">Connect with like-minded people and build a loyal following.</p>
                </div>
              </motion.div>

              <motion.div className="flex gap-5 items-start" variants={fadeUp}>
                <div className="w-11 h-11 rounded-full bg-[#fff4de] flex items-center justify-center shrink-0">
                  <Image src="/images/TrackAndAnalyze.svg" alt="Track" width={24} height={24} />
                </div>
                <div>
                  <h4 className="font-bold secondary-color text-[16px]">Track & Analyze</h4>
                  <p className="text-[#475467] text-[14px] mt-1 font-medium">Get insights on registrations, engagement, and feedback.</p>
                </div>
              </motion.div>

              <motion.div className="flex gap-5 items-start" variants={fadeUp}>
                <div className="w-11 h-11 rounded-full bg-[#eef2ff] flex items-center justify-center shrink-0">
                  <Image src="/images/EarnAndGet.svg" alt="Earn Badge" width={24} height={24} />
                </div>
                <div>
                  <h4 className="font-bold secondary-color text-[16px]">Earn & Get Recognized</h4>
                  <p className="text-[#475467] text-[14px] mt-1 font-medium">Increase your impact and unlock exclusive organizer perks.</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link href="/signup" className="flex items-center justify-center gap-2 bg-main text-white px-7 py-3 rounded-full font-semibold mt-4 text-base relative z-10 w-max cursor-pointer">
                Start Organizing <ArrowRight size={18} color="#FFFFFF" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="w-full bg-white rounded-2xl shadow-xl shadow-gray-200/50 mt-16 p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 xl:gap-0 xl:divide-x divide-gray-100"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeUp}
        >
          <div className="flex items-start gap-4 w-full xl:pr-6">
            <div className="w-14 h-14 rounded-full bg-[#ffeaf0] flex items-center justify-center shrink-0">
              <Image src="/images/ReachMorePeople.svg" alt="Reach" width={34} height={34} />
            </div>
            <div>
              <h5 className="font-bold secondary-color text-sm">Reach More People</h5>
              <p className="text-[#475467] text-xs mt-1 font-medium">Get your events discovered by thousands of active explorers.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 w-full xl:px-6">
            <div className="w-14 h-14 rounded-full bg-[#f4ebff] flex items-center justify-center shrink-0">
              <Image src="/images/BuildYourReputation.svg" alt="Reputation" width={34} height={34} />
            </div>
            <div>
              <h5 className="font-bold secondary-color text-sm">Build Your Reputation</h5>
              <p className="text-[#475467] text-xs mt-1 font-medium">Earn ratings, reviews, and badges as a trusted organizer.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 w-full xl:px-6">
            <div className="w-14 h-14 rounded-full bg-[#eef2ff] flex items-center justify-center shrink-0">
              <Image src="/images/TrackAndAnalyze.svg" alt="Track" width={34} height={34} />
            </div>
            <div>
              <h5 className="font-bold secondary-color text-sm">Track Engagement</h5>
              <p className="text-[#475467] text-xs mt-1 font-medium">View your total events, ratings, favorites, and earnings all in one place.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 w-full xl:pl-6">
            <div className="w-14 h-14 rounded-full bg-[#fff4de] flex items-center justify-center shrink-0">
              <Send2 size={34} color="currentColor" className="text-[#ff9f43]" />
            </div>
            <div>
              <h5 className="font-bold secondary-color text-sm">Instant Publishing</h5>
              <p className="text-[#475467] text-xs mt-1 font-medium">Skip the wait. Post your events and get them live on the discovery map immediately.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-10 text-center flex items-center justify-center gap-2"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeUp}
        >
          <span className="main-color font-bold text-xl">✨</span>
          <p className="text-[#667085] text-lg font-medium">
            Your events can <span className="text-(--accent-color) italic underline">inspire someone's</span> next great memory.
          </p>
          <span className="main-color font-bold text-xl">✨</span>
        </motion.div>
      </div>
    </section>
  );
}