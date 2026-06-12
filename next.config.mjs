import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    // Type enforcement happens in a dedicated `tsc --noEmit` Docker build step
    // instead (see Dockerfile): running the checker inside `next build` OOMs
    // the 2GB VPS. A type error still fails the image build either way.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'veritamom.com', 'www.veritamom.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'better-sqlite3'],
  },
};

export default withNextIntl(nextConfig);
