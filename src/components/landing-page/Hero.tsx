"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "iconsax-react";
import { motion } from "framer-motion";
import { fadeUp, fadeRight, heroStagger, floatIn } from "./animations";

export default function Hero() {
  return (
    <section id="home" className="w-full xl:min-h-screen relative overflow-hidden flex flex-col xl:flex-row items-start pt-[100px] sm:pt-[130px] xl:pt-[190px] pb-10 xl:pb-20 z-10">
      <div className="w-full mx-auto px-5 sm:px-8 xl:px-20 relative z-10 flex flex-col xl:flex-row items-start">
        <motion.div
          className="w-full xl:w-[45%] space-y-6 relative z-10 flex-shrink-0"
          initial="hidden"
          animate="visible"
          variants={heroStagger}
        >
          <div className="absolute -left-10 opacity-70">
          </div>
          <motion.div className="flex items-center gap-2 main-color font-medium text-base tracking-wide text-xl font-inter" variants={fadeUp}>
            <span>Explore</span> <span className="w-[6px] h-[6px] rounded-full bg-main mx-1"></span> <span>Connect</span> <span className="w-[6px] h-[6px] rounded-full bg-main mx-1"></span> <span>Celebrate</span>
            <Image src="/images/Margin.svg" alt="Line wave" width={52} height={16} className="ml-2" />
          </motion.div>

          <motion.h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold leading-[1.10] font-inter" variants={fadeUp}>
            <span className="secondary-color">Discover</span><br />
            <span className="main-color">Cambodia</span><br />
            <span className="secondary-color">Through</span><br />
            <span className="accent-color relative">
              Events<span className="inline-block w-[10px] h-[10px] rounded-full bg-main mx-1"></span>
              <Image src="/images/Loading.svg" alt="Sparkle" width={52} height={52} className="absolute -right-16 -top-0" />

            </span>
          </motion.h1>

          <motion.p className="text-gray-500 max-w-md w-full text-lg leading-relaxed font-regular font-inter" variants={fadeUp}>
            Explore unique events, connect with amazing people, and experience the real Cambodia like never before.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Link href="/signup" className="flex items-center justify-center gap-2 w-full sm:w-[200px] h-[60px] bg-main text-white px-8 py-3.5 rounded-full font-medium mt-4 cursor-pointer text-lg">
              Get Started <ArrowRight size="24" color="#FFFFFF" />
            </Link>
          </motion.div>

          <div className="absolute right-1 top-[30%] ">
            <Image src="/images/redstar.svg" alt="Star graphic" width={32} height={32} className="opacity-80" />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hidden xl:block xl:w-[50%] max-w-[1159px] aspect-square xl:absolute xl:right-0 xl:top-1/2 xl:-translate-y-1/2 relative flex-shrink-0 z-0 pointer-events-none mt-15"
        initial="hidden"
        animate="visible"
        variants={fadeRight}
      >
        <Image
          src="/images/HeroBanner.svg"
          alt="Discover Cambodia Events Graphic"
          fill
          className="object-contain object-right pointer-events-auto"
          priority
        />

        <motion.div
          className="absolute right-[5%] md:right-15 top-[15%] md:top-40 w-[40%] md:w-[22%] max-w-[250px] aspect-[5/6] min-w-[150px] rotate-8"
          variants={floatIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
        >
          <Image src="/images/EventCard1.svg" alt="Event Card 1" fill />
        </motion.div>
        <motion.div
          className="absolute right-[2%] md:right-12 bottom-[25%] md:bottom-55 w-[40%] md:w-[22%] max-w-[250px] aspect-[5/6] min-w-[150px] rotate-5"
          variants={floatIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
        >
          <Image src="/images/EventCard2.svg" alt="Event Card 2" fill />
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-42 w-[40%] max-w-[340px] aspect-[340/226] min-w-[200px] pointer-events-auto"
          variants={floatIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.0 }}
        >
          <Image src="/images/LiveTheMoments.svg" alt="Live the Moments" fill className="object-contain" />
        </motion.div>

        <div className="absolute bottom-[45%] left-20 pointer-events-auto">
          <Image src="/images/element -five.svg" alt="Paper Plane" width={37} height={29} className="opacity-80" />
        </div>
      </motion.div>
    </section>
  );
}