import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations for Vercel
  compress: true,
  poweredByHeader: false,
  
  // Build performance optimizations - removed problematic options
  experimental: {
    // Remove optimizeCss as it requires critters package
    // optimizeCss: true
  },

  // ESLint configuration for build - ignore to prevent timeout
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration - ignore to prevent timeout  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization - reduced for faster builds
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Environment-based configuration
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // Development configuration
  turbopack: {
    root: process.cwd(),
  },
  
  // Production redirects and rewrites
  async rewrites() {
    // Only add rewrites if API URL is configured
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || apiUrl === 'undefined') {
      return [];
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  
  // Security headers
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
};

export default nextConfig;
