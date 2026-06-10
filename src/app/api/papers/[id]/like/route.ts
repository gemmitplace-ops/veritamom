import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const existing = await prisma.paperLike.findUnique({
      where: { userId_paperId: { userId: user.userId, paperId: params.id } },
    });

    if (existing) {
      await prisma.paperLike.delete({
        where: { userId_paperId: { userId: user.userId, paperId: params.id } },
      });
      await prisma.researchPaper.update({
        where: { id: params.id },
        data: { likeCount: { decrement: 1 } },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.paperLike.create({
        data: { userId: user.userId, paperId: params.id },
      });
      await prisma.researchPaper.update({
        where: { id: params.id },
        data: { likeCount: { increment: 1 } },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}
