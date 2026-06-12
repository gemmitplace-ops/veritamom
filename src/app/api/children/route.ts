import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const children = await prisma.child.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ children });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, dob, sex } = await req.json();
  if (!name || !dob || !sex) {
    return NextResponse.json({ error: 'name, dob, and sex are required' }, { status: 400 });
  }

  const child = await prisma.child.create({
    data: {
      userId: session.id,
      name,
      dob: new Date(dob),
      sex,
    },
  });

  return NextResponse.json({ child }, { status: 201 });
}
