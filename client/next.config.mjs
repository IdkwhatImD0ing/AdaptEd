/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  eslint: {
    // Per project rule: ignore lint errors during production builds.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
