/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  images: {
    // Allow images from API host (replace or extend as needed)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.thogmi.org",
        pathname: "/**"
      }
    ]
  }
};

module.exports = nextConfig;
