"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, ArrowRight } from "iconsax-react";
import { motion } from "framer-motion";
import { fadeUp, fadeLeft, scaleIn, staggerContainer, viewportConfig } from "./animations";

export default function ShareJourney() {
  return (
    <section id="feed" className="w-full relative py-5 lg:py-20 z-10 overflow-hidden lg:min-h-[1050px] lg:mb-20 flex items-center">
      <div className="absolute top-20 left-[45%] -translate-x-1/2 -z-10 pointer-events-none mb-20 w-full max-w-[1564px]">
        <Image src="/images/Overlay+BlurBackground.svg" alt="Background Overlay" width={1564} height={100} className="w-full h-auto" />
      </div>
      <div className="absolute -bottom-10 left-0 w-full px-[5%] flex justify-between items-center pointer-events-none hidden md:flex z-0 ">
        <Image src="/images/DotDot.svg" alt="Dots" width={124} height={100} className="opacity-100 -translate-x-20" />
        <Image src="/images/DirectionWithAirplane.svg" alt="Flight path" width={373} height={100} className="opacity-100 mb-6" />
        <Image src="/images/SimilarToGlass.svg" alt="Dashed line" width={200} height={50} className="opacity-100 mb-4" />
      </div>

      <div className="w-full px-5 md:px-10 xl:px-20 mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
        <motion.div
          className="flex-1 space-y-8 relative z-10 lg:mt-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.div className="mb-6 relative w-max" variants={fadeLeft}>
            <Image src="/images/CameraAndDirection.svg" alt="Camera icon with dashed direction" width={150} height={50} />
          </motion.div>

          <motion.h2 className="text-4xl md:text-5xl lg:text-[72px] font-bold secondary-color leading-[1.15]" variants={fadeUp}>
            Share Your <br />
            <span className="main-color relative inline-block mt-2">
              Journey
              <div className="absolute top-[65%] -right-26">
                <Image src="/images/Margin.svg" alt="Squiggly line" width={53} height={16} />
              </div>
            </span>
          </motion.h2>

          <motion.p className="text-[#475467] text-lg md:text-[26px] max-w-sm font-regular leading-relaxed" variants={fadeUp}>
            Every moment tells a story. Share yours and inspire others to explore Cambodia.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Link href="/signup" className="flex items-center gap-2 bg-main text-white px-7 py-3.5 rounded-full font-medium w-max text-base cursor-pointer">
              <Camera size={20} color="#FFFFFF" className="" /> Share Your Moment <ArrowRight size={20} color="#FFFFFF" />
            </Link>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 flex flex-col sm:flex-row items-center gap-5 mt-12 max-w-[459px] sm:h-[203px] relative z-10"
            variants={fadeUp}
          >
            <div className="w-[120px] h-[120px] sm:w-[155px] sm:h-[152px] rounded-full overflow-hidden shrink-0 relative">
              <Image src="/images/ShareJourneyAvatar.svg" alt="User avatar" fill className="object-cover" />
            </div>
            <p className="text-[#475467] font-medium text-[20px] leading-relaxed">
              <Image src="/images/QuoteLeft.svg" alt="Quote" width={20} height={20} className="inline-block align-top mr-1" />
              The best memories are made when you <span className="main-color font-bold">explore together.<Image src="/images/QuoteRight.svg" alt="Quote" width={20} height={20} className="inline-block align-top ml-1" /></span>
            </p>
            <div className="absolute -top-6 -right-6">
              <Image src="/images/YelloStar.svg" alt="Star" width={58} height={58} />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex-[1.2] w-full relative lg:min-h-[550px] mt-10 lg:mt-0"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <div className="absolute top-5 right-65 z-20 pointer-events-none">
            <Image src="/images/Airplane.svg" alt="Airplane" width={25.6} height={25.6} />
          </div>

          <div className="flex gap-4 md:gap-6 h-full relative z-10 w-full justify-start items-start">
            <motion.div className="relative w-[40%] aspect-[420/551] rounded-[24px] overflow-hidden shadow-sm mt-8 md:mt-12" variants={scaleIn}>
              <Image src="/images/Gallery1.svg" alt="Angkor Wat Sunset" fill className="object-cover" />
            </motion.div>

            <div className="flex flex-col gap-4 md:gap-6 relative w-[30%]">
              <motion.div className="relative aspect-[312/360] w-full rounded-[20px] overflow-hidden shadow-sm" variants={scaleIn}>
                <Image src="/images/Gallery2.svg" alt="Street with lanterns" fill className="object-cover" />
              </motion.div>
              <motion.div className="relative aspect-[312/360] w-full rounded-[20px] overflow-hidden shadow-sm" variants={scaleIn}>
                <Image src="/images/Gallery5.svg" alt="Angkor Wat from above" fill className="object-cover" />
              </motion.div>

              <div className="absolute -left-10 md:-left-17 -bottom-5 z-30 w-[80px] md:w-[122px] aspect-square">
                <Image src="/images/FloatingHeart.svg" alt="Like" fill className="object-contain" />
              </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 relative mt-12 md:mt-16 w-[30%]">
              <motion.div className="relative aspect-[312/360] w-full rounded-[20px] overflow-hidden shadow-sm" variants={scaleIn}>
                <Image src="/images/Gallery4.svg" alt="Mountain Temple" fill className="object-cover" />
              </motion.div>
              <motion.div className="relative aspect-[312/360] w-full rounded-[20px] overflow-hidden shadow-sm" variants={scaleIn}>
                <Image src="/images/Gallery3.svg" alt="Food bowl" fill className="object-cover" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}