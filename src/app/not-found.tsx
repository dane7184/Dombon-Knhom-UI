// import { Link } from "iconsax-react";
import React from "react";
import "@/app/globals.css";
import Image from "next/image";
import Link from "next/link";

export default function notFound() {
  return (
    <>
      <div className="bg-(--) flex items-center justify-center w-screen h-screen relative">
        <Image
          src="/images/errorPage.png"
          alt="error"
          width={561}
          height={517}
          className="rounded-lg mb-20"
        />

        <Link
          href="/home"
          className="w-85.25 h-12.5 bg-(--main-color) rounded-[12px] flex items-center justify-center absolute top-175 z-10"
        >
          <p className="text-white">Back to homepage</p>
        </Link>
      </div>
    </>
  );
}
