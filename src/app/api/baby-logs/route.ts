import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date');

    const where: Record<string, unknown> = { userId: user.userId };
    if (type) where.type = type;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.startTime = { gte: start, lte: end };
    }

    const logs = await prisma.babyLog.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}

const logSchema = z.object({
  type: z.enum(['FEED', 'SLEEP', 'DIAPER', 'GROWTH', 'SYMPTOM', 'KICK']),
  startTime: z.string(),
  endTime: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  value: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const body = await request.json();
    const data = logSchema.parse(body);

    const log = await prisma.babyLog.create({
      data: {
        userId: user.userId,
        type: data.type,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        notes: data.notes,
        value: data.value,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'generic' }, { status: 500 });
  }
}
