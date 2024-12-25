/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.vectorlogohub.com'],
  },
  experimental: {
    typedRoutes: true
  }
}

module.exports = nextConfig 