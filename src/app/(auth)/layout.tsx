import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-bg-mobile relative flex h-screen w-full items-center justify-center overflow-hidden bg-background p-4 md:p-6 font-sans">
      <div className="absolute left-1/2 -ml-2 top-6 z-30 -translate-x-1/2 lg:left-10 lg:top-8 lg:translate-x-0">
        <Image
          src="/icons/project logo.png"
          alt="Logo"
          width={150}
          height={40}
          className="object-contain ml-4 lg:ml-4"
          priority
        />
      </div>

      <div className="absolute left-55 top-40 hidden md:grid grid-cols-5 gap-4 opacity-60">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="bg-main h-1 w-1 rounded-full" />
        ))}
      </div>

      <div className="absolute bottom-20 left-165 hidden md:grid grid-cols-5 gap-4 opacity-60">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="bg-main h-1 w-1 rounded-full" />
        ))}
      </div>

      <div className="bg-(--main-color)/50 absolute left-170 top-30 hidden md:block h-4 w-4 rounded-full" />
      <div className="bg-(--accent-color)/50 absolute left-240 top-40 hidden md:block h-4 w-4 rounded-full" />
      {/* <div className="bg-(--main-color)/50 absolute left-80 bottom-80 h-4 w-4 rounded-full" />
      <div className="bg-(--accent-color)/50 absolute left-40 bottom-40 h-4 w-4 rounded-full" /> */}

      <div className="absolute left-[25%] top-125 hidden md:block h-[530px] w-[530px] -translate-y-1/2 rounded-full bg-(--secondary-color)/2 blur-xs" />

      <div className="relative z-10 flex w-full max-w-7xl items-center justify-between gap-8 px-0 md:px-4">
        <div className="hidden flex-1 flex-col max-w-xl lg:flex justify-center">
          <div className="flex w-full items-center justify-center select-none">
            <img
              src="/images/Authentication(Image).svg"
              alt="Authentication Visual"
              className="max-h-[550px] h-auto w-full object-contain"
              draggable="false"
            />
          </div>
        </div>

        <div className="navbar-shadow w-full max-w-lg overflow-y-auto bg-transparent p-0 shadow-none md:rounded-2xl md:bg-white md:p-8 md:shadow-lg lg:w-[500px]">
          {children}
        </div>
      </div>
    </div>
  );
}
