import nextPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // You can add more configurations below
});

export default nextConfig;
