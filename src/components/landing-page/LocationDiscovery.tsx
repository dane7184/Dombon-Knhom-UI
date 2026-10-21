"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "iconsax-react";
import { motion } from "framer-motion";
import { fadeUp, fadeLeft, fadeRight, staggerContainer, viewportConfig } from "./animations";

export default function LocationDiscovery() {
  return (
    <section id="discover" className="w-full relative pb-20 px-5 md:px-20 mx-auto flex flex-col lg:flex-row items-center gap-16 z-10 justify-between">
      <motion.div
        className="flex-[1.8] w-full xl:max-w-[100%] relative drop-shadow-2xl aspect-[960/651]"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={fadeLeft}
      >
        <Image
          src="/images/Map.svg"
          alt="Interactive map preview showing events in the city"
          fill
          className=" object-contain"
        />
      </motion.div>

      <motion.div
        className="space-y-8 relative pr-4"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={staggerContainer}
      >
        <motion.div variants={fadeRight}>
          <div className="w-full h-full -top-20 relative">
            <Image src="/images/Direction.svg" alt="Direction line" width={512} height={102} className="w-full h-auto max-w-[512px]" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-[60px] font-bold secondary-color leading-[1.15] -translate-y-5 lg:-translate-y-10">
            Location-Based <br />
            <span className="main-color relative inline-block">
              Discovery
              <div className="absolute bottom-3 -right-24">
                <Image src="/images/Margin.svg" alt="underline" width={82} height={40} />
              </div>
            </span>
          </h2>
          <p className="text-[#475467] text-lg font-regular pr-10">
            Find amazing events happening <br /> near you. From hidden gems to <br /> must-see experiences.
          </p>
        </motion.div>

        <motion.div className="space-y-8 mt-10" variants={staggerContainer}>
          <motion.div className="flex gap-5 items-start" variants={fadeUp}>
            <div className="w-12 h-12 rounded-full bg-[#e8fafa] flex items-center justify-center shrink-0">
              <Image src="/images/ExploreNearby.svg" alt="Explore Nearby" width={22} height={22} />
            </div>
            <div>
              <h4 className="font-bold secondary-color text-[18px]">Explore Nearby</h4>
              <p className="text-[#475467] text-[16px] mt-1.5 font-regular">Discover events around your current location.</p>
            </div>
          </motion.div>

          <motion.div className="flex gap-5 items-start" variants={fadeUp}>
            <div className="w-12 h-12 rounded-full bg-[#ffeaf0] flex items-center justify-center shrink-0">
              <Image src="/images/FilterAndFind.svg" alt="Filter and Find" width={22} height={22} />
            </div>
            <div>
              <h4 className="font-bold secondary-color text-[18px]">Filter & Find</h4>
              <p className="text-[#475467] text-[16px] mt-1.5 font-regular">Search by category, date, or interest.</p>
            </div>
          </motion.div>

          <motion.div className="flex gap-5 items-start" variants={fadeUp}>
            <div className="w-12 h-12 rounded-full bg-[#fff4de] flex items-center justify-center shrink-0">
              <Image src="/images/Notification.svg" alt="Notification" width={22} height={22} />
            </div>
            <div>
              <h4 className="font-bold secondary-color text-[18px]">Never Miss Out</h4>
              <p className="text-[#475467] text-[16px] mt-1.5 font-regular">Get notified about events you'll love.</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="pt-6 relative inline-block w-full max-w-[300px] sm:h-[60px]" variants={fadeUp}>
          <Link href="/signup" className="flex items-center justify-center gap-2 bg-main text-white px-7 py-3.5 rounded-full font-semibold text-[18px] cursor-pointer w-full sm:w-max">
            Explore Map <ArrowRight size={22} color="#FFFFFF" />
          </Link>

          <div className="absolute -bottom-10 -right-72 hidden md:block opacity-80 pointer-events-none">
            <Image src="/images/SimilarToGlassStar.svg" alt="Decorative shape" width={200} height={64} className="object-contain" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}