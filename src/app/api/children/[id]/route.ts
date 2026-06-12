import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(req);

    const child = await prisma.child.findUnique({ where: { id: params.id } });
    if (!child || child.userId !== user.userId) {
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
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[children:PATCH]', error);
    return NextResponse.json({ error: 'Failed to update child' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(req);

    const child = await prisma.child.findUnique({ where: { id: params.id } });
    if (!child || child.userId !== user.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.child.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[children:DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 });
  }
}
