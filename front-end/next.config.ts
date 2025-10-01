import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ltzmjznhldqyyurxzrod.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/services/**",
      },
    ],
  },
};

export default nextConfig;
