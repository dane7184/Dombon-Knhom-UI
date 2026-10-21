import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import Providers from "@/providers/providers";
import { auth } from "@/lib/auth";
import { ReactNode } from "react";
import { Fredoka } from "next/font/google";
import { FRONTEND_URL } from "@/lib/url";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rounded",
});
const poppins = localFont({
  src: "../../public/font/Poppins-Regular.ttf",
  variable: "--font-poppins",
});

const inter = localFont({
  src: "../../public/font/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
});

const kantumruy = localFont({
  src: "../../public/font/KantumruyPro-VariableFont_wght.ttf",
  variable: "--font-kantumruy",
});

export const viewport: Viewport = {
  themeColor: "#18abc6",
};

export const metadata: Metadata = {
  metadataBase: new URL(FRONTEND_URL),
  title: "Dombon Knhom",
  description: "Cambodia's event discovery platform",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico?v=1", sizes: "any" },
      { url: "/project_logo/ios/16.png?v=1", sizes: "16x16", type: "image/png" },
      { url: "/project_logo/ios/32.png?v=1", sizes: "32x32", type: "image/png" },
      { url: "/project_logo/ios/192.png?v=1", sizes: "192x192", type: "image/png" },
      { url: "/project_logo/ios/512.png?v=1", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=1",
    apple: [
      { url: "/project_logo/ios/180.png?v=1", sizes: "180x180", type: "image/png" },
      { url: "/project_logo/ios/152.png?v=1", sizes: "152x152", type: "image/png" },
      { url: "/project_logo/ios/120.png?v=1", sizes: "120x120", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dombon Knhom",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileImage": "/project_logo/windows/Square150x150Logo.scale-100.png?v=1",
    "msapplication-TileColor": "#18abc6",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(
        "h-full no-scrollbar",
        "antialiased",
        poppins.variable,
        inter.variable,
        kantumruy.variable,
        fredoka.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-screen flex flex-col no-scrollbar">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
