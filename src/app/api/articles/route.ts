import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string().min(1),
  hook: z.string().min(1),
  tldr: z.string().min(1),
  body: z.string().min(1),
  metaDescription: z.string().optional(),
  confidenceLevel: z.enum(['ESTABLISHED', 'EMERGING', 'DEBATED']).optional(),
  trimesterRelevance: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  citedPaperIds: z.array(z.object({ paperId: z.string(), note: z.string().optional() })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trimester = searchParams.get('trimester');
    const featured = searchParams.get('featured') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isPublished: true };
    if (trimester && trimester !== 'ALL') where.trimesterRelevance = { contains: trimester };
    if (featured) where.isFeatured = true;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        include: {
          author: { select: { name: true, username: true } },
          citations: {
            include: {
              paper: { select: { id: true, title: true, journalName: true, publishedYear: true, citation: true } },
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({ articles, total, page, limit });
  } catch {
    return NextResponse.json({ articles: [], total: 0, page: 1, limit: 10 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'ADMIN' && user.role !== 'PUBLISHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = articleSchema.parse(body);

    const baseSlug = slugify(data.title);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const article = await prisma.article.create({
      data: {
        slug,
        title: data.title,
        hook: data.hook,
        tldr: data.tldr,
        body: data.body,
        metaDescription: data.metaDescription,
        confidenceLevel: data.confidenceLevel ?? 'ESTABLISHED',
        trimesterRelevance: data.trimesterRelevance ?? 'ALL',
        isPublished: data.isPublished ?? false,
        isFeatured: data.isFeatured ?? false,
        authorId: user.userId,
        publishedAt: data.isPublished ? new Date() : null,
        citations: data.citedPaperIds
          ? { create: data.citedPaperIds.map((c) => ({ paperId: c.paperId, note: c.note })) }
          : undefined,
      },
      include: {
        author: { select: { name: true, username: true } },
        citations: { include: { paper: true } },
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed', message: (error as Error).message }, { status: 500 });
  }
}
