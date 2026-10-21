import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
    },
});

const nextConfig: NextConfig = {
    output: "standalone",
    reactCompiler: true,
    productionBrowserSourceMaps: false,
    turbopack: {},
    experimental: {
        webpackMemoryOptimizations: true,
        preloadEntriesOnStart: true,
    },

    images: {
        localPatterns: [
            {
                pathname: '/api/media-proxy',
            },
            {
                pathname: '/**',
            },
        ],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.dombonkhnom.com",
            },
            {
                protocol: "https",
                hostname: "api.test.dombonkhnom.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "8080",
                pathname: "/**",
            },
        ],
    },

};

export default withPWA(nextConfig);
