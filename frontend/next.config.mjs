/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Limit webpack parallelism to reduce RAM usage during dev
      config.parallelism = 1;
    }
    return config;
  },
};

export default nextConfig;
