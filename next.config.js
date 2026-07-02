/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['pdfkit'],
  webpack: (config, { dev }) => {
    // Disable Webpack's filesystem cache in dev to prevent PackFileCacheStrategy OOM errors
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
