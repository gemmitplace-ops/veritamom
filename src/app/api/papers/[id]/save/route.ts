import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const existing = await prisma.paperSave.findUnique({
      where: { userId_paperId: { userId: user.userId, paperId: params.id } },
    });

    if (existing) {
      await prisma.paperSave.delete({
        where: { userId_paperId: { userId: user.userId, paperId: params.id } },
      });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.paperSave.create({
        data: { userId: user.userId, paperId: params.id },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}
