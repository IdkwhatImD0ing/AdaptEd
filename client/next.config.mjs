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
  // The default Next.js dev indicator floats at bottom-left, which sits
  // directly on top of the lecture page's mic button and intercepts the
  // click that starts narration. Park it bottom-right where it overlaps
  // the transcript pane harmlessly.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
