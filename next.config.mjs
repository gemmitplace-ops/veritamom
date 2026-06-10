import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'veritamom.com', 'www.veritamom.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'better-sqlite3'],
  },
};

export default withNextIntl(nextConfig);
