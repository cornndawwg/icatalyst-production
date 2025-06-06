/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  // Production configuration for Railway deployment
  trailingSlash: false,
  distDir: '.next',
  images: {
    unoptimized: false // Re-enable image optimization
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  },
  // API routes configuration for development
  async rewrites() {
    return process.env.NODE_ENV !== 'production' ? [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`
      }
    ] : [];
  }
};

module.exports = nextConfig; 