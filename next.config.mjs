/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Allow a larger payload for images etc
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
