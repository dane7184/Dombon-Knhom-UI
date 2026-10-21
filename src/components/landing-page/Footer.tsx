"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainerFast, viewportConfig } from "./animations";

export default function Footer() {
  return (
    <motion.footer
      className="w-full min-h-96 bg-white relative overflow-hidden py-14 sm:py-16 mt-10"
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={staggerContainerFast}
    >
      <div className="absolute top-0 left-0 pointer-events-none opacity-100 w-44 sm:w-60 md:w-72">
        <Image src="/images/Brush.svg" alt="Brush Stroke" width={300} height={100} className="w-full h-auto object-contain" />
      </div>
      <div className="absolute bottom-0 right-0 pointer-events-none opacity-80 w-36 sm:w-52 md:w-60">
        <Image src="/images/Brush2.svg" alt="Brush Stroke" width={250} height={100} className="w-full h-auto object-contain" />
      </div>
      <div className="absolute bottom-30 right-30 pointer-events-none opacity-100">
        <Image src="/images/LiveTheMomentFooters.svg" alt="Brush Stroke" width={200} height={100} className="w-44 sm:w-56 md:w-64 h-auto object-contain" />
      </div>
      <div className="absolute top-60 left-5 sm:left-40 pointer-events-none opacity-100 w-44 sm:w-70 md:w-72">
        <Image src="/images/DirectionAndLocation.svg" alt="Brush Stroke" width={300} height={100} className="w-full h-auto object-contain" />
      </div>


      <div className="w-full mx-auto px-5 sm:px-8 relative z-10 flex flex-col items-center">
        <motion.div variants={fadeUp}>
          <Link href="/" className="mb-10 block">
            <Image src="/images/Logo.svg" alt="Dombon Logo" width={170} height={71} className="w-30 sm:w-42.5 h-auto" />
          </Link>
        </motion.div>

        <motion.div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12 items-center divide-x-2 divide-gray-100 text-sm font-semibold secondary-color mt-5" variants={fadeUp}>
          <Link href="#home" className="px-4 sm:px-6 hover:text-(--main-color) transition">Home</Link>
          <Link href="#discover" className="px-4 sm:px-6 hover:text-(--main-color) transition">Discover</Link>
          <Link href="#events" className="px-4 sm:px-6 hover:text-(--main-color) transition">Event</Link>
          <Link href="#feed" className="px-4 sm:px-6 hover:text-(--main-color) transition">Feed</Link>
          <Link href="#organize" className="px-4 sm:px-6 hover:text-(--main-color) transition">Organize</Link>
        </motion.div>

        <motion.div className="w-full max-w-6xl relative flex justify-between items-center aspect-12/1 max-h-10 sm:max-h-14 mb-8 mt-12 border-b border-gray-100/0" variants={fadeUp}>
          <Image src="/images/LineFooter.svg" alt="Footer Line" fill className="object-contain pointer-events-none opacity-60" />
        </motion.div>

        <motion.p className="text-sm text-[#475467] font-medium mt-3 text-center px-4" variants={fadeUp}>
          &copy; 2026 Dombon. All rights reserved.
        </motion.p>
      </div>
    </motion.footer>
  );
}
