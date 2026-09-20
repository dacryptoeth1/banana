/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // banana.africa/@rhydar  ->  /store/rhydar
  async rewrites() {
    return [
      { source: '/@:handle', destination: '/store/:handle' },
      { source: '/@:handle/:product', destination: '/store/:handle/:product' },
    ];
  },
};
export default nextConfig;
