import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production-ready configuration
  typescript: {
    ignoreBuildErrors: false, // Don't ignore TypeScript errors in production
  },
  reactStrictMode: true, // Enable React strict mode
  eslint: {
    ignoreDuringBuilds: false, // Don't ignore ESLint errors in production
  },
  // Image optimization configuration
  images: {
    domains: ['localhost'],
    unoptimized: false, // Enable image optimization
  },
  // Asset prefix configuration for Vercel deployment
  assetPrefix: process.env.ASSET_PREFIX || '',
  // Experimental configurations - keep minimal
  experimental: {
    // Remove problematic experimental features
  },
  // Compression configuration
  compress: true,
  // Power build optimizations
  poweredByHeader: false,
  generateEtags: false,
  // HTTP headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Redirects if needed
  async redirects() {
    return [];
  },
  // Rewrites if needed
  async rewrites() {
    return [];
  },
};

export default nextConfig;
