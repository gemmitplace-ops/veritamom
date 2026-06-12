import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Type errors fail the build on purpose: a broken import once shipped to
  // production behind ignoreBuildErrors (see commit 03e344d). A failed build
  // leaves the old container running, which is the safer failure mode.
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
