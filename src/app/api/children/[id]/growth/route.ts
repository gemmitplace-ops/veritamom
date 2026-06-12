import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(req);

    const child = await prisma.child.findUnique({ where: { id: params.id } });
    if (!child || child.userId !== user.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const logs = await prisma.babyLog.findMany({
      where: { childId: params.id, type: 'GROWTH' },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[growth:GET]', error);
    return NextResponse.json({ error: 'Failed to load growth logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(req);

    const child = await prisma.child.findUnique({ where: { id: params.id } });
    if (!child || child.userId !== user.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { date, weight, height, head } = await req.json();
    if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 });

    const log = await prisma.babyLog.create({
      data: {
        userId: user.userId,
        childId: params.id,
        type: 'GROWTH',
        startTime: new Date(date),
        value: JSON.stringify({
          weight: weight ?? null,
          height: height ?? null,
          head: head ?? null,
        }),
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[growth:POST]', error);
    return NextResponse.json({ error: 'Failed to save growth log' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(req);

    const { logId } = await req.json();
    const log = await prisma.babyLog.findUnique({ where: { id: logId } });
    if (!log || log.userId !== user.userId || log.childId !== params.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.babyLog.delete({ where: { id: logId } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[growth:DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete growth log' }, { status: 500 });
  }
}
