import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const child = await prisma.child.findUnique({ where: { id: params.id } });
  if (!child || child.userId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const logs = await prisma.babyLog.findMany({
    where: { childId: params.id, type: 'GROWTH' },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const child = await prisma.child.findUnique({ where: { id: params.id } });
  if (!child || child.userId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { date, weight, height, head } = await req.json();
  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 });

  const log = await prisma.babyLog.create({
    data: {
      userId: session.id,
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
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { logId } = await req.json();
  const log = await prisma.babyLog.findUnique({ where: { id: logId } });
  if (!log || log.userId !== session.id || log.childId !== params.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.babyLog.delete({ where: { id: logId } });
  return NextResponse.json({ ok: true });
}
