import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const children = await prisma.child.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ children });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[children:GET]', error);
    return NextResponse.json({ error: 'Failed to load children' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const { name, dob, sex } = await request.json();
    if (!name || !dob || !sex) {
      return NextResponse.json({ error: 'name, dob, and sex are required' }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: {
        userId: user.userId,
        name,
        dob: new Date(dob),
        sex,
      },
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch (error: unknown) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[children:POST]', error);
    return NextResponse.json({ error: 'Failed to save child' }, { status: 500 });
  }
}
