import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    // Enable optimization with fallback for Render
    // Try to enable optimization, fallback to unoptimized if needed
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === 'true',
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL (Time To Live) in seconds
    minimumCacheTTL: 60,
    // Remote patterns for external images
    remotePatterns: [
      // Add remote image domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },

  // Environment variables validation (optional)
  // You can add runtime validation here if needed

  // TypeScript configuration
  typescript: {
    // Set to false if you want to ignore TypeScript errors during build
    ignoreBuildErrors: false,
  },


  // Output configuration
  // Using default output instead of standalone for better Render compatibility
  // output: 'standalone', // Commented out - using default Next.js output for Render
};

export default nextConfig;
