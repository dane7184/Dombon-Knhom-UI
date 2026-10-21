"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeDown, staggerContainerFast } from "./animations";

export default function Navbar() {
  return (
    <motion.nav
      className="w-full absolute top-0 left-0 right-0 z-50"
      initial="hidden"
      animate="visible"
      variants={staggerContainerFast}
    >
      <div className="flex items-center justify-between px-5 sm:px-8 md:px-20 py-4 md:py-6 w-full mx-auto">
        <motion.div className="flex items-center gap-2" variants={fadeDown}>
          <Link href="/" className="flex items-center">
            <Image src="/icons/project logo.png" alt="Dombon Logo" width={120} height={40} className="w-[100px] sm:w-[120px] h-auto object-contain" />
          </Link>
        </motion.div>

        <motion.div className="hidden md:flex items-center gap-[80px] text-[16px] font-semibold text-(--secondary-color)" variants={fadeDown}>
          <Link href="#events" className="hover:text-(--main-color) transition-colors">Events</Link>
          <Link href="#discover" className="hover:text-(--main-color) transition-colors">Discover</Link>
          <Link href="#feed" className="hover:text-(--main-color) transition-colors">Feed</Link>
          <Link href="#organize" className="hover:text-(--main-color) transition-colors">Organize</Link>
        </motion.div>

        <motion.div className="flex items-center gap-4 text-base font-semibold" variants={fadeDown}>
          <Link href="/login" className="flex items-center justify-center w-[100px] sm:w-[120px] h-[40px] sm:h-[50px] px-4 sm:px-7 py-2.5 rounded-full border border-gray-200 secondary-color bg-white drop-shadow-white cursor-pointer">
            Login
          </Link>
          <Link href="/signup" className="flex items-center justify-center w-[100px] sm:w-[120px] h-[40px] sm:h-[50px] px-4 sm:px-7 py-2.5 rounded-full bg-main text-white cursor-pointer">
            Sign Up
          </Link>
        </motion.div>
      </div>
    </motion.nav>
  );
}