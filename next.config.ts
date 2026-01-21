import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    // Disable image optimization for Render deployment
    // Render doesn't support Next.js image optimization out of the box
    unoptimized: process.env.NODE_ENV === 'production',
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
  output: 'standalone', // Optimized for production deployment
};

export default nextConfig;
