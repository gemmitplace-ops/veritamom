import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const paper = await prisma.researchPaper.findUnique({
    where: { id: params.id, isPublished: true },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { likes: true } },
    },
  });

  if (!paper) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.researchPaper.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ paper });
}
