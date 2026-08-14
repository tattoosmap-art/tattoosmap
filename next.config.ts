import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.fal.media',
      },
      {
        protocol: 'https',
        hostname: '*.fal.ai',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/_next/image',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/design-lab',
        destination: '/ai-tattoo-generator',
        permanent: true,
      },
      {
        source: '/ai-taattoo-generator',
        destination: '/ai-tattoo-generator',
        permanent: true,
      },
      {
        source: '/gallery/dotwork-haunting-fallen-angel-wings-tattoo-design',
        destination: '/gallery/dotwork-haunting-fall-of-icarus-tattoo-design',
        permanent: true,
      },
      {
        source: '/gallery/illustrative-ascending-angel-with-radiant-sunburst-halo-tattoo-design',
        destination: '/gallery/illustrative-icarus-ascending-with-radiant-sunburst-halo-tattoo-design',
        permanent: true,
      },
      {
        source: '/gallery/illustrative-divine-ascending-archangel-with-sword-tattoo-design',
        destination: '/gallery/illustrative-icarus-ascending-with-sword-tattoo-design',
        permanent: true,
      },
      {
        source: '/gallery/illustrative-ascending-winged-angel-and-broken-clock-tattoo-design',
        destination: '/gallery/illustrative-ascending-icarus-and-broken-clock-tattoo-design',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
