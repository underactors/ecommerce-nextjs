/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
  allowedDevOrigins: ['*.replit.dev', '*.repl.co', '*.kirk.replit.dev', 'localhost', '127.0.0.1'],
}

export default nextConfig