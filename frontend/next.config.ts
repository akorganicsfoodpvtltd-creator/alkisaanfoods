/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Aapki existing configuration yahan rahegi
  // reactStrictMode: true,
  // swcMinify: true,
};

module.exports = nextConfig;