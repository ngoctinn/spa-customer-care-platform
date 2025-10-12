import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nlgfvjvfnyfragmrjguw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos", // Thêm tên miền picsum.photos vào danh sách
        // Bạn có thể thêm các cấu hình path và port nếu cần,
        // nhưng với picsum.photos thì chỉ cần hostname là đủ.
      },
    ],
  },
};

export default nextConfig;
