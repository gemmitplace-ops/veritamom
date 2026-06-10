import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
