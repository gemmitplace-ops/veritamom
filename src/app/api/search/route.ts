import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ papers: [], articles: [] });

  const [papers, articles] = await Promise.all([
    prisma.researchPaper.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q } },
          { summary: { contains: q } },
          { citation: { contains: q } },
          { journalName: { contains: q } },
        ],
      },
      select: { id: true, title: true, citation: true, journalName: true, publishedYear: true },
      take: 5,
    }),
    prisma.article.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: q } },
          { hook: { contains: q } },
          { tldr: { contains: q } },
        ],
      },
      select: { id: true, slug: true, title: true, hook: true },
      take: 3,
    }),
  ]);

  return NextResponse.json({ papers, articles });
}
