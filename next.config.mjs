/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.vectorlogohub.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: https://cdn.vectorlogohub.com; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          }
        ],
      },
    ]
  },
}

export default nextConfig;
