import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const flagSchema = z.object({
  targetType: z.enum(['PAPER', 'POST', 'COMMENT']),
  targetId: z.string(),
  reason: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = flagSchema.parse(body);

    await prisma.flagReport.create({
      data: {
        reporterId: user.userId,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
      },
    });

    if (data.targetType === 'POST') {
      await prisma.post.update({
        where: { id: data.targetId },
        data: { isFlagged: true },
      });
    } else if (data.targetType === 'COMMENT') {
      await prisma.comment.update({
        where: { id: data.targetId },
        data: { isFlagged: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}
