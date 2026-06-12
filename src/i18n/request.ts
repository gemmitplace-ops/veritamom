import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'zh', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale: Locale =
    locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
  };
});
