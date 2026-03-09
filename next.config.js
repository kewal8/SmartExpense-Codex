const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  turbopack: {}
};

module.exports = withPWA(nextConfig);
