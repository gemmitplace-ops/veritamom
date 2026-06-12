import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  hook: z.string().min(1).optional(),
  tldr: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  metaDescription: z.string().optional(),
  confidenceLevel: z.enum(['ESTABLISHED', 'EMERGING', 'DEBATED']).optional(),
  trimesterRelevance: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  citedPaperIds: z.array(z.object({ paperId: z.string(), note: z.string().optional() })).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      author: { select: { name: true, username: true } },
      citations: {
        include: {
          paper: {
            select: {
              id: true, title: true, journalName: true, publishedYear: true,
              citation: true, fullPaperUrl: true, summary: true,
            },
          },
        },
      },
    },
  });

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } });

  return NextResponse.json({ article });
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'ADMIN' && user.role !== 'PUBLISHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const existing = await prisma.article.findUnique({ where: { slug: params.slug } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updateData: Record<string, unknown> = { ...data };
    if (data.isPublished && !existing.publishedAt) updateData.publishedAt = new Date();
    if (data.citedPaperIds !== undefined) delete updateData.citedPaperIds;

    const article = await prisma.article.update({
      where: { slug: params.slug },
      data: {
        ...updateData,
        ...(data.citedPaperIds !== undefined && {
          citations: {
            deleteMany: {},
            create: data.citedPaperIds.map((c) => ({ paperId: c.paperId, note: c.note })),
          },
        }),
      },
      include: {
        author: { select: { name: true, username: true } },
        citations: { include: { paper: true } },
      },
    });

    return NextResponse.json({ article });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed', message: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = requireAuth(request);
    if (user.role !== 'ADMIN' && user.role !== 'PUBLISHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.article.delete({ where: { slug: params.slug } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
