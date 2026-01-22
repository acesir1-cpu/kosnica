import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    // Enable optimization - only disable if explicitly set
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === 'true',
    // Optimized device sizes for responsive images (reduced for better performance)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Optimized image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Increase cache TTL for better performance
    minimumCacheTTL: 31536000, // 1 year
    // Remote patterns for external images
    remotePatterns: [
      // Add remote image domains here if needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
    // Enable content security policy for images
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
