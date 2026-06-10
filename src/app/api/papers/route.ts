import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trimester = searchParams.get('trimester') || 'ALL';
  const tag = searchParams.get('tag');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isPublished: true };

  if (trimester && trimester !== 'ALL') {
    where.trimesterRelevance = { contains: trimester };
  }

  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }

  const [papers, total] = await Promise.all([
    prisma.researchPaper.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { likes: true, saves: true } },
      },
    }),
    prisma.researchPaper.count({ where }),
  ]);

  const currentUser = getUserFromRequest(request);
  const userInteractions: Record<string, { liked: boolean; saved: boolean }> = {};

  if (currentUser) {
    const paperIds = papers.map((p) => p.id);
    const [likes, saves] = await Promise.all([
      prisma.paperLike.findMany({
        where: { userId: currentUser.userId, paperId: { in: paperIds } },
        select: { paperId: true },
      }),
      prisma.paperSave.findMany({
        where: { userId: currentUser.userId, paperId: { in: paperIds } },
        select: { paperId: true },
      }),
    ]);

    for (const id of paperIds) {
      userInteractions[id] = {
        liked: likes.some((l) => l.paperId === id),
        saved: saves.some((s) => s.paperId === id),
      };
    }
  }

  const papersWithInteractions = papers.map((p) => ({
    ...p,
    userLiked: userInteractions[p.id]?.liked ?? false,
    userSaved: userInteractions[p.id]?.saved ?? false,
  }));

  return NextResponse.json({ papers: papersWithInteractions, total, page, limit });
}
