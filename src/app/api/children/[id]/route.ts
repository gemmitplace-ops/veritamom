import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const child = await prisma.child.findUnique({ where: { id: params.id } });
  if (!child || child.userId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { name, dob, sex } = await req.json();
  const updated = await prisma.child.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(dob && { dob: new Date(dob) }),
      ...(sex && { sex }),
    },
  });

  return NextResponse.json({ child: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const child = await prisma.child.findUnique({ where: { id: params.id } });
  if (!child || child.userId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.child.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
