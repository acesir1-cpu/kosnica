import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    // Disable optimization for Render - it doesn't support Next.js image optimization
    unoptimized: true,
    // Keep formats for when optimization is enabled in future
    formats: ['image/avif', 'image/webp'],
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
