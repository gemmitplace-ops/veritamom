import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const BASE = 'https://veritamom.com';
const locales = ['en', 'zh', 'ko'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: { slug: string; updatedAt: Date }[] = [];
  let papers: { id: string; updatedAt: Date }[] = [];

  try {
    [articles, papers] = await Promise.all([
      prisma.article.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.researchPaper.findMany({
        where: { isPublished: true },
        select: { id: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ]);
  } catch {
    // DB not yet migrated — return static pages only
  }

  const staticPages = ['', '/community', '/tools'];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}${path}`,
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1.0 : 0.8,
    }))
  );

  const articleEntries: MetadataRoute.Sitemap = articles.flatMap((a) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))
  );

  const paperEntries: MetadataRoute.Sitemap = papers.flatMap((p) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}/papers/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );

  return [...staticEntries, ...articleEntries, ...paperEntries];
}
