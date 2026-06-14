import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ id: params.id }, { username: params.id }] },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = await prisma.follow.findMany({
    where: { followingId: user.id },
    include: { follower: { select: { id: true, name: true, username: true, avatarUrl: true, role: true, verifiedProfessionalTitle: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users: rows.map(r => r.follower) });
}
