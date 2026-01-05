import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resources.premierleague.com',
        pathname: '/premierleague/**',
      },
      {
        protocol: 'https',
        hostname: 'www.thesportsdb.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'r2.thesportsdb.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'img.a.transfermarkt.technology',
        pathname: '/portrait/**',
      },
      {
        protocol: 'https',
        hostname: 'tmssl.akamaized.net',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
