import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pzmjubmakmkvskkjldad.supabase.co", // your Supabase project's domain
        pathname: "/storage/v1/object/public/**", // allow public bucket files
      },
    ],
  },
};

export default nextConfig;
