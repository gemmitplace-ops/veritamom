import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (user.role !== 'ADMIN' && user.role !== 'PUBLISHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, username: true } },
      citations: {
        include: { paper: { select: { id: true, title: true, journalName: true, publishedYear: true, citation: true } } },
      },
    },
  });

  return NextResponse.json({ articles });
}
