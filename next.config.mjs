/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Fonts read from disk by the pay-link Open Graph image.
  outputFileTracingIncludes: { '/pay/[creator]/[product]/opengraph-image': ['./assets/fonts/**'] },
  // banana.africa/@rhydar  ->  /store/rhydar
  async rewrites() {
    return [
      { source: '/@:handle', destination: '/store/:handle' },
      { source: '/@:handle/:product', destination: '/store/:handle/:product' },
    ];
  },
};
export default nextConfig;
